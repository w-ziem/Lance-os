import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@lib/authSchemas';
import { useRegister } from '@hooks/useAuthApi';
import FormField from '@components/common/FormField';
import SubmitButton from '@components/common/SubmitButton';

// Registration creates the user record. It does NOT log the user in.
// After success we hand the email up so the parent can kick off the code flow.

interface Props {
  onRegistered: (email: string) => void;
}

export default function RegisterForm({ onRegistered }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', fullName: '' },
  });

  const registerUser = useRegister();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const created = await registerUser.mutateAsync(data);
      onRegistered(created.email);
    } catch {
      /* surfaced below */
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Full name"
        autoComplete="name"
        placeholder="Jane Doe"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      {registerUser.isError && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--status-error)',
            margin: 0,
          }}
        >
          Registration failed. The email may already be in use.
        </p>
      )}

      <SubmitButton isLoading={registerUser.isPending}>Create account</SubmitButton>
    </form>
  );
}
