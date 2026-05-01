import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema, type EmailFormValues } from '@lib/authSchemas';
import { useSendCode } from '@hooks/useAuthApi';
import FormField from '@components/common/FormField';
import SubmitButton from '@components/common/SubmitButton';

// Step 1 of the login flow. User types email → we request a code.
// On success we notify the parent (AuthPage) so it can switch to CodeForm.

interface Props {
  onCodeSent: (email: string) => void;
}

export default function EmailForm({ onCodeSent }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const sendCode = useSendCode();

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await sendCode.mutateAsync({ email });
      onCodeSent(email);
    } catch {
      // react-query stores the error; surfaced via sendCode.error below.
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      {sendCode.isError && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--status-error)',
            margin: 0,
          }}
        >
          Could not send code. Please check the email and try again.
        </p>
      )}

      <SubmitButton isLoading={sendCode.isPending}>Send login code</SubmitButton>
    </form>
  );
}
