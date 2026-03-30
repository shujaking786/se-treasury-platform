export type AlertSeverity = 'red' | 'amber' | 'green' | 'blue';

export interface Alert {
  id: string;
  text: string;
  severity: AlertSeverity;
}
