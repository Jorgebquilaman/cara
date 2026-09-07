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
      <div className="card-surface p-8 text-center text-gray-500 dark:text-gray-400">
        Cargando...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto card-surface">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-white/5">
        <thead className="bg-gray-50 dark:bg-neutral-800/60">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
                  col.className,
                  col.sortable && 'cursor-pointer select-none hover:text-cara-600 dark:hover:text-cara-400',
                )}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key
                      ? sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      : <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-cara-50/50 transition-colors dark:hover:bg-neutral-800/50">
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3 text-sm text-gray-800 dark:text-gray-200', col.className)}>
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
