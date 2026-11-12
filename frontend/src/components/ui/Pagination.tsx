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
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-ink-muted">
        {totalCount} resultado{totalCount !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
          className="p-2 rounded-full text-ink-muted hover:bg-mist/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-moss outline-none"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dot-${i}`} className="px-1 text-ink-muted text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[2rem] h-8 text-xs rounded-full font-medium transition-colors duration-150 ${
                p === pageNumber
                  ? 'bg-sage text-ivory shadow-soft-sm'
                  : 'text-ink-muted hover:bg-mist/70 hover:text-ink'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber >= totalPages}
          className="p-2 rounded-full text-ink-muted hover:bg-mist/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-moss outline-none"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
