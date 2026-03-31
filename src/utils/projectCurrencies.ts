import { bankAccounts, depositAccounts } from '../data/accounts';

const STORAGE_CURRENCY_FIELDS: Array<{ key: string; field: string }> = [
  { key: 'accounts_external_local', field: 'CCY' },
  { key: 'accounts_deposit_local', field: 'ccy' },
  { key: 'hr_fundings_local', field: 'CCY' },
  { key: 'accounting_fundings_local', field: 'CCY' },
];

function normalizeCurrency(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim().toUpperCase();
  return trimmed ? trimmed : null;
}

function readStoredCurrencies(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const currencies: string[] = [];

  for (const entry of STORAGE_CURRENCY_FIELDS) {
    try {
      const raw = localStorage.getItem(entry.key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        continue;
      }

      for (const item of parsed) {
        const normalized = normalizeCurrency(item?.[entry.field]);
        if (normalized) {
          currencies.push(normalized);
        }
      }
    } catch {
      // Ignore malformed local state and continue collecting from other sources.
    }
  }

  return currencies;
}

export function getAllProjectCurrencyCodes(extraValues: Array<string | null | undefined> = []): string[] {
  const allCurrencies = [
    ...bankAccounts.map((account) => account.ccy),
    ...depositAccounts.map((account) => account.ccy),
    ...readStoredCurrencies(),
    ...extraValues,
  ]
    .map(normalizeCurrency)
    .filter((value): value is string => Boolean(value));

  return [...new Set(allCurrencies)].sort();
}
