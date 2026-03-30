import type { Alert } from '../types';

export const overviewAlerts: Alert[] = [
  { id: 'sg-breach', text: '\uD83D\uDD34 SG LIMIT BREACH \u2014 118.7% (\u20AC35.6M / \u20AC30M)', severity: 'red' },
  { id: 'pasargad-breach', text: '\uD83D\uDD34 PASARGAD BREACH \u2014 229.6% (\u20AC23.0M / \u20AC10M)', severity: 'red' },
  { id: 'riyad-near', text: '\u26A0 RIYAD NEAR-LIMIT \u2014 98.9% (\u20AC59.3M / \u20AC60M)', severity: 'amber' },
  { id: 'uae-negative', text: '\u26A0 4678 UAE \u2014 NET NEGATIVE -\u20AC28K', severity: 'red' },
  { id: 'zero-debt', text: '\u2713 ZERO EXTERNAL DEBT \u2014 Full Region', severity: 'green' },
];

export const limitsAlerts: Alert[] = [
  { id: 'active-breaches', text: '\uD83D\uDD34 2 ACTIVE BREACHES \u2014 Immediate action required', severity: 'red' },
  { id: 'near-limit', text: '\u26A0 1 NEAR-LIMIT \u2014 Daily monitoring required (Riyad 98.9%)', severity: 'amber' },
];

export const competitiveAlerts: Alert[] = [
  { id: 'strategic-brief', text: '\u21AF STRATEGIC BRIEF \u2014 Why We Win vs. Ripple Technology', severity: 'blue' },
];
