import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

// Generic labelled input with optional error message.
// forwardRef is required so react-hook-form's register() can attach its ref.

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, className, ...inputProps }, ref) => {
    const inputId = id ?? inputProps.name;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'rounded-md border px-3 py-2 text-sm outline-none transition',
            'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className,
          )}
          aria-invalid={!!error}
          {...inputProps}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
export default FormField;
