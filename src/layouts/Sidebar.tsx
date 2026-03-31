import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getSidebarSections,
  isSidebarItemActive,
  isSectionFullyActive,
  isSectionPartiallyActive,
} from '../selectors/sidebar';
import {
  ACCOUNTS_FILTERS_UPDATED_EVENT,
  getAccountsSidebarSections,
  getAccountsSidebarViewCounts,
  getFallbackAccountFilterRecords,
  loadAccountFilterRecords,
  type AccountFilterRecord,
} from '../selectors/accountsFilters';
import type { SidebarSection } from '../selectors/sidebar';
import { useStore } from '../store';
import type { DashboardFilterValue, ViewMode } from '../types';

const baseViewModes: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: 'region', icon: '\u25C9', label: 'Region' },
  { mode: 'country', icon: '\u25CE', label: 'Country' },
  { mode: 'are', icon: '\u25CB', label: 'ARE' },
  { mode: 'bankingPartner', icon: '\u25C7', label: 'Banking Partner' },
];

const sectionHeadingStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  fontWeight: 600,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: 'var(--color-muted)',
  padding: '0 14px 6px 14px',
};

const dividerStyle: CSSProperties = {
  height: '1px',
  background: 'var(--color-border-custom)',
  margin: '8px 14px',
};

function getItemStyle(isActive: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '7px 14px',
    cursor: 'pointer',
    transition: 'all 100ms',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
    color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
    background: isActive ? 'var(--color-accent-hover)' : 'transparent',
    textDecoration: 'none',
    textAlign: 'left',
  };
}

const iconSpanStyle: CSSProperties = {
  fontSize: '11px',
  width: '16px',
  textAlign: 'center',
};

function CheckboxIcon({ checked, partial }: { checked: boolean; partial?: boolean }) {
  if (partial) {
    return (
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          border: '1.5px solid var(--color-accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: 'var(--color-accent-hover-strong)',
        }}
      >
        <span style={{ width: 8, height: 2, background: 'var(--color-accent)', borderRadius: 1 }} />
      </span>
    );
  }

  if (checked) {
    return (
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: 'var(--color-accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        border: '1.5px solid var(--color-border-2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'transparent',
      }}
    />
  );
}

function SidebarItem({
  label,
  meta,
  isActive,
  onClick,
}: {
  label: string;
  meta: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" style={getItemStyle(isActive)} onClick={onClick}>
      <CheckboxIcon checked={isActive} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span
        style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--color-muted)',
          flexShrink: 0,
        }}
      >
        {meta}
      </span>
    </button>
  );
}

