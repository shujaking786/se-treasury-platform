export interface BankAccount {
  areCode: string;
  entityName: string;
  country: string;
  bank: string;
  accountNumber: string;
  ccy: string;
  balance: number;
  balanceEur: number;
  comment: string | null;
  type: 'external' | 'internal';
  isPayroll: boolean;
}

export interface BankingPartnerSummary {
  bank: string;
  accountCount: number;
  totalBalanceEur: number;
  entities: string[];
  currencies: string[];
}

export interface DepositAccount {
  areCode: string;
  entityName: string;
  bank: string;
  accountNumber: string;
  ccy: string;
  interestRate: number;
  amount: number;
  amountEur: number;
  term: 'short' | 'long';
}

export const bankAccounts: BankAccount[] = [
  // 519X — Qatar — SCB
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', bank: 'Standard Chartered Bank', accountNumber: 'QA58SCBL…EUR', ccy: 'EUR', balance: 152338.47, balanceEur: 152338.47, comment: null, type: 'external', isPayroll: false },
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', bank: 'Standard Chartered Bank', accountNumber: 'QA44SCBL…GBP', ccy: 'GBP', balance: 5727.46, balanceEur: 6554.66, comment: null, type: 'external', isPayroll: false },
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', bank: 'Standard Chartered Bank', accountNumber: 'QA84SCBL…QAR', ccy: 'QAR', balance: 11885304.83, balanceEur: 2774561.42, comment: 'PR 4.2: 4.3mio', type: 'external', isPayroll: false },
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', bank: 'Standard Chartered Bank', accountNumber: 'QA46SCBL…USD', ccy: 'USD', balance: 4069664.83, balanceEur: 3462660.48, comment: null, type: 'external', isPayroll: false },
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', bank: 'Standard Chartered Bank', accountNumber: 'QA20SCBL…QAR', ccy: 'QAR', balance: 299900, balanceEur: 70010.07, comment: null, type: 'external', isPayroll: false },
  // 519X — HSBC
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', bank: 'HSBC', accountNumber: 'BBMEQA17…QAR', ccy: 'QAR', balance: 2023776.25, balanceEur: 472439.84, comment: null, type: 'external', isPayroll: false },

  // 4659 — Saudi Arabia — BNP
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'BNP Paribas', accountNumber: '47623003…EUR', ccy: 'EUR', balance: 1926.92, balanceEur: 1926.92, comment: null, type: 'external', isPayroll: false },
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'BNP Paribas', accountNumber: 'SA30031…SAR', ccy: 'SAR', balance: 17252994.85, balanceEur: 3913636.57, comment: 'PR 4.2: 12.8mio. Sweep 3.5mio to SAB', type: 'external', isPayroll: false },
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'BNP Paribas', accountNumber: '47623003…USD', ccy: 'USD', balance: 3400085.52, balanceEur: 2892951.20, comment: 'Sweep 560k to Nostro', type: 'external', isPayroll: false },
  // 4659 — SCB
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'Standard Chartered Bank', accountNumber: 'SA4091…SAR', ccy: 'SAR', balance: 146335.31, balanceEur: 33194.42, comment: null, type: 'external', isPayroll: false },
  // 4659 — Saudi Awwal Bank
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'Saudi Awwal Bank', accountNumber: '3607777001', ccy: 'SAR', balance: 25280080.77, balanceEur: 5734485.49, comment: 'Customs 1.7mio. Fund 3.5mio from BNP', type: 'external', isPayroll: false },
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'Saudi Awwal Bank', accountNumber: 'SA1345…EUR', ccy: 'EUR', balance: 724.30, balanceEur: 724.30, comment: null, type: 'external', isPayroll: false },
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'Saudi Awwal Bank', accountNumber: 'SA4045…USD', ccy: 'USD', balance: 5851.33, balanceEur: 4978.58, comment: null, type: 'external', isPayroll: false },
  // 4659 — FAB
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'First Abu Dhabi Bank', accountNumber: 'SA9473…SAR', ccy: 'SAR', balance: 59005.57, balanceEur: 13384.71, comment: null, type: 'external', isPayroll: false },
  // 4659 — EBI
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'Emirates Bank International', accountNumber: 'SA4195…SAR', ccy: 'SAR', balance: 134118.65, balanceEur: 30423.22, comment: null, type: 'external', isPayroll: false },
  // 4659 — Alrajhi
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', bank: 'Alrajhi Bank', accountNumber: 'SA9880…SAR', ccy: 'SAR', balance: 0, balanceEur: 0, comment: null, type: 'external', isPayroll: false },

  // 4PD7 — Saudi Arabia — Saudi British Bank
  { areCode: '4PD7', entityName: 'Siemens Energy Regional HQ', country: 'Saudi Arabia', bank: 'Saudi British Bank', accountNumber: 'SA5745…SAR', ccy: 'SAR', balance: 2723455.89, balanceEur: 617704.72, comment: null, type: 'external', isPayroll: false },
  { areCode: '4PD7', entityName: 'Siemens Energy Regional HQ', country: 'Saudi Arabia', bank: 'Saudi British Bank', accountNumber: 'SA8045…USD', ccy: 'USD', balance: 1012.75, balanceEur: 850.52, comment: null, type: 'external', isPayroll: false },

  // 516S — Saudi Arabia — Riyad Bank
  { areCode: '516S', entityName: 'Dresser-Rand Arabia LLC', country: 'Saudi Arabia', bank: 'Riyad Bank', accountNumber: '3020489…SAR', ccy: 'SAR', balance: 194209359.90, balanceEur: 44054082.20, comment: 'Shareholder issue', type: 'external', isPayroll: false },
  { areCode: '516S', entityName: 'Dresser-Rand Arabia LLC', country: 'Saudi Arabia', bank: 'Riyad Bank', accountNumber: '3020489…USD', ccy: 'USD', balance: 19288711.27, balanceEur: 16411734.40, comment: null, type: 'external', isPayroll: false },

  // 5402 — Egypt — Citi
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: '100547538', ccy: 'EGP', balance: 28537.83, balanceEur: 510.65, comment: 'Payroll Account', type: 'external', isPayroll: true },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: 'CITIEGCX…EGP', ccy: 'EGP', balance: 38102496.43, balanceEur: 681794.64, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: 'EG96…EUR', ccy: 'EUR', balance: 0, balanceEur: 0, comment: 'Payroll Account', type: 'external', isPayroll: true },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: '100547058EUR', ccy: 'EUR', balance: 14031442.41, balanceEur: 14031442.41, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: '100547015', ccy: 'GBP', balance: 3126472.41, balanceEur: 3578018.19, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: '100547252SEK', ccy: 'SEK', balance: 9137240.39, balanceEur: 854626.20, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Citi Bank Egypt', accountNumber: '100547031USD', ccy: 'USD', balance: 6189908.70, balanceEur: 5266662.77, comment: null, type: 'external', isPayroll: false },
  // 5402 — ALEX
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Bank of Alexandria', accountNumber: '101796009001EGP', ccy: 'EGP', balance: 185726.91, balanceEur: 3323.34, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Bank of Alexandria', accountNumber: '101796009003EUR', ccy: 'EUR', balance: 9580913.89, balanceEur: 9580913.89, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Bank of Alexandria', accountNumber: '101796009002USD', ccy: 'USD', balance: 675736.20, balanceEur: 574947.85, comment: null, type: 'external', isPayroll: false },
  // 5402 — ENBD
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Emirates NBD', accountNumber: '499000026905', ccy: 'EGP', balance: 922208.21, balanceEur: 16501.72, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Emirates NBD', accountNumber: 'EG49…EUR', ccy: 'EUR', balance: 459837.15, balanceEur: 459837.15, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Emirates NBD', accountNumber: 'EG76…USD', ccy: 'USD', balance: 991183.80, balanceEur: 843345.37, comment: null, type: 'external', isPayroll: false },
  // 5402 — FAB Egypt
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'First Abu Dhabi Bank', accountNumber: '5500061531', ccy: 'EGP', balance: 291833.08, balanceEur: 5221.97, comment: null, type: 'external', isPayroll: false },
  // 5402 — CIB
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'CIB Egypt', accountNumber: '100010771875', ccy: 'EGP', balance: 1133273.09, balanceEur: 20278.45, comment: null, type: 'external', isPayroll: false },
  // 5402 — SCB Egypt
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Standard Chartered Bank', accountNumber: 'EG76…EGP', ccy: 'EGP', balance: 436463755.99, balanceEur: 7809951.51, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Standard Chartered Bank', accountNumber: 'EG23…EUR', ccy: 'EUR', balance: 319805.60, balanceEur: 319805.60, comment: null, type: 'external', isPayroll: false },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', bank: 'Standard Chartered Bank', accountNumber: 'EG81…USD', ccy: 'USD', balance: 351077.06, balanceEur: 298712.72, comment: null, type: 'external', isPayroll: false },

  // 5665 — Iran — Pasargad
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', bank: 'Bank Pasargad', accountNumber: '3837160…EUR', ccy: 'EUR', balance: 745827.66, balanceEur: 745827.66, comment: null, type: 'external', isPayroll: false },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', bank: 'Bank Pasargad', accountNumber: '3837200…EUR', ccy: 'EUR', balance: 1671603.78, balanceEur: 1671603.78, comment: null, type: 'external', isPayroll: false },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', bank: 'Bank Pasargad', accountNumber: '383110…IRR', ccy: 'IRR', balance: 46210272280, balanceEur: 27726.16, comment: null, type: 'external', isPayroll: false },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', bank: 'Bank Pasargad', accountNumber: 'BKBPIR38…IRR', ccy: 'IRR', balance: 371958419239, balanceEur: 223175.05, comment: null, type: 'external', isPayroll: false },
  // 5665 — Saman
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', bank: 'Saman Bank', accountNumber: '61174123…EUR', ccy: 'EUR', balance: 484831.94, balanceEur: 484831.94, comment: null, type: 'external', isPayroll: false },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', bank: 'Saman Bank', accountNumber: '6114023…IRR', ccy: 'IRR', balance: 1644125171, balanceEur: 986.48, comment: null, type: 'external', isPayroll: false },
];

