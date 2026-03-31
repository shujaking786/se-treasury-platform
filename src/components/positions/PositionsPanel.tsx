import { SectionHeader } from '../ui/SectionHeader';
import { ViewToggle } from '../ui/ViewToggle';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { mePositionRows, africaPositionRows } from '../../data';
import { useStore } from '../../store';
import { cn } from '../../utils/cn';
import type { PositionRow, PositionStatus, CurrencyMode, StatusVariant } from '../../types';

const currencyOptions: { value: CurrencyMode; label: string }[] = [
  { value: 'EUR', label: 'EUR' },
  { value: 'LCY', label: 'LCY' },
  { value: 'ACCT_CCY', label: 'ACCT CCY' },
];

function getStatusVariant(status: PositionStatus): StatusVariant {
  switch (status) {
    case 'HEALTHY': return 'green';
    case 'NEGATIVE': return 'red';
    case 'LARGE':
    case 'MULTI_CTRY': return 'blue';
    case 'MTO': return 'mto';
    case 'MONITORED':
    case 'INT_DEBT':
    case 'IN_LIQ': return 'amber';
  }
}

function getStatusLabel(status: PositionStatus): string {
  switch (status) {
    case 'HEALTHY': return 'HEALTHY';
    case 'NEGATIVE': return 'NEGATIVE';
    case 'LARGE': return 'LARGE';
    case 'MTO': return 'MTO';
    case 'MONITORED': return 'MONITORED';
    case 'INT_DEBT': return 'INT DEBT';
    case 'MULTI_CTRY': return 'MULTI-CTRY';
    case 'IN_LIQ': return 'IN LIQ.';
  }
}

function formatVal(v: number | null): string {
  if (v === null) return '\u2014';
  if (v === 0) return '\u20AC0';
  const abs = Math.abs(v);
  if (abs >= 1) return `${abs.toFixed(2)}M`;
  if (abs >= 0.001) return `${(abs * 1000).toFixed(0)}K`;
  return `${abs}`;
}

function PositionTableRow({ row }: { row: PositionRow }) {
  const transitColor = row.fundsInTransitDirection === 'in' ? 'text-status-amber'
    : row.fundsInTransitDirection === 'out' ? 'text-status-red'
    : 'text-muted';

  return (
    <tr className={cn(
      'border-b border-border-custom transition-colors hover:bg-[var(--color-accent-hover-subtle)]',
      row.isNegative && 'bg-[rgba(239,68,68,0.04)]'
    )}>
      <td className={cn('px-3.5 py-[9px] text-[12px] font-mono font-bold', row.isNegative ? 'text-status-red' : 'text-white')}>
        {row.areCode}
      </td>
      <td className="px-3.5 py-[9px] text-[11px] text-muted font-mono">{row.country}</td>
      <td className="px-3.5 py-[9px] text-right font-mono text-[12px]">{formatVal(row.extLiquidity)}</td>
      <td className={cn('px-3.5 py-[9px] text-right font-mono text-[12px]', transitColor)}>
        {row.fundsInTransit !== null ? `${row.fundsInTransitDirection === 'out' ? '-' : '+'}${formatVal(row.fundsInTransit)}` : '\u2014'}
      </td>
      <td className="px-3.5 py-[9px] text-right text-[12px]">{row.reserved !== null ? formatVal(row.reserved) : '\u2014'}</td>
      <td className="px-3.5 py-[9px] text-right text-[12px]">{formatVal(row.expectedExtLiquidity)}</td>
      <td className={cn('px-3.5 py-[9px] text-right font-mono text-[12px]', row.intLiquidity ? 'text-status-green' : 'text-muted')}>
        {row.intLiquidity !== null ? `+${(row.intLiquidity * 1000).toFixed(0)}K` : '\u2014'}
      </td>
      <td className={cn('px-3.5 py-[9px] text-right font-mono text-[12px]', row.intDebt > 0 ? 'text-status-red' : 'text-status-green')}>
        {row.intDebt > 0 ? `\u20AC${(row.intDebt * 1000).toFixed(0)}K` : '\u20AC0'}
      </td>
      <td className="px-3.5 py-[9px] text-right">
        <span className={cn('font-mono', row.isNegative ? 'text-status-red' : row.totalNetPosition === row.extLiquidity && row.status === 'INT_DEBT' ? 'text-text-primary' : 'text-status-green')}>
          {row.isNegative ? `-${(Math.abs(row.totalNetPosition) * 1000).toFixed(0)}K` : formatVal(row.totalNetPosition)}
        </span>
      </td>
      <td className="px-3.5 py-[9px]">
        <Pill variant={getStatusVariant(row.status)}>{getStatusLabel(row.status)}</Pill>
      </td>
    </tr>
  );
}

export function PositionsPanel() {
  const { currencyMode, setCurrencyMode } = useStore();

  return (
    <div>
      {/* ME Region Header + Currency Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
        <span className="font-mono text-[11px] font-bold tracking-[1px] uppercase text-muted">
          ME Region — All AREs
        </span>
        <div className="flex gap-2 items-center">
          <span className="font-mono text-[9px] text-muted">DISPLAY CCY:</span>
          <ViewToggle options={currencyOptions} activeValue={currencyMode} onChange={setCurrencyMode} />
        </div>
      </div>

      {/* ME Table */}
      <DataCard style={{ marginBottom: 24, overflowX: 'auto' }}>
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              {['ARE', 'Country', 'Ext. Liquidity', 'Funds in Transit', 'Reserved', 'Expected Ext. Liq.', 'Int. Liquidity', 'Int. Debt', 'Total Net Position', 'Status'].map((h, i) => (
                <th key={h} className={cn(
                  'px-3.5 py-2 font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted whitespace-nowrap',
                  i >= 2 && i <= 8 ? 'text-right' : 'text-left'
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mePositionRows.map((row) => (
              <PositionTableRow key={row.areCode} row={row} />
            ))}
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <td colSpan={2} className="px-3.5 py-[9px] font-mono text-[10px] text-muted">ME TOTAL</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-white">199.4M</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-red">-2.73M</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-amber">7.95M</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-white">194.1M</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-green">27K</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-red">100K</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-green">191.4M</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </DataCard>

      {/* Africa Region */}
      <SectionHeader title="Africa Region — All AREs" />
      <DataCard style={{ overflowX: 'auto' }}>
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              {['ARE', 'Country', 'Ext. Liquidity', 'Funds in Transit', 'Reserved', 'Expected Ext. Liq.', 'Int. Liquidity', 'Int. Debt', 'Total Net Position', 'Status'].map((h, i) => (
                <th key={h} className={cn(
                  'px-3.5 py-2 font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted whitespace-nowrap',
                  i >= 2 && i <= 8 ? 'text-right' : 'text-left'
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {africaPositionRows.map((row) => (
              <PositionTableRow key={row.areCode} row={row} />
            ))}
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <td colSpan={2} className="px-3.5 py-[9px] font-mono text-[10px] text-muted">AFRICA TOTAL</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-white">156.6M</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-muted">—</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-muted">—</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-white">156.6M</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-muted">—</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-green">&euro;0</td>
              <td className="px-3.5 py-[9px] text-right font-mono font-bold text-status-green">156.6M</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </DataCard>
    </div>
  );
}
