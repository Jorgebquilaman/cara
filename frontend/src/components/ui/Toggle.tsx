import clsx from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

/** Toggle Calm Kit: track pill 52×30, ON sage, OFF sand/mist, thumb blanco. */
export function Toggle({ checked, onChange, disabled, label, id }: ToggleProps) {
  return (
    <label htmlFor={id} className={clsx('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex h-[30px] w-[52px] shrink-0 items-center rounded-full transition-colors duration-200 ease-calm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
          checked ? 'bg-sage' : 'bg-sand/60',
        )}
      >
        <span
          className={clsx(
            'inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-calm',
            checked ? 'translate-x-[25px]' : 'translate-x-[3px]',
          )}
        />
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
