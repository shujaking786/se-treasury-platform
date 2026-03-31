import { bankAccounts, countryPresence, legalEntities } from '../data';
import type { DashboardFilterValue, DashboardFilters, ViewMode } from '../types';
import { getCanonicalBankKey, getMatchingAreCodes } from './filtering';

export interface SidebarOption {
  key: string;
  label: string;
  meta: string;
  filter: DashboardFilterValue;
}

export interface SidebarSection {
  title: string;
  items: SidebarOption[];
}

function buildRegionSections(): SidebarSection[] {
  const meCount = legalEntities.filter((entity) => entity.region === 'ME').length;
  const africaCount = legalEntities.filter((entity) => entity.region === 'AFRICA').length;

  return [
    {
      title: 'Regions',
      items: [
        {
          key: 'region-ME',
          label: 'Middle East',
          meta: `${meCount} AREs`,
          filter: { kind: 'region', region: 'ME', label: 'Middle East' },
        },
        {
          key: 'region-AFRICA',
          label: 'Africa',
          meta: `${africaCount} AREs`,
          filter: { kind: 'region', region: 'AFRICA', label: 'Africa' },
        },
      ],
    },
  ];
}

function isInScope(areCodes: string[], scope: Set<string> | null): boolean {
  if (!scope) {
    return true;
  }

  return areCodes.some((areCode) => scope.has(areCode.toUpperCase()));
}

function countInScope(areCodes: string[], scope: Set<string> | null): number {
  if (!scope) {
    return areCodes.length;
  }

  return areCodes.filter((areCode) => scope.has(areCode.toUpperCase())).length;
}

function buildCountrySections(filters: DashboardFilters): SidebarSection[] {
  const scope = getMatchingAreCodes(filters, { excludeKinds: ['country'] });
  const meCountries = countryPresence
    .filter((entry) => entry.region === 'ME' && isInScope(entry.areCodes, scope))
    .map((entry) => ({
      key: `country-${entry.countryCode}`,
      label: entry.country,
      meta: `${countInScope(entry.areCodes, scope)} AREs`,
      filter: {
        kind: 'country' as const,
        countryCode: entry.countryCode,
        label: entry.country,
      },
    }));

  const africaCountries = countryPresence
    .filter((entry) => entry.region === 'AFRICA' && isInScope(entry.areCodes, scope))
    .map((entry) => ({
      key: `country-${entry.countryCode}`,
      label: entry.country,
      meta: `${countInScope(entry.areCodes, scope)} AREs`,
      filter: {
        kind: 'country' as const,
        countryCode: entry.countryCode,
        label: entry.country,
      },
    }));

  return [
    { title: 'ME Countries', items: meCountries },
    { title: 'Africa Countries', items: africaCountries },
  ].filter((section) => section.items.length > 0);
}

function buildAreSections(filters: DashboardFilters): SidebarSection[] {
  const scope = getMatchingAreCodes(filters, { excludeKinds: ['entity'] });
  const meEntities = legalEntities
    .filter((entity) => entity.region === 'ME' && isInScope([entity.areCode], scope))
    .map((entity) => {
      const code = entity.areCode.toUpperCase();
      return {
        key: `entity-${code}`,
        label: `${code} ${entity.country}`,
        meta: entity.countryCode,
        filter: {
          kind: 'entity' as const,
          areCode: code,
          label: `${code} ${entity.country}`,
        },
      };
    });

  const africaEntities = legalEntities
    .filter((entity) => entity.region === 'AFRICA' && isInScope([entity.areCode], scope))
    .map((entity) => {
      const code = entity.areCode.toUpperCase();
      return {
        key: `entity-${code}`,
        label: `${code} ${entity.country}`,
        meta: entity.countryCode,
        filter: {
          kind: 'entity' as const,
          areCode: code,
          label: `${code} ${entity.country}`,
        },
      };
    });

  return [
    { title: 'ME AREs', items: meEntities },
    { title: 'Africa AREs', items: africaEntities },
  ].filter((section) => section.items.length > 0);
}

function buildBankSections(filters: DashboardFilters): SidebarSection[] {
  const scope = getMatchingAreCodes(filters, { excludeKinds: ['bankingPartner'] });
  const partnerMap = new Map<string, { bank: string; areCodes: Set<string> }>();

  for (const account of bankAccounts) {
    if (!isInScope([account.areCode], scope)) {
      continue;
    }

    const canonicalKey = getCanonicalBankKey(account.bank);
    const existing = partnerMap.get(canonicalKey);

    if (existing) {
      existing.areCodes.add(account.areCode);
      continue;
    }

    partnerMap.set(canonicalKey, {
      bank: account.bank,
      areCodes: new Set([account.areCode]),
    });
  }

  const partners = [...partnerMap.values()]
    .sort((left, right) => left.bank.localeCompare(right.bank))
    .map((partner) => ({
      key: `bank-${getCanonicalBankKey(partner.bank)}`,
      label: partner.bank,
      meta: `${partner.areCodes.size} AREs`,
      filter: {
        kind: 'bankingPartner' as const,
        bank: partner.bank,
        label: partner.bank,
      },
    }));

  return [{ title: 'Banking Partners', items: partners }];
}

export function getSidebarSections(viewMode: ViewMode, filters: DashboardFilters): SidebarSection[] {
  switch (viewMode) {
    case 'region':
      return buildRegionSections();
    case 'country':
      return buildCountrySections(filters);
    case 'are':
      return buildAreSections(filters);
    case 'bankingPartner':
      return buildBankSections(filters);
  }
}

export function isSidebarItemActive(filters: DashboardFilters, itemFilter: DashboardFilterValue): boolean {
  return filters.some((filter) => {
    if (filter.kind !== itemFilter.kind) return false;
    switch (itemFilter.kind) {
      case 'region':
        return filter.kind === 'region' && filter.region === itemFilter.region;
      case 'country':
        return filter.kind === 'country' && filter.countryCode === itemFilter.countryCode;
      case 'entity':
        return filter.kind === 'entity' && filter.areCode.toUpperCase() === itemFilter.areCode.toUpperCase();
      case 'bankingPartner':
        return filter.kind === 'bankingPartner' && filter.bank === itemFilter.bank;
    }
  });
}

/** Check if all items in a section are active. */
export function isSectionFullyActive(filters: DashboardFilters, section: SidebarSection): boolean {
  return section.items.length > 0 && section.items.every((item) => isSidebarItemActive(filters, item.filter));
}

/** Check if some (but not all) items in a section are active. */
export function isSectionPartiallyActive(filters: DashboardFilters, section: SidebarSection): boolean {
  const activeCount = section.items.filter((item) => isSidebarItemActive(filters, item.filter)).length;
  return activeCount > 0 && activeCount < section.items.length;
}
