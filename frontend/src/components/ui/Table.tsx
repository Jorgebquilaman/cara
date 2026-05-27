import { ReactNode } from 'react';
import clsx from 'clsx';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'No hay datos disponibles',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-cara-200 bg-white p-8 text-center text-cara-500">
        Cargando...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-cara-200 bg-white p-8 text-center text-cara-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-cara-200">
      <table className="min-w-full divide-y divide-cara-200 bg-white">
        <thead className="bg-cara-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cara-600',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cara-100">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-cara-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3 text-sm text-cara-800', col.className)}>
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
