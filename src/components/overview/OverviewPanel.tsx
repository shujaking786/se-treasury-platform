import { useState, useEffect } from 'react';
import { AlertBanner } from '../ui/AlertBanner';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { LimitBar } from '../ui/LimitBar';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { selectOverviewViewModel } from '../../selectors/overview';
import { matchesAreCode } from '../../selectors/filtering';
import {
  fetchFsrAccountDetails,
  fetchFsrLiquiditySummary,
  type FsrAccountDetail,
  type FsrLiquiditySummary,
} from '../../data/hr';

function formatBreakdownValue(value: number): string {
  return value === 0 ? '\u20AC0' : `\u20AC${(value / 1_000_000).toFixed(1)}M`;
}

function formatAccountBalance(value: number): string {
  if (value === 0) return '\u20AC0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}\u20AC${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  return `${sign}\u20AC${abs.toFixed(0)}`;
}

export function OverviewPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const overview = selectOverviewViewModel(activeFilters);

  const [accountDetails, setAccountDetails] = useState<FsrAccountDetail[]>([]);
  const [liquiditySummary, setLiquiditySummary] = useState<FsrLiquiditySummary[]>([]);

  useEffect(() => {
    fetchFsrAccountDetails().then(setAccountDetails);
    fetchFsrLiquiditySummary().then(setLiquiditySummary);
  }, []);

  const filteredAccounts = accountDetails.filter((a) => matchesAreCode(activeFilters, a.ARE_Code));
  const filteredLiquidity = liquiditySummary.filter((a) => matchesAreCode(activeFilters, a.ARE_Code));

  const headerClassName = 'px-5 py-3.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
  const rowClassName = 'border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]';
  const cellPadding = 'px-5 py-4';

  return (
    <div>
      <AlertBanner alerts={overview.alerts} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px', marginTop: '10px' }}>
        {overview.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <DataCard title="MEA Regional Breakdown" subtitle="Total Net Position by Region &mdash; EUR">
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

        <DataCard title="Top Positions by Entity" subtitle="Net Total Liquidity &mdash; EUR">
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

      <SectionHeader title="External Bank Accounts" />
      <DataCard subtitle={`${filteredAccounts.length} accounts in scope`} style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'Bank', 'Account', 'CCY', 'Balance (Local)', 'Balance (EUR)'].map((h, i) => (
                  <th key={h} className={cn(headerClassName, i >= 5 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? filteredAccounts.map((a, i) => (
                <tr key={`${a.ARE_Code}-${a.Account}-${i}`} className={rowClassName}>
                  <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{a.ARE_Code}</td>
                  <td className={`${cellPadding} text-[11px] text-text-primary`}>{a.Entity_Name}</td>
                  <td className={`${cellPadding} text-[11px] text-text-primary`}>{a.Bank_Name}</td>
                  <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{a.Account}</td>
                  <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{a.CCY}</td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.Closing_Balance_Local_CCY ?? 0) > 0 ? 'text-status-green' : (a.Closing_Balance_Local_CCY ?? 0) < 0 ? 'text-status-red' : 'text-muted')}>
                    {(a.Closing_Balance_Local_CCY ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.Closing_Balance_EUR ?? 0) > 0 ? 'text-white' : (a.Closing_Balance_EUR ?? 0) < 0 ? 'text-status-red' : 'text-muted')}>
                    {formatAccountBalance(a.Closing_Balance_EUR ?? 0)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center font-mono text-[11px] text-muted">
                    No accounts for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataCard>

      <SectionHeader title="Liquidity Summary" />
      <DataCard subtitle={`${filteredLiquidity.length} entities in scope`} style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'Ext. Liquidity', 'Ext. Debt', 'Int. Liquidity', 'Int. Debt', 'Net Position'].map((h, i) => (
                  <th key={h} className={cn(headerClassName, i >= 2 ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLiquidity.length > 0 ? filteredLiquidity.map((a, i) => (
                <tr key={`${a.ARE_Code}-${i}`} className={rowClassName}>
                  <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{a.ARE_Code}</td>
                  <td className={`${cellPadding} text-[11px] text-text-primary`}>{a.Entity_Name}</td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.External_Liquidity ?? 0) > 0 ? 'text-status-green' : 'text-muted')}>
                    {formatAccountBalance(a.External_Liquidity ?? 0)}
                  </td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.External_Debt ?? 0) < 0 ? 'text-status-red' : 'text-muted')}>
                    {formatAccountBalance(a.External_Debt ?? 0)}
                  </td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.Internal_Liquidity ?? 0) > 0 ? 'text-status-green' : 'text-muted')}>
                    {formatAccountBalance(a.Internal_Liquidity ?? 0)}
                  </td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.Internal_Debt ?? 0) < 0 ? 'text-status-red' : 'text-muted')}>
                    {formatAccountBalance(a.Internal_Debt ?? 0)}
                  </td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, (a.Net_Position ?? 0) > 0 ? 'text-white' : (a.Net_Position ?? 0) < 0 ? 'text-status-red' : 'text-muted')}>
                    {formatAccountBalance(a.Net_Position ?? 0)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center font-mono text-[11px] text-muted">
                    No liquidity data for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  );
}
