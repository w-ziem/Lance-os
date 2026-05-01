import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
}

export default function SubmitButton({
  isLoading,
  disabled,
  children,
  style,
  type = 'submit',
  ...rest
}: SubmitButtonProps) {
  const isDisabled = disabled || isLoading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      style={{
        background: isDisabled ? 'rgba(79, 70, 229, 0.6)' : 'var(--accent)',
        color: '#fff',
        border: 'none',
        borderRadius: 9,
        padding: '11px 0',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        cursor: isLoading ? 'wait' : isDisabled ? 'not-allowed' : 'pointer',
        width: '100%',
        transition: 'all 0.18s ease',
        marginTop: 4,
        boxShadow: isDisabled ? 'none' : 'rgba(79, 70, 229, 0.27) 0 2px 12px',
        letterSpacing: '0.01em',
        ...style,
      }}
      {...rest}
    >
      {isLoading ? 'Sending…' : children}
    </button>
  );
}
