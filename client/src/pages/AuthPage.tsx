import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import EmailForm from '@components/auth/EmailForm';
import CodeForm from '@components/auth/CodeForm';
import RegisterForm from '@components/auth/RegisterForm';
import GoogleLoginButton from '@components/auth/GoogleLoginButton';

type Mode = 'login' | 'register';

interface LocationState {
  from?: { pathname?: string };
}

export default function AuthPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('login');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    setPendingEmail(null);
  }, [mode]);

  if (isBootstrapping) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    const redirectTo =
      (location.state as LocationState | null)?.from?.pathname ?? '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
      }}
    >
      {/* ─── Left: Hero Panel ─────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 55%',
          background: 'var(--sidebar-bg)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -120,
              left: -80,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(79, 70, 229, 0.13) 0%, transparent 70%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
            }}
          />
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0.04,
            }}
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Top: wordmark */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="font-display font-extrabold text-[22px] text-white tracking-[-0.04em]">
            Lance
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.35)',
              marginTop: 2,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Freelance OS
          </div>
        </div>

        {/* Middle: headline + features */}
        <div style={{ position: 'relative', zIndex: 1, margin: 'auto 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              borderRadius: 99,
              padding: '5px 14px',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                animation: 'agent-pulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              AI agent included
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 52,
              lineHeight: 1.05,
              color: '#fff',
              margin: '0 0 20px',
              letterSpacing: '-0.04em',
            }}
          >
            Run your freelance
            <br />
            <span style={{ color: 'var(--accent)' }}>business on autopilot.</span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 420,
            }}
          >
            Clients, projects, tasks, invoices — managed by you and your AI agent
            working in tandem.
          </p>



          {/* Bottom: social proof */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex' }}>
              {['AK', 'JL', 'MR', 'T+'].map((ini, i) => (
                <div
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: ['#4F46E5', '#7C3AED', '#0D9488', '#374151'][i],
                    border: '2px solid #0F1923',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#fff',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 4 - i,
                  }}
                >
                  {ini}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>
              Trusted by{' '}
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
                2,400+
              </span>{' '}
              freelancers
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Auth Form ─────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 56px 56px',
          paddingTop: 'clamp(48px, calc(50vh - 200px), 180px)',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        {/* Subtle top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, var(--accent), var(--accent-border))`,
          }}
        />

        <div className="fade-up" style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 26,
                color: 'var(--text-primary)',
                margin: '0 0 6px',
                letterSpacing: '-0.03em',
              }}
            >
              {mode === 'login' ? 'Welcome back.' : 'Get started free.'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              {mode === 'login'
                ? 'Sign in to your workspace.'
                : 'Create your account in seconds.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              background: 'var(--bg-page)',
              borderRadius: 9,
              padding: 3,
              marginBottom: 28,
            }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 7,
                  padding: '8px 0',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  boxShadow:
                    mode === m ? '0 1px 4px rgba(0, 0, 0, 0.10)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <GoogleLoginButton />

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              marginTop: 20,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border-default)',
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.06em',
              }}
            >
              or
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'var(--border-default)',
              }}
            />
          </div>

          {/* Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'login' &&
              (pendingEmail ? (
                <CodeForm email={pendingEmail} onBack={() => setPendingEmail(null)} />
              ) : (
                <EmailForm onCodeSent={setPendingEmail} />
              ))}

            {mode === 'register' &&
              (pendingEmail ? (
                <CodeForm email={pendingEmail} onBack={() => setPendingEmail(null)} />
              ) : (
                <RegisterForm onRegistered={setPendingEmail} />
              ))}
          </div>

          {/* Footer text */}
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              lineHeight: 1.6,
              textAlign: 'center',
              marginTop: 24,
            }}
          >
            By continuing, you agree to our{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
      }}
    >
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading…</p>
    </div>
  );
}
