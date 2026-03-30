import type { Region } from './entity';

export type CurrencyMode = 'EUR' | 'LCY' | 'ACCT_CCY';

export type PositionStatus =
  | 'HEALTHY' | 'NEGATIVE' | 'LARGE' | 'MTO'
  | 'MONITORED' | 'INT_DEBT' | 'MULTI_CTRY' | 'IN_LIQ';

export interface PositionRow {
  areCode: string;
  country: string;
  flag: string;
  extLiquidity: number;
  fundsInTransit: number | null;
  fundsInTransitDirection: 'in' | 'out' | null;
  reserved: number | null;
  expectedExtLiquidity: number;
  intLiquidity: number | null;
  intDebt: number;
  totalNetPosition: number;
  status: PositionStatus;
  isMto: boolean;
  isNegative: boolean;
}

export interface PositionSummary {
  region: Region;
  extLiquidity: number;
  fundsInTransit: number | null;
  reserved: number | null;
  expectedExtLiquidity: number;
  intLiquidity: number | null;
  intDebt: number;
  totalNetPosition: number;
}
