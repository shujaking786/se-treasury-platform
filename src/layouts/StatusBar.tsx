export function StatusBar() {
  return (
    <div
      className="app-status-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 24,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border-custom)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        gap: 20,
        zIndex: 100,
        overflowX: 'auto',
      }}
    >
      <div
        className="app-status-brand"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: 9999,
            backgroundColor: 'var(--color-status-green)',
            flexShrink: 0,
          }}
        />
        <span>Data current as of</span> 05 MAR 2026
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: 9999,
            backgroundColor: 'var(--color-status-green)',
            flexShrink: 0,
          }}
        />
        22 AREs loaded
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: 9999,
            backgroundColor: 'var(--color-status-red)',
            flexShrink: 0,
          }}
        />
        2 limit breaches
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: 9999,
            backgroundColor: 'var(--color-status-green)',
            flexShrink: 0,
          }}
        />
        Finavigate: Excel mode
      </div>
      <div
        style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--color-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        SE Treasury Intelligence Platform &middot; MEA &middot; PoC v1.0 &middot; &copy; 2026
      </div>
    </div>
  );
}
