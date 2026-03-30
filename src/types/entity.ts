export type Region = 'ME' | 'AFRICA';

export type CurrencyCode =
  | 'EUR' | 'SAR' | 'AED' | 'QAR' | 'OMR' | 'KWD' | 'BHD'
  | 'EGP' | 'IRR' | 'PKR' | 'XOF' | 'MAD' | 'TZS' | 'GHS'
  | 'ZAR' | 'DZD' | 'AOA' | 'NGN' | 'SDG';

export interface Entity {
  areCode: string;
  name: string;
  flag: string;
  region: Region;
  country: string;
  localCurrency: CurrencyCode;
  isMto: boolean;
  hasWarning: boolean;
}
