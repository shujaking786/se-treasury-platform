import { useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { SectionHeader } from '../ui/SectionHeader';
import { useStore } from '../../store';
import { matchesAreCode } from '../../selectors/filtering';
import { fetchFsrLiquiditySummary, fetchFsrAccountDetails, type FsrLiquiditySummary, type FsrAccountDetail } from '../../data/hr';
import { legalEntities } from '../../data/legal';

function formatEur(value: number): string {
  if (value === 0) return '\u20AC0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}\u20AC${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  return `${sign}\u20AC${abs.toFixed(0)}`;
}

function formatLocal(value: number, ccy: string): string {
  if (value === 0) return '0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B ${ccy}`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M ${ccy}`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K ${ccy}`;
  return `${sign}${abs.toFixed(0)} ${ccy}`;
}

const thClass = 'px-5 py-3.5 text-left font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
const thRight = `${thClass} text-right`;
const tdBase = 'px-5 py-4 text-[12px]';
const tdRight = `${tdBase} text-right font-mono`;

const PAGE_SIZE = 20;

const paginationBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: 0.5,
  border: '1px solid var(--color-border-2)',
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--color-muted)',
  cursor: 'pointer',
};

const paginationBtnDisabledStyle: React.CSSProperties = {
  ...paginationBtnStyle,
  opacity: 0.35,
  cursor: 'default',
};

