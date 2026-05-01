import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, ...inputProps }, ref) => {
    const [focus, setFocus] = useState(false);
    const inputId = id ?? inputProps.name;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          onFocus={(e) => {
            setFocus(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            inputProps.onBlur?.(e);
          }}
          style={{
            border: `1px solid ${
              error ? 'var(--status-error)' : focus ? 'var(--accent)' : 'var(--border-default)'
            }`,
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            color: 'var(--text-primary)',
            background: 'var(--surface)',
            outline: 'none',
            boxShadow: focus
              ? `0 0 0 3px ${error ? 'var(--status-error-tint)' : 'var(--accent-ring)'}`
              : 'none',
            transition: 'all 0.14s ease',
          }}
          aria-invalid={!!error}
          {...inputProps}
        />
        {error && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--status-error)',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
export default FormField;
