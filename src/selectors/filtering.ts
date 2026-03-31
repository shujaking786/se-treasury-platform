import { bankAccounts, countryPresence, legalEntities } from '../data';
import type { DashboardFilterValue, DashboardFilters } from '../types';

type FilterKind = DashboardFilterValue['kind'];

function normalizeValue(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getCanonicalBankKey(bankName: string): string {
  const normalized = normalizeValue(bankName);

  const aliasEntries: Array<[string[], string]> = [
    [['standardcharteredbank', 'standardchartered', 'scb'], 'standardchartered'],
    [['citibankegypt', 'citibank', 'citigroupinc', 'citi'], 'citigroup'],
    [['bankofalexandria', 'alex'], 'bankofalexandria'],
    [['emiratesnbd', 'enbd'], 'emiratesnbd'],
    [['firstabudhabibank', 'fab'], 'firstabudhabi'],
    [['saudiawwalbank', 'sab'], 'saudiawwalbank'],
    [['saudibritishbank', 'sbb'], 'saudibritishbank'],
    [['bnpparibas', 'bnp'], 'bnpparibas'],
    [['riyadbank'], 'riyadbank'],
    [['bankpasargad', 'pasargad'], 'bankpasargad'],
    [['samanbank', 'saman'], 'samanbank'],
    [['hsbc'], 'hsbc'],
    [['alrajhibank', 'alrajhi'], 'alrajhibank'],
    [['emiratesbankinternational', 'ebi'], 'emiratesbankinternational'],
    [['cibegypt', 'cib'], 'cibegypt'],
    [['societegenerale'], 'societegenerale'],
    [['stdbankofsafrica', 'standardbankofsafrica'], 'standardbankofsafrica'],
    [['nbkkuwait'], 'nbkkuwait'],
    [['gulfbank'], 'gulfbank'],
  ];

  for (const [aliases, canonical] of aliasEntries) {
    if (aliases.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

export function extractAreCode(value: string): string {
  const match = value.trim().match(/^[A-Za-z0-9]+/);
  return match ? match[0].toUpperCase() : value.trim().toUpperCase();
}

/** Get matching ARE codes for a single filter value. */
function getMatchingAreCodesForSingle(filter: DashboardFilterValue): Set<string> {
  if (filter.kind === 'entity') {
    return new Set([filter.areCode.toUpperCase()]);
  }

  if (filter.kind === 'region') {
    return new Set(
      legalEntities
        .filter((entity) => entity.region === filter.region)
        .map((entity) => entity.areCode.toUpperCase()),
    );
  }

  if (filter.kind === 'country') {
    const countryEntry = countryPresence.find((entry) => entry.countryCode === filter.countryCode);
    return new Set(
      countryEntry
        ? countryEntry.areCodes.map((code) => code.toUpperCase())
        : legalEntities
            .filter((entity) => entity.countryCode === filter.countryCode)
            .map((entity) => entity.areCode.toUpperCase()),
    );
  }

  // bankingPartner
  return new Set(
    bankAccounts
      .filter((account) => getCanonicalBankKey(account.bank) === getCanonicalBankKey(filter.bank))
      .map((account) => account.areCode.toUpperCase()),
  );
}

function unionAreCodes(filters: DashboardFilters): Set<string> {
  const combined = new Set<string>();

  for (const filter of filters) {
    for (const code of getMatchingAreCodesForSingle(filter)) {
      combined.add(code);
    }
  }

  return combined;
}

function intersectAreCodes(left: Set<string>, right: Set<string>): Set<string> {
  const intersected = new Set<string>();
  for (const code of left) {
    if (right.has(code)) {
      intersected.add(code);
    }
  }
  return intersected;
}

function filterIntersectsAreCodes(filter: DashboardFilterValue, areCodes: Set<string>): boolean {
  for (const code of getMatchingAreCodesForSingle(filter)) {
    if (areCodes.has(code)) {
      return true;
    }
  }

  return false;
}

/** Get matching ARE codes for an array of filters using OR within each kind and AND across kinds. */
export function getMatchingAreCodes(
  filters: DashboardFilters,
  options?: { excludeKinds?: FilterKind[] },
): Set<string> | null {
  const effectiveFilters = options?.excludeKinds?.length
    ? filters.filter((filter) => !options.excludeKinds?.includes(filter.kind))
    : filters;

  if (effectiveFilters.length === 0) {
    return null; // no filter = match all
  }

  const groupedFilters = new Map<FilterKind, DashboardFilterValue[]>();
  for (const filter of effectiveFilters) {
    const group = groupedFilters.get(filter.kind) ?? [];
    group.push(filter);
    groupedFilters.set(filter.kind, group);
  }

  let matchingAreCodes: Set<string> | null = null;

  for (const group of groupedFilters.values()) {
    const groupAreCodes = unionAreCodes(group);
    matchingAreCodes = matchingAreCodes ? intersectAreCodes(matchingAreCodes, groupAreCodes) : groupAreCodes;
  }

  return matchingAreCodes ?? null;
}

export function normalizeDashboardFilters(filters: DashboardFilters): DashboardFilters {
  let normalized = [...filters];

  const regionFilters = normalized.filter((filter) => filter.kind === 'region');
  if (regionFilters.length > 0) {
    const regionAreCodes = unionAreCodes(regionFilters);
    normalized = normalized.filter((filter) => filter.kind === 'region' || filterIntersectsAreCodes(filter, regionAreCodes));
  }

  const countryFilters = normalized.filter((filter) => filter.kind === 'country');
  if (countryFilters.length > 0) {
    const countryAreCodes = unionAreCodes(countryFilters);
    normalized = normalized.filter(
      (filter) => filter.kind === 'region' || filter.kind === 'country' || filterIntersectsAreCodes(filter, countryAreCodes),
    );
  }

  const entityFilters = normalized.filter((filter) => filter.kind === 'entity');
  if (entityFilters.length > 0) {
    const entityAreCodes = unionAreCodes(entityFilters);
    normalized = normalized.filter(
      (filter) => filter.kind !== 'bankingPartner' || filterIntersectsAreCodes(filter, entityAreCodes),
    );
  }

  return normalized;
}

export function matchesAreCode(filters: DashboardFilters, areCode: string | null | undefined): boolean {
  if (filters.length === 0) {
    return true;
  }

  if (!areCode) {
    return false;
  }

  const matchingAreCodes = getMatchingAreCodes(filters);
  return matchingAreCodes ? matchingAreCodes.has(extractAreCode(areCode)) : true;
}

export function matchesAnyAreCode(filters: DashboardFilters, areCodes: Array<string | null | undefined>): boolean {
  if (filters.length === 0) {
    return true;
  }

  return areCodes.some((areCode) => matchesAreCode(filters, areCode));
}

export function matchesBankName(filters: DashboardFilters, bankName: string | null | undefined): boolean {
  if (filters.length === 0) {
    return true;
  }

  const bankFilters = filters.filter((f) => f.kind === 'bankingPartner');
  if (bankFilters.length === 0) {
    return true;
  }

  if (!bankName) {
    return false;
  }

  return bankFilters.some(
    (f) => f.kind === 'bankingPartner' && getCanonicalBankKey(bankName) === getCanonicalBankKey(f.bank),
  );
}

export function getFilterSummaryLabel(filters: DashboardFilters): string {
  if (filters.length === 0) return 'All';
  if (filters.length === 1) return filters[0].label;
  return `${filters.length} filters`;
}