export const bankingPartnerSummary: BankingPartnerSummary[] = [
  { bank: 'Standard Chartered Bank', accountCount: 9, totalBalanceEur: 14608233.65, entities: ['519X', '4659', '5402'], currencies: ['EUR', 'GBP', 'QAR', 'USD', 'SAR', 'EGP'] },
  { bank: 'Citi Bank Egypt', accountCount: 7, totalBalanceEur: 24413054.86, entities: ['5402'], currencies: ['EGP', 'EUR', 'GBP', 'SEK', 'USD'] },
  { bank: 'BNP Paribas', accountCount: 3, totalBalanceEur: 6808514.69, entities: ['4659'], currencies: ['EUR', 'SAR', 'USD'] },
  { bank: 'Saudi Awwal Bank', accountCount: 3, totalBalanceEur: 5740188.37, entities: ['4659'], currencies: ['SAR', 'EUR', 'USD'] },
  { bank: 'Bank of Alexandria', accountCount: 3, totalBalanceEur: 10159185.08, entities: ['5402'], currencies: ['EGP', 'EUR', 'USD'] },
  { bank: 'Riyad Bank', accountCount: 2, totalBalanceEur: 60465816.60, entities: ['516S'], currencies: ['SAR', 'USD'] },
  { bank: 'Bank Pasargad', accountCount: 4, totalBalanceEur: 2668332.65, entities: ['5665'], currencies: ['EUR', 'IRR'] },
  { bank: 'Emirates NBD', accountCount: 3, totalBalanceEur: 1319684.24, entities: ['5402'], currencies: ['EGP', 'EUR', 'USD'] },
  { bank: 'HSBC', accountCount: 1, totalBalanceEur: 472439.84, entities: ['519X'], currencies: ['QAR'] },
  { bank: 'First Abu Dhabi Bank', accountCount: 2, totalBalanceEur: 18606.68, entities: ['4659', '5402'], currencies: ['SAR', 'EGP'] },
  { bank: 'Emirates Bank International', accountCount: 1, totalBalanceEur: 30423.22, entities: ['4659'], currencies: ['SAR'] },
  { bank: 'Saudi British Bank', accountCount: 2, totalBalanceEur: 618555.24, entities: ['4PD7'], currencies: ['SAR', 'USD'] },
  { bank: 'Saman Bank', accountCount: 2, totalBalanceEur: 485818.42, entities: ['5665'], currencies: ['EUR', 'IRR'] },
  { bank: 'Alrajhi Bank', accountCount: 1, totalBalanceEur: 0, entities: ['4659'], currencies: ['SAR'] },
  { bank: 'CIB Egypt', accountCount: 1, totalBalanceEur: 20278.45, entities: ['5402'], currencies: ['EGP'] },
];

