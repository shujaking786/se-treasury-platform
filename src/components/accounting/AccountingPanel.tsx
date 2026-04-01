import { useEffect, useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { matchesAreCode } from '../../selectors/filtering';
import { fetchAccountingFunding, type AccountingFunding } from '../../data/hr';
import { legalEntities } from '../../data/legal';
import { bankAccounts } from '../../data/accounts';
import { getAllProjectCurrencyCodes } from '../../utils/projectCurrencies';

const FUNDING_STORAGE_KEY = 'accounting_fundings_local';

function getLocalFundings(): AccountingFunding[] {
  try {
    const raw = localStorage.getItem(FUNDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFundings(items: AccountingFunding[]) {
  localStorage.setItem(FUNDING_STORAGE_KEY, JSON.stringify(items));
}

function formatEur(value: number): string {
  if (value === 0) {
    return '\u20AC0';
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}\u20AC${(abs / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}\u20AC${(abs / 1_000).toFixed(0)}K`;
  }

  return `${sign}\u20AC${abs.toFixed(0)}`;
}

function formatDisplayDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '\u2014';
  }

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(utcDate);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function renderEmptyTableRow(colSpan: number) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-8 text-center font-mono text-[11px] text-muted">
        No data available for the current filter.
      </td>
    </tr>
  );
}

const emptyForm: AccountingFunding = {
  ARE_Code: '',
  CCY: '',
  Purpose: '',
  Bank_Name: '',
  IBAN: '',
  Amount: 0,
  date: '',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start',
  justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '24px 16px',
};
const modalBoxStyle: React.CSSProperties = {
  background: 'var(--color-surface)', border: '1px solid var(--color-border-2)',
  borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  width: '100%', maxWidth: 620, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
};
const modalHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 28px', borderBottom: '1px solid var(--color-border-2)',
};
const modalTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: 0.5,
};
const modalFormStyle: React.CSSProperties = { padding: '24px 28px' };
const modalGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', columnGap: 20, rowGap: 18 };
const fieldWrapperStyle: React.CSSProperties = { minWidth: 0 };
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)',
  borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.4, color: 'white', outline: 'none', boxSizing: 'border-box',
};
const selectWrapperStyle: React.CSSProperties = { position: 'relative', width: '100%' };
const selectStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)',
  borderRadius: 6, padding: '10px 36px 10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12,
  lineHeight: 1.4, color: 'white', outline: 'none', appearance: 'none' as const, WebkitAppearance: 'none', MozAppearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
};
const selectArrowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  right: 14,
  width: 12,
  height: 12,
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: 'var(--color-muted)',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
  letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 8,
};
const modalFooterStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 20,
  borderTop: '1px solid var(--color-border-2)',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5,
  color: 'var(--color-muted)', border: '1px solid var(--color-border-2)', borderRadius: 6,
  background: 'transparent', cursor: 'pointer',
};
const submitBtnStyle: React.CSSProperties = {
  padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5,
  color: 'white', background: 'var(--color-accent)', border: 'none', borderRadius: 6, cursor: 'pointer',
};
const addBtnStyle: React.CSSProperties = {
  padding: '8px 18px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5,
  color: 'white', background: 'var(--color-accent)', border: 'none', borderRadius: 6, cursor: 'pointer',
};

interface DropdownOption { value: string; label: string }

interface AddAccountingFundingModalProps {
  onClose: () => void;
  onSubmit: (item: AccountingFunding) => void;
  entityOptions: DropdownOption[];
  bankOptions: DropdownOption[];
  ccyOptions: DropdownOption[];
  purposeOptions: DropdownOption[];
}

function ModalSelect({ value, onChange, options, placeholder = 'Select...', required = false }: { value: string; onChange: (value: string) => void; options: DropdownOption[]; placeholder?: string; required?: boolean }) {
  return (
    <div style={selectWrapperStyle}>
      <select style={{ ...selectStyle, color: value ? 'white' : 'var(--color-muted)' }} value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="" disabled style={{ color: 'var(--color-muted)' }}>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: 'white', background: 'var(--color-surface-2)' }}>{option.label}</option>
        ))}
      </select>
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" style={selectArrowStyle}>
        <path d="M2.25 4.5 6 8.25 9.75 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function AddAccountingFundingModal({ onClose, onSubmit, entityOptions, bankOptions, ccyOptions, purposeOptions }: AddAccountingFundingModalProps) {
  const [form, setForm] = useState<AccountingFunding>(emptyForm);

  const handleChange = (field: keyof AccountingFunding, value: string) => {
    setForm((prev) => ({ ...prev, [field]: field === 'Amount' ? Number(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const closeBtnStyle: React.CSSProperties = { padding: 4, background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 20, cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Add Accounting Funding</h2>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div style={fieldWrapperStyle}>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect value={form.ARE_Code} onChange={(value) => handleChange('ARE_Code', value)} options={entityOptions} placeholder="Select entity..." required />
            </div>
            <div style={fieldWrapperStyle}>
              <label style={labelStyle}>CCY</label>
              <ModalSelect value={form.CCY} onChange={(value) => handleChange('CCY', value)} options={ccyOptions} placeholder="Select currency..." required />
            </div>
            <div style={fieldWrapperStyle}>
              <label style={labelStyle}>Purpose</label>
              <ModalSelect value={form.Purpose} onChange={(value) => handleChange('Purpose', value)} options={purposeOptions} placeholder="Select purpose..." required />
            </div>
            <div style={{ ...fieldWrapperStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Bank Name</label>
              <ModalSelect value={form.Bank_Name} onChange={(value) => handleChange('Bank_Name', value)} options={bankOptions} placeholder="Select bank..." required />
            </div>
            <div style={{ ...fieldWrapperStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>IBAN</label>
              <input style={inputStyle} placeholder="e.g. EG96..." value={form.IBAN} onChange={(e) => handleChange('IBAN', e.target.value)} required />
            </div>
            <div style={fieldWrapperStyle}>
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" style={inputStyle} placeholder="0.00" value={form.Amount || ''} onChange={(e) => handleChange('Amount', e.target.value)} required />
            </div>
            <div style={fieldWrapperStyle}>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.date} onChange={(e) => handleChange('date', e.target.value)} required />
            </div>
          </div>
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle}>Add Funding</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AccountingPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const [apiFundings, setApiFundings] = useState<AccountingFunding[]>([]);
  const [localFundings, setLocalFundings] = useState<AccountingFunding[]>(getLocalFundings);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAccountingFunding().then(setApiFundings);
  }, []);

  const allFundings = useMemo(() => [...apiFundings, ...localFundings], [apiFundings, localFundings]);

  const filtered = useMemo(
    () => allFundings.filter((f) => matchesAreCode(activeFilters, f.ARE_Code)),
    [allFundings, activeFilters],
  );

  const handleAddFunding = useCallback((item: AccountingFunding) => {
    const updated = [...getLocalFundings(), item];
    saveLocalFundings(updated);
    setLocalFundings(updated);
    setShowModal(false);
  }, []);

  const filteredLegalEntities = useMemo(
    () => legalEntities.slice().sort((left, right) => left.areCode.localeCompare(right.areCode)),
    [],
  );

  const filteredBankAccounts = useMemo(
    () => bankAccounts.filter((a) => matchesAreCode(activeFilters, a.areCode)),
    [activeFilters],
  );

  const entityOptions = useMemo<DropdownOption[]>(() =>
    filteredLegalEntities.map((e) => ({ value: e.areCode, label: `${e.areCode} — ${e.name}` })),
    [filteredLegalEntities],
  );

  const dropdownSourceAccounts = filteredBankAccounts.length ? filteredBankAccounts : bankAccounts;

  const bankOptions = useMemo<DropdownOption[]>(() => {
    const unique = [...new Set(dropdownSourceAccounts.map((a) => a.bank))].sort();
    return unique.map((b) => ({ value: b, label: b }));
  }, [dropdownSourceAccounts]);

  const ccyOptions = useMemo<DropdownOption[]>(() => {
    const unique = getAllProjectCurrencyCodes([
      ...dropdownSourceAccounts.map((account) => account.ccy),
      ...allFundings.map((funding) => funding.CCY),
    ]);
    return unique.map((c) => ({ value: c, label: c }));
  }, [dropdownSourceAccounts, allFundings]);

  const purposeOptions = useMemo<DropdownOption[]>(() => [
    { value: 'Payroll', label: 'Payroll' },
    { value: 'Vendor Payment', label: 'Vendor Payment' },
    { value: 'Intercompany', label: 'Intercompany' },
    { value: 'Tax', label: 'Tax' },
    { value: 'Capital', label: 'Capital' },
    { value: 'Other', label: 'Other' },
  ], []);

  // KPI computations
  const totalFundings = filtered.length;
  const totalAmount = filtered.reduce((sum, f) => sum + f.Amount, 0);
  const uniqueBanks = new Set(filtered.map((f) => f.Bank_Name)).size;
  const uniqueCurrencies = new Set(filtered.map((f) => f.CCY)).size;

  const purposeChartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of filtered) {
      const purpose = item.Purpose || 'Other';
      map.set(purpose, (map.get(purpose) ?? 0) + item.Amount);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const bankChartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of filtered) {
      const bank = item.Bank_Name || 'Unknown';
      map.set(bank, (map.get(bank) ?? 0) + item.Amount);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const headerClassName = 'px-5 py-3.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
  const rowClassName = 'border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]';
  const cellPadding = 'px-5 py-4';

  return (
    <div>
      {showModal && (
        <AddAccountingFundingModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddFunding}
          entityOptions={entityOptions}
          bankOptions={bankOptions}
          ccyOptions={ccyOptions}
          purposeOptions={purposeOptions}
        />
      )}

      <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Total Transactions" value={String(totalFundings)} subtitle="Funding records" gradient="default" />
        <KpiCard label="Total Amount" value={formatEur(totalAmount)} subtitle="EUR equivalent" gradient="green" />
        <KpiCard label="Banks" value={String(uniqueBanks)} subtitle="Unique banking partners" gradient="default" />
        <KpiCard label="Currencies" value={String(uniqueCurrencies)} subtitle="Unique currencies" gradient="default" />
      </div>

      <div className="dashboard-two-column-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
        <DataCard title="Transactions by Purpose" subtitle="Total amount grouped by transaction purpose">
          <div style={{ width: '100%', height: 300, padding: '8px' }}>
            {purposeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={purposeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} stroke="none">
                    {purposeChartData.map((_, i) => (
                      <Cell key={i} fill={['#009999', '#8a00e5', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#a78bfa'][i % 8]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }}
                    itemStyle={{ color: 'white' }}
                    formatter={(value) => formatEur(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full font-mono text-[11px] text-muted">No data available</div>
            )}
            {purposeChartData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1 px-2">
                {purposeChartData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: ['#009999', '#8a00e5', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#a78bfa'][i % 8] }} />
                    <span className="font-mono text-[9px] text-muted">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DataCard>

        <DataCard title="Transactions by Bank" subtitle="Total amount grouped by banking partner">
          <div style={{ width: '100%', height: 300, padding: '8px 8px 8px 0' }}>
            {bankChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankChartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-2)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }} tickFormatter={(v: number) => formatEur(v)} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border-2)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }}
                    itemStyle={{ color: 'white' }}
                    formatter={(value) => formatEur(Number(value))}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#009999" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full font-mono text-[11px] text-muted">No data available</div>
            )}
          </div>
        </DataCard>
      </div>

      <SectionHeader
        title="Accounting Fundings"
        rightContent={
          <button onClick={() => setShowModal(true)} style={addBtnStyle}>
            + Add Funding
          </button>
        }
      />
      <DataCard subtitle="Funding records fetched from Fabric GraphQL" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'CCY', 'Purpose', 'Bank', 'IBAN', 'Date', 'Amount'].map((heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      headerClassName,
                      index === 6 ? 'text-right' : 'text-left',
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item, index) => (
                  <tr key={`${item.ARE_Code}-${item.IBAN}-${index}`} className={rowClassName}>
                    <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{item.ARE_Code}</td>
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{item.CCY}</td>
                    <td className={`${cellPadding} text-[11px] text-text-primary`}>{item.Purpose}</td>
                    <td className={`${cellPadding} text-[11px] text-text-primary`}>{item.Bank_Name}</td>
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{item.IBAN}</td>
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{formatDisplayDate(item.date)}</td>
                    <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, item.Amount > 0 ? 'text-status-green' : 'text-muted')}>
                      {formatEur(item.Amount)}
                    </td>
                  </tr>
                ))
              ) : (
                renderEmptyTableRow(7)
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  );
}
