'use client';

import { useSyncExternalStore } from 'react';
import { HOURS, formatMinutes, isOpenAt, type DayIndex } from '@/config/store';

/**
 * A ticking clock is an external system, not React state, so it is read through
 * useSyncExternalStore. The snapshot is the current minute rather than a
 * timestamp: returning Date.now() on every call would never compare equal and
 * would re-render forever.
 */
const listeners = new Set<() => void>();
let currentMinute = Math.floor(Date.now() / 60_000);
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (!timer) {
    timer = setInterval(() => {
      const next = Math.floor(Date.now() / 60_000);
      if (next !== currentMinute) {
        currentMinute = next;
        listeners.forEach((l) => l());
      }
    }, 20_000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => currentMinute;
/** The server has no idea what time it is where the visitor is. */
const getServerSnapshot = () => null;

export function OpenStatus() {
  const minute = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (minute === null) {
    return <div className="skeleton h-[26px] w-[132px]" style={{ borderRadius: 999 }} aria-hidden />;
  }

  const now = new Date(minute * 60_000);
  const open = isOpenAt(now);
  const today = HOURS[now.getDay() as DayIndex];

  let detail: string;
  if (open && today) detail = `until ${formatMinutes(today.close)}`;
  else if (today && now.getHours() * 60 + now.getMinutes() < today.open) detail = `opens ${formatMinutes(today.open)}`;
  else detail = 'back tomorrow';

  return (
    <p
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-extrabold"
      style={{
        background: open ? 'color-mix(in srgb, var(--ok) 16%, transparent)' : 'var(--surface-2)',
        color: open ? 'var(--ok)' : 'var(--ink-muted)',
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: open ? 'var(--ok)' : 'var(--ink-muted)' }}
        aria-hidden
      />
      {open ? 'Open now' : 'Closed'} <span className="font-semibold">{detail}</span>
    </p>
  );
}
