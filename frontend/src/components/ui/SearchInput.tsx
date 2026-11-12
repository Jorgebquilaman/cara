import { Search, SlidersHorizontal } from 'lucide-react';
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import clsx from 'clsx';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  onFilterClick?: () => void;
}

/** Input de búsqueda Calm Kit: pill surface con inset, lupa izq, filtros der con divisor. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, leftIcon, onFilterClick, ...props }, ref) => (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
        {leftIcon ?? <Search className="h-4 w-4" strokeWidth={1.5} />}
      </span>
      <input
        ref={ref}
        className={clsx(
          'w-full h-11 rounded-full border border-transparent pl-11 pr-[52px] text-sm',
          'bg-[var(--surface)] text-ink placeholder:text-ink-muted',
          'shadow-[var(--shadow-inset)] transition-all duration-200 ease-calm',
          'focus:outline-none focus:ring-2 focus:ring-moss focus:ring-offset-2 focus:ring-offset-ivory',
          className,
        )}
        {...props}
      />
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Filtros"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-mist/60 transition-colors border-l border-[var(--divider)]/50 pl-1"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  ),
);

SearchInput.displayName = 'SearchInput';
