import { SectionHeader } from '../ui/SectionHeader';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { payrollDates, payrollRows, payrollTotals, vendorRunRows } from '../../data';
import { cn } from '../../utils/cn';

export function ForecastPanel() {
  return (
    <div>
      {/* Payroll Schedule */}
      <SectionHeader
        title="HR Payroll Schedule — Feb/Mar 2026"
        rightContent={<span className="font-mono text-[9px] text-muted">SOURCE: HR MONTHLY UPLOAD · 9 ENTITIES</span>}
        style={{ marginTop: 0 }}
      />
      <DataCard
        title="External Account Funding Request — Payroll"
        subtitle="Treasury & Corporate Finance · ME Region · EUR Equiv."
        headerRight={<Pill variant="blue">MONTHLY UPLOAD</Pill>}
        style={{ marginBottom: 24, overflowX: 'auto' }}
      >
        <div className="min-w-[760px]">
          {/* Header */}
          <div
            className="grid font-mono text-[9px] tracking-[1px] uppercase text-muted px-3.5 py-2"
            style={{ gridTemplateColumns: '150px 70px 90px 90px 90px 90px 90px 90px', backgroundColor: 'var(--color-surface-2)' }}
          >
            <span>Entity</span><span>CCY</span>
            {payrollDates.map((d) => <span key={d.date} className="text-right">{d.label}</span>)}
            <span className="text-right">Total</span>
          </div>
          {/* Rows */}
          {payrollRows.map((row, idx) => (
            <div
              key={idx}
              className={cn(
                'grid px-3.5 py-2 border-b border-border-custom text-[11.5px]',
                row.isHighlighted && 'bg-[rgba(239,68,68,0.03)]'
              )}
              style={{ gridTemplateColumns: '150px 70px 90px 90px 90px 90px 90px 90px' }}
            >
              <span className={row.highlightColor === 'red' ? 'text-status-red' : ''}>{row.entityLabel}</span>
              <span className="font-mono text-muted">{row.currency}</span>
              {row.amounts.map((amt, i) => (
                <span key={i} className={cn('font-mono text-right', amt !== null ? 'text-white' : 'text-surface-2')}>
                  {amt !== null ? `${amt}M` : '\u2014'}
                </span>
              ))}
              <span className={cn(
                'font-mono text-right',
                row.totalColor === 'red' ? 'text-status-red' : row.totalColor === 'amber' ? 'text-status-amber' : 'text-white'
              )}>
                {row.total}M
              </span>
            </div>
          ))}
          {/* Total Row */}
          <div
            className="grid px-3.5 py-2 font-mono font-bold text-[11px]"
            style={{ gridTemplateColumns: '150px 70px 90px 90px 90px 90px 90px 90px', backgroundColor: 'var(--color-surface-2)' }}
          >
            <span className="text-muted">TOTAL PAYROLL</span><span></span>
            {payrollTotals.amounts.map((amt, i) => (
              <span key={i} className="text-right text-text-primary">{amt}M</span>
            ))}
            <span className="text-right text-status-amber">{payrollTotals.total}M</span>
          </div>
        </div>
      </DataCard>

      {/* Vendor Run */}
      <SectionHeader
        title="Accounting Vendor Run — Week 01 Mar 2026"
        rightContent={<span className="font-mono text-[9px] text-muted">SOURCE: ACCOUNTING WEEKLY UPLOAD</span>}
      />
      <DataCard
        title="Weekly Vendor Funding — Requested vs. Utilized vs. Estimate"
        subtitle="Mon request → Wed execution window · Variances auto-flagged"
        headerRight={<Pill variant="blue">WEEKLY UPLOAD</Pill>}
        style={{ overflowX: 'auto' }}
        footer={
          <>
            <span className="font-mono text-[10px] text-status-red">&lrm;&#9888; 463G OMR: 7K OMR pending approval — exceeds weekly estimate</span>
            <span className="font-mono text-[10px] text-muted">Buffer reserves: 4678 +1.5M · 4659 +1.0M · 519X +1.0M</span>
          </>
        }
      >
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
              {['ARE', 'Bank', 'CCY', 'Type', 'Requested', 'Utilized', 'Estimate', 'Variance', 'Status'].map((h, i) => (
                <th key={h} className={cn(
                  'px-3.5 py-2 font-mono text-[9px] font-semibold tracking-[1.2px] uppercase text-muted whitespace-nowrap',
                  i >= 4 && i <= 7 ? 'text-right' : 'text-left'
                )}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendorRunRows.map((row, idx) => (
              <tr key={idx} className="border-b border-border-custom hover:bg-[var(--color-accent-hover-subtle)]">
                <td className="px-3.5 py-[9px] font-mono font-bold text-[12px] text-white">{row.areCode}</td>
                <td className="px-3.5 py-[9px] text-[12px] text-muted">{row.bank}</td>
                <td className="px-3.5 py-[9px] font-mono text-muted">{row.currency}</td>
                <td className="px-3.5 py-[9px] text-[12px]">{row.type}</td>
                <td className="px-3.5 py-[9px] text-right font-mono text-[12px]">{row.requested !== null ? `${row.requested}M` : '\u2014'}</td>
                <td className="px-3.5 py-[9px] text-right font-mono text-[12px]">{row.utilized !== null ? `${row.utilized}M` : '\u2014'}</td>
                <td className="px-3.5 py-[9px] text-right font-mono text-[12px]">{row.estimate !== null ? `${row.estimate}M` : '\u2014'}</td>
                <td className="px-3.5 py-[9px] text-right">
                  {row.varianceLabel ? (
                    <span className={cn('font-mono text-[11px] font-bold', row.varianceDirection === 'up' ? 'text-status-amber' : 'text-status-green')}>
                      {row.varianceLabel}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-3.5 py-[9px]">
                  <Pill variant={row.statusVariant}>{row.status}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataCard>
    </div>
  );
}
