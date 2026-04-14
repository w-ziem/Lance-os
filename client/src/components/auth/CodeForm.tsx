import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { codeSchema, type CodeFormValues } from '@lib/authSchemas';
import { useVerifyCode } from '@hooks/useAuthApi';
import { useAuth } from '@hooks/useAuth';
import FormField from '@components/common/FormField';
import SubmitButton from '@components/common/SubmitButton';

// Step 2 of login. User enters the code sent to email.
// On success we call setSession() — this flips isAuthenticated true and the
// ProtectedRoute lets the user through to the dashboard.

interface Props {
  email: string;
  onBack: () => void;
}

export default function CodeForm({ email, onBack }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const verifyCode = useVerifyCode();
  const { setSession } = useAuth();

  const onSubmit = handleSubmit(async ({ code }) => {
    try {
      const response = await verifyCode.mutateAsync({ email, code });
      setSession(response.accessToken);
      // Navigation happens automatically: AuthPage watches isAuthenticated.
    } catch {
      /* error surfaced via verifyCode.error below */
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <p className="text-sm text-gray-600">
        We sent a code to <span className="font-medium">{email}</span>.
      </p>

      <FormField
        label="Verification code"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        maxLength={8}
        error={errors.code?.message}
        {...register('code')}
      />

      {verifyCode.isError && (
        <p className="text-sm text-red-600">
          Invalid or expired code. Please try again.
        </p>
      )}

      <SubmitButton isLoading={verifyCode.isPending}>Verify & sign in</SubmitButton>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← Use a different email
      </button>
    </form>
  );
}
