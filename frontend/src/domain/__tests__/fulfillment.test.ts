import { describe, it, expect } from 'vitest';
import {
  slotsForDate, windowsForDate, slotKey, toDateKey, fromDateKey, formatSlotDate, DEFAULT_RULES,
} from '@/domain/fulfillment/slots';
import { customLeadDaysFor, cartLeadTimeDays } from '@/domain/fulfillment/leadtime';
import { PRODUCT_BY_SLUG } from '@/domain/catalog/products';

// 2026-09-08 is a Tuesday; 2026-09-07 is a Monday (shop closed); 2026-09-12 a Saturday.
const TUE = '2026-09-08';
const MON = '2026-09-07';
const SAT = '2026-09-12';

const at = (day: string, h: number, m = 0) => new Date(`${day}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

describe('opening hours drive the windows', () => {
  it('produces no windows on the closed day', () => {
    expect(windowsForDate(MON)).toHaveLength(0);
  });

  it('produces hourly windows inside opening hours', () => {
    const w = windowsForDate(TUE); // Tue 9am - 7pm
    expect(w).toHaveLength(10);
    expect(w[0].label).toBe('9am - 10am');
    expect(w.at(-1)!.label).toBe('6pm - 7pm');
  });

  it('runs later on Saturday', () => {
    expect(windowsForDate(SAT)).toHaveLength(12); // 9am - 9pm
  });
});

describe('per-slot order caps', () => {
  const base = { dateKey: TUE, mode: 'pickup' as const, now: at('2026-09-01', 9) };

  it('offers a slot while it is under capacity', () => {
    const slots = slotsForDate({ ...base, bookings: { [slotKey({ date: TUE, start: 600 })]: 7 } });
    const s = slots.find((x) => x.start === 600)!;
    expect(s.remaining).toBe(1);
    expect(s.available).toBe(true);
  });

  it('closes the slot exactly at capacity', () => {
    const slots = slotsForDate({ ...base, bookings: { [slotKey({ date: TUE, start: 600 })]: 8 } });
    const s = slots.find((x) => x.start === 600)!;
    expect(s.remaining).toBe(0);
    expect(s.available).toBe(false);
    expect(s.reason).toBe('full');
  });

  it('caps delivery tighter than pickup', () => {
    const bookings = { [slotKey({ date: TUE, start: 600 })]: 5 };
    const pickup = slotsForDate({ ...base, bookings }).find((s) => s.start === 600)!;
    const delivery = slotsForDate({ ...base, mode: 'delivery', bookings }).find((s) => s.start === 600)!;
    expect(pickup.available).toBe(true);
    expect(delivery.available).toBe(false);
  });

  it('never reports negative remaining when overbooked', () => {
    const slots = slotsForDate({ ...base, bookings: { [slotKey({ date: TUE, start: 600 })]: 99 } });
    expect(slots.find((s) => s.start === 600)!.remaining).toBe(0);
  });
});

describe('same-day cut-off and prep time', () => {
  it('blocks same-day slots once the 2pm cut-off passes', () => {
    const slots = slotsForDate({ dateKey: TUE, mode: 'pickup', now: at(TUE, 14, 1), bookings: {} });
    expect(slots.every((s) => !s.available)).toBe(true);
    expect(slots.find((s) => s.start === 18 * 60)!.reason).toBe('past-cutoff');
  });

  it('allows same-day slots before the cut-off, given prep time', () => {
    const slots = slotsForDate({ dateKey: TUE, mode: 'pickup', now: at(TUE, 9), bookings: {} });
    expect(slots.find((s) => s.start === 11 * 60)!.available).toBe(true);
  });

  it('refuses a window that starts inside the two-hour prep minimum', () => {
    const slots = slotsForDate({ dateKey: TUE, mode: 'pickup', now: at(TUE, 9), bookings: {} });
    expect(slots.find((s) => s.start === 10 * 60)!.reason).toBe('too-soon');
  });

  it('leaves future days untouched by today cut-off', () => {
    const slots = slotsForDate({ dateKey: SAT, mode: 'pickup', now: at(TUE, 18), bookings: {} });
    expect(slots.some((s) => s.available)).toBe(true);
  });
});

describe('lead time', () => {
  it('rejects dates earlier than the item lead time allows', () => {
    const slots = slotsForDate({
      dateKey: TUE, mode: 'pickup', now: at(TUE, 8), bookings: {}, leadTimeDays: 2,
    });
    expect(slots.every((s) => s.reason === 'lead-time')).toBe(true);
  });

  it('takes the slowest item in the basket', () => {
    const lines = [
      { product: PRODUCT_BY_SLUG['classic-chocolate-chunk'] }, // same day
      { product: PRODUCT_BY_SLUG['chocolate-drip-cake'] },     // 2 days
    ];
    expect(cartLeadTimeDays(lines)).toBe(2);
  });

  it('needs a longer window for large custom cakes', () => {
    expect(customLeadDaysFor(20)).toBe(5);
    expect(customLeadDaysFor(80)).toBe(10);
  });
});

describe('capacity configuration', () => {
  it('keeps delivery capacity below pickup, since routing is the bottleneck', () => {
    expect(DEFAULT_RULES.capacity.delivery).toBeLessThan(DEFAULT_RULES.capacity.pickup);
  });
});


describe('date keys are parsed in local time, not UTC', () => {
  // Regression: `new Date('2026-08-25')` is UTC midnight, so anyone west of UTC
  // rendered the previous day. A customer abroad ordering a cake home to Manila
  // was shown the wrong collection date, sometimes the closed Monday.
  it('keeps the calendar day when parsing a key', () => {
    const d = fromDateKey('2026-08-25');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7); // August
    expect(d.getDate()).toBe(25);
  });

  it('round-trips a key through Date and back', () => {
    for (const key of ['2026-01-01', '2026-08-25', '2026-12-31', '2027-03-01']) {
      expect(toDateKey(fromDateKey(key))).toBe(key);
    }
  });

  it('renders the same day number it was given', () => {
    expect(formatSlotDate('2026-08-25', { day: 'numeric', month: 'long' })).toContain('25');
    expect(formatSlotDate('2026-08-25')).toContain('Tuesday');
  });

  it('never renders the closed Monday for a Tuesday key', () => {
    expect(formatSlotDate('2026-08-25')).not.toContain('Monday');
  });
});
