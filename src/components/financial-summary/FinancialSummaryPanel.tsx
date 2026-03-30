import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { SectionHeader } from '../ui/SectionHeader';

const kpis = [
  { label: 'Total Revenue (YTD)', value: '€124.8M', subtitle: '+8.3% vs prior year', gradient: 'green' as const, valueColor: 'white' as const },
  { label: 'Operating Expenses (YTD)', value: '€87.2M', subtitle: '69.9% cost-to-income ratio', gradient: 'default' as const, valueColor: 'white' as const },
  { label: 'Net Income (YTD)', value: '€37.6M', subtitle: '30.1% net margin', gradient: 'green' as const, valueColor: 'green' as const },
  { label: 'Cash Burn Rate', value: '€4.2M/mo', subtitle: '83 months runway at current rate', gradient: 'amber' as const, valueColor: 'amber' as const },
];

const incomeRows = [
  { item: 'Gross Revenue', q1: '€42.1M', q2: '€41.5M', q3: '€41.2M', q4: '€43.0M', fy: '€167.8M', varPct: '+8.3%', varColor: 'green' as const, fyColor: 'text-white' },
  { item: 'Cost of Services', q1: '-€18.4M', q2: '-€17.9M', q3: '-€18.1M', q4: '-€18.6M', fy: '-€73.0M', varPct: '+4.1%', varColor: 'amber' as const, fyColor: 'text-white' },
  { item: 'Gross Profit', q1: '€23.7M', q2: '€23.6M', q3: '€23.1M', q4: '€24.4M', fy: '€94.8M', varPct: '+12.8%', varColor: 'green' as const, fyColor: 'text-status-green' },
  { item: 'Operating Expenses', q1: '-€29.5M', q2: '-€28.8M', q3: '-€28.9M', q4: '-€30.2M', fy: '-€117.4M', varPct: '+3.6%', varColor: 'amber' as const, fyColor: 'text-white' },
  { item: 'EBITDA', q1: '€14.2M', q2: '€13.9M', q3: '€13.5M', q4: '€14.8M', fy: '€56.4M', varPct: '+11.2%', varColor: 'green' as const, fyColor: 'text-status-green' },
  { item: 'Net Income', q1: '€12.8M', q2: '€12.6M', q3: '€12.2M', q4: '€13.4M', fy: '€51.0M', varPct: '+14.5%', varColor: 'green' as const, fyColor: 'text-status-green' },
];

const cashFlowRows = [
  { entity: '5402 Egypt', location: 'Cairo · EGP/EUR', region: 'Africa', inflows: '€8.4M', outflows: '-€6.1M', net: '+€2.3M', netColor: 'text-status-green', opening: '€62.5M', closing: '€64.8M', closingColor: 'text-white', status: 'HEALTHY', statusVariant: 'green' as const },
  { entity: '5423 Nigeria', location: 'Lagos · NGN/EUR', region: 'Africa', inflows: '€9.1M', outflows: '-€7.8M', net: '+€1.3M', netColor: 'text-status-green', opening: '€61.6M', closing: '€62.9M', closingColor: 'text-white', status: 'HEALTHY', statusVariant: 'green' as const },
  { entity: '516S Saudi', location: 'Riyadh · SAR/EUR', region: 'Middle East', inflows: '€11.2M', outflows: '-€9.9M', net: '+€1.3M', netColor: 'text-status-green', opening: '€59.2M', closing: '€60.5M', closingColor: 'text-white', status: 'HEALTHY', statusVariant: 'green' as const },
  { entity: '412W Ivory Coast', location: 'Abidjan · XOF/EUR', region: 'Africa', inflows: '€5.6M', outflows: '-€4.8M', net: '+€0.8M', netColor: 'text-status-green', opening: '€31.2M', closing: '€32.0M', closingColor: 'text-white', status: 'HEALTHY', statusVariant: 'green' as const },
  { entity: '4678 UAE', location: 'Dubai · AED/EUR', region: 'Middle East', inflows: '€3.2M', outflows: '-€3.8M', net: '-€0.6M', netColor: 'text-status-red', opening: '€0.6M', closing: '-€28K', closingColor: 'text-status-red', status: 'NEGATIVE', statusVariant: 'red' as const },
  { entity: '5665 Iran', location: 'Tehran · IRR/EUR', region: 'Middle East', inflows: '€4.8M', outflows: '-€4.3M', net: '+€0.5M', netColor: 'text-status-green', opening: '€31.1M', closing: '€31.6M', closingColor: 'text-white', status: 'WATCH', statusVariant: 'amber' as const },
  { entity: '519X Qatar', location: 'Doha · QAR/EUR', region: 'Middle East', inflows: '€6.7M', outflows: '-€5.9M', net: '+€0.8M', netColor: 'text-status-green', opening: '€24.6M', closing: '€25.4M', closingColor: 'text-white', status: 'HEALTHY', statusVariant: 'green' as const },
];