export const depositAccounts: DepositAccount[] = [
  // 5665 Iran — Pasargad Short Term
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383.303.1…IRR', ccy: 'IRR', interestRate: 0.27, amount: 800_000_000_000, amountEur: 1465687.34, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383.303.2…IRR', ccy: 'IRR', interestRate: 0.27, amount: 750_000_000_000, amountEur: 1374081.88, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383.312.1…IRR', ccy: 'IRR', interestRate: 0.27, amount: 1_800_000_000_000, amountEur: 3297796.52, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383.312.2…IRR', ccy: 'IRR', interestRate: 0.27, amount: 1_500_000_000_000, amountEur: 2748163.77, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383-9422…EUR-5', ccy: 'EUR', interestRate: 0.0125, amount: 2_000_000, amountEur: 2000000, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383-9422…EUR-1', ccy: 'EUR', interestRate: 0.0125, amount: 5_000_000, amountEur: 5000000, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Bank Pasargad', accountNumber: '383-9422…EUR-2', ccy: 'EUR', interestRate: 0.0125, amount: 4_000_000, amountEur: 4000000, term: 'short' },
  // 5665 Iran — Saman Short Term
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Saman Bank', accountNumber: '611-613…EUR-5', ccy: 'EUR', interestRate: 0.0025, amount: 4_000_000, amountEur: 4000000, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Saman Bank', accountNumber: '611-613…EUR-2', ccy: 'EUR', interestRate: 0.0025, amount: 3_000_000, amountEur: 3000000, term: 'short' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', bank: 'Saman Bank', accountNumber: '611-613…EUR-4', ccy: 'EUR', interestRate: 0.0025, amount: 1_500_000, amountEur: 1500000, term: 'short' },
  // 5402 Egypt — Citi deposit
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'Citi Bank Egypt', accountNumber: 'Citi EUR Deposit', ccy: 'EUR', interestRate: 0.0185, amount: 15_000_000, amountEur: 15000000, term: 'short' },
  // 5402 Egypt — ENBD deposit
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'Emirates NBD', accountNumber: 'ENBD USD Deposit', ccy: 'USD', interestRate: 0.035, amount: 6_500_000, amountEur: 5453477.64, term: 'short' },
];
