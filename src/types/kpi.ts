import type { KpiVariant } from './common';

export interface KpiCardData {
  label: string;
  value: string;
  valueColor?: 'green' | 'amber' | 'red' | 'white';
  subtitle: string;
  gradient: KpiVariant;
}
