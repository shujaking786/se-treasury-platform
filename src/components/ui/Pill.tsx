import type { CSSProperties } from 'react';
import type { StatusVariant } from '../../types';

const variantStyles: Record<StatusVariant, CSSProperties> = {
  green: { backgroundColor: 'var(--color-status-green-bg)', color: 'var(--color-status-green)' },
  amber: { backgroundColor: 'var(--color-status-amber-bg)', color: 'var(--color-status-amber)' },
  red: { backgroundColor: 'var(--color-status-red-bg)', color: 'var(--color-status-red)' },
  blue: { backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)' },
  mto: { backgroundColor: 'var(--color-mto-bg)', color: 'var(--color-mto)' },
};

interface PillProps {
  variant: StatusVariant;
  children: React.ReactNode;
}

export function Pill({ variant, children }: PillProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 700,
      paddingLeft: 7,
      paddingRight: 7,
      paddingTop: 3,
      paddingBottom: 3,
      borderRadius: 4,
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
    }}>
      {children}
    </span>
  );
}
