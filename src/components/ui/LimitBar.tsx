const fillColors: Record<string, string> = {
  safe: 'var(--color-status-green)',
  warn: 'var(--color-status-amber)',
  breach: 'var(--color-status-red)',
};

interface LimitBarProps {
  percentage: number;
  variant: 'safe' | 'warn' | 'breach';
  height?: number;
}

export function LimitBar({ percentage, variant, height = 5 }: LimitBarProps) {
  return (
    <div style={{
      flex: 1,
      backgroundColor: 'var(--color-surface-2)',
      borderRadius: 3,
      overflow: 'hidden',
      height,
    }}>
      <div
        style={{
          height: '100%',
          borderRadius: 3,
          transition: 'all 500ms',
          backgroundColor: fillColors[variant],
          width: `${Math.min(percentage, 100)}%`,
        }}
      />
    </div>
  );
}
