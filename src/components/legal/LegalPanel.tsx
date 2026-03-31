import { useCallback, useMemo, useState } from 'react';
import { KpiCard } from '../ui/KpiCard';
import { DataCard } from '../ui/DataCard';
import { Pill } from '../ui/Pill';
import { SectionHeader } from '../ui/SectionHeader';
import { cn } from '../../utils/cn';
import { useStore } from '../../store';
import { selectLegalViewModel } from '../../selectors/legal';
import { getCanonicalBankKey } from '../../selectors/filtering';
import { externalFacilities, internalLoans, legalEntities, type ExternalFacility, type InternalLoan, type LegalEntity } from '../../data/legal';

const LEGAL_ENTITY_STORAGE_KEY = 'legal_entities_local';
const LEGAL_FACILITY_STORAGE_KEY = 'legal_external_facilities_local';
const LEGAL_LOAN_STORAGE_KEY = 'legal_internal_loans_local';

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

function formatLimit(value: number, ccy: string): string {
  if (value === 0) {
    return `0 ${ccy}`;
  }

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${(abs / 1_000_000_000).toFixed(1)}B ${ccy}`;
  }

  if (abs >= 1_000_000) {
    return `${(abs / 1_000_000).toFixed(1)}M ${ccy}`;
  }

  if (abs >= 1_000) {
    return `${(abs / 1_000).toFixed(0)}K ${ccy}`;
  }

  return `${abs.toFixed(0)} ${ccy}`;
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

const emptyEntityForm = {
  areCode: '',
  name: '',
  country: '',
  countryCode: '',
  region: 'ME' as const,
  externalLiquidityEur: '',
  netPositionEur: '',
  bankingPartnersText: '',
  accountCount: '',
};

const emptyFacilityForm = {
  areCode: '',
  entityName: '',
  bank: '',
  type: 'Overdraft' as ExternalFacility['type'],
  interestRatePct: '',
  limit: '',
  limitCcy: '',
  utilized: '',
  glosExpiry: '',
};

const emptyLoanForm = {
  areCode: '',
  entityName: '',
  instrument: '',
  fixedRatePct: '',
  amount: '',
  amountCcy: '',
  amountEur: '',
  expiry: '',
};

interface DropdownOption {
  value: string;
  label: string;
}

interface ModalSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: DropdownOption[];
  required?: boolean;
}

function ModalSelect({ value, onChange, placeholder = 'Select...', options, required = false }: ModalSelectProps) {
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

function parseNumber(value: string): number {
  return Number(value) || 0;
}

function parseRatePercent(value: string): number {
  const numeric = Number(value) || 0;
  return numeric > 1 ? numeric / 100 : numeric;
}

function parsePartnerList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function AddLegalEntityModal({
  initialRegion,
  onClose,
  onSubmit,
}: {
  initialRegion: LegalEntity['region'];
  onClose: () => void;
  onSubmit: (item: LegalEntity) => void;
}) {
  const [form, setForm] = useState(() => ({
    ...emptyEntityForm,
    region: initialRegion,
  }));

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      areCode: form.areCode.trim().toUpperCase(),
      name: form.name.trim(),
      country: form.country.trim(),
      countryCode: form.countryCode.trim().toUpperCase(),
      region: form.region,
      externalLiquidityEur: parseNumber(form.externalLiquidityEur),
      netPositionEur: parseNumber(form.netPositionEur),
      bankingPartners: parsePartnerList(form.bankingPartnersText),
      accountCount: parseNumber(form.accountCount),
    });
  };

  const closeBtnStyle: React.CSSProperties = { padding: 4, background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 20, cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Add Legal Entity</h2>
          <button type="button" onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <input style={inputStyle} value={form.areCode} onChange={(e) => handleChange('areCode', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={inputStyle} value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input style={inputStyle} value={form.country} onChange={(e) => handleChange('country', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Country Code</label>
              <input style={inputStyle} value={form.countryCode} onChange={(e) => handleChange('countryCode', e.target.value)} required />
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
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Account Count</label>
              <input type="number" style={inputStyle} value={form.accountCount} onChange={(e) => handleChange('accountCount', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Ext. Liquidity (EUR)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.externalLiquidityEur} onChange={(e) => handleChange('externalLiquidityEur', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Net Position (EUR)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.netPositionEur} onChange={(e) => handleChange('netPositionEur', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Banking Partners</label>
              <input style={inputStyle} placeholder="Comma separated, e.g. SCB, HSBC" value={form.bankingPartnersText} onChange={(e) => handleChange('bankingPartnersText', e.target.value)} />
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

function AddFacilityModal({
  onClose,
  onSubmit,
  entityOptions,
  entityLookup,
}: {
  onClose: () => void;
  onSubmit: (item: ExternalFacility) => void;
  entityOptions: DropdownOption[];
  entityLookup: Map<string, { name: string }>;
}) {
  const [form, setForm] = useState(emptyFacilityForm);

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
      type: form.type,
      interestRate: parseRatePercent(form.interestRatePct),
      limit: parseNumber(form.limit),
      limitCcy: form.limitCcy.trim().toUpperCase(),
      utilized: parseNumber(form.utilized),
      glosExpiry: form.glosExpiry.trim() || null,
    });
  };

  const closeBtnStyle: React.CSSProperties = { padding: 4, background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 20, cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Add External Facility</h2>
          <button type="button" onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect
                value={form.areCode}
                onChange={(value) => handleChange('areCode', value)}
                placeholder="Select entity..."
                options={entityOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={{ ...inputStyle, opacity: 0.7 }} value={form.entityName} readOnly tabIndex={-1} />
            </div>
            <div>
              <label style={labelStyle}>Bank</label>
              <input style={inputStyle} value={form.bank} onChange={(e) => handleChange('bank', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <ModalSelect
                value={form.type}
                onChange={(value) => handleChange('type', value)}
                options={[
                  { value: 'Overdraft', label: 'Overdraft' },
                  { value: 'FX OD', label: 'FX OD' },
                  { value: 'FX Line', label: 'FX Line' },
                  { value: 'Credit Line', label: 'Credit Line' },
                ]}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Interest Rate (%)</label>
              <input type="number" step="0.001" style={inputStyle} value={form.interestRatePct} onChange={(e) => handleChange('interestRatePct', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Limit CCY</label>
              <input style={inputStyle} value={form.limitCcy} onChange={(e) => handleChange('limitCcy', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Limit</label>
              <input type="number" step="0.01" style={inputStyle} value={form.limit} onChange={(e) => handleChange('limit', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Utilized</label>
              <input type="number" step="0.01" style={inputStyle} value={form.utilized} onChange={(e) => handleChange('utilized', e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>GLOS Expiry</label>
              <input type="date" style={inputStyle} value={form.glosExpiry} onChange={(e) => handleChange('glosExpiry', e.target.value)} />
            </div>
          </div>
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle}>Add Facility</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddLoanModal({
  onClose,
  onSubmit,
  entityOptions,
  entityLookup,
}: {
  onClose: () => void;
  onSubmit: (item: InternalLoan) => void;
  entityOptions: DropdownOption[];
  entityLookup: Map<string, { name: string }>;
}) {
  const [form, setForm] = useState(emptyLoanForm);

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
      instrument: form.instrument.trim(),
      fixedRate: parseRatePercent(form.fixedRatePct),
      amount: parseNumber(form.amount),
      amountCcy: form.amountCcy.trim().toUpperCase(),
      amountEur: parseNumber(form.amountEur),
      expiry: form.expiry,
    });
  };

  const closeBtnStyle: React.CSSProperties = { padding: 4, background: 'none', border: 'none', color: 'var(--color-muted)', fontSize: 20, cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={modalTitleStyle}>Add Internal Loan / Deposit</h2>
          <button type="button" onClick={onClose} style={closeBtnStyle}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={modalGridStyle}>
            <div>
              <label style={labelStyle}>ARE Code</label>
              <ModalSelect
                value={form.areCode}
                onChange={(value) => handleChange('areCode', value)}
                placeholder="Select entity..."
                options={entityOptions}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Entity Name</label>
              <input style={{ ...inputStyle, opacity: 0.7 }} value={form.entityName} readOnly tabIndex={-1} />
            </div>
            <div>
              <label style={labelStyle}>Instrument</label>
              <input style={inputStyle} value={form.instrument} onChange={(e) => handleChange('instrument', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Fixed Rate (%)</label>
              <input type="number" step="0.001" style={inputStyle} value={form.fixedRatePct} onChange={(e) => handleChange('fixedRatePct', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Amount</label>
              <input type="number" step="0.01" style={inputStyle} value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>CCY</label>
              <input style={inputStyle} value={form.amountCcy} onChange={(e) => handleChange('amountCcy', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Amount (EUR)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.amountEur} onChange={(e) => handleChange('amountEur', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Expiry</label>
              <input type="date" style={inputStyle} value={form.expiry} onChange={(e) => handleChange('expiry', e.target.value)} required />
            </div>
          </div>
          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" style={submitBtnStyle}>Add Loan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EntityTableWithStyles({
  entities,
  regionLabel,
  headerClassName,
  rowClassName,
  cellPadding,
  onAdd,
}: {
  entities: ReturnType<typeof selectLegalViewModel>['meEntities'];
  regionLabel: string;
  headerClassName: string;
  rowClassName: string;
  cellPadding: string;
  onAdd: () => void;
}) {
  return (
    <>
      <SectionHeader
        title={`${regionLabel} \u2014 Legal Entities`}
        rightContent={<button type="button" style={addBtnStyle} onClick={onAdd}>Add Entity</button>}
      />
      <DataCard style={{ marginBottom: 24, overflowX: 'auto' }}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity Name', 'Country', 'Ext. Liquidity', 'Net Position', 'Banking Partners', 'Accounts', 'Status'].map((heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      headerClassName,
                      (index === 3 || index === 4 || index === 6) ? 'text-right' : 'text-left',
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entities.length > 0 ? (
                <>
                  {entities.map((entity) => {
                    const isNegative = entity.netPositionEur < 0;

                    return (
                      <tr
                        key={entity.areCode}
                        className={cn(
                          rowClassName,
                          isNegative && 'bg-[rgba(239,68,68,0.04)]',
                        )}
                      >
                        <td className={cn(`${cellPadding} font-mono text-[12px] font-bold`, isNegative ? 'text-status-red' : 'text-white')}>{entity.areCode}</td>
                        <td className={`${cellPadding} text-[11px] text-text-primary`}>{entity.name}</td>
                        <td className={`${cellPadding} text-[11px] text-muted`}>{entity.country} <span className="font-mono text-[9px]">({entity.countryCode})</span></td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-text-primary`}>{formatEur(entity.externalLiquidityEur)}</td>
                        <td className={cn(`${cellPadding} text-right font-mono text-[12px]`, isNegative ? 'text-status-red' : 'text-status-green')}>
                          {formatEur(entity.netPositionEur)}
                        </td>
                        <td className={cellPadding}>
                          <div className="flex gap-1 flex-wrap">
                            {entity.bankingPartners.length > 0 ? (
                              entity.bankingPartners.map((partner) => (
                                <span key={partner} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-2 text-muted">{partner}</span>
                              ))
                            ) : (
                              <span className="text-[9px] text-muted">{'\u2014'}</span>
                            )}
                          </div>
                        </td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-muted`}>{entity.accountCount || '\u2014'}</td>
                        <td className={cellPadding}>
                          {isNegative ? (
                            <Pill variant="red">NEGATIVE</Pill>
                          ) : entity.netPositionEur > 10_000_000 ? (
                            <Pill variant="blue">LARGE</Pill>
                          ) : (
                            <Pill variant="green">ACTIVE</Pill>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-surface-2/60 border-t border-border-2">
                    <td colSpan={3} className={`${cellPadding} font-mono text-[10px] font-semibold tracking-[1px] uppercase text-muted`}>{regionLabel} TOTAL</td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-white`}>
                      {formatEur(entities.reduce((sum, entity) => sum + entity.externalLiquidityEur, 0))}
                    </td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-status-green`}>
                      {formatEur(entities.reduce((sum, entity) => sum + entity.netPositionEur, 0))}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </>
              ) : (
                renderEmptyTableRow(8)
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </>
  );
}

export function LegalPanel() {
  const activeFilters = useStore((state) => state.activeFilters);
  const headerClassName = 'px-5 py-3.5 font-mono text-[10px] font-semibold tracking-[1.5px] uppercase text-muted whitespace-nowrap';
  const rowClassName = 'border-b border-border-custom last:border-b-0 transition-colors hover:bg-[var(--color-accent-hover)]';
  const cellPadding = 'px-5 py-4';

  const [localEntities, setLocalEntities] = useState<LegalEntity[]>(() => getLocalItems<LegalEntity>(LEGAL_ENTITY_STORAGE_KEY));
  const [localFacilities, setLocalFacilities] = useState<ExternalFacility[]>(() => getLocalItems<ExternalFacility>(LEGAL_FACILITY_STORAGE_KEY));
  const [localLoans, setLocalLoans] = useState<InternalLoan[]>(() => getLocalItems<InternalLoan>(LEGAL_LOAN_STORAGE_KEY));
  const [entityModalRegion, setEntityModalRegion] = useState<LegalEntity['region'] | null>(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const allLegalEntities = useMemo(() => [...legalEntities, ...localEntities], [localEntities]);
  const allExternalFacilities = useMemo(() => [...externalFacilities, ...localFacilities], [localFacilities]);
  const allInternalLoans = useMemo(() => [...internalLoans, ...localLoans], [localLoans]);

  const legal = selectLegalViewModel(activeFilters, allLegalEntities, allExternalFacilities, allInternalLoans);

  const entityLookup = useMemo(() => {
    const map = new Map<string, { name: string }>();
    for (const entity of allLegalEntities) {
      map.set(entity.areCode, { name: entity.name });
    }
    return map;
  }, [allLegalEntities]);

  const entityOptions = useMemo<DropdownOption[]>(() => (
    allLegalEntities
      .slice()
      .sort((left, right) => left.areCode.localeCompare(right.areCode))
      .map((entity) => ({ value: entity.areCode, label: `${entity.areCode} - ${entity.name}` }))
  ), [allLegalEntities]);

  const handleAddEntity = useCallback((item: LegalEntity) => {
    const updated = [...getLocalItems<LegalEntity>(LEGAL_ENTITY_STORAGE_KEY), item];
    saveLocalItems(LEGAL_ENTITY_STORAGE_KEY, updated);
    setLocalEntities(updated);
    setEntityModalRegion(null);
  }, []);

  const handleAddFacility = useCallback((item: ExternalFacility) => {
    const updated = [...getLocalItems<ExternalFacility>(LEGAL_FACILITY_STORAGE_KEY), item];
    saveLocalItems(LEGAL_FACILITY_STORAGE_KEY, updated);
    setLocalFacilities(updated);
    setShowFacilityModal(false);
  }, []);

  const handleAddLoan = useCallback((item: InternalLoan) => {
    const updated = [...getLocalItems<InternalLoan>(LEGAL_LOAN_STORAGE_KEY), item];
    saveLocalItems(LEGAL_LOAN_STORAGE_KEY, updated);
    setLocalLoans(updated);
    setShowLoanModal(false);
  }, []);

  const bankNameLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const entity of allLegalEntities) {
      for (const partner of entity.bankingPartners) {
        map.set(getCanonicalBankKey(partner), partner);
      }
    }
    return map;
  }, [allLegalEntities]);

  const normalizedFacilities = useMemo(() => (
    legal.externalFacilities.map((facility) => ({
      ...facility,
      bank: bankNameLookup.get(getCanonicalBankKey(facility.bank)) ?? facility.bank,
    }))
  ), [legal.externalFacilities, bankNameLookup]);

  return (
    <div>
      {entityModalRegion && (
        <AddLegalEntityModal
          initialRegion={entityModalRegion}
          onClose={() => setEntityModalRegion(null)}
          onSubmit={handleAddEntity}
        />
      )}
      {showFacilityModal && (
        <AddFacilityModal
          onClose={() => setShowFacilityModal(false)}
          onSubmit={handleAddFacility}
          entityOptions={entityOptions}
          entityLookup={entityLookup}
        />
      )}
      {showLoanModal && (
        <AddLoanModal
          onClose={() => setShowLoanModal(false)}
          onSubmit={handleAddLoan}
          entityOptions={entityOptions}
          entityLookup={entityLookup}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {legal.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <EntityTableWithStyles
        entities={legal.meEntities}
        regionLabel="Middle East"
        headerClassName={headerClassName}
        rowClassName={rowClassName}
        cellPadding={cellPadding}
        onAdd={() => setEntityModalRegion('ME')}
      />
      <EntityTableWithStyles
        entities={legal.africaEntities}
        regionLabel="Africa"
        headerClassName={headerClassName}
        rowClassName={rowClassName}
        cellPadding={cellPadding}
        onAdd={() => setEntityModalRegion('AFRICA')}
      />
      <SectionHeader
        title="External Credit Facilities"
        rightContent={<button type="button" style={addBtnStyle} onClick={() => setShowFacilityModal(true)}>Add Facility</button>}
      />
      <DataCard subtitle="Overdrafts, FX lines and credit facilities - local currency" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'Bank', 'Type', 'Interest Rate', 'Limit', 'Utilized', 'Utilization'].map((heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      headerClassName,
                      index >= 4 ? 'text-right' : 'text-left',
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normalizedFacilities.length > 0 ? (
                normalizedFacilities.map((facility, index) => {
                  const utilizationPct = facility.limit > 0 ? (facility.utilized / facility.limit) * 100 : 0;

                  return (
                    <tr key={`${facility.areCode}-${facility.bank}-${facility.type}-${index}`} className={rowClassName}>
                      <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{facility.areCode}</td>
                      <td className={`${cellPadding} text-[11px] text-muted truncate max-w-[160px]`}>{facility.entityName}</td>
                      <td className={`${cellPadding} text-[11px] text-text-primary`}>{facility.bank}</td>
                      <td className={cellPadding}>
                        <Pill variant={facility.type === 'Overdraft' ? 'amber' : 'blue'}>{facility.type.toUpperCase()}</Pill>
                      </td>
                      <td className={`${cellPadding} text-right font-mono text-[12px] text-status-amber`}>{(facility.interestRate * 100).toFixed(2)}%</td>
                      <td className={`${cellPadding} text-right font-mono text-[12px] text-text-primary`}>{formatLimit(facility.limit, facility.limitCcy)}</td>
                      <td className={`${cellPadding} text-right font-mono text-[12px] text-status-green`}>{formatLimit(facility.utilized, facility.limitCcy)}</td>
                      <td className={`${cellPadding} text-right`}>
                        <div className="flex items-center justify-end gap-2">
                          <div style={{ width: 60, height: 6, background: 'var(--color-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${utilizationPct}%`,
                                height: '100%',
                                borderRadius: 3,
                                background: utilizationPct > 80 ? 'var(--color-status-red)' : utilizationPct > 50 ? 'var(--color-status-amber)' : 'var(--color-status-green)',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-muted">{utilizationPct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                renderEmptyTableRow(8)
              )}
            </tbody>
          </table>
        </div>
      </DataCard>

      <SectionHeader
        title="Internal Loans & Deposits"
        rightContent={<button type="button" style={addBtnStyle} onClick={() => setShowLoanModal(true)}>Add Loan</button>}
      />
      <DataCard subtitle="Inter-company instruments - fixed rate agreements" style={{ marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '0 8px 8px 8px' }}>
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2 border-b-2 border-border-2">
                {['ARE', 'Entity', 'Instrument', 'Fixed Rate', 'Amount', 'CCY', 'Amount (EUR)', 'Expiry'].map((heading, index) => (
                  <th
                    key={heading}
                    className={cn(
                      headerClassName,
                      (index === 3 || index === 4 || index === 6) ? 'text-right' : 'text-left',
                    )}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {legal.internalLoans.length > 0 ? (
                <>
                  {legal.internalLoans.map((loan, index) => {
                    const isExpired = new Date(loan.expiry) < new Date();

                    return (
                      <tr key={`${loan.areCode}-${loan.instrument}-${index}`} className={rowClassName}>
                        <td className={`${cellPadding} font-mono text-[12px] font-bold text-white`}>{loan.areCode}</td>
                        <td className={`${cellPadding} text-[11px] text-muted truncate max-w-[160px]`}>{loan.entityName}</td>
                        <td className={`${cellPadding} text-[11px] text-text-primary`}>{loan.instrument}</td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-status-amber`}>{(loan.fixedRate * 100).toFixed(3)}%</td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-text-primary`}>{formatLimit(loan.amount, loan.amountCcy)}</td>
                        <td className={`${cellPadding} font-mono text-[10px] text-muted`}>{loan.amountCcy}</td>
                        <td className={`${cellPadding} text-right font-mono text-[12px] text-status-green`}>{formatEur(loan.amountEur)}</td>
                        <td className={cellPadding}>
                          <div className="flex items-center gap-2">
                            <span className={cn('font-mono text-[11px]', isExpired ? 'text-status-red' : 'text-text-primary')}>
                              {loan.expiry}
                            </span>
                            {isExpired && <Pill variant="red">EXPIRED</Pill>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-surface-2/60 border-t border-border-2">
                    <td colSpan={6} className={`${cellPadding} font-mono text-[10px] font-semibold tracking-[1px] uppercase text-muted`}>TOTAL</td>
                    <td className={`${cellPadding} text-right font-mono font-bold text-white`}>{formatEur(legal.totalLoanAmount)}</td>
                    <td></td>
                  </tr>
                </>
              ) : (
                renderEmptyTableRow(8)
              )}
            </tbody>
          </table>
        </div>
      </DataCard>
    </div>
  );
}
