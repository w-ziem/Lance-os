import { useState } from 'react';
import { useSendCode } from '@hooks/useAuthApi';
import FormField from '@components/common/FormField';
import SubmitButton from '@components/common/SubmitButton';

// Step 1 of the login flow. User types email → we request a code.
// On success we notify the parent (AuthPage) so it can switch to CodeForm.

interface Props {
  onCodeSent: (email: string) => void;
}

export default function EmailForm({ onCodeSent }: Props) {
  const [data, setData] = useState({ email: '' });
  const [error, setError] = useState('');

  const sendCode = useSendCode();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    try {
      await sendCode.mutateAsync({ email: data.email.trim() });
      onCodeSent(data.email.trim());
    } catch {
      // react-query stores the error; surfaced via sendCode.isError below.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={data.email}
        onChange={(e) => setData({ email: e.target.value })}
        error={error}
      />

      {sendCode.isError && (
        <p style={{ fontSize: 13, color: 'var(--status-error)', margin: 0 }}>
          Could not send code. Please check the email and try again.
        </p>
      )}

      <SubmitButton isLoading={sendCode.isPending}>Send login code</SubmitButton>
    </form>
  );
}
