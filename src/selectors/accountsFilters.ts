import { bankAccounts, type BankAccount } from '../data/accounts';
import { fetchBankAccounts, type DimBankAccount } from '../data/hr';
import { legalEntities } from '../data/legal';
import type { DashboardFilterValue, DashboardFilters, Region, ViewMode } from '../types';
import { getCanonicalBankKey } from '../utils/bankNames';

export const ACCOUNTS_FILTERS_UPDATED_EVENT = 'accounts-bank-filters-updated';
const LOCAL_BANK_STORAGE_KEY = 'accounts_bank_local';
let cachedAccountFilterRecords: AccountFilterRecord[] = [];

export interface AccountFilterRecord {
  areCode: string;
  bank: string;
  country: string;
  region: Region;
}

interface SidebarOptionLike {
  key: string;
  label: string;
  meta: string;
  filter: DashboardFilterValue;
}

interface SidebarSectionLike {
  title: string;
  items: SidebarOptionLike[];
}

function normalizeCountryValue(country: string | null | undefined): string {
  return (country ?? '').trim();
}

export function getAccountFilterCountryKey(country: string | null | undefined): string {
  return normalizeCountryValue(country).toUpperCase();
}

export function normalizeAccountFilterRegion(region: string | null | undefined): Region {
  return region?.trim().toLowerCase() === 'africa' ? 'AFRICA' : 'ME';
}

function mapDimBankAccountToFilterRecord(item: DimBankAccount): AccountFilterRecord {
  return {
    areCode: item.ARE.trim().toUpperCase(),
    bank: item.bank.trim(),
    country: normalizeCountryValue(item.country),
    region: normalizeAccountFilterRegion(item.region),
  };
}

function mapStaticBankAccountToFilterRecord(item: BankAccount): AccountFilterRecord {
  const legalEntity = legalEntities.find((entity) => entity.areCode.toUpperCase() === item.areCode.trim().toUpperCase());
  return {
    areCode: item.areCode.trim().toUpperCase(),
    bank: item.bank.trim(),
    country: normalizeCountryValue(item.country),
    region: legalEntity?.region ?? 'ME',
  };
}

