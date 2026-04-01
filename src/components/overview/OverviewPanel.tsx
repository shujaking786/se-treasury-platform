import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { LimitBar } from '../ui/LimitBar';
import { Pill } from '../ui/Pill';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { fetchFinalSummary, type FinalSummaryItem } from '../../data/hr';
import { mapFinalSummaryRows, selectOverviewViewModel } from '../../selectors/overview';
import { matchesAreCode } from '../../selectors/filtering';
import type { PositionRow, StatusVariant } from '../../types';

function formatBreakdownValue(value: number): string {
  return value === 0 ? '\u20AC0' : `\u20AC${(value / 1_000_000).toFixed(1)}M`;
}

function formatPositionMillions(value: number | null): string {
  if (value === null) {
    return '\u2014';
  }

  if (value === 0) {
    return '\u20AC0';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  return `${sign}\u20AC${abs.toFixed(abs >= 10 ? 1 : 2)}M`;
}

function formatTransitValue(value: number | null, direction: PositionRow['fundsInTransitDirection']): string {
  if (value === null) {
    return '\u2014';
  }

  const prefix = direction === 'out' ? '-' : '+';
  return `${prefix}${formatPositionMillions(value)}`;
}

function getStatusMeta(status: PositionRow['status']): { label: string; variant: StatusVariant } {
  switch (status) {
    case 'NEGATIVE':
      return { label: 'NEGATIVE', variant: 'red' };
    case 'LARGE':
      return { label: 'LARGE', variant: 'blue' };
    case 'MTO':
      return { label: 'MTO', variant: 'mto' };
    case 'MONITORED':
      return { label: 'MONITORED', variant: 'amber' };
    case 'INT_DEBT':
      return { label: 'INT DEBT', variant: 'amber' };
    case 'MULTI_CTRY':
      return { label: 'MULTI-CTRY', variant: 'blue' };
    case 'IN_LIQ':
      return { label: 'IN LIQ.', variant: 'amber' };
    default:
      return { label: 'HEALTHY', variant: 'green' };
  }
}

function RegionSummaryTable({
  title,
  subtitle,
  rows,
  totalLabel,
}: {
  title: string;
  subtitle: string;
  rows: PositionRow[];
  totalLabel: string;
}) {
  const headerClassName = 'px-5 py-3.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
  const rowClassName = 'border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]';
  const cellPadding = 'px-5 py-4';

  const totals = rows.reduce(
    (sum, row) => ({
      extLiquidity: sum.extLiquidity + row.extLiquidity,
      fundsInTransit:
        sum.fundsInTransit + (row.fundsInTransit ?? 0) * (row.fundsInTransitDirection === 'out' ? -1 : 1),
      reserved: sum.reserved + (row.reserved ?? 0),
      expectedExtLiquidity: sum.expectedExtLiquidity + row.expectedExtLiquidity,
      extDebt: sum.extDebt + (row.extDebt ?? 0),
      intLiquidity: sum.intLiquidity + (row.intLiquidity ?? 0),
      intDebt: sum.intDebt + row.intDebt,
      totalNetPosition: sum.totalNetPosition + row.totalNetPosition,
    }),
    {
      extLiquidity: 0,
      fundsInTransit: 0,
      reserved: 0,
      expectedExtLiquidity: 0,
      extDebt: 0,
      intLiquidity: 0,
      intDebt: 0,
      totalNetPosition: 0,
    },
  );

  return (
    <>
      <SectionHeader title={title} />
      <DataCard subtitle={subtitle} style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[1260px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Country', 'Ext. Liquidity', 'Funds in Transit', 'Reserved', 'Expected Ext. Liq.', 'External Debt', 'Int. Liquidity', 'Int. Debt', 'Total Net Position', 'Status'].map((heading, index) => (
                  <th key={heading} className={cn(headerClassName, index >= 2 && index <= 9 ? 'text-right' : 'text-left')}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                <>
                  {rows.map((row) => {
                    const status = getStatusMeta(row.status);
                    return (
                      <tr key={`${title}-${row.areCode}`} className={cn(rowClassName, row.isNegative && 'bg-[var(--color-status-red-bg)]/30')}>
                        <td className={cn(`${cellPadding} font-mono text-[12px] font-bold`, row.isNegative ? 'text-status-red' : 'text-white')}>
                          {row.areCode}
                        </td>
                        <td className={`${cellPadding} text-[11px] text-text-primary`}>{row.country}</td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-white`}>{formatPositionMillions(row.extLiquidity)}</td>
                        <td
                          className={cn(
                            `${cellPadding} text-right font-mono text-[12px]`,
                            row.fundsInTransitDirection === 'in'
                              ? 'text-status-amber'
                              : row.fundsInTransitDirection === 'out'
                                ? 'text-status-red'
                                : 'text-muted',
                          )}
                        >
                          {formatTransitValue(row.fundsInTransit, row.fundsInTransitDirection)}
                        </td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] ${row.reserved ? 'text-status-amber' : 'text-muted'}`}>
                          {formatPositionMillions(row.reserved)}
                        </td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-white`}>{formatPositionMillions(row.expectedExtLiquidity)}</td>
                        <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (row.extDebt ?? 0) > 0 ? 'text-status-red' : 'text-muted')}>
                          {formatPositionMillions(row.extDebt ?? 0)}
                        </td>
                        <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, row.intLiquidity ? 'text-status-green' : 'text-muted')}>
                          {formatPositionMillions(row.intLiquidity)}
                        </td>
                        <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, row.intDebt > 0 ? 'text-status-red' : 'text-muted')}>
                          {formatPositionMillions(row.intDebt)}
                        </td>
                        <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, row.totalNetPosition < 0 ? 'text-status-red' : 'text-status-green')}>
                          {formatPositionMillions(row.totalNetPosition)}
                        </td>
                        <td className={cellPadding}>
                          <Pill variant={status.variant}>{status.label}</Pill>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: 'rgba(11, 22, 40, 0.8)' }}>
                    <td colSpan={2} className={`${cellPadding} font-mono text-[10px] font-semibold tracking-[1.2px] text-muted uppercase`}>
                      {totalLabel}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold text-white`}>{formatPositionMillions(totals.extLiquidity)}</td>
                    <td className={cn(`${cellPadding} text-right font-mono text-[12px] font-bold`, totals.fundsInTransit > 0 ? 'text-status-amber' : totals.fundsInTransit < 0 ? 'text-status-red' : 'text-muted')}>
                      {totals.fundsInTransit === 0 ? '\u2014' : formatPositionMillions(totals.fundsInTransit)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold ${totals.reserved > 0 ? 'text-status-amber' : 'text-muted'}`}>
                      {totals.reserved === 0 ? '\u2014' : formatPositionMillions(totals.reserved)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold text-white`}>{formatPositionMillions(totals.expectedExtLiquidity)}</td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold ${totals.extDebt > 0 ? 'text-status-red' : 'text-muted'}`}>
                      {formatPositionMillions(totals.extDebt)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold ${totals.intLiquidity > 0 ? 'text-status-green' : 'text-muted'}`}>
                      {totals.intLiquidity === 0 ? '\u2014' : formatPositionMillions(totals.intLiquidity)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold ${totals.intDebt > 0 ? 'text-status-red' : 'text-muted'}`}>
                      {formatPositionMillions(totals.intDebt)}
                    </td>
                    <td className={`${cellPadding} text-right font-mono text-[12px] font-bold ${totals.totalNetPosition < 0 ? 'text-status-red' : 'text-status-green'}`}>
                      {formatPositionMillions(totals.totalNetPosition)}
                    </td>
                    <td className={cellPadding} />
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center font-mono text-[11px] text-muted">
                    No summary rows for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </>
  );
}

export function OverviewPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const [finalSummaryRows, setFinalSummaryRows] = useState<FinalSummaryItem[]>([]);

  useEffect(() => {
    fetchFinalSummary().then(setFinalSummaryRows);
  }, []);

  const mappedSummary = useMemo(() => mapFinalSummaryRows(finalSummaryRows), [finalSummaryRows]);
  const overview = useMemo(
    () => selectOverviewViewModel(activeFilters, mappedSummary.meRows, mappedSummary.africaRows),
    [activeFilters, mappedSummary],
  );
  const filteredMeSummary = mappedSummary.meRows.filter((row) => matchesAreCode(activeFilters, row.areCode));
  const filteredAfricaSummary = mappedSummary.africaRows.filter((row) => matchesAreCode(activeFilters, row.areCode));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px', marginTop: '10px' }}>
        {overview.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <DataCard title="MEA Regional Breakdown" subtitle="Total Net Position by Region — EUR">
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>Middle East</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'white' }}>
                  {formatBreakdownValue(overview.meNetPosition)} <span style={{ color: 'var(--color-muted)', fontSize: '10px' }}>/ {overview.totalNetPosition ? ((overview.meNetPosition / overview.totalNetPosition) * 100).toFixed(1) : '0.0'}%</span>
                </span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '5px', height: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '5px',
                    background: 'var(--color-status-green)',
                    width: `${overview.totalNetPosition ? Math.max((overview.meNetPosition / overview.totalNetPosition) * 100, 0) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>Africa</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'white' }}>
                  {formatBreakdownValue(overview.africaNetPosition)} <span style={{ color: 'var(--color-muted)', fontSize: '10px' }}>/ {overview.totalNetPosition ? ((overview.africaNetPosition / overview.totalNetPosition) * 100).toFixed(1) : '0.0'}%</span>
                </span>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '5px', height: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '5px',
                        background: 'var(--color-accent-secondary)',
                        width: `${overview.totalNetPosition ? Math.max((overview.africaNetPosition / overview.totalNetPosition) * 100, 0) : 0}%`,
                      }}
                    />
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-muted)', marginBottom: '6px' }}>EXTERNAL LIQUIDITY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'white', fontWeight: 'bold' }}>{formatBreakdownValue(overview.externalLiquidity)}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '3px' }}>Gross position pre-reservations</div>
              </div>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-muted)', marginBottom: '6px' }}>INTERNAL LIQUIDITY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'white', fontWeight: 'bold' }}>
                  {overview.kpis[4]?.subtitle?.replace('Internal liquidity: ', '') ?? '\u20AC0'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '3px' }}>Current internal liquidity in scope</div>
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard title="Top Positions by Entity" subtitle="Net Total Liquidity — EUR">
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overview.topPositions.length > 0 ? (
              overview.topPositions.map((position) => (
                <div key={position.code} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', width: '40px', color: position.isNeg ? 'var(--color-status-red)' : 'var(--color-muted)' }}>
                    {position.code}
                  </span>
                  <div style={{ flex: 1 }}>
                    <LimitBar percentage={position.pct} variant={position.variant} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', width: '65px', textAlign: 'right', color: position.isNeg ? 'var(--color-status-red)' : 'white' }}>
                    {position.value}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)' }}>
                No position data for the current filter.
              </div>
            )}
          </div>
        </DataCard>
      </div>

      <RegionSummaryTable
        title="MEA Summary"
        subtitle="Summary-sheet style position view for Middle East entities"
        rows={filteredMeSummary}
        totalLabel="MEA Total"
      />

      <RegionSummaryTable
        title="Africa Summary"
        subtitle="Summary-sheet style position view for Africa entities"
        rows={filteredAfricaSummary}
        totalLabel="Africa Total"
      />
    </div>
  );
}