export function FinancialSummaryPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const [liquiditySummary, setLiquiditySummary] = useState<FsrLiquiditySummary[]>([]);
  const [accountDetails, setAccountDetails] = useState<FsrAccountDetail[]>([]);
  const [extPage, setExtPage] = useState(1);
  const [intPage, setIntPage] = useState(1);

  useEffect(() => {
    fetchFsrLiquiditySummary().then(setLiquiditySummary);
    fetchFsrAccountDetails().then(setAccountDetails);
  }, []);

  const entityLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const entity of legalEntities) map.set(entity.areCode, entity.name);
    return map;
  }, []);

  const enrichedLiquidity = useMemo(() => {
    const filtered = liquiditySummary.filter((item) => item.ARE_Code && matchesAreCode(activeFilters, item.ARE_Code));
    return filtered
      .map((item) => ({
        ...item,
        Entity_Name: item.Entity_Name || entityLookup.get(item.ARE_Code) || item.Entity_Name,
      }))
      .filter((item) => Boolean(item.Entity_Name?.trim()));
  }, [liquiditySummary, activeFilters, entityLookup]);

  const filteredAccounts = useMemo(() => (
    accountDetails
      .filter((item) => item.ARE_Code && item.ARE_Code.trim() !== '' && matchesAreCode(activeFilters, item.ARE_Code))
      .map((item) => ({
        ...item,
        Entity_Name: item.Entity_Name || entityLookup.get(item.ARE_Code ?? '') || item.Entity_Name,
      }))
      .filter((item) => Boolean(item.Entity_Name?.trim()))
  ), [accountDetails, activeFilters, entityLookup]);

  const externalAccounts = useMemo(
    () => filteredAccounts.filter((item) => item.Account_Type === 'External'),
    [filteredAccounts],
  );

  const internalAccounts = useMemo(
    () => filteredAccounts.filter((item) => item.Account_Type === 'Internal'),
    [filteredAccounts],
  );

  // Reset pages when data changes
  useEffect(() => { setExtPage(1); }, [externalAccounts.length]);
  useEffect(() => { setIntPage(1); }, [internalAccounts.length]);

  const extTotalPages = Math.max(1, Math.ceil(externalAccounts.length / PAGE_SIZE));
  const intTotalPages = Math.max(1, Math.ceil(internalAccounts.length / PAGE_SIZE));
  const pagedExternal = externalAccounts.slice((extPage - 1) * PAGE_SIZE, extPage * PAGE_SIZE);
  const pagedInternal = internalAccounts.slice((intPage - 1) * PAGE_SIZE, intPage * PAGE_SIZE);

  const fsrKpis = useMemo(() => {
    const extLiq = enrichedLiquidity.reduce((sum, item) => sum + item.External_Liquidity, 0);
    const extDebt = enrichedLiquidity.reduce((sum, item) => sum + item.External_Debt, 0);
    const intLiq = enrichedLiquidity.reduce((sum, item) => sum + item.Internal_Liquidity, 0);
    const intDebt = enrichedLiquidity.reduce((sum, item) => sum + item.Internal_Debt, 0);
    return [
      { label: 'External Liquidity', value: formatEur(extLiq), subtitle: 'Total external liquidity (EUR)', gradient: 'green' as const, valueColor: extLiq > 0 ? 'green' as const : 'white' as const },
      { label: 'External Debt', value: formatEur(extDebt), subtitle: 'Total external debt (EUR)', gradient: 'default' as const, valueColor: extDebt > 0 ? 'red' as const : 'white' as const },
      { label: 'Internal Liquidity', value: formatEur(intLiq), subtitle: 'Total internal liquidity (EUR)', gradient: 'green' as const, valueColor: intLiq > 0 ? 'green' as const : 'white' as const },
      { label: 'Internal Debt', value: formatEur(intDebt), subtitle: 'Total internal debt (EUR)', gradient: 'default' as const, valueColor: intDebt > 0 ? 'red' as const : 'white' as const },
    ];
  }, [enrichedLiquidity]);

  const renderEmptyRow = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="px-5 py-8 text-center font-mono text-[11px] text-muted">
        No data available for the current filter.
      </td>
    </tr>
  );

  const extTotalEur = externalAccounts.reduce((sum, item) => sum + item.Closing_Balance_EUR, 0);
  const intTotalEur = internalAccounts.reduce((sum, item) => sum + item.Closing_Balance_EUR, 0);

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {fsrKpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* External Accounts */}
      <SectionHeader title="External Accounts" style={{ marginTop: 0 }} />
      <DataCard
        title="External Accounts"
        subtitle={`${externalAccounts.length} accounts \u00B7 Total Balance: ${formatEur(extTotalEur)}`}
        headerRight={<Pill variant="blue">FSR</Pill>}
        style={{ marginBottom: 24 }}
      >
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                <th className={thClass}>ARE</th>
                <th className={thClass}>Entity</th>
                <th className={thClass}>Bank</th>
                <th className={thClass}>Account</th>
                <th className={thClass}>CCY</th>
                <th className={thRight}>Balance (Local)</th>
                <th className={thRight}>Balance (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {pagedExternal.length > 0 ? pagedExternal.map((row, i) => (
                <tr key={`${row.ARE_Code}-${row.Account}-${i}`} className="border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]">
                  <td className={`${tdBase} font-mono font-bold text-white`}>{row.ARE_Code ?? '\u2014'}</td>
                  <td className={`${tdBase} text-[11px] text-muted truncate max-w-[160px]`}>{row.Entity_Name ?? '\u2014'}</td>
                  <td className={`${tdBase} text-[11px] text-text-primary`}>{row.Bank_Name ?? '\u2014'}</td>
                  <td className={`${tdBase} font-mono text-[10px] text-muted`}>{row.Account}</td>
                  <td className={`${tdBase} font-mono text-[10px] text-muted`}>{row.CCY}</td>
                  <td className={tdRight}>{formatLocal(row.Closing_Balance_Local_CCY ?? row.Closing_Balance, row.Local_CCY ?? row.CCY)}</td>
                  <td className={`${tdRight} ${row.Closing_Balance_EUR > 0 ? 'text-status-green' : row.Closing_Balance_EUR < 0 ? 'text-status-red' : 'text-muted'}`}>{formatEur(row.Closing_Balance_EUR)}</td>
                </tr>
              )) : renderEmptyRow(7)}
            </tbody>
          </table>
        </div>
        {extTotalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border-2)' }}>
            <span className="font-mono text-[10px] text-muted">
              Showing {(extPage - 1) * PAGE_SIZE + 1}{'\u2013'}{Math.min(extPage * PAGE_SIZE, externalAccounts.length)} of {externalAccounts.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" style={extPage === 1 ? paginationBtnDisabledStyle : paginationBtnStyle} disabled={extPage === 1} onClick={() => setExtPage((p) => p - 1)}>Previous</button>
              <span className="font-mono text-[10px] text-muted" style={{ alignSelf: 'center', minWidth: 44, textAlign: 'center' }}>
                {extPage} / {extTotalPages}
              </span>
              <button type="button" style={extPage === extTotalPages ? paginationBtnDisabledStyle : paginationBtnStyle} disabled={extPage === extTotalPages} onClick={() => setExtPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </DataCard>

      {/* Internal Accounts */}
      <SectionHeader title="Internal Accounts" />
      <DataCard
        title="Internal Accounts"
        subtitle={`${internalAccounts.length} accounts \u00B7 Total Balance: ${formatEur(intTotalEur)}`}
        headerRight={<Pill variant="blue">FSR</Pill>}
        style={{ marginBottom: 24 }}
      >
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                <th className={thClass}>ARE</th>
                <th className={thClass}>Entity</th>
                <th className={thClass}>Bank</th>
                <th className={thClass}>Account</th>
                <th className={thClass}>CCY</th>
                <th className={thRight}>Balance (Local)</th>
                <th className={thRight}>Balance (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {pagedInternal.length > 0 ? pagedInternal.map((row, i) => (
                <tr key={`${row.ARE_Code}-${row.Account}-${i}`} className="border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]">
                  <td className={`${tdBase} font-mono font-bold text-white`}>{row.ARE_Code ?? '\u2014'}</td>
                  <td className={`${tdBase} text-[11px] text-muted truncate max-w-[160px]`}>{row.Entity_Name ?? '\u2014'}</td>
                  <td className={`${tdBase} text-[11px] text-text-primary`}>{row.Bank_Name ?? '\u2014'}</td>
                  <td className={`${tdBase} font-mono text-[10px] text-muted`}>{row.Account}</td>
                  <td className={`${tdBase} font-mono text-[10px] text-muted`}>{row.CCY}</td>
                  <td className={tdRight}>{formatLocal(row.Closing_Balance_Local_CCY ?? row.Closing_Balance, row.Local_CCY ?? row.CCY)}</td>
                  <td className={`${tdRight} ${row.Closing_Balance_EUR > 0 ? 'text-status-green' : row.Closing_Balance_EUR < 0 ? 'text-status-red' : 'text-muted'}`}>{formatEur(row.Closing_Balance_EUR)}</td>
                </tr>
              )) : renderEmptyRow(7)}
            </tbody>
          </table>
        </div>
        {intTotalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border-2)' }}>
            <span className="font-mono text-[10px] text-muted">
              Showing {(intPage - 1) * PAGE_SIZE + 1}{'\u2013'}{Math.min(intPage * PAGE_SIZE, internalAccounts.length)} of {internalAccounts.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" style={intPage === 1 ? paginationBtnDisabledStyle : paginationBtnStyle} disabled={intPage === 1} onClick={() => setIntPage((p) => p - 1)}>Previous</button>
              <span className="font-mono text-[10px] text-muted" style={{ alignSelf: 'center', minWidth: 44, textAlign: 'center' }}>
                {intPage} / {intTotalPages}
              </span>
              <button type="button" style={intPage === intTotalPages ? paginationBtnDisabledStyle : paginationBtnStyle} disabled={intPage === intTotalPages} onClick={() => setIntPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </DataCard>
    </div>
  );
}
