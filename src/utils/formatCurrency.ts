export function formatCurrency(value: number): string {
  if (value === 0) return '€0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}€${m.toFixed(m >= 100 ? 1 : 2).replace(/\.?0+$/, '')}M`;
  }
  if (abs >= 1_000) {
    const k = abs / 1_000;
    return `${sign}€${k.toFixed(k >= 100 ? 0 : 0)}K`;
  }
  return `${sign}€${abs.toFixed(0)}`;
}

export function formatCurrencyShort(value: number): string {
  if (value === 0) return '€0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)}K`;
  }
  return `${sign}${abs.toFixed(0)}`;
}
