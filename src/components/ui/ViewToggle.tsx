interface ViewToggleProps<T extends string> {
  options: { value: T; label: string }[];
  activeValue: T;
  onChange: (value: T) => void;
}

export function ViewToggle<T extends string>({ options, activeValue, onChange }: ViewToggleProps<T>) {
  return (
    <div style={{ display: 'flex', gap: 4, backgroundColor: 'var(--color-surface-2)', borderRadius: 8, padding: 3 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          style={{
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 5,
            paddingBottom: 5,
            borderRadius: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: 0.5,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 150ms',
            backgroundColor: activeValue === opt.value ? 'var(--color-surface)' : 'transparent',
            color: activeValue === opt.value ? '#ffffff' : 'var(--color-muted)',
          }}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
