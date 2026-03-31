export interface EntityContact {
  areCode: string;
  entityName: string;
  country: string;
  region: 'ME' | 'AFRICA';
  cfo: string | null;
  hoa: string | null;
}

export interface PayrollAccount {
  areCode: string;
  entityName: string;
  country: string;
  bank: string;
  accountNumber: string;
  ccy: string;
  balance: number;
  balanceEur: number;
}

export interface HrFunding {
  ARE_Code: string;
  ARE_Name: string;
  CCY: string;
  Purpose: string;
  Bank_Name: string;
  IBAN: string;
  date: string;
  Amount: number;
}

export interface CountryPresence {
  country: string;
  countryCode: string;
  region: 'ME' | 'AFRICA';
  entityCount: number;
  areCodes: string[];
}

export const entityContacts: EntityContact[] = [
  { areCode: '519X', entityName: 'Siemens Energy WLL', country: 'Qatar', region: 'ME', cfo: null, hoa: null },
  { areCode: '4659', entityName: 'Siemens Energy LLC', country: 'Saudi Arabia', region: 'ME', cfo: null, hoa: null },
  { areCode: '4PD7', entityName: 'Siemens Energy Regional HQ', country: 'Saudi Arabia', region: 'ME', cfo: null, hoa: null },
  { areCode: '516S', entityName: 'Dresser-Rand Arabia LLC', country: 'Saudi Arabia', region: 'ME', cfo: null, hoa: null },
  { areCode: '463G', entityName: 'Siemens Energy Oman', country: 'Oman', region: 'ME', cfo: null, hoa: null },
  { areCode: '4732', entityName: 'Siemens Energy Kuwait', country: 'Kuwait', region: 'ME', cfo: null, hoa: null },
  { areCode: '4PB7', entityName: 'Siemens Energy Kuwait (D-R)', country: 'Kuwait', region: 'ME', cfo: null, hoa: null },
  { areCode: '4678', entityName: 'Siemens Energy FZE', country: 'UAE', region: 'ME', cfo: null, hoa: null },
  { areCode: '523S', entityName: 'Siemens Energy UAE (D-R)', country: 'UAE', region: 'ME', cfo: null, hoa: null },
  { areCode: '548X', entityName: 'Siemens Energy Sudan', country: 'Sudan', region: 'ME', cfo: null, hoa: null },
  { areCode: '5402', entityName: 'Siemens Technologies S.A.E.', country: 'Egypt', region: 'ME', cfo: null, hoa: null },
  { areCode: '4PD4', entityName: 'Siemens Energy Pakistan', country: 'Pakistan', region: 'ME', cfo: null, hoa: null },
  { areCode: '5665', entityName: 'Siemens Sherkate Sahami (Khass)', country: 'Iran', region: 'ME', cfo: null, hoa: null },
  { areCode: '4PD3', entityName: 'Siemens Energy Algeria', country: 'Algeria', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '543X', entityName: 'Siemens Energy South Africa', country: 'South Africa', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '461T', entityName: 'Siemens Energy Ghana', country: 'Ghana', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '479X', entityName: 'Siemens Energy East Africa', country: 'TZ, UG, MO, ZW', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '452D', entityName: 'Siemens Energy Morocco', country: 'Morocco', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '412W', entityName: 'Siemens Energy Ivory Coast', country: 'Ivory Coast', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '519G', entityName: 'Siemens Energy Angola', country: 'Angola', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '5423', entityName: 'Siemens Energy Nigeria', country: 'Nigeria', region: 'AFRICA', cfo: null, hoa: null },
  { areCode: '490S', entityName: 'Siemens Energy Nigeria (2)', country: 'Nigeria', region: 'AFRICA', cfo: null, hoa: null },
];

export const payrollAccounts: PayrollAccount[] = [];

export async function fetchHrFunding(): Promise<HrFunding[]> {
  const response = await fetch('/data/hr_funding.json');
  if (!response.ok) return [];
  const json = await response.json();
  return json?.data?.hr_fundings?.items ?? [];
}

export interface AccountingFunding {
  ARE_Code: string;
  CCY: string;
  Purpose: string;
  Bank_Name: string;
  IBAN: string;
  Amount: number;
  date: string;
}

export async function fetchAccountingFunding(): Promise<AccountingFunding[]> {
  const response = await fetch('/data/accounting_funding.json');
  if (!response.ok) return [];
  const json = await response.json();
  return json?.data?.accounting_fundings?.items ?? [];
}