function dedupeRecords(records: AccountFilterRecord[]): AccountFilterRecord[] {
  const seen = new Set<string>();
  const deduped: AccountFilterRecord[] = [];

  for (const record of records) {
    const areCode = record.areCode.trim().toUpperCase();
    const bank = record.bank.trim();
    const country = normalizeCountryValue(record.country);
    if (!areCode || !bank || !country) continue;

    const key = `${areCode}|${getCanonicalBankKey(bank)}|${getAccountFilterCountryKey(country)}|${record.region}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ areCode, bank, country, region: record.region });
  }

  return deduped;
}

function readLocalBankAccounts(): DimBankAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_BANK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as DimBankAccount[] : [];
  } catch {
    return [];
  }
}

export function getFallbackAccountFilterRecords(): AccountFilterRecord[] {
  return dedupeRecords(bankAccounts.map(mapStaticBankAccountToFilterRecord));
}

export function getCachedAccountFilterRecords(): AccountFilterRecord[] {
  if (cachedAccountFilterRecords.length === 0) {
    cachedAccountFilterRecords = getFallbackAccountFilterRecords();
  }
  return cachedAccountFilterRecords;
}

export async function loadAccountFilterRecords(): Promise<AccountFilterRecord[]> {
  const remoteBankAccounts = await fetchBankAccounts();
  const localBankAccounts = readLocalBankAccounts();
  const records = [...remoteBankAccounts, ...localBankAccounts].map(mapDimBankAccountToFilterRecord);
  cachedAccountFilterRecords = records.length > 0 ? dedupeRecords(records) : getFallbackAccountFilterRecords();
  return cachedAccountFilterRecords;
}

function filterMatchesCandidate(filter: DashboardFilterValue, candidate: {
  areCode?: string | null;
  bank?: string | null;
  country?: string | null;
  region?: string | null;
}): boolean {
  switch (filter.kind) {
    case 'region':
      return normalizeAccountFilterRegion(candidate.region) === filter.region;
    case 'country':
      return getAccountFilterCountryKey(candidate.country) === filter.countryCode.toUpperCase();
    case 'entity':
      return (candidate.areCode ?? '').trim().toUpperCase() === filter.areCode.trim().toUpperCase();
    case 'bankingPartner':
      return candidate.bank ? getCanonicalBankKey(candidate.bank) === getCanonicalBankKey(filter.bank) : false;
  }
}

export function matchesAccountsFilterCandidate(
  filters: DashboardFilters,
  candidate: {
    areCode?: string | null;
    bank?: string | null;
    country?: string | null;
    region?: string | null;
  },
): boolean {
  if (filters.length === 0) return true;

  const groupedFilters = new Map<DashboardFilterValue['kind'], DashboardFilterValue[]>();
  for (const filter of filters) {
    const group = groupedFilters.get(filter.kind) ?? [];
    group.push(filter);
    groupedFilters.set(filter.kind, group);
  }

  for (const group of groupedFilters.values()) {
    if (!group.some((filter) => filterMatchesCandidate(filter, candidate))) {
      return false;
    }
  }

  return true;
}

function isRecordInScope(
  record: AccountFilterRecord,
  filters: DashboardFilters,
  excludeKinds: DashboardFilterValue['kind'][] = [],
): boolean {
  const effectiveFilters = filters.filter((filter) => !excludeKinds.includes(filter.kind));
  return matchesAccountsFilterCandidate(effectiveFilters, record);
}

function countDistinctAres(records: AccountFilterRecord[]): number {
  return new Set(records.map((record) => record.areCode)).size;
}

export function getAccountsSidebarViewCounts(records: AccountFilterRecord[]): Record<ViewMode, number> {
  return {
    region: new Set(records.map((record) => record.region)).size,
    country: new Set(records.map((record) => getAccountFilterCountryKey(record.country))).size,
    are: new Set(records.map((record) => record.areCode)).size,
    bankingPartner: new Set(records.map((record) => getCanonicalBankKey(record.bank))).size,
  };
}

export function getAccountsSidebarSections(viewMode: ViewMode, filters: DashboardFilters, records: AccountFilterRecord[]): SidebarSectionLike[] {
  if (records.length === 0) return [];

  switch (viewMode) {
    case 'region': {
      const scopedRecords = records.filter((record) => isRecordInScope(record, filters, ['region']));
      const regionItems = (['ME', 'AFRICA'] as const)
        .map((region) => {
          const regionRecords = scopedRecords.filter((record) => record.region === region);
          if (regionRecords.length === 0) return null;
          return {
            key: `region-${region}`,
            label: region === 'ME' ? 'Middle East' : 'Africa',
            meta: `${countDistinctAres(regionRecords)} AREs`,
            filter: { kind: 'region' as const, region, label: region === 'ME' ? 'Middle East' : 'Africa' },
          };
        })
        .filter(Boolean) as SidebarOptionLike[];

      return regionItems.length > 0 ? [{ title: 'Regions', items: regionItems }] : [];
    }

    case 'country': {
      const scopedRecords = records.filter((record) => isRecordInScope(record, filters, ['country']));
      const countries = new Map<string, { country: string; region: Region; areCodes: Set<string> }>();
      for (const record of scopedRecords) {
        const key = getAccountFilterCountryKey(record.country);
        const existing = countries.get(key);
        if (existing) {
          existing.areCodes.add(record.areCode);
        } else {
          countries.set(key, { country: record.country, region: record.region, areCodes: new Set([record.areCode]) });
        }
      }

      const meItems = [...countries.entries()]
        .filter(([, item]) => item.region === 'ME')
        .sort((left, right) => left[1].country.localeCompare(right[1].country))
        .map(([key, item]) => ({
          key: `country-${key}`,
          label: item.country,
          meta: `${item.areCodes.size} AREs`,
          filter: { kind: 'country' as const, countryCode: key, label: item.country },
        }));

      const africaItems = [...countries.entries()]
        .filter(([, item]) => item.region === 'AFRICA')
        .sort((left, right) => left[1].country.localeCompare(right[1].country))
        .map(([key, item]) => ({
          key: `country-${key}`,
          label: item.country,
          meta: `${item.areCodes.size} AREs`,
          filter: { kind: 'country' as const, countryCode: key, label: item.country },
        }));

      return [
        { title: 'ME Countries', items: meItems },
        { title: 'Africa Countries', items: africaItems },
      ].filter((section) => section.items.length > 0);
    }

    case 'are': {
      const scopedRecords = records.filter((record) => isRecordInScope(record, filters, ['entity']));
      const entities = new Map<string, { country: string; region: Region }>();
      for (const record of scopedRecords) {
        if (!entities.has(record.areCode)) {
          entities.set(record.areCode, { country: record.country, region: record.region });
        }
      }

      const meItems = [...entities.entries()]
        .filter(([, item]) => item.region === 'ME')
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([areCode, item]) => ({
          key: `entity-${areCode}`,
          label: `${areCode} ${item.country}`,
          meta: item.country,
          filter: { kind: 'entity' as const, areCode, label: `${areCode} ${item.country}` },
        }));

      const africaItems = [...entities.entries()]
        .filter(([, item]) => item.region === 'AFRICA')
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([areCode, item]) => ({
          key: `entity-${areCode}`,
          label: `${areCode} ${item.country}`,
          meta: item.country,
          filter: { kind: 'entity' as const, areCode, label: `${areCode} ${item.country}` },
        }));

      return [
        { title: 'ME AREs', items: meItems },
        { title: 'Africa AREs', items: africaItems },
      ].filter((section) => section.items.length > 0);
    }

    case 'bankingPartner': {
      const scopedRecords = records.filter((record) => isRecordInScope(record, filters, ['bankingPartner']));
      const banks = new Map<string, { bank: string; accountCount: number }>();
      for (const record of scopedRecords) {
        const key = getCanonicalBankKey(record.bank);
        const existing = banks.get(key);
        if (existing) {
          existing.accountCount += 1;
        } else {
          banks.set(key, { bank: record.bank, accountCount: 1 });
        }
      }

      return [{
        title: 'Banking Partners',
        items: [...banks.values()]
          .sort((left, right) => left.bank.localeCompare(right.bank))
          .map((item) => ({
            key: `bank-${getCanonicalBankKey(item.bank)}`,
            label: item.bank,
            meta: `${item.accountCount} accounts`,
            filter: { kind: 'bankingPartner' as const, bank: item.bank, label: item.bank },
          })),
      }];
    }
  }
}
