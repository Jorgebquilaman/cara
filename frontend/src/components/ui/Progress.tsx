import clsx from 'clsx';

interface ProgressProps {
  value: number; // 0-100
  label?: string;
  className?: string;
  showPercent?: boolean;
}

/** Barra de progreso Calm Kit: track mist 12px, relleno sage, % a la derecha. */
export function Progress({ value, label, className, showPercent = true }: ProgressProps) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-xs text-ink-muted">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-ink-muted tabular-nums">{Math.round(safe)}%</span>}
        </div>
      )}
      <div className="h-3 w-full rounded-full bg-mist overflow-hidden">
        <div
          className="h-full rounded-full bg-sage transition-all duration-300 ease-calm"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