const thClass = 'px-5 py-3.5 text-left font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
const thRight = `${thClass} text-right`;
const tdBase = 'px-5 py-4 text-[12px]';
const tdRight = `${tdBase} text-right font-mono`;

export function FinancialSummaryPanel() {
  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Income Statement Summary */}
      <SectionHeader title="Income Statement" style={{ marginTop: 0 }} />
      <DataCard
        title="Income Statement Summary"
        subtitle="Quarterly Breakdown — EUR (FY 2026)"
        headerRight={<Pill variant="blue">YTD</Pill>}
        style={{ marginBottom: 24 }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
            <span className="font-mono text-[10px] text-muted">Source: Finavigate ERP · Consolidated</span>
            <span className="font-mono text-[10px] text-muted">Last Updated: 05 MAR 2026</span>
          </div>
        }
      >
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-surface-2 border-b-2 border-border-2">
              <th className={thClass}>Line Item</th>
              <th className={thRight}>Q1</th>
              <th className={thRight}>Q2</th>
              <th className={thRight}>Q3</th>
              <th className={thRight}>Q4 (Proj)</th>
              <th className={thRight}>FY Total</th>
              <th className={`${thClass} text-right`}>Var %</th>
            </tr>
          </thead>
          <tbody>
            {incomeRows.map((row) => (
              <tr key={row.item} className="border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]">
                <td className={`${tdBase} font-bold text-white`}>{row.item}</td>
                <td className={tdRight}>{row.q1}</td>
                <td className={tdRight}>{row.q2}</td>
                <td className={tdRight}>{row.q3}</td>
                <td className={`${tdRight} text-muted`}>{row.q4}</td>
                <td className={`${tdRight} font-bold ${row.fyColor}`}>{row.fy}</td>
                <td className={`${tdBase} text-right`}><Pill variant={row.varColor}>{row.varPct}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </DataCard>

      {/* Cash Flow by Entity */}
      <SectionHeader title="Cash Flow by Entity" />
      <DataCard
        title="Cash Flow by Entity"
        subtitle="Net Cash Movement — Current Period — EUR"
        headerRight={<Pill variant="blue">MAR 2026</Pill>}
        style={{ marginBottom: 24 }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
            <span className="font-mono text-[10px] text-muted">7 of 22 entities shown · Sorted by closing balance</span>
            <span className="font-mono text-[10px] text-muted">Period: 01–05 MAR 2026</span>
          </div>
        }
      >
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-2 border-b-2 border-border-2">
              <th className={thClass}>Entity</th>
              <th className={thClass}>Region</th>
              <th className={thRight}>Inflows</th>
              <th className={thRight}>Outflows</th>
              <th className={thRight}>Net Cash Flow</th>
              <th className={thRight}>Opening Bal.</th>
              <th className={thRight}>Closing Bal.</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {cashFlowRows.map((row) => (
              <tr key={row.entity} className="border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]">
                <td className={tdBase}>
                  <span className="font-bold text-white">{row.entity}</span>
                  <br />
                  <span className="font-mono text-[10px] text-muted">{row.location}</span>
                </td>
                <td className={`${tdBase} text-[11px] text-muted`}>{row.region}</td>
                <td className={tdRight}>{row.inflows}</td>
                <td className={tdRight}>{row.outflows}</td>
                <td className={`${tdRight} ${row.netColor}`}>{row.net}</td>
                <td className={tdRight}>{row.opening}</td>
                <td className={`${tdRight} font-bold ${row.closingColor}`}>{row.closing}</td>
                <td className={tdBase}><Pill variant={row.statusVariant}>{row.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </DataCard>
    </div>
  );
}
