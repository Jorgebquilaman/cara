import clsx from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

/** Checkbox Calm Kit: 24px, radio 8, checked sage con tilde blanco. */
export function Checkbox({ checked, onChange, label, disabled, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className={clsx('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'h-6 w-6 shrink-0 rounded-[8px] flex items-center justify-center border transition-all duration-150 ease-calm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
          checked ? 'bg-sage border-sage' : 'bg-[var(--surface)] border-[1.5px] border-sand',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-ivory" strokeWidth={2.5} />}
      </button>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
}
