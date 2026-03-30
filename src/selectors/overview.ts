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
  const filteredEntities = legalEntities.filter((entity) => matchesAreCode(filter, entity.areCode));
  const meEntities = filteredEntities.filter((entity) => entity.region === 'ME');
  const africaEntities = filteredEntities.filter((entity) => entity.region === 'AFRICA');

  const totalGroupLiquidity = filteredEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0);
  const reservedForPayments = positions.reduce((sum, row) => sum + ((row.reserved ?? 0) * 1_000_000), 0);
  const externalLiquidity = filteredEntities.reduce((sum, entity) => sum + entity.externalLiquidityEur, 0);
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
      value: formatEur(meEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0)),
      valueColor: 'white',
      subtitle: `${formatEntityCount(meEntities.length)} · ${totalGroupLiquidity ? ((meEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0) / totalGroupLiquidity) * 100).toFixed(1) : '0.0'}% of scope`,
      gradient: 'default',
    },
    {
      label: 'Africa Region',
      value: formatEur(africaEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0)),
      valueColor: 'white',
      subtitle: `${formatEntityCount(africaEntities.length)} · ${totalGroupLiquidity ? ((africaEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0) / totalGroupLiquidity) * 100).toFixed(1) : '0.0'}% of scope`,
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

  const topPositions = [...filteredEntities]
    .sort((left, right) => right.netPositionEur - left.netPositionEur)
    .slice(0, 7)
    .map((entity) => ({
      code: entity.areCode,
      value: formatEur(entity.netPositionEur),
      pct: totalGroupLiquidity > 0 ? Math.max((Math.abs(entity.netPositionEur) / totalGroupLiquidity) * 100, 1) : 0,
      variant: entity.netPositionEur < 0 ? 'breach' as const : 'safe' as const,
      isNeg: entity.netPositionEur < 0,
    }));

  const alerts: Alert[] = [
    ...bankingPartnerLimits
      .filter((limit) => matchesAnyAreCode(filter, limit.relatedAres))
      .filter((limit) => limit.status === 'BREACH' || limit.status === 'NEAR_LIMIT')
      .slice(0, 3)
      .map((limit): Alert => ({
        id: `limit-${limit.partner}`,
        text: `${limit.partner} ${limit.status === 'BREACH' ? 'BREACH' : 'NEAR-LIMIT'} — ${limit.utilizationPct.toFixed(1)}%`,
        severity: limit.status === 'BREACH' ? 'red' : 'amber',
      })),
    ...filteredEntities
      .filter((entity) => entity.netPositionEur < 0)
      .slice(0, 2)
      .map((entity): Alert => ({
        id: `negative-${entity.areCode}`,
        text: `${entity.areCode} ${entity.country} — NET NEGATIVE ${formatEur(entity.netPositionEur)}`,
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
    meNetPosition: meEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0),
    africaNetPosition: africaEntities.reduce((sum, entity) => sum + entity.netPositionEur, 0),
    totalNetPosition: totalGroupLiquidity,
    externalLiquidity,
    internalLiquidity,
    topPositions,
  };
}
