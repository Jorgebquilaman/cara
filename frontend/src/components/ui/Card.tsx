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
    <div className={clsx('card-surface', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-6 py-4">
          <div>
            {title && <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
