import { AlertBanner } from '../ui/AlertBanner';
import { SectionHeader } from '../ui/SectionHeader';
import { DataCard } from '../ui/DataCard';
import { competitiveAlerts } from '../../data';
import { rippleProfile, seTreasuryProfile, comparisonCriteria, proofPoints } from '../../data';
import { cn } from '../../utils/cn';
import type { ComparisonResult } from '../../types';

const resultColors: Record<ComparisonResult, string> = {
  win: 'text-status-green',
  lose: 'text-status-red',
  neutral: 'text-status-amber',
};

export function CompetitivePanel() {
  return (
    <div>
      <AlertBanner alerts={competitiveAlerts} />

      {/* Two comparison cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Ripple */}
        <DataCard title={rippleProfile.name} subtitle={rippleProfile.subtitle}>
          <div className="p-4 flex flex-col gap-2 text-[12px] text-muted">
            {rippleProfile.features.map((f, i) => (
              <div key={i} className={!f.isPositive ? 'text-status-red' : ''}>{f.text}</div>
            ))}
          </div>
        </DataCard>

        {/* SE Treasury */}
        <DataCard
          title={seTreasuryProfile.name}
          subtitle={seTreasuryProfile.subtitle}
          borderStyle={{ borderColor: 'var(--color-accent-border-strong)' }}
          headerStyle={{ backgroundColor: 'var(--color-accent-hover)' }}
        >
          <div className="p-4 flex flex-col gap-2 text-[12px]">
            {seTreasuryProfile.features.map((f, i) => (
              <div key={i} className="text-status-green">{f.text}</div>
            ))}
          </div>
        </DataCard>
      </div>

      {/* Head-to-Head Comparison */}
      <SectionHeader title="Head-to-Head Comparison" />
      <DataCard style={{ overflowX: 'auto' }}>
        <div className="min-w-[640px]">
          {/* Header */}
          <div className="grid" style={{ gridTemplateColumns: '220px 1fr 1fr', backgroundColor: 'var(--color-surface-2)' }}>
            <div className="px-4 py-2.5 font-mono text-[9px] tracking-[1px] text-muted">CRITERION</div>
            <div className="px-4 py-2.5 font-mono text-[9px] tracking-[1px] text-status-red">RIPPLE TREASURY</div>
            <div className="px-4 py-2.5 font-mono text-[9px] tracking-[1px] text-accent">SE TREASURY PLATFORM</div>
          </div>
          {/* Rows */}
          {comparisonCriteria.map((row) => (
            <div
              key={row.criterion}
              className="grid border-b border-border-custom last:border-b-0"
              style={{ gridTemplateColumns: '220px 1fr 1fr' }}
            >
              <div className="px-4 py-3 text-[11px] font-semibold font-mono text-muted">{row.criterion}</div>
              <div className={cn('px-4 py-3 text-[12px]', resultColors[row.ripple.result])}>{row.ripple.text}</div>
              <div className={cn('px-4 py-3 text-[12px]', resultColors[row.seTreasury.result])}>{row.seTreasury.text}</div>
            </div>
          ))}
        </div>
      </DataCard>

      {/* Win Argument */}
      <div className="rounded-[10px] px-6 py-5 mt-6" style={{ backgroundColor: 'var(--color-accent-hover)', border: '1px solid var(--color-accent-border)' }}>
        <div className="font-mono text-[10px] text-accent tracking-[1px] uppercase mb-2.5">
          THE 30-SECOND WIN ARGUMENT
        </div>
        <div className="text-[14px] font-semibold text-white leading-[1.7]">
          {'\u201C'}Ripple solves how money moves. You told us you need to know where money is — across 22 entities, 16 countries — with limit breaches flagged, payroll reserved, MTO countries handled, and a four-eyes governance trail. That is a different problem. We built exactly what you described. And we can show you your own FSR report, automated from your own data, next week.{'\u201D'}
        </div>
        <div className="mt-4 flex gap-3 flex-wrap">
          {proofPoints.map((pp) => (
            <div key={pp.headline} className="bg-surface border border-border-2 rounded-[8px] px-4 py-2.5 flex-1 min-w-[160px]">
              <div className="font-mono text-[9px] text-muted mb-1">{pp.label}</div>
              <div className={cn('text-[13px] font-bold', pp.variant === 'red' ? 'text-status-red' : 'text-accent')}>
                {pp.headline}
              </div>
              <div className="text-[11px] text-muted">{pp.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
