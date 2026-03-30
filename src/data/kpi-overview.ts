import type { KpiCardData } from '../types';

export const overviewKpis: KpiCardData[] = [
  {
    label: 'Total Group Liquidity',
    value: '\u20AC348.0M',
    valueColor: 'white',
    subtitle: '22 AREs \u00B7 16 Countries',
    gradient: 'green',
  },
  {
    label: 'ME Region',
    value: '\u20AC191.4M',
    valueColor: 'white',
    subtitle: '13 entities \u00B7 55.1% of group',
    gradient: 'default',
  },
  {
    label: 'Africa Region',
    value: '\u20AC156.6M',
    valueColor: 'white',
    subtitle: '9 entities \u00B7 44.9% of group',
    gradient: 'default',
  },
  {
    label: 'Reserved for Payments',
    value: '\u20AC7.95M',
    valueColor: 'amber',
    subtitle: 'HR + Accounting obligations',
    gradient: 'amber',
  },
  {
    label: 'External Debt (Region)',
    value: '\u20AC0.0',
    valueColor: 'green',
    subtitle: 'Int. Debt: \u20AC100K (548X SD)',
    gradient: 'red',
  },
];
