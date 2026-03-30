export interface LegalEntity {
  areCode: string;
  name: string;
  country: string;
  countryCode: string;
  region: 'ME' | 'AFRICA';
  externalLiquidityEur: number;
  netPositionEur: number;
  bankingPartners: string[];
  accountCount: number;
}

export interface ExternalFacility {
  areCode: string;
  entityName: string;
  bank: string;
  type: 'Overdraft' | 'FX OD' | 'FX Line' | 'Credit Line';
  interestRate: number;
  limit: number;
  limitCcy: string;
  utilized: number;
  glosExpiry: string | null;
}

export interface InternalLoan {
  areCode: string;
  entityName: string;
  instrument: string;
  fixedRate: number;
  amount: number;
  amountCcy: string;
  amountEur: number;
  expiry: string;
}

export interface InterestRateEntry {
  areCode: string;
  entityName: string;
  ccy: string;
  overdraftRate: number | null;
  depositRate: number | null;
  asOf: string;
}

export const legalEntities: LegalEntity[] = [
  // Middle East
  { areCode: '519X', name: 'Siemens Energy WLL', country: 'Qatar', countryCode: 'QA', region: 'ME', externalLiquidityEur: 6938564.94, netPositionEur: 5948666.51, bankingPartners: ['SCB', 'HSBC'], accountCount: 6 },
  { areCode: '4659', name: 'Siemens Energy LLC', country: 'Saudi Arabia', countryCode: 'SA', region: 'ME', externalLiquidityEur: 12625705.41, netPositionEur: 9382191.32, bankingPartners: ['BNP', 'SCB', 'SAB', 'FAB', 'EBI', 'Alrajhi'], accountCount: 10 },
  { areCode: '4PD7', name: 'Siemens Energy Regional HQ', country: 'Saudi Arabia', countryCode: 'SA', region: 'ME', externalLiquidityEur: 618555.24, netPositionEur: 618555.24, bankingPartners: ['SBB'], accountCount: 2 },
  { areCode: '516S', name: 'Dresser-Rand Arabia LLC', country: 'Saudi Arabia', countryCode: 'SA', region: 'ME', externalLiquidityEur: 60465816.60, netPositionEur: 60465816.60, bankingPartners: ['Riyad Bank'], accountCount: 2 },
  { areCode: '463G', name: 'Siemens Energy Oman', country: 'Oman', countryCode: 'OM', region: 'ME', externalLiquidityEur: 1185059.17, netPositionEur: 888666.01, bankingPartners: [], accountCount: 0 },
  { areCode: '4732', name: 'Siemens Energy Kuwait', country: 'Kuwait', countryCode: 'KW', region: 'ME', externalLiquidityEur: 1318667.86, netPositionEur: 1153483.27, bankingPartners: [], accountCount: 0 },
  { areCode: '4PB7', name: 'Siemens Energy Kuwait (D-R)', country: 'Kuwait', countryCode: 'KW', region: 'ME', externalLiquidityEur: 67278.30, netPositionEur: 67278.30, bankingPartners: [], accountCount: 0 },
  { areCode: '4678', name: 'Siemens Energy FZE', country: 'UAE', countryCode: 'AE', region: 'ME', externalLiquidityEur: 3192789.91, netPositionEur: -28410.62, bankingPartners: [], accountCount: 0 },
  { areCode: '523S', name: 'Siemens Energy UAE (D-R)', country: 'UAE', countryCode: 'AE', region: 'ME', externalLiquidityEur: 1524396.73, netPositionEur: 1490128.64, bankingPartners: [], accountCount: 0 },
  { areCode: '548X', name: 'Siemens Energy Sudan', country: 'Sudan', countryCode: 'SD', region: 'ME', externalLiquidityEur: 100318.80, netPositionEur: 200637.59, bankingPartners: [], accountCount: 0 },
  { areCode: '5402', name: 'Siemens Technologies S.A.E.', country: 'Egypt', countryCode: 'EG', region: 'ME', externalLiquidityEur: 64799372.07, netPositionEur: 64799372.07, bankingPartners: ['Citi', 'ALEX', 'ENBD', 'FAB', 'CIB', 'SCB'], accountCount: 19 },
  { areCode: '4PD4', name: 'Siemens Energy Pakistan', country: 'Pakistan', countryCode: 'PK', region: 'ME', externalLiquidityEur: 14987029.27, netPositionEur: 14987029.27, bankingPartners: [], accountCount: 0 },
  { areCode: '5665', name: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', countryCode: 'IR', region: 'ME', externalLiquidityEur: 31543017.58, netPositionEur: 31569972.52, bankingPartners: ['Pasargad', 'Saman'], accountCount: 7 },
  // Africa
  { areCode: '4PD3', name: 'Siemens Energy Algeria', country: 'Algeria', countryCode: 'DZ', region: 'AFRICA', externalLiquidityEur: 14541846.86, netPositionEur: 14541846.86, bankingPartners: [], accountCount: 0 },
  { areCode: '543X', name: 'Siemens Energy South Africa', country: 'South Africa', countryCode: 'ZA', region: 'AFRICA', externalLiquidityEur: 1189226.31, netPositionEur: 1189226.31, bankingPartners: [], accountCount: 0 },
  { areCode: '461T', name: 'Siemens Energy Ghana', country: 'Ghana', countryCode: 'GH', region: 'AFRICA', externalLiquidityEur: 2613052.94, netPositionEur: 2613052.94, bankingPartners: [], accountCount: 0 },
  { areCode: '479X', name: 'Siemens Energy East Africa', country: 'TZ, UG, MO, ZW', countryCode: 'TZ', region: 'AFRICA', externalLiquidityEur: 28440042.20, netPositionEur: 28440042.20, bankingPartners: [], accountCount: 0 },
  { areCode: '452D', name: 'Siemens Energy Morocco', country: 'Morocco', countryCode: 'MA', region: 'AFRICA', externalLiquidityEur: 1707861.96, netPositionEur: 1707861.96, bankingPartners: [], accountCount: 0 },
  { areCode: '412W', name: 'Siemens Energy Ivory Coast', country: 'Ivory Coast', countryCode: 'CI', region: 'AFRICA', externalLiquidityEur: 32020802.54, netPositionEur: 32020802.54, bankingPartners: [], accountCount: 0 },
  { areCode: '519G', name: 'Siemens Energy Angola', country: 'Angola', countryCode: 'AO', region: 'AFRICA', externalLiquidityEur: 7593760.26, netPositionEur: 7593760.26, bankingPartners: [], accountCount: 0 },
  { areCode: '5423', name: 'Siemens Energy Nigeria', country: 'Nigeria', countryCode: 'NG', region: 'AFRICA', externalLiquidityEur: 62908016.47, netPositionEur: 62908016.47, bankingPartners: [], accountCount: 0 },
  { areCode: '490S', name: 'Siemens Energy Nigeria (2)', country: 'Nigeria', countryCode: 'NG', region: 'AFRICA', externalLiquidityEur: 5556086.47, netPositionEur: 5556086.47, bankingPartners: [], accountCount: 0 },
];

export const externalFacilities: ExternalFacility[] = [
  // 5402 Egypt
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'Citibank', type: 'Overdraft', interestRate: 0.215, limit: 125800000, limitCcy: 'EGP', utilized: 0, glosExpiry: null },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'Emirates NBD', type: 'FX OD', interestRate: 0.09165, limit: 9313725.49, limitCcy: 'EGP', utilized: 0, glosExpiry: null },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'Emirates NBD', type: 'FX Line', interestRate: 0.21, limit: 475000000, limitCcy: 'EGP', utilized: 0, glosExpiry: null },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'Bank of Alexandria', type: 'Overdraft', interestRate: 0.2125, limit: 100000000, limitCcy: 'EGP', utilized: 0, glosExpiry: null },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', bank: 'CIB Egypt', type: 'Overdraft', interestRate: 0.21, limit: 1500000000, limitCcy: 'EGP', utilized: 0, glosExpiry: null },
];

