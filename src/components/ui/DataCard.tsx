import type { CSSProperties } from 'react';

interface DataCardProps {
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  headerStyle?: CSSProperties;
  borderStyle?: CSSProperties;
  footer?: React.ReactNode;
  children: React.ReactNode;
  style?: CSSProperties;
  bodyPadding?: boolean;
}

export function DataCard({ title, subtitle, headerRight, headerStyle, borderStyle, footer, children, style, bodyPadding = false }: DataCardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border-custom)',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      ...borderStyle,
      ...style,
    }}>
      {title && (
        <div style={{
          paddingLeft: 18,
          paddingRight: 18,
          paddingTop: 14,
          paddingBottom: 14,
          borderBottom: '1px solid var(--color-border-2)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          background: 'var(--gradient-card-header)',
          ...headerStyle,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.2px' }}>{title}</div>
            {subtitle && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', marginTop: 4 }}>{subtitle}</div>}
          </div>
          {headerRight}
        </div>
      )}
      <div style={bodyPadding ? { padding: 16 } : undefined}>
        {children}
      </div>
      {footer && (
        <div style={{
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 10,
          paddingBottom: 10,
          borderTop: '1px solid var(--color-border-custom)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}
