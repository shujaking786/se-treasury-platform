import { useCallback, useEffect, useMemo, useState } from 'react';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { legalEntities } from '../../data/legal';
import { depositAccounts as seededDepositAccounts, type DepositAccount } from '../../data/accounts';
import { getCanonicalBankKey, matchesAreCode } from '../../selectors/filtering';
import { fetchFsrAccountDetails, fetchBankAccounts, type DimBankAccount, type FsrAccountDetail } from '../../data/hr';

const EXTERNAL_ACCOUNT_STORAGE_KEY = 'accounts_external_local';
const DEPOSIT_ACCOUNT_STORAGE_KEY = 'accounts_deposit_local';

interface BankingPartnerRow {
  bank: string;
  accountCount: number;
  totalBalanceEur: number;
  entities: string[];
  currencies: string[];
}

interface ExternalAccountRow extends FsrAccountDetail {
  Comment?: string | null;
}

interface DropdownOption {
  value: string;
  label: string;
}

function getLocalItems<T>(storageKey: string): T[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItems<T>(storageKey: string, items: T[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

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

function renderEmptyTableRow(colSpan: number) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-8 text-center font-mono text-[11px] text-muted">
        No data available for the current filter.
      </td>
    </tr>
  );
}

function normalizeAccountKey(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function parseNumber(value: string): number {
  return Number(value) || 0;
}

function parseRatePercent(value: string): number {
  const numeric = Number(value) || 0;
  return numeric > 1 ? numeric / 100 : numeric;
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
};

const modalBoxStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-2)',
  borderRadius: 12,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  width: '100%',
  maxWidth: 620,
  margin: '0 16px',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 28px',
  borderBottom: '1px solid var(--color-border-2)',
};

const modalTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  fontWeight: 700,
  color: 'white',
  letterSpacing: 0.5,
};

const modalFormStyle: React.CSSProperties = {
  padding: '24px 28px',
};

const modalGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: 'var(--color-muted)',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border-2)',
  borderRadius: 6,
  padding: '10px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'white',
  outline: 'none',
};

const modalFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12,
  marginTop: 28,
  paddingTop: 20,
  borderTop: '1px solid var(--color-border-2)',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 0.5,
  color: 'var(--color-muted)',
  border: '1px solid var(--color-border-2)',
  borderRadius: 6,
  background: 'transparent',
  cursor: 'pointer',
};

const submitBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 0.5,
  color: 'white',
  background: 'var(--color-accent)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

const addBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: 0.5,
  color: 'white',
  background: 'var(--color-accent)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

const selectWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border-2)',
  borderRadius: 6,
  padding: '10px 36px 10px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  lineHeight: 1.4,
  outline: 'none',
  appearance: 'none' as const,
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  cursor: 'pointer',
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

