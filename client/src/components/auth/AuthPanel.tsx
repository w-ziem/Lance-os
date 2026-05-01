import clsx from 'clsx';
import EmailForm from '@components/auth/EmailForm';
import RegisterForm from '@components/auth/RegisterForm';
import CodeForm from '@components/auth/CodeForm';
import GoogleLoginButton from '@components/auth/GoogleLoginButton';

// AuthPanel — right column. "Dumb" view: AuthPage owns mode/pendingEmail state
// and passes them down. Renders the correct form based on those props.

export type AuthMode = 'login' | 'register';

interface AuthPanelProps {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  pendingEmail: string | null;
  setPendingEmail: (e: string | null) => void;
}

export default function AuthPanel({ mode, setMode, pendingEmail, setPendingEmail }: AuthPanelProps) {
  const isRegister = mode === 'register';

  return (
    <section className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-sm">
        <Heading mode={mode} />

        <div className="mt-6">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>

        <div className="mt-6">
          <GoogleLoginButton />
        </div>

        <Divider />

        <div>
          {pendingEmail ? (
            <CodeForm email={pendingEmail} onBack={() => setPendingEmail(null)} />
          ) : isRegister ? (
            <RegisterForm onRegistered={setPendingEmail} />
          ) : (
            <EmailForm onCodeSent={setPendingEmail} />
          )}
        </div>

        <Footer />
      </div>
    </section>
  );
}

function Heading({ mode }: { mode: AuthMode }) {
  const isRegister = mode === 'register';
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-header text-3xl font-extrabold text-color-heading">
        {isRegister ? 'Get started free.' : 'Welcome back.'}
      </h2>
      <p className="text-sm text-gray-500">
        {isRegister ? 'Create your account in seconds.' : 'Sign in to your account.'}
      </p>
    </div>
  );
}

function ModeToggle({ mode, setMode }: { mode: AuthMode; setMode: (m: AuthMode) => void }) {
  return (
    <div className="flex w-full rounded-full bg-gray-100 p-1">
      <ToggleButton active={mode === 'login'} onClick={() => setMode('login')}>
        Sign in
      </ToggleButton>
      <ToggleButton active={mode === 'register'} onClick={() => setMode('register')}>
        Register
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
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
        'flex-1 rounded-full px-4 py-2 text-sm font-medium transition',
        active ? 'bg-white text-color-heading shadow-sm' : 'text-gray-500 hover:text-gray-700',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-8 flex flex-col gap-1 text-center">
      <p className="text-xs text-gray-400">
        By continuing, you agree to our{' '}
        <a href="#" className="text-color-brand hover:underline">Terms</a> and{' '}
        <a href="#" className="text-color-brand hover:underline">Privacy Policy</a>.
      </p>
      <p className="text-xs italic text-gray-400">
        Demo — click "Send login code" to enter
      </p>
    </div>
  );
}