function SectionHeading({
  section,
  isAllActive,
  isPartial,
  onToggleAll,
}: {
  section: SidebarSection;
  isAllActive: boolean;
  isPartial: boolean;
  onToggleAll: () => void;
}) {
  return (
    <div
      style={{
        ...sectionHeadingStyle,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onToggleAll}
    >
      <CheckboxIcon checked={isAllActive} partial={isPartial} />
      <span style={{ flex: 1 }}>{section.title}</span>
      <span style={{ fontSize: 8, color: 'var(--color-muted)' }}>{section.items.length}</span>
    </div>
  );
}

export function Sidebar() {
  const {
    sidebarViewMode,
    setSidebarViewMode,
    activeFilters,
    toggleFilter,
    setFilters,
    clearFilters,
    sidebarOpen,
    closeSidebar,
  } = useStore();
  const location = useLocation();
  const isAccountsRoute = location.pathname.startsWith('/accounts');
  const [accountFilterRecords, setAccountFilterRecords] = useState<AccountFilterRecord[]>(getFallbackAccountFilterRecords());

  useEffect(() => {
    if (!isAccountsRoute) return;

    let isMounted = true;
    const refreshAccountFilterRecords = () => {
      loadAccountFilterRecords().then((records) => {
        if (isMounted) {
          setAccountFilterRecords(records);
        }
      });
    };

    refreshAccountFilterRecords();
    window.addEventListener(ACCOUNTS_FILTERS_UPDATED_EVENT, refreshAccountFilterRecords);

    return () => {
      isMounted = false;
      window.removeEventListener(ACCOUNTS_FILTERS_UPDATED_EVENT, refreshAccountFilterRecords);
    };
  }, [isAccountsRoute]);

  const sections = isAccountsRoute
    ? getAccountsSidebarSections(sidebarViewMode, activeFilters, accountFilterRecords) as SidebarSection[]
    : getSidebarSections(sidebarViewMode, activeFilters);

  const viewCounts = useMemo(() => {
    if (!isAccountsRoute) {
      return {
        region: 2,
        country: 16,
        are: 22,
        bankingPartner: 16,
      } as const;
    }

    return getAccountsSidebarViewCounts(accountFilterRecords);
  }, [isAccountsRoute, accountFilterRecords]);

  const viewModes = useMemo(
    () => baseViewModes.map((mode) => ({ ...mode, count: viewCounts[mode.mode] ?? 0 })),
    [viewCounts],
  );

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  function handleToggleSection(section: SidebarSection) {
    const allActive = isSectionFullyActive(activeFilters, section);
    if (allActive) {
      // Remove all items from this section
      const remaining = activeFilters.filter((f) => {
        // Keep filters that don't belong to this section
        return !section.items.some((item) => {
          const itemFilter = item.filter;
          if (f.kind !== itemFilter.kind) return false;
          switch (f.kind) {
            case 'region': return itemFilter.kind === 'region' && f.region === itemFilter.region;
            case 'country': return itemFilter.kind === 'country' && f.countryCode === itemFilter.countryCode;
            case 'entity': return itemFilter.kind === 'entity' && f.areCode === itemFilter.areCode;
            case 'bankingPartner': return itemFilter.kind === 'bankingPartner' && f.bank === itemFilter.bank;
          }
        });
      });
      setFilters(remaining);
    } else {
      // Add all items from this section that aren't already active
      const newFilters: DashboardFilterValue[] = [];
      for (const item of section.items) {
        if (!isSidebarItemActive(activeFilters, item.filter)) {
          newFilters.push(item.filter);
        }
      }
      setFilters([...activeFilters, ...newFilters]);
    }
  }

  const baseSidebarStyle: CSSProperties = {
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border-custom)',
    overflowY: 'auto',
    paddingTop: '12px',
    paddingBottom: '32px',
    width: '200px',
    flexShrink: 0,
    display: 'block',
  };

  const openOverlayStyle: CSSProperties = sidebarOpen
    ? {
        position: 'fixed',
        display: 'block',
        top: '52px',
        left: 0,
        bottom: 0,
        width: '240px',
        zIndex: 160,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }
    : {};

  const sidebarStyle: CSSProperties = {
    ...baseSidebarStyle,
    ...openOverlayStyle,
  };

  const hasFilters = activeFilters.length > 0;

  return (
    <>
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 150,
          }}
          onClick={closeSidebar}
        />
      )}

      <div style={sidebarStyle} className="sidebar-scroll">
        <div style={{ marginBottom: '16px' }}>
          <div style={sectionHeadingStyle}>View By</div>
          {viewModes.map((vm) => {
            const isActive = sidebarViewMode === vm.mode;

            return (
              <button
                key={vm.mode}
                type="button"
                style={getItemStyle(isActive)}
                onClick={() => setSidebarViewMode(vm.mode)}
              >
                <span style={iconSpanStyle}>{vm.icon}</span>
                {vm.label}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    background: isActive ? 'var(--color-accent-hover-solid)' : 'var(--color-surface-2)',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                  }}
                >
                  {vm.count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={dividerStyle} />

        {/* Clear all button */}
        {hasFilters && (
          <div style={{ padding: '4px 14px 8px 14px' }}>
            <button
              type="button"
              onClick={clearFilters}
              style={{
                width: '100%',
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid var(--color-border-2)',
                background: 'var(--color-accent-hover)',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Clear {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''}
            </button>
          </div>
        )}

        {sections.map((section, index) => {
          const isAllActive = isSectionFullyActive(activeFilters, section);
          const isPartial = isSectionPartiallyActive(activeFilters, section);

          return (
            <div key={section.title} style={{ marginBottom: index === sections.length - 1 ? 0 : '16px' }}>
              <SectionHeading
                section={section}
                isAllActive={isAllActive}
                isPartial={isPartial}
                onToggleAll={() => handleToggleSection(section)}
              />
              {section.items.map((item) => {
                const isActive = isSidebarItemActive(activeFilters, item.filter);

                return (
                  <SidebarItem
                    key={item.key}
                    label={item.label}
                    meta={item.meta}
                    isActive={isActive}
                    onClick={() => toggleFilter(item.filter)}
                  />
                );
              })}
              {index < sections.length - 1 && <div style={dividerStyle} />}
            </div>
          );
        })}
      </div>
    </>
  );
}
