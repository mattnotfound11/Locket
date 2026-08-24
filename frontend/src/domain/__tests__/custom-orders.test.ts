import { describe, it, expect } from 'vitest';
import { validateCustomOrder } from '@/domain/orders/custom';
import { generateOrderRef } from '@/domain/orders/order';

const NOW = new Date('2026-09-01T10:00:00');

const valid = {
  occasion: 'Birthday',
  eventDate: '2026-09-20',
  servings: 20,
  flavours: ['Ube macapuno'],
  dietary: [],
  avoidAllergens: [],
  designNotes: 'Two tiers, pastel pink, fresh flowers on top.',
  name: 'Marisol Ilagan',
  email: 'marisol@example.ph',
  phone: '0917 428 3067',
};

describe('custom order validation', () => {
  it('accepts a complete brief', () => {
    expect(validateCustomOrder(valid, NOW)).toEqual({});
  });

  it('rejects a date inside the lead time', () => {
    const e = validateCustomOrder({ ...valid, eventDate: '2026-09-03' }, NOW);
    expect(e.eventDate).toMatch(/needs 5 days/);
  });

  it('demands the longer lead time for big cakes', () => {
    const e = validateCustomOrder({ ...valid, servings: 80, eventDate: '2026-09-07' }, NOW);
    expect(e.eventDate).toMatch(/needs 10 days/);
  });

  it('accepts Philippine mobile formats', () => {
    for (const phone of ['09174283067', '+639174283067', '639174283067', '0917 428 3067']) {
      expect(validateCustomOrder({ ...valid, phone }, NOW).phone).toBeUndefined();
    }
  });

  it('rejects a landline or a malformed mobile', () => {
    for (const phone of ['1234', '02 8123 4567', '0817 428 3067']) {
      expect(validateCustomOrder({ ...valid, phone }, NOW).phone).toBeTruthy();
    }
  });

  it('requires a real design description', () => {
    expect(validateCustomOrder({ ...valid, designNotes: 'nice' }, NOW).designNotes).toBeTruthy();
  });

  it('enforces the minimum and maximum size', () => {
    expect(validateCustomOrder({ ...valid, servings: 4 }, NOW).servings).toBeTruthy();
    expect(validateCustomOrder({ ...valid, servings: 400 }, NOW).servings).toBeTruthy();
  });

  it('needs at least one flavour', () => {
    expect(validateCustomOrder({ ...valid, flavours: [] }, NOW).flavours).toBeTruthy();
  });
});

describe('order references', () => {
  it('avoids glyphs that get misheard on the phone', () => {
    for (let i = 0; i < 300; i++) {
      expect(generateOrderRef()).toMatch(/^LKT-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });
});
