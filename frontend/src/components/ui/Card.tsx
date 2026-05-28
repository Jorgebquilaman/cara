import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className, action }: CardProps) {
  return (
    <div className={clsx('rounded-xl border border-cara-200 bg-white shadow-sm dark:border-cara-700 dark:bg-cara-900', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-cara-100 px-6 py-4 dark:border-cara-700">
          <div>
            {title && <h3 className="text-base font-semibold text-cara-900 dark:text-cara-100">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-cara-500 dark:text-cara-400">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