export interface FsrAccountDetail {
  ARE_Code: string | null;
  Entity_Name: string | null;
  Account_Type: string;
  Bank_Name: string | null;
  Account: string;
  CCY: string;
  Closing_Balance: number;
  Closing_Balance_EUR: number;
  Closing_Balance_Local_CCY: number | null;
  Local_CCY: string | null;
}

export interface DimBankAccount {
  account_name: string;
  bank: string;
  CCY: string;
  ARE: string;
  are_name: string;
  country: string;
  currency: string;
  region: string;
}

export async function fetchFsrAccountDetails(): Promise<FsrAccountDetail[]> {
  const response = await fetch('/data/fsr_account_details.json');
  if (!response.ok) return [];
  const json = await response.json();
  return json?.data?.fsr_account_details?.items ?? [];
}

export async function fetchBankAccounts(): Promise<DimBankAccount[]> {
  const response = await fetch('/data/bank_account.json');
  if (!response.ok) return [];
  const json = await response.json();
  return json?.data?.dim_bank_accounts?.items ?? [];
}

export interface FsrLiquiditySummary {
  ARE_Code: string;
  Entity_Name: string;
  External_Liquidity: number;
  External_Debt: number;
  Internal_Liquidity: number;
  Internal_Debt: number;
  Total_Liquidity: number;
  Total_Debt: number;
  Net_Position: number;
}

export async function fetchFsrLiquiditySummary(): Promise<FsrLiquiditySummary[]> {
  const response = await fetch('/data/fsr_liquidity_summary.json');
  if (!response.ok) return [];
  const json = await response.json();
  return json?.data?.fsr_liquidity_summaries?.items ?? [];
}

export interface FinalSummaryItem {
  ARE: string;
  Entity_Name: string;
  Country: string;
  Region: string;
  External_Liquidity: number;
  Reserved_for_Payment: number | string;
  Funds_in_transit: number | string;
  Expected_External_Liquidity: number;
  External_Debt: number;
  Internal_Liquidity: number;
  Internal_Debt: number;
  Total_Liquidity: number;
  Total_Debt: number;
  NET_Liquidity_Position: number;
}

export async function fetchFinalSummary(): Promise<FinalSummaryItem[]> {
  const response = await fetch('/data/final_summary.json');
  if (!response.ok) return [];
  const json = await response.json();
  return json?.data?.final_summaries?.items ?? [];
}

export const countryPresence: CountryPresence[] = [
  { country: 'Qatar', countryCode: 'QA', region: 'ME', entityCount: 1, areCodes: ['519X'] },
  { country: 'Saudi Arabia', countryCode: 'SA', region: 'ME', entityCount: 3, areCodes: ['4659', '4PD7', '516S'] },
  { country: 'Oman', countryCode: 'OM', region: 'ME', entityCount: 1, areCodes: ['463G'] },
  { country: 'Kuwait', countryCode: 'KW', region: 'ME', entityCount: 2, areCodes: ['4732', '4PB7'] },
  { country: 'UAE', countryCode: 'AE', region: 'ME', entityCount: 2, areCodes: ['4678', '523S'] },
  { country: 'Sudan', countryCode: 'SD', region: 'ME', entityCount: 1, areCodes: ['548X'] },
  { country: 'Egypt', countryCode: 'EG', region: 'ME', entityCount: 1, areCodes: ['5402'] },
  { country: 'Pakistan', countryCode: 'PK', region: 'ME', entityCount: 1, areCodes: ['4PD4'] },
  { country: 'Iran', countryCode: 'IR', region: 'ME', entityCount: 1, areCodes: ['5665'] },
  { country: 'Algeria', countryCode: 'DZ', region: 'AFRICA', entityCount: 1, areCodes: ['4PD3'] },
  { country: 'South Africa', countryCode: 'ZA', region: 'AFRICA', entityCount: 1, areCodes: ['543X'] },
  { country: 'Ghana', countryCode: 'GH', region: 'AFRICA', entityCount: 1, areCodes: ['461T'] },
  { country: 'East Africa', countryCode: 'TZ', region: 'AFRICA', entityCount: 1, areCodes: ['479X'] },
  { country: 'Morocco', countryCode: 'MA', region: 'AFRICA', entityCount: 1, areCodes: ['452D'] },
  { country: 'Ivory Coast', countryCode: 'CI', region: 'AFRICA', entityCount: 1, areCodes: ['412W'] },
  { country: 'Angola', countryCode: 'AO', region: 'AFRICA', entityCount: 1, areCodes: ['519G'] },
  { country: 'Nigeria', countryCode: 'NG', region: 'AFRICA', entityCount: 2, areCodes: ['5423', '490S'] },
];
