import { ReactNode } from 'react';
import clsx from 'clsx';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'No hay datos disponibles',
  sortKey,
  sortDir,
  onSort,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-ink-muted">
        Cargando...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-ink-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-[var(--divider)]/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-3 py-3 text-left text-[11px] font-medium uppercase tracking-section text-ink-muted',
                  col.className,
                  col.sortable && 'cursor-pointer select-none hover:text-ink transition-colors',
                )}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key
                      ? sortDir === 'asc' ? <ArrowUp className="h-3 w-3" strokeWidth={1.5} /> : <ArrowDown className="h-3 w-3" strokeWidth={1.5} />
                      : <ArrowUpDown className="h-3 w-3 opacity-40" strokeWidth={1.5} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-[var(--divider)]/40 last:border-0 hover:bg-mist/30 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-3 py-3.5 text-sm text-ink', col.className)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
