import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-2 dark:focus:ring-offset-[#1A1917] disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-cara-500 text-white hover:bg-cara-600 active:bg-cara-700': variant === 'primary',
            'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 active:bg-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-700': variant === 'secondary',
            'bg-danger text-white hover:bg-red-600 active:bg-red-700': variant === 'danger',
            'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800': variant === 'ghost',
          },
          {
            'px-3 py-1.5': size === 'sm',
            'px-4 py-2': size === 'md',
            'px-6 py-2.5': size === 'lg',
          },
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
