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
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-calm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-ivory dark:focus-visible:ring-offset-[#262B27]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-sage text-ivory shadow-soft-sm hover:bg-[var(--sage-hover)] active:scale-[0.98]': variant === 'primary',
            'bg-transparent text-ink border border-sand hover:bg-mist/70 dark:text-[#EFEAE2]': variant === 'secondary',
            'bg-danger text-ivory shadow-soft-sm hover:opacity-90': variant === 'danger',
            'text-ink-muted hover:text-ink hover:bg-mist/60': variant === 'ghost',
          },
          {
            'px-3.5 py-1.5 text-[13px]': size === 'sm',
            'px-5 py-2.5 text-sm': size === 'md',
            'px-7 py-3 text-[15px]': size === 'lg',
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
