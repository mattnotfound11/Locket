import { describe, it, expect } from 'vitest';
import { computeTotals, PRICING } from '@/domain/cart/totals';
import { peso, percentOf } from '@/domain/money';
import { PRODUCT_BY_SLUG, PRODUCTS } from '@/domain/catalog/products';
import { methodAllowed } from '@/domain/payments/methods';

const cookie = PRODUCT_BY_SLUG['classic-chocolate-chunk']; // 9500
const cake = PRODUCT_BY_SLUG['chocolate-drip-cake'];       // 165000

describe('money', () => {
  it('formats centavos as pesos', () => {
    expect(peso(9500)).toBe('₱95.00');
    expect(peso(165000)).toBe('₱1,650.00');
  });

  it('rounds percentages half-up rather than truncating', () => {
    expect(percentOf(12345, 50)).toBe(6173); // 6172.5 rounds up
  });
});

describe('cart totals', () => {
  it('multiplies line items without float drift', () => {
    const t = computeTotals([{ product: cookie, quantity: 3 }], 'pickup');
    expect(t.subtotal).toBe(28500);
    expect(t.itemCount).toBe(3);
  });

  it('adds no delivery fee for pickup', () => {
    expect(computeTotals([{ product: cookie, quantity: 1 }], 'pickup').deliveryFee).toBe(0);
  });

  it('charges delivery below the free threshold', () => {
    const t = computeTotals([{ product: cookie, quantity: 2 }], 'delivery');
    expect(t.deliveryFee).toBe(PRICING.deliveryFee);
    expect(t.total).toBe(19000 + PRICING.deliveryFee);
  });

  it('waives delivery at the threshold', () => {
    const t = computeTotals([{ product: cake, quantity: 2 }], 'delivery'); // 330000
    expect(t.deliveryFee).toBe(0);
    expect(t.freeDeliveryShortfall).toBe(0);
  });

  it('reports how far off free delivery a basket is', () => {
    const t = computeTotals([{ product: cookie, quantity: 1 }], 'delivery');
    expect(t.freeDeliveryShortfall).toBe(PRICING.freeDeliveryFrom - 9500);
  });
});

describe('deposits', () => {
  it('takes no deposit on a small basket', () => {
    const t = computeTotals([{ product: cookie, quantity: 2 }], 'pickup');
    expect(t.depositRequired).toBe(false);
    expect(t.depositAmount).toBe(0);
  });

  it('takes half up front once the basket passes the threshold', () => {
    const t = computeTotals([{ product: cake, quantity: 1 }], 'pickup'); // 165000
    expect(t.depositRequired).toBe(true);
    expect(t.depositAmount).toBe(82500);
    expect(t.balanceOnCollection).toBe(82500);
  });

  it('splits the deposit across the delivery fee too', () => {
    const t = computeTotals([{ product: cake, quantity: 1 }], 'delivery');
    expect(t.depositAmount + t.balanceOnCollection).toBe(t.total);
  });

  it('refuses cash on collection when a deposit is required', () => {
    expect(methodAllowed('cod', true)).toBe(false);
    expect(methodAllowed('cod', false)).toBe(true);
    expect(methodAllowed('gcash', true)).toBe(true);
  });
});

describe('catalogue integrity', () => {
  it('gives every product a unique slug and id', () => {
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(PRODUCTS.length);
  });

  it('points every product at an allergen declaration', () => {
    for (const p of PRODUCTS) expect(Array.isArray(p.allergens)).toBe(true);
  });

  it('gives every sealed item a full nutrition panel', () => {
    for (const p of PRODUCTS.filter((x) => x.prepacked)) {
      expect(p.prepacked!.ingredients.length).toBeGreaterThan(30);
      expect(p.prepacked!.calories).toBeGreaterThan(0);
      expect(p.prepacked!.shelfLife).toBeTruthy();
    }
  });

  it('prices everything in whole centavos', () => {
    for (const p of PRODUCTS) expect(Number.isInteger(p.price)).toBe(true);
  });
});
