'use client';

import { Minus, Plus } from '@phosphor-icons/react/dist/ssr';

export function QuantityStepper({
  value, onChange, min = 1, max = 50, label, compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  compact?: boolean;
}) {
  const size = compact ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div
      className="inline-flex items-center rounded-full"
      style={{ border: '1.5px solid var(--border)', background: 'var(--surface)' }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${size} flex items-center justify-center rounded-full disabled:opacity-35`}
        style={{ color: 'var(--ink)' }}
        aria-label={`Remove one ${label}`}
      >
        <Minus size={compact ? 13 : 15} weight="bold" />
      </button>
      <span
        className={`${compact ? 'w-7 text-[13px]' : 'w-9 text-[15px]'} text-center font-extrabold tabular-nums`}
        aria-live="polite"
        aria-label={`${value} ${label}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${size} flex items-center justify-center rounded-full disabled:opacity-35`}
        style={{ color: 'var(--ink)' }}
        aria-label={`Add one ${label}`}
      >
        <Plus size={compact ? 13 : 15} weight="bold" />
      </button>
    </div>
  );
}
