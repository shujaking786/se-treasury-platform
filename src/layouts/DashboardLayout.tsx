import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { useStore } from '../store';

const STATUS_BAR_HEIGHT = 24;
const CONTENT_PADDING = 20;
const CONTENT_BOTTOM_GAP = 24;

export function DashboardLayout() {
  const { activeFilters, removeFilter, clearFilters } = useStore();

  return (
    <div style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar />
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          paddingBottom: `${STATUS_BAR_HEIGHT}px`,
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: `${CONTENT_PADDING}px`,
            paddingBottom: `${CONTENT_PADDING + STATUS_BAR_HEIGHT + CONTENT_BOTTOM_GAP}px`,
          }}
          className="main-scroll"
        >
          {activeFilters.length > 0 && (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                border: '1px solid var(--color-border-2)',
                background: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: 'var(--color-muted)',
                  }}
                >
                  Applied Filters
                </span>
                {activeFilters.map((filter, index) => (
                  <button
                    key={`${filter.kind}-${index}`}
                    type="button"
                    onClick={() => removeFilter(filter)}
                    aria-label={`Remove filter: ${filter.label}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 9999,
                      border: '1px solid var(--color-border-2)',
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      paddingLeft: 10,
                      paddingRight: 8,
                      paddingTop: 5,
                      paddingBottom: 5,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{filter.label}</span>
                    <span style={{ color: 'var(--color-muted)', fontSize: 12, lineHeight: 1 }}>&times;</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={clearFilters}
                aria-label="Clear all filters"
                style={{
                  borderRadius: 9999,
                  border: '1px solid var(--color-accent-border)',
                  background: 'var(--color-accent-hover)',
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 6,
                  paddingBottom: 6,
                  cursor: 'pointer',
                }}
              >
                Clear All
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
