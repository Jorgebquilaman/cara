import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pageNumber, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= pageNumber - 1 && i <= pageNumber + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 card-surface border-t border-gray-100 dark:border-white/5 rounded-t-none">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {totalCount} resultado{totalCount !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="p-1.5 rounded-lg hover:bg-cara-100 disabled:opacity-30 disabled:cursor-not-allowed text-cara-600 dark:text-cara-400 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm dark:text-gray-500">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[2rem] h-8 text-sm rounded-lg font-medium transition-colors ${
                p === pageNumber
                  ? 'bg-cara-500 text-white'
                  : 'text-cara-600 hover:bg-cara-100 dark:text-cara-400 dark:hover:bg-neutral-800'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="p-1.5 rounded-lg hover:bg-cara-100 disabled:opacity-30 disabled:cursor-not-allowed text-cara-600 dark:text-cara-400 dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
