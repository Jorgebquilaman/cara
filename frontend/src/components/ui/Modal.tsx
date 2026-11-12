import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1F2A24]/30 backdrop-blur-sm transition-opacity duration-200" onClick={onClose} />
      <div
        className={clsx(
          'relative z-50 w-full rounded-card bg-[var(--surface)] p-6 shadow-float border border-[var(--border-card)]',
          'max-h-[90vh] overflow-y-auto transition-all duration-200 ease-calm',
          {
            'max-w-sm': size === 'sm',
            'max-w-lg': size === 'md',
            'max-w-2xl': size === 'lg',
          },
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink-muted hover:bg-mist/70 hover:text-ink transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 outline-none"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
