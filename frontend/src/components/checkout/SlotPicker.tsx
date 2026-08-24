'use client';

import { useEffect, useState } from 'react';
import { CalendarBlank, Warning } from '@phosphor-icons/react/dist/ssr';
import type { DayAvailability, FulfilmentMode, Slot } from '@/domain/fulfillment/slots';
import { UNAVAILABLE_COPY } from '@/domain/fulfillment/slots';

interface Props {
  mode: FulfilmentMode;
  leadTimeDays: number;
  selected: { date: string; start: number } | null;
  onSelect: (slot: { date: string; start: number; label: string } | null) => void;
}

export function SlotPicker({ mode, leadTimeDays, selected, onSelect }: Props) {
  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [capacity, setCapacity] = useState(0);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/availability?mode=${mode}&leadDays=${leadTimeDays}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data: { days: DayAvailability[]; capacity: number }) => {
        if (cancelled) return;
        setDays(data.days);
        setCapacity(data.capacity);

        // Land the user on the first day that can actually take the order.
        const firstOpen = data.days.find((d) => d.openSlotCount > 0);
        setActiveDate((current) => {
          if (current && data.days.some((d) => d.dateKey === current && d.openSlotCount > 0)) return current;
          return firstOpen?.dateKey ?? data.days[0]?.dateKey ?? null;
        });
      })
      .catch(() => { if (!cancelled) setError('We could not load collection times. Please refresh.'); });

    return () => { cancelled = true; };
  }, [mode, leadTimeDays]);

  // Selecting a different mode or basket can invalidate an already-picked slot.
  useEffect(() => {
    if (!selected || !days) return;
    const still = days
      .find((d) => d.dateKey === selected.date)?.slots
      .find((s) => s.start === selected.start && s.available);
    if (!still) onSelect(null);
  }, [days, selected, onSelect]);

  if (error) {
    return (
      <p className="card flex items-center gap-2 p-4 text-[14px] font-bold" role="alert" style={{ color: 'var(--danger)' }}>
        <Warning size={17} weight="fill" aria-hidden /> {error}
      </p>
    );
  }

  if (!days) {
    return (
      <div className="space-y-3" aria-live="polite" aria-busy="true">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-[76px] w-[70px] shrink-0" style={{ borderRadius: 'var(--radius-input)' }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-[58px]" style={{ borderRadius: 'var(--radius-input)' }} />
          ))}
        </div>
        <span className="sr-only">Loading available collection times</span>
      </div>
    );
  }

  const active = days.find((d) => d.dateKey === activeDate);

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Choose a date">
        {days.map((d) => {
          const isActive = d.dateKey === activeDate;
          const unavailable = d.isClosed || d.openSlotCount === 0;
          return (
            <button
              key={d.dateKey}
              type="button"
              onClick={() => setActiveDate(d.dateKey)}
              disabled={unavailable}
              aria-pressed={isActive}
              className="flex w-[70px] shrink-0 flex-col items-center gap-0.5 px-2 py-2.5 transition-colors disabled:opacity-40"
              style={{
                borderRadius: 'var(--radius-input)',
                background: isActive ? 'var(--brand-strong)' : 'var(--surface)',
                color: isActive ? 'var(--brand-ink)' : 'var(--ink)',
                border: `1.5px solid ${isActive ? 'var(--brand-strong)' : 'var(--border)'}`,
              }}
            >
              <span className="text-[11.5px] font-bold uppercase">{d.weekday}</span>
              <span className="display text-[21px] leading-none">{d.dayOfMonth}</span>
              <span className="text-[10.5px] font-semibold">
                {d.isClosed ? 'Closed' : d.openSlotCount === 0 ? 'Full' : `${d.openSlotCount} free`}
              </span>
            </button>
          );
        })}
      </div>

      {!active || active.slots.length === 0 ? (
        <p className="card flex items-center gap-2 p-4 text-[14.5px]" style={{ color: 'var(--ink-soft)' }}>
          <CalendarBlank size={18} weight="fill" aria-hidden />
          We are closed that day. Pick another date above.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Choose a time window">
            {active.slots.map((slot) => (
              <SlotButton
                key={`${slot.date}-${slot.start}`}
                slot={slot}
                capacity={capacity}
                selected={selected?.date === slot.date && selected?.start === slot.start}
                onSelect={() => onSelect({ date: slot.date, start: slot.start, label: slot.label })}
              />
            ))}
          </div>
          <p className="mt-3 text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>
            Each window takes {capacity} {mode} orders. We cap them so your bake is not rushed.
          </p>
        </>
      )}
    </div>
  );
}

function SlotButton({
  slot, capacity, selected, onSelect,
}: { slot: Slot; capacity: number; selected: boolean; onSelect: () => void }) {
  const nearlyFull = slot.available && slot.remaining <= Math.max(1, Math.floor(capacity * 0.25));

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!slot.available}
      aria-pressed={selected}
      className="flex flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed"
      style={{
        borderRadius: 'var(--radius-input)',
        background: selected ? 'var(--brand-strong)' : slot.available ? 'var(--surface)' : 'var(--surface-2)',
        color: selected ? 'var(--brand-ink)' : slot.available ? 'var(--ink)' : 'var(--ink-muted)',
        border: `1.5px solid ${selected ? 'var(--brand-strong)' : 'var(--border)'}`,
        opacity: slot.available ? 1 : 0.7,
      }}
    >
      <span className="text-[14px] font-extrabold">{slot.label}</span>
      <span className="text-[11.5px] font-semibold">
        {slot.available
          ? nearlyFull ? `Only ${slot.remaining} left` : `${slot.remaining} spaces`
          : UNAVAILABLE_COPY[slot.reason ?? 'full']}
      </span>
    </button>
  );
}