function AddExternalAccountModal({
  onClose,
  onSubmit,
  entityOptions,
  bankOptions,
  ccyOptions,
  entityLookup,
}: {
  onClose: () => void;
  onSubmit: (item: ExternalAccountRow) => void;
  entityOptions: DropdownOption[];
  bankOptions: DropdownOption[];
  ccyOptions: DropdownOption[];
  entityLookup: Map<string, { name: string }>;
}) {
  const [form, setForm] = useState({
    ARE_Code: '',
    Entity_Name: '',
    Bank_Name: '',
    Account: '',
    CCY: '',
    Closing_Balance: '',
    Closing_Balance_EUR: '',
    Comment: '',
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    if (field === 'ARE_Code') {
      const match = entityLookup.get(value);
      setForm((prev) => ({ ...prev, ARE_Code: value, Entity_Name: match?.name ?? prev.Entity_Name }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ARE_Code: form.ARE_Code,
      Entity_Name: form.Entity_Name,
      Account_Type: 'External',
      Bank_Name: form.Bank_Name.trim(),
      Account: form.Account.trim(),
      CCY: form.CCY.trim().toUpperCase(),
      Closing_Balance: parseNumber(form.Closing_Balance),
      Closing_Balance_EUR: parseNumber(form.Closing_Balance_EUR),
      Closing_Balance_Local_CCY: parseNumber(form.Closing_Balance),
      Local_CCY: form.CCY.trim().toUpperCase(),
      Comment: form.Comment.trim() || null,
    });
  };

  const closeBtnStyle: React.CSSProperties = { padding: 4, background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 20, cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Add External Account</h2>
          <button type="button" onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect value={form.ARE_Code} onChange={(value) => handleChange('ARE_Code', value)} options={entityOptions} placeholder="Select entity..." required />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={{ ...inputStyle, opacity: 0.7 }} value={form.Entity_Name} readOnly tabIndex={-1} />
            </div>
            <div>
              <label style={labelStyle}>Bank</label>
              <ModalSelect value={form.Bank_Name} onChange={(value) => handleChange('Bank_Name', value)} options={bankOptions} placeholder="Select bank..." required />
            </div>
            <div>
              <label style={labelStyle}>Account</label>
              <input style={inputStyle} value={form.Account} onChange={(e) => handleChange('Account', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>CCY</label>
              <ModalSelect value={form.CCY} onChange={(value) => handleChange('CCY', value)} options={ccyOptions} placeholder="Select currency..." required />
            </div>
            <div>
              <label style={labelStyle}>Balance (Local)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.Closing_Balance} onChange={(e) => handleChange('Closing_Balance', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Balance (EUR)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.Closing_Balance_EUR} onChange={(e) => handleChange('Closing_Balance_EUR', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Comment</label>
              <input style={inputStyle} value={form.Comment} onChange={(e) => handleChange('Comment', e.target.value)} />
            </div>
          </div>
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle}>Add Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddDepositAccountModal({
  onClose,
  onSubmit,
  entityOptions,
  bankOptions,
  ccyOptions,
  entityLookup,
}: {
  onClose: () => void;
  onSubmit: (item: DepositAccount) => void;
  entityOptions: DropdownOption[];
  bankOptions: DropdownOption[];
  ccyOptions: DropdownOption[];
  entityLookup: Map<string, { name: string }>;
}) {
  const [form, setForm] = useState({
    areCode: '',
    entityName: '',
    bank: '',
    accountNumber: '',
    ccy: '',
    interestRatePct: '',
    amount: '',
    amountEur: '',
    term: 'short' as DepositAccount['term'],
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    if (field === 'areCode') {
      const match = entityLookup.get(value);
      setForm((prev) => ({ ...prev, areCode: value, entityName: match?.name ?? prev.entityName }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      areCode: form.areCode,
      entityName: form.entityName,
      bank: form.bank.trim(),
      accountNumber: form.accountNumber.trim(),
      ccy: form.ccy.trim().toUpperCase(),
      interestRate: parseRatePercent(form.interestRatePct),
      amount: parseNumber(form.amount),
      amountEur: parseNumber(form.amountEur),
      term: form.term,
    });
  };

  const closeBtnStyle: React.CSSProperties = { padding: 4, background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 20, cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Add Deposit Account</h2>
          <button type="button" onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect value={form.areCode} onChange={(value) => handleChange('areCode', value)} options={entityOptions} placeholder="Select entity..." required />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={{ ...inputStyle, opacity: 0.7 }} value={form.entityName} readOnly tabIndex={-1} />
            </div>
            <div>
              <label style={labelStyle}>Bank</label>
              <ModalSelect value={form.bank} onChange={(value) => handleChange('bank', value)} options={bankOptions} placeholder="Select bank..." required />
            </div>
            <div>
              <label style={labelStyle}>Account</label>
              <input style={inputStyle} value={form.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>CCY</label>
              <ModalSelect value={form.ccy} onChange={(value) => handleChange('ccy', value)} options={ccyOptions} placeholder="Select currency..." required />
            </div>
            <div>
              <label style={labelStyle}>Term</label>
              <ModalSelect value={form.term} onChange={(value) => handleChange('term', value)} options={[{ value: 'short', label: 'Short' }, { value: 'long', label: 'Long' }]} required />
            </div>
            <div>
              <label style={labelStyle}>Interest Rate (%)</label>
              <input type="number" step="0.001" style={inputStyle} value={form.interestRatePct} onChange={(e) => handleChange('interestRatePct', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" style={inputStyle} value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Amount (EUR)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.amountEur} onChange={(e) => handleChange('amountEur', e.target.value)} required />
            </div>
          </div>
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle}>Add Deposit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AccountsPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const [fsrData, setFsrData] = useState<FsrAccountDetail[]>([]);
  const [bankData, setBankData] = useState<DimBankAccount[]>([]);
  const [localExternalAccounts, setLocalExternalAccounts] = useState<ExternalAccountRow[]>(() => getLocalItems<ExternalAccountRow>(EXTERNAL_ACCOUNT_STORAGE_KEY));
  const [localDepositAccounts, setLocalDepositAccounts] = useState<DepositAccount[]>(() => getLocalItems<DepositAccount>(DEPOSIT_ACCOUNT_STORAGE_KEY));
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    fetchFsrAccountDetails().then(setFsrData);
    fetchBankAccounts().then(setBankData);
  }, []);

  const allExternalAccounts = useMemo<ExternalAccountRow[]>(() => [...fsrData, ...localExternalAccounts], [fsrData, localExternalAccounts]);
  const allDepositAccounts = useMemo<DepositAccount[]>(() => [...seededDepositAccounts, ...localDepositAccounts], [localDepositAccounts]);

  const entityLookup = useMemo(() => {
    const map = new Map<string, { name: string }>();
    for (const entity of legalEntities) map.set(entity.areCode, { name: entity.name });
    return map;
  }, []);

  const entityOptions = useMemo<DropdownOption[]>(() => (
    legalEntities
      .slice()
      .sort((left, right) => left.areCode.localeCompare(right.areCode))
      .map((entity) => ({ value: entity.areCode, label: `${entity.areCode} - ${entity.name}` }))
  ), []);

  const bankOptions = useMemo<DropdownOption[]>(() => {
    const uniqueBanks = [...new Set([
      ...bankData.map((item) => item.bank),
      ...allExternalAccounts.map((item) => item.Bank_Name).filter((value): value is string => Boolean(value)),
      ...allDepositAccounts.map((item) => item.bank),
    ])].sort();
    return uniqueBanks.map((bank) => ({ value: bank, label: bank }));
  }, [bankData, allExternalAccounts, allDepositAccounts]);

  const ccyOptions = useMemo<DropdownOption[]>(() => {
    const uniqueCurrencies = [...new Set([
      ...bankData.map((item) => item.CCY),
      ...allExternalAccounts.map((item) => item.CCY),
      ...allDepositAccounts.map((item) => item.ccy),
    ])].sort();
    return uniqueCurrencies.map((ccy) => ({ value: ccy, label: ccy }));
  }, [bankData, allExternalAccounts, allDepositAccounts]);

  const enrichedExternalAccounts = useMemo<ExternalAccountRow[]>(() => {
    const byAccount = new Map<string, DimBankAccount>();
    const byBankAndCurrency = new Map<string, DimBankAccount[]>();

    for (const item of bankData) {
      const accountKey = normalizeAccountKey(item.account_name);
      if (accountKey && !byAccount.has(accountKey)) byAccount.set(accountKey, item);
      const bankCurrencyKey = `${getCanonicalBankKey(item.bank)}|${item.CCY.trim().toUpperCase()}`;
      const existing = byBankAndCurrency.get(bankCurrencyKey) ?? [];
      existing.push(item);
      byBankAndCurrency.set(bankCurrencyKey, existing);
    }

    return allExternalAccounts.map((item) => {
      const directMatch = byAccount.get(normalizeAccountKey(item.Account));
      const bankCurrencyKey = item.Bank_Name ? `${getCanonicalBankKey(item.Bank_Name)}|${item.CCY.trim().toUpperCase()}` : '';
      const bankCurrencyMatches = bankCurrencyKey ? byBankAndCurrency.get(bankCurrencyKey) ?? [] : [];
      const fallbackMatch = bankCurrencyMatches.length === 1 ? bankCurrencyMatches[0] : undefined;
      const matched = directMatch ?? fallbackMatch;

      return {
        ...item,
        ARE_Code: item.ARE_Code ?? matched?.ARE ?? null,
        Entity_Name: item.Entity_Name ?? matched?.are_name ?? null,
        Bank_Name: item.Bank_Name ?? matched?.bank ?? null,
      };
    });
  }, [allExternalAccounts, bankData]);

  const filteredExternalAccounts = useMemo(
    () => enrichedExternalAccounts.filter((item) => matchesAreCode(activeFilters, item.ARE_Code)),
    [enrichedExternalAccounts, activeFilters],
  );

  const filteredDepositAccounts = useMemo(
    () => allDepositAccounts.filter((item) => matchesAreCode(activeFilters, item.areCode)),
    [allDepositAccounts, activeFilters],
  );

  const bankingPartners = useMemo(() => {
    const summaryMap = new Map<string, BankingPartnerRow>();
    for (const item of filteredExternalAccounts) {
      const bank = item.Bank_Name ?? 'Unknown bank';
      const entity = item.ARE_Code ?? 'UNKNOWN';
      const existing = summaryMap.get(bank);
      if (existing) {
        existing.accountCount += 1;
        existing.totalBalanceEur += item.Closing_Balance_EUR;
        if (!existing.entities.includes(entity)) existing.entities.push(entity);
        if (!existing.currencies.includes(item.CCY)) existing.currencies.push(item.CCY);
      } else {
        summaryMap.set(bank, { bank, accountCount: 1, totalBalanceEur: item.Closing_Balance_EUR, entities: [entity], currencies: [item.CCY] });
      }
    }
    return [...summaryMap.values()].sort((left, right) => right.totalBalanceEur - left.totalBalanceEur);
  }, [filteredExternalAccounts]);

  const kpis = useMemo(() => {
    const totalBalanceEur = filteredExternalAccounts.reduce((sum, item) => sum + item.Closing_Balance_EUR, 0);
    return [
      { label: 'Total Accounts', value: String(filteredExternalAccounts.length), valueColor: 'white' as const, subtitle: 'External bank accounts in scope', gradient: 'default' as const },
      { label: 'Banking Partners', value: String(bankingPartners.length), valueColor: 'white' as const, subtitle: 'Distinct banking relationships', gradient: 'default' as const },
      { label: 'Currencies', value: String(new Set(filteredExternalAccounts.map((item) => item.CCY)).size), valueColor: 'white' as const, subtitle: 'Active currencies in scope', gradient: 'green' as const },
      { label: 'Total Ext. Balance', value: formatEur(totalBalanceEur), valueColor: totalBalanceEur > 0 ? 'green' as const : 'white' as const, subtitle: 'Sum of filtered external balances', gradient: 'green' as const },
    ];
  }, [filteredExternalAccounts, bankingPartners]);

  const handleAddExternalAccount = useCallback((item: ExternalAccountRow) => {
    const updated = [...getLocalItems<ExternalAccountRow>(EXTERNAL_ACCOUNT_STORAGE_KEY), item];
    saveLocalItems(EXTERNAL_ACCOUNT_STORAGE_KEY, updated);
    setLocalExternalAccounts(updated);
    setShowExternalModal(false);
  }, []);

  const handleAddDepositAccount = useCallback((item: DepositAccount) => {
    const updated = [...getLocalItems<DepositAccount>(DEPOSIT_ACCOUNT_STORAGE_KEY), item];
    saveLocalItems(DEPOSIT_ACCOUNT_STORAGE_KEY, updated);
    setLocalDepositAccounts(updated);
    setShowDepositModal(false);
  }, []);

  const headerClassName = 'px-5 py-3.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
  const rowClassName = 'border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]';
  const cellPadding = 'px-5 py-4';

  return (
    <div>
      {showExternalModal && <AddExternalAccountModal onClose={() => setShowExternalModal(false)} onSubmit={handleAddExternalAccount} entityOptions={entityOptions} bankOptions={bankOptions} ccyOptions={ccyOptions} entityLookup={entityLookup} />}
      {showDepositModal && <AddDepositAccountModal onClose={() => setShowDepositModal(false)} onSubmit={handleAddDepositAccount} entityOptions={entityOptions} bankOptions={bankOptions} ccyOptions={ccyOptions} entityLookup={entityLookup} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      <DataCard title="External Bank Accounts" subtitle="All external accounts grouped by entity - showing local + EUR balance" headerRight={<button type="button" style={addBtnStyle} onClick={() => setShowExternalModal(true)}>Add Account</button>} style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'Bank', 'Account', 'CCY', 'Balance (Local)', 'Balance (EUR)', 'Comment'].map((heading, index) => <th key={heading} className={cn(headerClassName, (index === 5 || index === 6) ? 'text-right' : 'text-left')}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredExternalAccounts.length > 0 ? filteredExternalAccounts.map((account, index) => (
                <tr key={`${account.ARE_Code ?? 'unknown'}-${account.Account}-${index}`} className={rowClassName}>
                  <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{account.ARE_Code ?? '-'}</td>
                  <td className={`${cellPadding} text-[11px] text-muted truncate max-w-[160px]`}>{account.Entity_Name ?? 'Unknown entity'}</td>
                  <td className={`${cellPadding} text-[11px] text-text-primary`}>{account.Bank_Name ?? 'Unknown bank'}</td>
                  <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{account.Account}</td>
                  <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{account.CCY}</td>
                  <td className={`${cellPadding} text-right font-mono text-[11px] text-text-primary`}>{formatLocal(account.Closing_Balance, account.CCY)}</td>
                  <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, account.Closing_Balance_EUR > 0 ? 'text-status-green' : 'text-muted')}>{formatEur(account.Closing_Balance_EUR)}</td>
                  <td className={`${cellPadding} text-[10px] text-muted`}>{account.Comment ?? '\u2014'}</td>
                </tr>
              )) : renderEmptyTableRow(8)}
            </tbody>
          </table>
        </div>
      </DataCard>

      <DataCard title="Banking Partners" subtitle="Aggregated balance by banking relationship - EUR" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['Bank', 'Accounts', 'Total Balance (EUR)', 'Entities', 'Currencies'].map((heading, index) => <th key={heading} className={cn(headerClassName, index === 2 ? 'text-right' : 'text-left')}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {bankingPartners.length > 0 ? bankingPartners.map((partner) => (
                <tr key={partner.bank} className={rowClassName}>
                  <td className={`${cellPadding} text-[12px] font-semibold text-white`}>{partner.bank}</td>
                  <td className={`${cellPadding} font-mono text-[12px] text-text-primary`}>{partner.accountCount}</td>
                  <td className={`${cellPadding} text-right font-mono text-[12px] text-status-green`}>{formatEur(partner.totalBalanceEur)}</td>
                  <td className={cellPadding}><div className="flex gap-1 flex-wrap">{partner.entities.map((entity) => <span key={entity} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-2 text-muted">{entity}</span>)}</div></td>
                  <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{partner.currencies.join(', ')}</td>
                </tr>
              )) : renderEmptyTableRow(5)}
            </tbody>
          </table>
        </div>
      </DataCard>

      <DataCard title="Deposit Accounts" subtitle="Short-term and long-term deposits - EUR equivalent" headerRight={<button type="button" style={addBtnStyle} onClick={() => setShowDepositModal(true)}>Add Deposit</button>}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'Bank', 'CCY', 'Interest Rate', 'Amount (EUR)', 'Term'].map((heading, index) => <th key={heading} className={cn(headerClassName, (index === 4 || index === 5) ? 'text-right' : 'text-left')}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredDepositAccounts.length > 0 ? (
                <>
                  {filteredDepositAccounts.map((deposit, index) => (
                    <tr key={`${deposit.areCode}-${deposit.accountNumber}-${index}`} className={rowClassName}>
                      <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{deposit.areCode}</td>
                      <td className={`${cellPadding} text-[11px] text-muted truncate max-w-[160px]`}>{deposit.entityName}</td>
                      <td className={`${cellPadding} text-[11px] text-text-primary`}>{deposit.bank}</td>
                      <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{deposit.ccy}</td>
                      <td className={`${cellPadding} text-right font-mono text-[12px] text-status-amber`}>{(deposit.interestRate * 100).toFixed(2)}%</td>
                      <td className={`${cellPadding} text-right font-mono text-[12px] text-status-green`}>{formatEur(deposit.amountEur)}</td>
                      <td className={cellPadding}><Pill variant={deposit.term === 'short' ? 'amber' : 'blue'}>{deposit.term === 'short' ? 'SHORT' : 'LONG'}</Pill></td>
                    </tr>
                  ))}
                  <tr className="bg-surface-2/60 border-t border-border-2">
                    <td colSpan={5} className={`${cellPadding} font-mono text-[10px] font-semibold tracking-[1px] uppercase text-muted`}>TOTAL DEPOSITS</td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-white`}>{formatEur(filteredDepositAccounts.reduce((sum, deposit) => sum + deposit.amountEur, 0))}</td>
                    <td></td>
                  </tr>
                </>
              ) : renderEmptyTableRow(7)}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  );
}
