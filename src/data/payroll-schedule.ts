import type { PayrollDate, PayrollScheduleRow } from '../types';

export const payrollDates: PayrollDate[] = [
  { label: '20 Feb', date: '2026-02-20' },
  { label: '23 Feb', date: '2026-02-23' },
  { label: '27 Feb', date: '2026-02-27' },
  { label: '05 Mar', date: '2026-03-05' },
  { label: '11 Mar', date: '2026-03-11' },
];

export const payrollRows: PayrollScheduleRow[] = [
  { entityLabel: '4659 Saudi Ltd.', currency: 'SAR', amounts: [null, 18.89, null, null, null], total: 18.89, totalColor: 'amber', isHighlighted: false },
  { entityLabel: '4PD7 SE Regional', currency: 'SAR', amounts: [null, 1.32, null, null, null], total: 1.32, totalColor: 'amber', isHighlighted: false },
  { entityLabel: '4678 SLLC UAE \u26A0', currency: 'AED', amounts: [40.65, null, 8.53, 0.60, 0.60], total: 50.38, totalColor: 'red', isHighlighted: true, highlightColor: 'red' },
  { entityLabel: '4678 SLLC Bahrain', currency: 'BHD', amounts: [0.07, null, null, null, null], total: 0.07, totalColor: 'default', isHighlighted: false },
  { entityLabel: '523S D-R Ops', currency: 'AED', amounts: [0.69, null, 0.33, null, null], total: 1.02, totalColor: 'default', isHighlighted: false },
  { entityLabel: '4732 Kuwait Power', currency: 'KWD', amounts: [0.23, null, 0.02, 0.02, null], total: 0.26, totalColor: 'default', isHighlighted: false },
  { entityLabel: '519X Qatar', currency: 'QAR', amounts: [6.30, null, 0.26, 0.26, 0.26], total: 7.08, totalColor: 'default', isHighlighted: false },
  { entityLabel: '463G Oman LLC', currency: 'OMR', amounts: [0.19, null, 0.01, 0.01, 0.01], total: 0.22, totalColor: 'default', isHighlighted: false },
  { entityLabel: '4PB7 Kuwait WLL', currency: 'KWD', amounts: [0.02, null, 0.005, null, null], total: 0.02, totalColor: 'default', isHighlighted: false },
];

export const payrollTotals = {
  amounts: [48.15, 20.21, 9.15, 0.88, 0.87],
  total: 79.26,
};
