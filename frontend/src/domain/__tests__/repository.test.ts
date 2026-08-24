import { describe, it, expect } from 'vitest';
import { getOrderRepository } from '@/infrastructure/repositories/orders';
import { slotKey, windowsForDate } from '@/domain/fulfillment/slots';

const TUE = '2026-09-08';
const repo = getOrderRepository();

describe('booking counts', () => {
  it('returns every key it was asked for, including untouched windows', async () => {
    // Regression: the previous implementation walked only live reservations, so
    // a window with seeded demand and no booking came back absent, which a
    // caller reads as zero and would oversell.
    const keys = windowsForDate(TUE).map((w) => slotKey({ date: TUE, start: w.start }));
    const counts = await repo.countsFor(keys);
    expect(Object.keys(counts)).toHaveLength(keys.length);
    for (const k of keys) expect(typeof counts[k]).toBe('number');
  });

  it('agrees with the single-key lookup', async () => {
    const key = slotKey({ date: TUE, start: 600 });
    const [batch, single] = [await repo.countsFor([key]), await repo.countFor(key)];
    expect(batch[key]).toBe(single);
  });

  it('is stable across calls, so the picker does not flicker', async () => {
    const key = slotKey({ date: TUE, start: 660 });
    expect(await repo.countFor(key)).toBe(await repo.countFor(key));
  });

  it('increments on reserve and restores on release', async () => {
    const slot = { date: TUE, start: 720 };
    const key = slotKey(slot);
    const before = await repo.countFor(key);
    expect(await repo.reserveSlot(slot, 'pickup', 8)).toBe(true);
    expect(await repo.countFor(key)).toBe(before + 1);
    await repo.releaseSlot(slot);
    expect(await repo.countFor(key)).toBe(before);
  });

  it('refuses to reserve past capacity', async () => {
    const slot = { date: TUE, start: 780 };
    const key = slotKey(slot);
    const capacity = await repo.countFor(key); // treat current load as the cap
    expect(await repo.reserveSlot(slot, 'pickup', capacity)).toBe(false);
  });
});
