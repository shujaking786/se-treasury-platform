import type { Alert, AlertSeverity } from '../../types';
import type { CSSProperties } from 'react';

const severityStyles: Record<AlertSeverity, CSSProperties> = {
  red: { backgroundColor: 'var(--color-status-red-bg)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-status-red)' },
  amber: { backgroundColor: 'var(--color-status-amber-bg)', borderColor: 'rgba(245,158,11,0.2)', color: 'var(--color-status-amber)' },
  green: { backgroundColor: 'var(--color-status-green-bg)', borderColor: 'rgba(34,197,94,0.2)', color: 'var(--color-status-green)' },
  blue: { backgroundColor: 'var(--color-accent-glow)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' },
};

interface AlertBannerProps {
  alerts: Alert[];
  style?: CSSProperties;
}

export function AlertBanner({ alerts, style }: AlertBannerProps) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', ...style }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 5,
            paddingBottom: 5,
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            borderWidth: 1,
            borderStyle: 'solid',
            transition: 'all 150ms',
            ...severityStyles[alert.severity],
          }}
        >
          {alert.text}
        </div>
      ))}
    </div>
  );
}
