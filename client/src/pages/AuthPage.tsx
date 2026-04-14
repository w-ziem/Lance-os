import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@hooks/useAuth';
import EmailForm from '@components/auth/EmailForm';
import CodeForm from '@components/auth/CodeForm';
import RegisterForm from '@components/auth/RegisterForm';
import GoogleLoginButton from '@components/auth/GoogleLoginButton';

// AuthPage orchestrates the login/register flow.
// It holds two pieces of UI state:
//   - mode: which tab is active (login | register)
//   - pendingEmail: after email/register is submitted, switch to code screen

type Mode = 'login' | 'register';

interface LocationState {
  from?: { pathname?: string };
}

export default function AuthPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  const [mode, setMode] = useState<Mode>('login');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Reset the code step when the user switches tabs.
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Welcome to Lance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sign in or create a new account.
        </p>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-gray-200">
          <TabButton active={mode === 'login'} onClick={() => setMode('login')}>
            Sign in
          </TabButton>
          <TabButton active={mode === 'register'} onClick={() => setMode('register')}>
            Register
          </TabButton>
        </div>

        {/* Tab content */}
        <div className="mt-6">
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

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleLoginButton />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helpers kept in the same file because they are tightly coupled and
// not reused elsewhere. Promote to shared components if that changes.
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        '-mb-px border-b-2 px-3 pb-2 text-sm font-medium transition',
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700',
      )}
    >
      {children}
    </button>
  );
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  );
}
