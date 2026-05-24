import { useState } from 'react';
import { useRegister } from '@hooks/useAuthApi';
import FormField from '@components/common/FormField';
import SubmitButton from '@components/common/SubmitButton';

// Registration creates the user record. It does NOT log the user in.
// After success we hand the email up so the parent can kick off the code flow.

interface Props {
  onRegistered: (email: string) => void;
}

export default function RegisterForm({ onRegistered }: Props) {
  const [data, setData] = useState({ email: '', fullName: '' });
  const [errors, setErrors] = useState({ email: '', fullName: '' });

  const registerUser = useRegister();

  function validate() {
    const next = { email: '', fullName: '' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (!data.fullName.trim()) {
      next.fullName = 'Full name is required';
    }
    setErrors(next);
    return !next.email && !next.fullName;
  }

  function handleChange(field: keyof typeof data) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      const created = await registerUser.mutateAsync({
        email: data.email.trim(),
        fullName: data.fullName.trim(),
      });
      onRegistered(created.email);
    } catch {
      /* surfaced below */
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Full name"
        name="fullName"
        autoComplete="name"
        placeholder="Jane Doe"
        value={data.fullName}
        onChange={handleChange('fullName')}
        error={errors.fullName}
      />

      <FormField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={data.email}
        onChange={handleChange('email')}
        error={errors.email}
      />

      {registerUser.isError && (
        <p style={{ fontSize: 13, color: 'var(--status-error)', margin: 0 }}>
          Registration failed. The email may already be in use.
        </p>
      )}

      <SubmitButton isLoading={registerUser.isPending}>Create account</SubmitButton>
    </form>
  );
}
