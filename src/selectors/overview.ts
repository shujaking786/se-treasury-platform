import { bankingPartnerLimits, legalEntities } from '../data';
import type { FinalSummaryItem } from '../data/hr';
import type { Alert, DashboardFilters, KpiCardData, PositionRow, PositionStatus } from '../types';
import { matchesAnyAreCode, matchesAreCode } from './filtering';

const MILLION = 1_000_000;
const LARGE_POSITION_THRESHOLD_M = 25;

const MTO_ARE_CODES = new Set(['5402', '4PD4', '4PD3', '5423']);
const MONITORED_ARE_CODES = new Set(['5665']);
const MULTI_COUNTRY_ARE_CODES = new Set(['479X']);
const IN_LIQUIDATION_ARE_CODES = new Set(['490S']);

const legalEntityLookup = new Map(legalEntities.map((entity) => [entity.areCode, entity]));

function formatEur(value: number): string {
  if (value === 0) {
    return '\u20AC0';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= MILLION) {
    return `${sign}\u20AC${(abs / MILLION).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  }

  return `${sign}\u20AC${abs.toFixed(0)}`;
}

function formatEntityCount(count: number): string {
  return count === 1 ? '1 entity' : `${count} entities`;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toMillions(value: number): number {
  return value / MILLION;
}

function getRegionFromSummary(region: string | null | undefined): 'ME' | 'AFRICA' {
  return region?.trim().toLowerCase() === 'africa' ? 'AFRICA' : 'ME';
}

function getStatusForSummary(item: FinalSummaryItem, netPosition: number): PositionStatus {
  const areCode = item.ARE.trim().toUpperCase();

  if (netPosition < 0) {
    return 'NEGATIVE';
  }

  if (MTO_ARE_CODES.has(areCode)) {
    return 'MTO';
  }

  if (MONITORED_ARE_CODES.has(areCode)) {
    return 'MONITORED';
  }

  if (MULTI_COUNTRY_ARE_CODES.has(areCode)) {
    return 'MULTI_CTRY';
  }

  if (IN_LIQUIDATION_ARE_CODES.has(areCode) || item.Entity_Name.toLowerCase().includes('liquidation')) {
    return 'IN_LIQ';
  }

  if (netPosition >= LARGE_POSITION_THRESHOLD_M) {
    return 'LARGE';
  }

  return 'HEALTHY';
}

export function mapFinalSummaryRows(items: FinalSummaryItem[]): { meRows: PositionRow[]; africaRows: PositionRow[] } {
  const meRows: PositionRow[] = [];
  const africaRows: PositionRow[] = [];

  for (const item of items) {
    const areCode = item.ARE.trim().toUpperCase();
    const legalEntity = legalEntityLookup.get(areCode);
    const reserved = toNumber(item.Reserved_for_Payment);
    const fundsInTransit = toNumber(item.Funds_in_transit);
    const internalLiquidity = toMillions(item.Internal_Liquidity);
    const internalDebt = toMillions(Math.abs(item.Internal_Debt));
    const totalNetPosition = toMillions(item.NET_Liquidity_Position);
    const status = getStatusForSummary(item, totalNetPosition);

    const row: PositionRow = {
      areCode,
      country: legalEntity?.country ?? item.Country,
      flag: '',
      extLiquidity: toMillions(item.External_Liquidity),
      fundsInTransit: fundsInTransit === 0 ? null : toMillions(fundsInTransit),
      fundsInTransitDirection: fundsInTransit === 0 ? null : 'out',
      reserved: reserved === 0 ? null : toMillions(reserved),
      expectedExtLiquidity: toMillions(item.Expected_External_Liquidity),
      extDebt: toMillions(Math.abs(item.External_Debt)),
      intLiquidity: internalLiquidity === 0 ? null : internalLiquidity,
      intDebt: internalDebt,
      totalNetPosition,
      status,
      isMto: status === 'MTO',
      isNegative: totalNetPosition < 0,
    };

    if (getRegionFromSummary(item.Region) === 'AFRICA') {
      africaRows.push(row);
    } else {
      meRows.push(row);
    }
  }

  return { meRows, africaRows };
}

export function selectOverviewViewModel(
  filter: DashboardFilters,
  mePositionRows: PositionRow[],
  africaPositionRows: PositionRow[],
) {
  const positions = [...mePositionRows, ...africaPositionRows].filter((row) => matchesAreCode(filter, row.areCode));
  const mePositions = mePositionRows.filter((row) => matchesAreCode(filter, row.areCode));
  const africaPositions = africaPositionRows.filter((row) => matchesAreCode(filter, row.areCode));
  const filteredEntityCodes = new Set(positions.map((row) => row.areCode));
  const filteredEntities = legalEntities.filter((entity) => filteredEntityCodes.has(entity.areCode));

  const meNetPosition = mePositions.reduce((sum, row) => sum + (row.totalNetPosition * MILLION), 0);
  const africaNetPosition = africaPositions.reduce((sum, row) => sum + (row.totalNetPosition * MILLION), 0);
  const totalGroupLiquidity = meNetPosition + africaNetPosition;
  const reservedForPayments = positions.reduce((sum, row) => sum + ((row.reserved ?? 0) * MILLION), 0);
  const externalLiquidity = positions.reduce((sum, row) => sum + (row.extLiquidity * MILLION), 0);
  const internalLiquidity = positions.reduce((sum, row) => sum + ((row.intLiquidity ?? 0) * MILLION), 0);
  const internalDebt = positions.reduce((sum, row) => sum + (row.intDebt * MILLION), 0);
  const uniqueCountries = filteredEntities.length > 0
    ? new Set(filteredEntities.map((entity) => entity.countryCode)).size
    : new Set(positions.map((row) => row.country)).size;

  const kpis: KpiCardData[] = [
    {
      label: 'Total Group Liquidity',
      value: formatEur(totalGroupLiquidity),
      valueColor: totalGroupLiquidity >= 0 ? 'white' : 'red',
      subtitle: `${formatEntityCount(positions.length)} | ${uniqueCountries} countries`,
      gradient: 'green',
    },
    {
      label: 'ME Region',
      value: formatEur(meNetPosition),
      valueColor: 'white',
      subtitle: `${formatEntityCount(mePositions.length)} | ${totalGroupLiquidity ? ((meNetPosition / totalGroupLiquidity) * 100).toFixed(1) : '0.0'}% of scope`,
      gradient: 'default',
    },
    {
      label: 'Africa Region',
      value: formatEur(africaNetPosition),
      valueColor: 'white',
      subtitle: `${formatEntityCount(africaPositions.length)} | ${totalGroupLiquidity ? ((africaNetPosition / totalGroupLiquidity) * 100).toFixed(1) : '0.0'}% of scope`,
      gradient: 'default',
    },
    {
      label: 'Reserved for Payments',
      value: formatEur(reservedForPayments),
      valueColor: reservedForPayments > 0 ? 'amber' : 'white',
      subtitle: 'HR + accounting obligations',
      gradient: 'amber',
    },
    {
      label: 'Internal Debt',
      value: formatEur(internalDebt),
      valueColor: internalDebt > 0 ? 'red' : 'green',
      subtitle: `Internal liquidity: ${formatEur(internalLiquidity)}`,
      gradient: 'red',
    },
  ];

  const topPositions = [...positions]
    .sort((left, right) => right.totalNetPosition - left.totalNetPosition)
    .slice(0, 7)
    .map((row) => {
      const netPosition = row.totalNetPosition * MILLION;
      return {
        code: row.areCode,
        value: formatEur(netPosition),
        pct: totalGroupLiquidity > 0 ? Math.max((Math.abs(netPosition) / totalGroupLiquidity) * 100, 1) : 0,
        variant: netPosition < 0 ? 'breach' as const : 'safe' as const,
        isNeg: netPosition < 0,
      };
    });

  const alerts: Alert[] = [
    ...bankingPartnerLimits
      .filter((limit) => matchesAnyAreCode(filter, limit.relatedAres))
      .filter((limit) => limit.status === 'BREACH' || limit.status === 'NEAR_LIMIT')
      .slice(0, 3)
      .map((limit): Alert => ({
        id: `limit-${limit.partner}`,
        text: `${limit.partner} ${limit.status === 'BREACH' ? 'BREACH' : 'NEAR-LIMIT'} - ${limit.utilizationPct.toFixed(1)}%`,
        severity: limit.status === 'BREACH' ? 'red' : 'amber',
      })),
    ...positions
      .filter((row) => row.totalNetPosition < 0)
      .slice(0, 2)
      .map((row): Alert => ({
        id: `negative-${row.areCode}`,
        text: `${row.areCode} ${row.country} - NET NEGATIVE ${formatEur(row.totalNetPosition * MILLION)}`,
        severity: 'red',
      })),
  ];

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable',
      text: 'No active breaches in the current filter scope',
      severity: 'green',
    });
  }

  return {
    alerts,
    kpis,
    meNetPosition,
    africaNetPosition,
    totalNetPosition: totalGroupLiquidity,
    externalLiquidity,
    internalLiquidity,
    topPositions,
  };
}
