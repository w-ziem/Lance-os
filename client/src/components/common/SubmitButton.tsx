import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

// Primary button used at the bottom of forms.
// Shows "Loading..." text while isLoading is true and disables the button.
export default function SubmitButton({
  isLoading,
  disabled,
  children,
  className,
  type = 'submit',
  ...rest
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition',
        'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...rest}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  );
}
