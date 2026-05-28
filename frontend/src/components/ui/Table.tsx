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
      <div className="rounded-lg border border-cara-200 bg-white p-8 text-center text-cara-500 dark:border-cara-700 dark:bg-cara-900 dark:text-cara-400">
        Cargando...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-cara-200 bg-white p-8 text-center text-cara-500 dark:border-cara-700 dark:bg-cara-900 dark:text-cara-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-cara-200 dark:border-cara-700">
      <table className="min-w-full divide-y divide-cara-200 bg-white dark:divide-cara-700 dark:bg-cara-900">
        <thead className="bg-cara-50 dark:bg-cara-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cara-600 dark:text-cara-300',
                  col.className,
                  col.sortable && 'cursor-pointer select-none hover:text-cara-800 dark:hover:text-cara-100',
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
        <tbody className="divide-y divide-cara-100 dark:divide-cara-700">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-cara-50 transition-colors dark:hover:bg-cara-800">
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3 text-sm text-cara-800 dark:text-cara-200', col.className)}>
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
