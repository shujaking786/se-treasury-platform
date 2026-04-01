import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const allowedUsers = new Map<string, string>([
  ['Dina Nader', '2025@Dina$2026'],
  ['siemens', 'MEA@Siemens$2027'],
]);

export function LoginPage() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUserName = userName.trim();
    const expectedPassword = allowedUsers.get(trimmedUserName);

    if (!trimmedUserName || !password) {
      setError('Enter both username and password to continue.');
      return;
    }

    if (expectedPassword !== password) {
      setError('Invalid username or password.');
      return;
    }

    login(trimmedUserName);
    navigate('/overview', { replace: true });
  };

  return (
    <div
      className="login-page"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(360px, 440px)',
        background:
          'radial-gradient(circle at top left, rgba(0, 153, 153, 0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(138, 0, 229, 0.22), transparent 30%), #120d27',
      }}
    >
      <section
        className="login-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '56px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 32,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/se-logo-light.svg"
            alt="Siemens Energy"
            style={{ height: 32, width: 'auto', display: 'block' }}
          />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 1.8,
              textTransform: 'uppercase',
              color: 'rgba(244, 243, 251, 0.72)',
            }}
          >
            MEA and Africa Treasury Platform
          </div>
        </div>

        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 9999,
              background: 'rgba(0, 153, 153, 0.14)',
              border: '1px solid rgba(0, 153, 153, 0.3)',
              color: '#9ef4eb',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            Secure workspace access
          </div>
          <h1
            style={{
              marginTop: 24,
              fontSize: 'clamp(44px, 5vw, 72px)',
              lineHeight: 0.96,
              letterSpacing: '-0.05em',
              color: '#f7f7fc',
            }}
          >
            Treasury control,
            <br />
            powered by Siemens Energy.
          </h1>
          <p
            style={{
              marginTop: 24,
              maxWidth: 520,
              fontSize: 16,
              lineHeight: 1.8,
              color: 'rgba(244, 243, 251, 0.72)',
            }}
          >
            Sign in to access cash visibility, funding operations, legal entities, and financial summary dashboards
            in one secure workspace.
          </p>
        </div>

        <div
          className="login-metrics"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {[
            { label: 'Coverage', value: 'MEA and Africa' },
            { label: 'Modules', value: '5 live panels' },
            { label: 'Security', value: 'Role-based access' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 18,
                borderRadius: 20,
                background: 'rgba(36, 28, 68, 0.72)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 16px 40px rgba(5, 4, 18, 0.28)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(180, 175, 207, 0.78)',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="login-panel-shell"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        <div
          className="login-panel"
          style={{
            width: '100%',
            maxWidth: 380,
            borderRadius: 28,
            padding: 32,
            background: 'rgba(36, 28, 68, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 60px rgba(7, 5, 20, 0.45)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div
            style={{
              minHeight: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <img
              src="/se-logo-light.svg"
              alt="Siemens Energy"
              style={{ height: 26, width: 'auto', display: 'block' }}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 30, lineHeight: 1.1, color: '#ffffff' }}>Sign in</h2>
            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: 1.7,
                color: 'rgba(180, 175, 207, 0.86)',
              }}
            >
              Use your username and password to continue to the treasury dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 28, display: 'grid', gap: 18 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(180, 175, 207, 0.86)',
                }}
              >
                Username
              </span>
              <input
                type="text"
                value={userName}
                onChange={(event) => {
                  setUserName(event.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your username"
                autoComplete="username"
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: '1px solid rgba(0, 153, 153, 0.26)',
                  background: 'rgba(16, 12, 34, 0.9)',
                  color: '#ffffff',
                  padding: '15px 16px',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(180, 175, 207, 0.86)',
                }}
              >
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  borderRadius: 16,
                  border: '1px solid rgba(138, 0, 229, 0.26)',
                  background: 'rgba(16, 12, 34, 0.9)',
                  color: '#ffffff',
                  padding: '15px 16px',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
            </label>

            {error ? (
              <div
                role="alert"
                style={{
                  borderRadius: 14,
                  border: '1px solid rgba(255, 122, 122, 0.24)',
                  background: 'rgba(127, 29, 29, 0.18)',
                  padding: '12px 14px',
                  fontSize: 13,
                  color: '#ffd1d1',
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              style={{
                marginTop: 6,
                border: 'none',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #009999, #8a00e5)',
                color: '#ffffff',
                padding: '15px 18px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 18px 32px rgba(0, 153, 153, 0.26)',
              }}
            >
              Continue to dashboard
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
