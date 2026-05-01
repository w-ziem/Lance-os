import { useRef, useState } from 'react';
import { useVerifyCode } from '@hooks/useAuthApi';
import { useAuth } from '@hooks/useAuth';

// Step 2 of login. 6-box digit input — each box takes one digit.
// Auto-advances focus on input, auto-submits when all 6 are filled.
// On success setSession() flips isAuthenticated → AuthPage navigates away.

interface Props {
  email: string;
  onBack: () => void;
}

export default function CodeForm({ email, onBack }: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const verifyCode = useVerifyCode();
  const { setSession } = useAuth();

  async function submit(code: string) {
    try {
      const response = await verifyCode.mutateAsync({ email, code });
      setSession(response.accessToken);
    } catch {
      // error surfaced via verifyCode.isError below
    }
  }

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs[i + 1].current?.focus();
    if (next.every(d => d !== '')) {
      setTimeout(() => submit(next.join('')), 200);
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: 13,
          fontFamily: 'var(--font-body)',
          padding: 0,
          marginBottom: 16,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        ← Back
      </button>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--text-primary)',
          margin: '0 0 6px',
        }}
      >
        Check your email
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px' }}>
        We sent a 6-digit code to{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
      </p>

      {/* 6-box digit input */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            value={d}
            maxLength={1}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            style={{
              width: 44,
              height: 52,
              textAlign: 'center',
              fontSize: 22,
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              color: 'var(--text-primary)',
              border: `1px solid ${d ? 'var(--accent)' : 'var(--border-default)'}`,
              borderRadius: 8,
              outline: 'none',
              background: 'var(--surface)',
              boxShadow: d ? `0 0 0 3px var(--accent-ring)` : 'none',
              transition: 'all 0.14s ease',
            }}
          />
        ))}
      </div>

      {verifyCode.isError && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--status-error)',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Invalid or expired code. Please try again.
        </p>
      )}

      {verifyCode.isPending && (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          Verifying…
        </p>
      )}
    </>
  );
}
