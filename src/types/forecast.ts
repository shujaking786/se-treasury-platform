import type { CurrencyCode } from './entity';
import type { StatusVariant } from './common';

export interface PayrollDate {
  label: string;
  date: string;
}

export interface PayrollScheduleRow {
  entityLabel: string;
  currency: CurrencyCode;
  amounts: (number | null)[];
  total: number;
  totalColor: 'amber' | 'red' | 'default';
  isHighlighted: boolean;
  highlightColor?: 'red';
}

export interface VendorRunRow {
  areCode: string;
  bank: string;
  currency: CurrencyCode;
  type: string;
  requested: number | null;
  utilized: number | null;
  estimate: number | null;
  variance: number | null;
  varianceDirection: 'up' | 'down' | null;
  varianceLabel: string | null;
  status: string;
  statusVariant: StatusVariant;
}
