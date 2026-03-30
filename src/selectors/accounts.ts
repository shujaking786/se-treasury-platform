import { bankAccounts, depositAccounts } from '../data';
import type { DashboardFilters } from '../types';
import { matchesAreCode, matchesBankName } from './filtering';

interface DerivedBankingPartnerSummary {
  bank: string;
  accountCount: number;
  totalBalanceEur: number;
  entities: string[];
  currencies: string[];
}

function formatEur(value: number): string {
  if (value === 0) {
    return '\u20AC0';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}\u20AC${(abs / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  }

  return `${sign}\u20AC${abs.toFixed(0)}`;
}

function deriveBankingPartnerSummary(filteredAccounts: typeof bankAccounts): DerivedBankingPartnerSummary[] {
  const summaryMap = new Map<string, DerivedBankingPartnerSummary>();

  for (const account of filteredAccounts) {
    const existing = summaryMap.get(account.bank);

    if (existing) {
      existing.accountCount += 1;
      existing.totalBalanceEur += account.balanceEur;

      if (!existing.entities.includes(account.areCode)) {
        existing.entities.push(account.areCode);
      }

      if (!existing.currencies.includes(account.ccy)) {
        existing.currencies.push(account.ccy);
      }

      continue;
    }

    summaryMap.set(account.bank, {
      bank: account.bank,
      accountCount: 1,
      totalBalanceEur: account.balanceEur,
      entities: [account.areCode],
      currencies: [account.ccy],
    });
  }

  return [...summaryMap.values()].sort((left, right) => right.totalBalanceEur - left.totalBalanceEur);
}

export function selectAccountsViewModel(filter: DashboardFilters) {
  const filteredBankAccounts = bankAccounts.filter(
    (account) => matchesAreCode(filter, account.areCode) && matchesBankName(filter, account.bank),
  );
  const filteredDepositAccounts = depositAccounts.filter(
    (deposit) => matchesAreCode(filter, deposit.areCode) && matchesBankName(filter, deposit.bank),
  );
  const bankingPartners = deriveBankingPartnerSummary(filteredBankAccounts);
  const totalExternalBalanceEur = filteredBankAccounts.reduce((sum, account) => sum + account.balanceEur, 0);
  const uniqueCurrencies = new Set(filteredBankAccounts.map((account) => account.ccy)).size;

  return {
    kpis: [
      {
        label: 'Total Accounts',
        value: String(filteredBankAccounts.length),
        valueColor: 'white' as const,
        subtitle: 'External bank accounts in scope',
        gradient: 'default' as const,
      },
      {
        label: 'Banking Partners',
        value: String(bankingPartners.length),
        valueColor: 'white' as const,
        subtitle: 'Distinct banking relationships',
        gradient: 'default' as const,
      },
      {
        label: 'Currencies',
        value: String(uniqueCurrencies),
        valueColor: 'white' as const,
        subtitle: 'Active currencies in scope',
        gradient: 'green' as const,
      },
      {
        label: 'Total Ext. Balance',
        value: formatEur(totalExternalBalanceEur),
        valueColor: totalExternalBalanceEur > 0 ? 'green' as const : 'white' as const,
        subtitle: 'Sum of filtered external balances',
        gradient: 'green' as const,
      },
    ],
    bankAccounts: filteredBankAccounts,
    bankingPartners,
    depositAccounts: filteredDepositAccounts,
  };
}
