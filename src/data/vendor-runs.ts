import type { VendorRunRow } from '../types';

export const vendorRunRows: VendorRunRow[] = [
  { areCode: '4678', bank: 'SCB', currency: 'AED', type: 'Supplier', requested: 8.20, utilized: 1.30, estimate: 1.00, variance: 0.286, varianceDirection: 'up', varianceLabel: '+286K \u2191', status: 'OVER-EST', statusVariant: 'amber' },
  { areCode: '4678', bank: 'SCB', currency: 'AED', type: 'HR Allow', requested: 0.50, utilized: 0.88, estimate: 0.60, variance: 0.284, varianceDirection: 'up', varianceLabel: '+284K \u2191', status: 'OVER-EST', statusVariant: 'amber' },
  { areCode: '4659', bank: 'BNP', currency: 'SAR', type: 'Supplier', requested: 11.5, utilized: 8.00, estimate: 6.60, variance: 1.40, varianceDirection: 'up', varianceLabel: '+1.40M \u2191', status: 'HIGH VAR', statusVariant: 'red' },
  { areCode: '519X', bank: 'SCB', currency: 'QAR', type: 'Supplier', requested: 4.80, utilized: 1.00, estimate: null, variance: null, varianceDirection: null, varianceLabel: null, status: 'IN PROCESS', statusVariant: 'blue' },
  { areCode: '463G', bank: 'SCB', currency: 'OMR', type: 'Supplier', requested: null, utilized: 0.094, estimate: 0.060, variance: 0.034, varianceDirection: 'up', varianceLabel: '+34K \u2191', status: 'EXCEEDED', statusVariant: 'amber' },
  { areCode: '523S', bank: 'SCB', currency: 'AED', type: 'Supplier', requested: 0.16, utilized: 0.071, estimate: 0.050, variance: 0.021, varianceDirection: 'up', varianceLabel: '+21K \u2191', status: 'MINOR VAR', statusVariant: 'green' },
  { areCode: '4732', bank: 'SFS', currency: 'KWD', type: 'Supplier', requested: null, utilized: 0.013, estimate: 0.060, variance: 0.047, varianceDirection: 'down', varianceLabel: '-47K \u2193', status: 'UNDER EST.', statusVariant: 'green' },
];
