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
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition-colors placeholder:text-gray-400 dark:bg-neutral-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cara-500/40',
            error
              ? 'border-danger focus:border-danger'
              : 'border-gray-200 focus:border-cara-500 dark:border-neutral-700',
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
