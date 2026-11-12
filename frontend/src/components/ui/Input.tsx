import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-ink-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full h-11 rounded-full border px-4 text-sm transition-all duration-200 ease-calm',
            'bg-[var(--surface)] text-ink placeholder:text-ink-muted',
            'shadow-[var(--shadow-inset)]',
            'focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory dark:focus:ring-offset-[#262B27]',
            error
              ? 'border-danger'
              : 'border-transparent',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger pl-4">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
