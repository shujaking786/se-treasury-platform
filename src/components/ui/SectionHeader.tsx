import type { CSSProperties } from 'react';

interface SectionHeaderProps {
  title: string;
  action?: string;
  rightContent?: React.ReactNode;
  style?: CSSProperties;
}

export function SectionHeader({ title, action, rightContent, style }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      marginTop: 28,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 3,
          height: 16,
          borderRadius: 2,
          backgroundImage: 'var(--gradient-brand-vertical)',
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase' as const,
          color: 'var(--color-text-primary)',
        }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {action && (
          <span style={{ fontSize: 11, color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}>{action}</span>
        )}
        {rightContent}
      </div>
    </div>
  );
}
