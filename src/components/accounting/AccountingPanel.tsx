import { useEffect, useState, useCallback, useMemo } from 'react';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { matchesAreCode } from '../../selectors/filtering';
import { fetchAccountingFunding, type AccountingFunding } from '../../data/hr';
import { legalEntities } from '../../data/legal';
import { bankAccounts } from '../../data/accounts';

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
  position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
};
const modalBoxStyle: React.CSSProperties = {
  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
  borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  width: '100%', maxWidth: 560, margin: '0 16px',
};
const modalHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 28px', borderBottom: '1px solid var(--color-border)',
};
const modalTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: 0.5,
};
const modalFormStyle: React.CSSProperties = { padding: '24px 28px' };
const modalGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
  borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'white', outline: 'none',
};
const selectStyle: React.CSSProperties = {
  width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
  borderRadius: 6, padding: '10px 36px 10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12,
  color: 'white', outline: 'none', appearance: 'auto' as const, cursor: 'pointer',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
  letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: 8,
};
const modalFooterStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, paddingTop: 20,
  borderTop: '1px solid var(--color-border)',
};
const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 0.5,
  color: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: 6,
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
            <div>
              <label style={labelStyle}>ARE Code</label>
              <select
                style={{ ...selectStyle, color: form.ARE_Code ? 'white' : 'var(--color-muted)' }}
                value={form.ARE_Code}
                onChange={(e) => handleChange('ARE_Code', e.target.value)}
                required
              >
                <option value="" disabled style={{ color: 'var(--color-muted)' }}>Select entity...</option>
                {entityOptions.map((o) => (
                  <option key={o.value} value={o.value} style={{ color: 'white', background: 'var(--color-surface-2)' }}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>CCY</label>
              <select
                style={{ ...selectStyle, color: form.CCY ? 'white' : 'var(--color-muted)' }}
                value={form.CCY}
                onChange={(e) => handleChange('CCY', e.target.value)}
                required
              >
                <option value="" disabled style={{ color: 'var(--color-muted)' }}>Select currency...</option>
                {ccyOptions.map((o) => (
                  <option key={o.value} value={o.value} style={{ color: 'white', background: 'var(--color-surface-2)' }}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Purpose</label>
              <select
                style={{ ...selectStyle, color: form.Purpose ? 'white' : 'var(--color-muted)' }}
                value={form.Purpose}
                onChange={(e) => handleChange('Purpose', e.target.value)}
                required
              >
                <option value="" disabled style={{ color: 'var(--color-muted)' }}>Select purpose...</option>
                {purposeOptions.map((o) => (
                  <option key={o.value} value={o.value} style={{ color: 'white', background: 'var(--color-surface-2)' }}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Bank Name</label>
              <select
                style={{ ...selectStyle, color: form.Bank_Name ? 'white' : 'var(--color-muted)' }}
                value={form.Bank_Name}
                onChange={(e) => handleChange('Bank_Name', e.target.value)}
                required
              >
                <option value="" disabled style={{ color: 'var(--color-muted)' }}>Select bank...</option>
                {bankOptions.map((o) => (
                  <option key={o.value} value={o.value} style={{ color: 'white', background: 'var(--color-surface-2)' }}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>IBAN</label>
              <input style={inputStyle} placeholder="e.g. EG96..." value={form.IBAN} onChange={(e) => handleChange('IBAN', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" style={inputStyle} placeholder="0.00" value={form.Amount || ''} onChange={(e) => handleChange('Amount', e.target.value)} required />
            </div>
            <div>
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

  // Build filter-aware dropdown options
  const filteredLegalEntities = useMemo(
    () => legalEntities.filter((e) => matchesAreCode(activeFilters, e.areCode)),
    [activeFilters],
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
    const unique = [...new Set(dropdownSourceAccounts.map((a) => a.ccy))].sort();
    return unique.map((c) => ({ value: c, label: c }));
  }, [dropdownSourceAccounts]);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Total Fundings" value={String(totalFundings)} subtitle="Funding records" gradient="default" />
        <KpiCard label="Total Amount" value={formatEur(totalAmount)} subtitle="EUR equivalent" gradient="green" />
        <KpiCard label="Banks" value={String(uniqueBanks)} subtitle="Unique banking partners" gradient="default" />
        <KpiCard label="Currencies" value={String(uniqueCurrencies)} subtitle="Unique currencies" gradient="default" />
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
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{item.date}</td>
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
