import type { Product } from '../catalog/types';

/** A cart is only ready as early as its slowest item. */
export function cartLeadTimeDays(items: readonly { product: Product }[]): number {
  return items.reduce((max, i) => Math.max(max, i.product.leadTimeDays ?? 0), 0);
}

/** Custom bakes are quoted and hand-decorated, so they sit outside the menu lead times. */
export const CUSTOM_ORDER_LEAD_DAYS = 5;
export const CUSTOM_ORDER_LEAD_DAYS_TIERED = 10;
/** Above this many servings we need the longer window. */
export const CUSTOM_TIER_SERVINGS = 40;

export function customLeadDaysFor(servings: number): number {
  return servings > CUSTOM_TIER_SERVINGS ? CUSTOM_ORDER_LEAD_DAYS_TIERED : CUSTOM_ORDER_LEAD_DAYS;
}

export function earliestDateFor(now: Date, leadDays: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + leadDays);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function leadTimeMessage(leadDays: number): string {
  if (leadDays === 0) return 'Ready today if you order before 2pm.';
  if (leadDays === 1) return 'This bake needs one day of notice.';
  return `This bake needs ${leadDays} days of notice.`;
}
