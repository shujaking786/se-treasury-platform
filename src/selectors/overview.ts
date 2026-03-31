import { bankingPartnerLimits, legalEntities, mePositionRows, africaPositionRows } from '../data';
import type { Alert, DashboardFilters, KpiCardData } from '../types';
import { matchesAnyAreCode, matchesAreCode } from './filtering';

function formatEur(value: number): string {
  if (value === 0) {
    return '\u20AC0';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}\u20AC${(abs / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  }

  return `${sign}\u20AC${abs.toFixed(0)}`;
}

function formatEntityCount(count: number): string {
  return count === 1 ? '1 entity' : `${count} entities`;
}

export function selectOverviewViewModel(filter: DashboardFilters) {
  const positions = [...mePositionRows, ...africaPositionRows].filter((row) => matchesAreCode(filter, row.areCode));
  const mePositions = mePositionRows.filter((row) => matchesAreCode(filter, row.areCode));
  const africaPositions = africaPositionRows.filter((row) => matchesAreCode(filter, row.areCode));
  const filteredEntities = legalEntities.filter((entity) => matchesAreCode(filter, entity.areCode));
  const meEntities = filteredEntities.filter((entity) => entity.region === 'ME');
  const africaEntities = filteredEntities.filter((entity) => entity.region === 'AFRICA');

  const meNetPosition = mePositions.reduce((sum, row) => sum + (row.totalNetPosition * 1_000_000), 0);
  const africaNetPosition = africaPositions.reduce((sum, row) => sum + (row.totalNetPosition * 1_000_000), 0);
  const totalGroupLiquidity = meNetPosition + africaNetPosition;
  const reservedForPayments = positions.reduce((sum, row) => sum + ((row.reserved ?? 0) * 1_000_000), 0);
  const externalLiquidity = positions.reduce((sum, row) => sum + (row.extLiquidity * 1_000_000), 0);
  const internalLiquidity = positions.reduce((sum, row) => sum + ((row.intLiquidity ?? 0) * 1_000_000), 0);
  const internalDebt = positions.reduce((sum, row) => sum + (row.intDebt * 1_000_000), 0);
  const uniqueCountries = new Set(filteredEntities.map((entity) => entity.countryCode)).size;

  const kpis: KpiCardData[] = [
    {
      label: 'Total Group Liquidity',
      value: formatEur(totalGroupLiquidity),
      valueColor: totalGroupLiquidity >= 0 ? 'white' : 'red',
      subtitle: `${formatEntityCount(filteredEntities.length)} · ${uniqueCountries} countries`,
      gradient: 'green',
    },
    {
      label: 'ME Region',
      value: formatEur(meNetPosition),
      valueColor: 'white',
      subtitle: `${formatEntityCount(meEntities.length)} · ${totalGroupLiquidity ? ((meNetPosition / totalGroupLiquidity) * 100).toFixed(1) : '0.0'}% of scope`,
      gradient: 'default',
    },
    {
      label: 'Africa Region',
      value: formatEur(africaNetPosition),
      valueColor: 'white',
      subtitle: `${formatEntityCount(africaEntities.length)} · ${totalGroupLiquidity ? ((africaNetPosition / totalGroupLiquidity) * 100).toFixed(1) : '0.0'}% of scope`,
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
      const netPosition = row.totalNetPosition * 1_000_000;
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
    ...filteredEntities
      .filter((entity) => entity.netPositionEur < 0)
      .slice(0, 2)
      .map((entity): Alert => ({
        id: `negative-${entity.areCode}`,
        text: `${entity.areCode} ${entity.country} - NET NEGATIVE ${formatEur(entity.netPositionEur)}`,
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
