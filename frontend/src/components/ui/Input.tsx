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
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full h-10 rounded-lg border bg-white px-3.5 text-sm text-gray-900 dark:bg-neutral-800 dark:text-gray-100 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-cara-500 focus:ring-2 focus:ring-cara-500/25',
            error
              ? 'border-danger focus:border-danger'
              : 'border-[var(--color-border)] focus:border-cara-500 dark:border-neutral-700',
            className,
          )}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
