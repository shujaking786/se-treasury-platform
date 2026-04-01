import { useEffect, useState, useCallback, useMemo } from 'react';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { selectHrViewModel } from '../../selectors/hr';
import { fetchHrFunding, type HrFunding, type EntityContact } from '../../data/hr';
import { legalEntities } from '../../data/legal';
import { bankAccounts } from '../../data/accounts';
import { matchesAreCode } from '../../selectors/filtering';
import { getAllProjectCurrencyCodes } from '../../utils/projectCurrencies';

const FUNDING_STORAGE_KEY = 'hr_fundings_local';
const ENTITY_STORAGE_KEY = 'hr_entities_local';

function getLocalFundings(): HrFunding[] {
  try {
    const raw = localStorage.getItem(FUNDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFundings(items: HrFunding[]) {
  localStorage.setItem(FUNDING_STORAGE_KEY, JSON.stringify(items));
}

function getLocalEntities(): EntityContact[] {
  try {
    const raw = localStorage.getItem(ENTITY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEntities(items: EntityContact[]) {
  localStorage.setItem(ENTITY_STORAGE_KEY, JSON.stringify(items));
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

function formatHrDate(value: string): string {
  if (!value) {
    return '\u2014';
  }

  const isoDateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoDateMatch) {
    return isoDateMatch[0];
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

const emptyFundingForm: HrFunding = {
  ARE_Code: '',
  ARE_Name: '',
  CCY: '',
  Purpose: '',
  Bank_Name: '',
  IBAN: '',
  date: '',
  Amount: 0,
};

const emptyEntityForm: EntityContact = {
  areCode: '',
  entityName: '',
  country: '',
  region: 'ME',
  cfo: null,
  hoa: null,
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  overflowY: 'auto',
  padding: '24px 16px',
};

const modalBoxStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-2)',
  borderRadius: 12,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  width: '100%',
  maxWidth: 560,
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 20,
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

interface DropdownOption { value: string; label: string }

interface ModalSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: DropdownOption[];
  required?: boolean;
}

function ModalSelect({ value, onChange, placeholder, options, required = false }: ModalSelectProps) {
  return (
    <div style={selectWrapperStyle}>
      <select
        style={{
          ...selectStyle,
          color: value ? 'white' : 'var(--color-muted)',
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled style={{ color: 'var(--color-muted)' }}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} style={{ color: 'white', background: 'var(--color-surface-2)' }}>
            {option.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" style={selectArrowStyle}>
        <path d="M2.25 4.5 6 8.25 9.75 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface FundingModalProps {
  onClose: () => void;
  onSubmit: (item: HrFunding) => void;
  entityOptions: DropdownOption[];
  bankOptions: DropdownOption[];
  ccyOptions: DropdownOption[];
  purposeOptions: DropdownOption[];
  entityLookup: Map<string, { name: string }>;
}

function AddFundingModal({ onClose, onSubmit, entityOptions, bankOptions, ccyOptions, purposeOptions, entityLookup }: FundingModalProps) {
  const [form, setForm] = useState<HrFunding>(emptyFundingForm);

  const handleChange = (field: keyof HrFunding, value: string) => {
    if (field === 'ARE_Code') {
      const match = entityLookup.get(value);
      setForm((prev) => ({ ...prev, ARE_Code: value, ARE_Name: match?.name ?? prev.ARE_Name }));
    } else {
      setForm((prev) => ({ ...prev, [field]: field === 'Amount' ? Number(value) || 0 : value }));
    }
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
          <h2 style={modalTitleStyle}>Add HR Funding</h2>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect
                value={form.ARE_Code}
                onChange={(value) => handleChange('ARE_Code', value)}
                placeholder="Select entity..."
                options={entityOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={{ ...inputStyle, opacity: 0.7 }} value={form.ARE_Name} readOnly tabIndex={-1} />
            </div>
            <div>
              <label style={labelStyle}>CCY</label>
              <ModalSelect
                value={form.CCY}
                onChange={(value) => handleChange('CCY', value)}
                placeholder="Select currency..."
                options={ccyOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Purpose</label>
              <ModalSelect
                value={form.Purpose}
                onChange={(value) => handleChange('Purpose', value)}
                placeholder="Select purpose..."
                options={purposeOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Bank Name</label>
              <ModalSelect
                value={form.Bank_Name}
                onChange={(value) => handleChange('Bank_Name', value)}
                placeholder="Select bank..."
                options={bankOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>IBAN</label>
              <input style={inputStyle} placeholder="e.g. EG96..." value={form.IBAN} onChange={(e) => handleChange('IBAN', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" style={inputStyle} value={form.date} onChange={(e) => handleChange('date', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" style={inputStyle} placeholder="0.00" value={form.Amount || ''} onChange={(e) => handleChange('Amount', e.target.value)} required />
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

interface EntityModalProps {
  onClose: () => void;
  onSubmit: (item: EntityContact) => void;
  entityOptions: DropdownOption[];
  countryOptions: DropdownOption[];
  entityLookup: Map<string, { name: string; country: string; region: 'ME' | 'AFRICA' }>;
}

function AddEntityModal({ onClose, onSubmit, entityOptions, countryOptions, entityLookup }: EntityModalProps) {
  const [form, setForm] = useState<EntityContact>(emptyEntityForm);

  const handleAreChange = (value: string) => {
    const match = entityLookup.get(value);
    setForm((prev) => ({
      ...prev,
      areCode: value,
      entityName: match?.name ?? prev.entityName,
      country: match?.country ?? prev.country,
      region: match?.region ?? prev.region,
    }));
  };

  const handleChange = (field: keyof EntityContact, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value === '' && (field === 'cfo' || field === 'hoa') ? null : value }));
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
          <h2 style={modalTitleStyle}>Add Entity</h2>
          <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect
                value={form.areCode}
                onChange={handleAreChange}
                placeholder="Select entity..."
                options={entityOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={inputStyle} value={form.entityName} onChange={(e) => handleChange('entityName', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <ModalSelect
                value={form.country}
                onChange={(value) => handleChange('country', value)}
                placeholder="Select country..."
                options={countryOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Region</label>
              <ModalSelect
                value={form.region}
                onChange={(value) => handleChange('region', value)}
                options={[
                  { value: 'ME', label: 'ME' },
                  { value: 'AFRICA', label: 'AFRICA' },
                ]}
                placeholder="Select region..."
                required
              />
            </div>
            <div>
              <label style={labelStyle}>CFO</label>
              <input style={inputStyle} placeholder="e.g. John Doe" value={form.cfo ?? ''} onChange={(e) => handleChange('cfo', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Head of Accounting</label>
              <input style={inputStyle} placeholder="e.g. Jane Smith" value={form.hoa ?? ''} onChange={(e) => handleChange('hoa', e.target.value)} />
            </div>
          </div>
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle}>Add Entity</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function HrPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const [apiFundings, setApiFundings] = useState<HrFunding[]>([]);
  const [localFundings, setLocalFundings] = useState<HrFunding[]>(getLocalFundings);
  const [localEntities, setLocalEntities] = useState<EntityContact[]>(getLocalEntities);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);

  useEffect(() => {
    fetchHrFunding().then(setApiFundings);
  }, []);

  const allFundings = [...apiFundings, ...localFundings];

  const handleAddFunding = useCallback((item: HrFunding) => {
    const updated = [...getLocalFundings(), item];
    saveLocalFundings(updated);
    setLocalFundings(updated);
    setShowFundingModal(false);
  }, []);

  const handleAddEntity = useCallback((item: EntityContact) => {
    const updated = [...getLocalEntities(), item];
    saveLocalEntities(updated);
    setLocalEntities(updated);
    setShowEntityModal(false);
  }, []);

  const hr = selectHrViewModel(activeFilters, allFundings, localEntities);
  const allEntityContacts = hr.entityContacts;

  // Build filter-aware dropdown options
  const allLegalEntities = useMemo(
    () => legalEntities.slice().sort((left, right) => left.areCode.localeCompare(right.areCode)),
    [],
  );
  const filteredLegalEntities = allLegalEntities;

  const filteredBankAccounts = useMemo(
    () => bankAccounts.filter((a) => matchesAreCode(activeFilters, a.areCode)),
    [activeFilters],
  );

  const entityOptions = useMemo<DropdownOption[]>(() =>
    filteredLegalEntities.map((e) => ({ value: e.areCode, label: `${e.areCode} — ${e.name}` })),
    [filteredLegalEntities],
  );

  const fundingEntityLookup = useMemo(() => {
    const map = new Map<string, { name: string }>();
    for (const e of legalEntities) map.set(e.areCode, { name: e.name });
    return map;
  }, []);

  const entityDetailLookup = useMemo(() => {
    const map = new Map<string, { name: string; country: string; region: 'ME' | 'AFRICA' }>();
    for (const e of legalEntities) map.set(e.areCode, { name: e.name, country: e.country, region: e.region });
    return map;
  }, []);

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

  const countryOptions = useMemo<DropdownOption[]>(() => {
    const unique = [...new Set(filteredLegalEntities.map((e) => e.country))].sort();
    return unique.map((c) => ({ value: c, label: c }));
  }, [filteredLegalEntities]);

  const headerClassName = 'px-5 py-3.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
  const rowClassName = 'border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]';
  const cellPadding = 'px-5 py-4';

  return (
    <div>
      {showFundingModal && (
        <AddFundingModal
          onClose={() => setShowFundingModal(false)}
          onSubmit={handleAddFunding}
          entityOptions={entityOptions}
          bankOptions={bankOptions}
          ccyOptions={ccyOptions}
          purposeOptions={purposeOptions}
          entityLookup={fundingEntityLookup}
        />
      )}
      {showEntityModal && (
        <AddEntityModal
          onClose={() => setShowEntityModal(false)}
          onSubmit={handleAddEntity}
          entityOptions={entityOptions}
          countryOptions={countryOptions}
          entityLookup={entityDetailLookup}
        />
      )}

      <div className="dashboard-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {hr.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="dashboard-two-column-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <DataCard title="Middle East — Country Presence" subtitle="Entities per jurisdiction">
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {hr.meCountries.map((country) => (
              <div key={country.countryCode} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, width: 80, color: 'var(--color-text-primary)' }}>{country.country}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ background: 'var(--color-surface-2)', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 5,
                        background: 'var(--color-status-green)',
                        width: `${(country.entityCount / 3) * 100}%`,
                        minWidth: country.entityCount > 0 ? 12 : 0,
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, width: 20, textAlign: 'right', color: 'white' }}>{country.entityCount}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', width: 80 }}>{country.areCodes.join(', ')}</span>
              </div>
            ))}
          </div>
        </DataCard>

        <DataCard title="Africa — Country Presence" subtitle="Entities per jurisdiction">
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {hr.africaCountries.map((country) => (
              <div key={country.countryCode} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, width: 80, color: 'var(--color-text-primary)' }}>{country.country}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ background: 'var(--color-surface-2)', borderRadius: 5, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 5,
                        background: 'var(--color-accent-secondary)',
                        width: `${(country.entityCount / 2) * 100}%`,
                        minWidth: country.entityCount > 0 ? 12 : 0,
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, width: 20, textAlign: 'right', color: 'white' }}>{country.entityCount}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-muted)', width: 80 }}>{country.areCodes.join(', ')}</span>
              </div>
            ))}
          </div>
        </DataCard>
      </div>

      <SectionHeader
        title="HR Fundings"
        rightContent={
          <button
            onClick={() => setShowFundingModal(true)}
            style={{
              padding: '8px 18px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 0.5,
              color: 'white',
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            + Add Funding
          </button>
        }
      />
      <DataCard subtitle="Funding records fetched from Fabric GraphQL" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'CCY', 'Purpose', 'Bank', 'IBAN', 'Date', 'Amount'].map((heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      headerClassName,
                      index === 7 ? 'text-right' : 'text-left',
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hr.hrFundings.length > 0 ? (
                hr.hrFundings.map((item, index) => (
                  <tr key={`${item.ARE_Code}-${item.IBAN}-${index}`} className={rowClassName}>
                    <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{item.ARE_Code}</td>
                    <td className={`${cellPadding} text-[11px] text-text-primary`}>{item.ARE_Name}</td>
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{item.CCY}</td>
                    <td className={`${cellPadding} text-[11px] text-text-primary`}>{item.Purpose}</td>
                    <td className={`${cellPadding} text-[11px] text-text-primary`}>{item.Bank_Name}</td>
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{item.IBAN}</td>
                    <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{formatHrDate(item.date)}</td>
                    <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, item.Amount > 0 ? 'text-status-green' : 'text-muted')}>
                      {formatEur(item.Amount)}
                    </td>
                  </tr>
                ))
              ) : (
                renderEmptyTableRow(8)
              )}
            </tbody>
          </table>
        </div>
      </DataCard>

      <SectionHeader
        title="Entity Directory"
        rightContent={
          <button onClick={() => setShowEntityModal(true)} style={addBtnStyle}>
            + Add Entity
          </button>
        }
      />
      <DataCard subtitle="All legal entities with contact assignments" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '4px 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity Name', 'Country', 'Region', 'CFO', 'Head of Accounting'].map((heading) => (
                  <th key={heading} className={`${headerClassName} text-left`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allEntityContacts.length > 0 ? (
                allEntityContacts.map((contact, index) => (
                  <tr key={`${contact.areCode}-${index}`} className={rowClassName}>
                    <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{contact.areCode}</td>
                    <td className={`${cellPadding} text-[11px] text-text-primary`}>{contact.entityName}</td>
                    <td className={`${cellPadding} text-[11px] text-muted`}>{contact.country}</td>
                    <td className={cellPadding}>
                      <Pill variant={contact.region === 'ME' ? 'green' : 'blue'}>{contact.region}</Pill>
                    </td>
                    <td className={`${cellPadding} text-[11px] text-muted`}>{contact.cfo ?? '\u2014'}</td>
                    <td className={`${cellPadding} text-[11px] text-muted`}>{contact.hoa ?? '\u2014'}</td>
                  </tr>
                ))
              ) : (
                renderEmptyTableRow(6)
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  );
}
