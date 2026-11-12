import clsx from 'clsx';
import { ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedTabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Tabs segmentadas Calm Kit: contenedor pill surface, tab activa pill sage. */
export function SegmentedTabs<T extends string = string>({ tabs, value, onChange, className }: SegmentedTabsProps<T>) {
  return (
    <div className={clsx('inline-flex items-center gap-1 rounded-full bg-[var(--surface)] p-1.5 shadow-soft-sm border border-[var(--border-card)]', className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 ease-calm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
              active
                ? 'bg-sage text-ivory shadow-soft-sm'
                : 'text-ink-muted hover:text-ink hover:bg-mist/60',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
