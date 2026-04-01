import type { KpiCardData } from '../../types';

const gradientMap: Record<string, string> = {
  default: 'var(--gradient-brand-horizontal)',
  green: 'linear-gradient(to right, var(--color-status-green), var(--color-accent-secondary))',
  amber: 'linear-gradient(to right, var(--color-status-amber), #f97316)',
  red: 'linear-gradient(to right, var(--color-status-red), #f97316)',
};

const valueColorMap: Record<string, string> = {
  white: '#ffffff',
  green: 'var(--color-status-green)',
  amber: 'var(--color-status-amber)',
  red: 'var(--color-status-red)',
};

export function KpiCard({ label, value, valueColor = 'white', subtitle, gradient }: KpiCardData) {
  return (
    <div className="kpi-card" style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border-2)',
      borderRadius: 10,
      paddingLeft: 18,
      paddingRight: 18,
      paddingTop: 16,
      paddingBottom: 16,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundImage: gradientMap[gradient],
      }} />
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        color: 'var(--color-muted)',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 22,
        fontWeight: 700,
        lineHeight: 1,
        color: valueColorMap[valueColor],
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 6 }}>{subtitle}</div>
    </div>
  );
}
