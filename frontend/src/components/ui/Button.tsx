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
          'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cara-500 focus:ring-offset-2 dark:focus:ring-offset-[#121212] disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-cara-500 text-white hover:bg-cara-600 shadow-sm': variant === 'primary',
            'bg-white text-cara-700 border border-gray-200 hover:bg-cara-50 hover:border-cara-300 dark:bg-neutral-800 dark:text-cara-300 dark:border-neutral-700 dark:hover:bg-neutral-700': variant === 'secondary',
            'bg-danger text-white hover:bg-red-600 shadow-sm': variant === 'danger',
            'text-cara-600 hover:bg-cara-100 dark:text-cara-400 dark:hover:bg-neutral-800': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
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
