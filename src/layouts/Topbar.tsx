import { NavLink } from 'react-router-dom';
import { NAV_TABS } from '../constants';
import { useStore } from '../store';

export function Topbar() {
  const { toggleSidebar, brandMode, toggleBrandMode } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const isSiemensBrand = brandMode === 'siemens-energy';

  return (
    <div style={{
      height: 80,
      justifyContent: 'space-between',
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border-2)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 20,
      paddingRight: 20,
      gap: 24,
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      {/* Mobile hamburger — responsive behavior removed (was lg:hidden), showing by default */}
      {/* Hover styles removed (was hover:text-text-primary hover:bg-surface-2) */}
      <button
        className="mobile-nav-trigger"
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          color: 'var(--color-muted)',
          transition: 'color 150ms, background-color 150ms',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: 'var(--font-sans)',
        fontWeight: 800,
        fontSize: 15,
        color: '#ffffff',
        letterSpacing: '-0.3px',
        flexShrink: 0,
        minWidth: 0,
      }}>
        <div></div>
        {isSiemensBrand ? (
          <img
            src="/se-logo-light.svg"
            alt="Siemens Energy"
            style={{ height: 24, width: 'auto', display: 'block', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 40,
            height: 40,
            backgroundImage: 'var(--gradient-brand-diagonal)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 900,
            color: '#ffffff',
            flexShrink: 0,
          }}>
            SE
          </div>
        )}
        {/* Responsive behavior removed (was hidden sm:block), showing by default */}
        <div style={{ minWidth: 0 }}>
          {isSiemensBrand ? 'Siemens Energy' : 'Treasury Intelligence'}<br />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 400,
            color: 'var(--color-muted)',
            whiteSpace: 'nowrap',
          }}>
            {isSiemensBrand ? 'MEA TREASURY INTELLIGENCE PLATFORM' : 'MEA REGIONAL PLATFORM / FINAVIGATE-LINKED'}
          </span>
        </div>
      </div>

      {/* Navigation — responsive behavior removed (was hidden md:flex), showing by default */}
      <nav style={{
        display: 'flex',
        gap: 40,
        overflowX: 'auto',
        flexShrink: 0,
        alignItems :'center'
      }}>
        {NAV_TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            style={({ isActive }) => ({
              padding: isActive ? '14px 40px' : '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms',
              textDecoration: 'none',
              whiteSpace: 'nowrap' as const,
              color: isActive ? '#ffffff' : 'var(--color-muted)',
              backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* Right section */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          type="button"
          onClick={toggleBrandMode}
          aria-pressed={isSiemensBrand}
          aria-label={isSiemensBrand ? 'Switch to the original branding' : 'Switch to Siemens Energy branding'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 9999,
            border: '1px solid var(--color-accent-border)',
            background: isSiemensBrand ? 'var(--color-accent-hover)' : 'var(--color-surface-2)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            paddingLeft: 10,
            paddingRight: 12,
            paddingTop: 5,
            paddingBottom: 5,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: 'var(--gradient-brand-diagonal)',
              display: 'inline-block',
            }}
          />
          <span>Brand</span>
          <span style={{ color: 'var(--color-accent)' }}>{isSiemensBrand ? 'Siemens Energy' : 'Original'}</span>
        </button>
        {/* Responsive behavior removed (was hidden lg:block), showing by default */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-muted)',
        }}>
          Report Date <span style={{ color: 'var(--color-text-primary)' }}>{today}</span>
        </div>
      </div>
    </div>
  );
}