export const internalLoans: InternalLoan[] = [
  // 516S — Dresser-Rand
  { areCode: '516S', entityName: 'Dresser-Rand Arabia LLC', instrument: 'Loan USD', fixedRate: 0.00299, amount: 68872023.71, amountCcy: 'USD', amountEur: 57785803.0, expiry: '2022-05-15' },
  // 5402 — Egypt internal deposits
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', instrument: 'Citi EUR Deposit', fixedRate: 0.0185, amount: 15000000, amountCcy: 'EUR', amountEur: 15000000, expiry: '2026-02-09' },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', instrument: 'ENBD USD Deposit', fixedRate: 0.035, amount: 5453477.64, amountCcy: 'USD', amountEur: 5453477.64, expiry: '2026-02-09' },
];

export const interestRates: InterestRateEntry[] = [
  // 5402 Egypt
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', ccy: 'EUR', overdraftRate: null, depositRate: null, asOf: '2025-12-01' },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', ccy: 'USD', overdraftRate: null, depositRate: null, asOf: '2025-12-01' },
  // 5665 Iran
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', ccy: 'EUR', overdraftRate: null, depositRate: null, asOf: '2025-12-01' },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', ccy: 'USD', overdraftRate: null, depositRate: null, asOf: '2025-12-01' },
];
