import { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-[13px] font-medium text-ink-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'block w-full h-11 rounded-full border px-4 text-sm transition-all duration-200 ease-calm',
            'bg-[var(--surface)] text-ink',
            'shadow-[var(--shadow-inset)]',
            'focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory dark:focus:ring-offset-[#262B27]',
            error ? 'border-danger' : 'border-transparent',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger pl-4">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
