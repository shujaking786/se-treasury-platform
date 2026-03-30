import type { BankingPartnerLimit } from '../types';

export const bankingPartnerLimits: BankingPartnerLimit[] = [
  { partner: 'Soci\u00E9t\u00E9 G\u00E9n\u00E9rale', hqLimitEur: 30.0, actualBalanceEur: 35.6, utilizationPct: 118.7, status: 'BREACH', relatedAres: ['4PD7', '516S'] },
  { partner: 'Bank Pasargad', hqLimitEur: 10.0, actualBalanceEur: 23.0, utilizationPct: 229.6, status: 'BREACH', relatedAres: ['5665 Iran'] },
  { partner: 'Riyad Bank', hqLimitEur: 60.0, actualBalanceEur: 59.3, utilizationPct: 98.9, status: 'NEAR_LIMIT', relatedAres: ['516S Saudi'] },
  { partner: 'Standard Chartered', hqLimitEur: 50.0, actualBalanceEur: 29.2, utilizationPct: 58.3, status: 'ELEVATED', relatedAres: ['519X', '463G', '4678', '523S'] },
  { partner: 'Std. Bank of S.Africa', hqLimitEur: 50.0, actualBalanceEur: 25.8, utilizationPct: 51.7, status: 'ELEVATED', relatedAres: ['479X', '543X'] },
  { partner: 'Citigroup Inc', hqLimitEur: 110.0, actualBalanceEur: 31.4, utilizationPct: 28.5, status: 'SAFE', relatedAres: ['4659', '4732', '4PB7', '5402'] },
  { partner: 'NBK Kuwait', hqLimitEur: 10.0, actualBalanceEur: 2.1, utilizationPct: 21.2, status: 'SAFE', relatedAres: ['4732'] },
  { partner: 'Saudi British Bank', hqLimitEur: 20.0, actualBalanceEur: 1.2, utilizationPct: 5.8, status: 'SAFE', relatedAres: ['4PD7'] },
  { partner: 'ENBD', hqLimitEur: 20.0, actualBalanceEur: 0.66, utilizationPct: 3.3, status: 'SAFE', relatedAres: ['523S'] },
  { partner: 'Gulf Bank', hqLimitEur: 10.0, actualBalanceEur: 0.10, utilizationPct: 1.0, status: 'SAFE', relatedAres: ['5665'] },
];
