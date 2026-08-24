import { FULFILMENT_HOURS, type DayIndex, formatMinutes } from '@/config/store';

export type FulfilmentMode = 'pickup' | 'delivery';

export interface SlotId {
  /** Local calendar date, YYYY-MM-DD. */
  readonly date: string;
  /** Minutes from midnight at which the window opens. */
  readonly start: number;
}

export interface Slot extends SlotId {
  readonly end: number;
  readonly label: string;
  readonly capacity: number;
  readonly booked: number;
  readonly remaining: number;
  readonly available: boolean;
  /** Present when unavailable, so the UI can explain rather than just disable. */
  readonly reason?: 'full' | 'too-soon' | 'closed' | 'past-cutoff' | 'lead-time';
}

export interface SlotRules {
  readonly windowMinutes: number;
  readonly capacity: Readonly<Record<FulfilmentMode, number>>;
  /** Orders placed after this time cannot take a slot on the same day. */
  readonly sameDayCutoff: number;
  /** Minimum minutes between placing an order and the start of its slot. */
  readonly minimumPrepMinutes: number;
  /** How far ahead the picker offers dates. */
  readonly horizonDays: number;
}

export const DEFAULT_RULES: SlotRules = {
  windowMinutes: 60,
  capacity: { pickup: 8, delivery: 5 },
  sameDayCutoff: 14 * 60,
  minimumPrepMinutes: 120,
  horizonDays: 14,
};

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function slotKey(s: SlotId): string {
  return `${s.date}|${s.start}`;
}

/**
 * Formats a YYYY-MM-DD slot key for display.
 *
 * Never use `new Date('2026-08-25')` for this: that parses as UTC midnight, so
 * a customer west of UTC sees the previous day. An overseas relative ordering a
 * cake home would be told the wrong collection date, and could be shown Monday,
 * which is the one day the shop is shut.
 */
export function formatSlotDate(
  dateKey: string,
  options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' },
): string {
  return fromDateKey(dateKey).toLocaleDateString('en-PH', options);
}

/** Bare windows for a day, before availability is considered. */
export function windowsForDate(dateKey: string, rules: SlotRules = DEFAULT_RULES) {
  const day = fromDateKey(dateKey).getDay() as DayIndex;
  const hours = FULFILMENT_HOURS[day];
  if (!hours) return [];

  const out: { start: number; end: number; label: string }[] = [];
  for (let t = hours.open; t + rules.windowMinutes <= hours.close; t += rules.windowMinutes) {
    out.push({
      start: t,
      end: t + rules.windowMinutes,
      label: `${formatMinutes(t)} - ${formatMinutes(t + rules.windowMinutes)}`,
    });
  }
  return out;
}

/**
 * Resolves real availability for one day.
 *
 * A slot is offered only when every one of these holds: the shop is open, the
 * window starts far enough ahead to actually bake the order, the same-day
 * cutoff has not passed, the order's lead time is satisfied, and the cap for
 * that window has not been reached.
 */
export function slotsForDate(params: {
  dateKey: string;
  mode: FulfilmentMode;
  now: Date;
  bookings: Readonly<Record<string, number>>;
  leadTimeDays?: number;
  rules?: SlotRules;
}): Slot[] {
  const { dateKey, mode, now, bookings, leadTimeDays = 0, rules = DEFAULT_RULES } = params;
  const capacity = rules.capacity[mode];

  const earliestByLeadTime = new Date(now);
  earliestByLeadTime.setDate(earliestByLeadTime.getDate() + leadTimeDays);
  const leadTimeKey = toDateKey(earliestByLeadTime);

  const nowKey = toDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return windowsForDate(dateKey, rules).map((w) => {
    const booked = bookings[slotKey({ date: dateKey, start: w.start })] ?? 0;
    const remaining = Math.max(0, capacity - booked);

    let reason: Slot['reason'];
    if (dateKey < leadTimeKey) {
      reason = 'lead-time';
    } else if (dateKey === nowKey && nowMinutes >= rules.sameDayCutoff) {
      reason = 'past-cutoff';
    } else if (dateKey === nowKey && w.start - nowMinutes < rules.minimumPrepMinutes) {
      reason = 'too-soon';
    } else if (remaining === 0) {
      reason = 'full';
    }

    return {
      date: dateKey, start: w.start, end: w.end, label: w.label,
      capacity, booked, remaining,
      available: reason === undefined,
      reason,
    };
  });
}

export interface DayAvailability {
  readonly dateKey: string;
  readonly weekday: string;
  readonly dayOfMonth: number;
  readonly monthShort: string;
  readonly isClosed: boolean;
  readonly slots: readonly Slot[];
  readonly openSlotCount: number;
}

/** The next `horizonDays` days, each with its resolved slots. */
export function availabilityCalendar(params: {
  mode: FulfilmentMode;
  now: Date;
  bookings: Readonly<Record<string, number>>;
  leadTimeDays?: number;
  rules?: SlotRules;
}): DayAvailability[] {
  const rules = params.rules ?? DEFAULT_RULES;
  const days: DayAvailability[] = [];

  for (let i = 0; i < rules.horizonDays; i++) {
    const d = new Date(params.now);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const dateKey = toDateKey(d);
    const slots = slotsForDate({ ...params, dateKey, rules });

    days.push({
      dateKey,
      weekday: d.toLocaleDateString('en-PH', { weekday: 'short' }),
      dayOfMonth: d.getDate(),
      monthShort: d.toLocaleDateString('en-PH', { month: 'short' }),
      isClosed: slots.length === 0,
      slots,
      openSlotCount: slots.filter((s) => s.available).length,
    });
  }
  return days;
}

export const UNAVAILABLE_COPY: Readonly<Record<NonNullable<Slot['reason']>, string>> = {
  full: 'Fully booked',
  'too-soon': 'Needs 2 hours notice',
  closed: 'Closed',
  'past-cutoff': 'Past the 2pm cut-off for today',
  'lead-time': 'Earlier than this order allows',
};
