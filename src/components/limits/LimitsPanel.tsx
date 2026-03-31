import { AlertBanner } from '../ui/AlertBanner';
import { SectionHeader } from '../ui/SectionHeader';
import { DataCard } from '../ui/DataCard';
import { LimitBar } from '../ui/LimitBar';
import { Pill } from '../ui/Pill';
import { limitsAlerts, bankingPartnerLimits } from '../../data';
import { cn } from '../../utils/cn';
import type { LimitStatus, StatusVariant } from '../../types';

function getLimitBarVariant(status: LimitStatus): 'safe' | 'warn' | 'breach' {
  switch (status) {
    case 'BREACH': return 'breach';
    case 'NEAR_LIMIT':
    case 'ELEVATED': return 'warn';
    case 'SAFE': return 'safe';
  }
}

function getStatusPillVariant(status: LimitStatus): StatusVariant {
  switch (status) {
    case 'BREACH': return 'red';
    case 'NEAR_LIMIT':
    case 'ELEVATED': return 'amber';
    case 'SAFE': return 'green';
  }
}

function getStatusLabel(status: LimitStatus): string {
  switch (status) {
    case 'BREACH': return '\u26A0 BREACH';
    case 'NEAR_LIMIT': return 'NEAR-LIMIT';
    case 'ELEVATED': return 'ELEVATED';
    case 'SAFE': return 'SAFE';
  }
}

function getPctColor(status: LimitStatus): string {
  switch (status) {
    case 'BREACH': return 'text-status-red';
    case 'NEAR_LIMIT':
    case 'ELEVATED': return 'text-status-amber';
    case 'SAFE': return 'text-status-green';
  }
}

export function LimitsPanel() {
  return (
    <div>
      <AlertBanner alerts={limitsAlerts} />
      <SectionHeader title="Banking Partner Limit Utilization" action="Export Report" style={{ marginTop: 0 }} />
      <DataCard
        footer={
          <>
            <span className="font-mono text-[10px] text-muted">LoS (Global Letters of Support) module: Phase 2 · Requires LoS limits + utilization upload</span>
            <span className="font-mono text-[10px] text-muted">Loans & Deposits: Phase 2 · Upload on maturity event</span>
          </>
        }
        style={{ overflowX: 'auto' }}
      >
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <th className="px-3.5 py-2 text-left font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted">Banking Partner</th>
              <th className="px-3.5 py-2 text-left font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted">HQ Limit (EUR)</th>
              <th className="px-3.5 py-2 text-left font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted">Actual Balance (EUR)</th>
              <th className="px-3.5 py-2 text-left font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted min-w-[200px]">Utilization</th>
              <th className="px-3.5 py-2 text-right font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted">%</th>
              <th className="px-3.5 py-2 text-left font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted">Status</th>
              <th className="px-3.5 py-2 text-left font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted">AREs</th>
            </tr>
          </thead>
          <tbody>
            {bankingPartnerLimits.map((limit) => (
              <tr key={limit.partner} className="border-b border-border-custom hover:bg-[var(--color-accent-hover-subtle)] transition-colors">
                <td className="px-3.5 py-[9px] text-[12px] font-bold text-white">{limit.partner}</td>
                <td className="px-3.5 py-[9px] font-mono text-[12px]">&euro;{limit.hqLimitEur.toFixed(1)}M</td>
                <td className={cn('px-3.5 py-[9px] font-mono text-[12px]', limit.status === 'BREACH' ? 'text-status-red font-bold' : limit.status === 'NEAR_LIMIT' ? 'text-status-amber font-bold' : '')}>
                  &euro;{limit.actualBalanceEur >= 1 ? limit.actualBalanceEur.toFixed(1) + 'M' : limit.actualBalanceEur.toFixed(2) + 'M'}
                </td>
                <td className="px-3.5 py-[9px]">
                  <div className="flex items-center gap-2.5">
                    <LimitBar percentage={limit.utilizationPct} variant={getLimitBarVariant(limit.status)} />
                  </div>
                </td>
                <td className="px-3.5 py-[9px] text-right">
                  <span className={cn('font-mono text-[10px] font-bold', getPctColor(limit.status))}>
                    {limit.utilizationPct.toFixed(1)}%
                  </span>
                </td>
                <td className="px-3.5 py-[9px]">
                  <Pill variant={getStatusPillVariant(limit.status)}>{getStatusLabel(limit.status)}</Pill>
                </td>
                <td className="px-3.5 py-[9px] font-mono text-[11px] text-muted">{limit.relatedAres.join(' \u00B7 ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataCard>
    </div>
  );
}
