import { percentOf, sum, type Centavos } from '../money';
import type { Product } from '../catalog/types';
import type { FulfilmentMode } from '../fulfillment/slots';

export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
}

export interface PricingPolicy {
  readonly deliveryFee: Centavos;
  readonly freeDeliveryFrom: Centavos;
  /** Orders at or above this need a deposit rather than full payment on the day. */
  readonly depositThreshold: Centavos;
  readonly depositPercent: number;
}

export const PRICING: PricingPolicy = {
  deliveryFee: 12000,
  freeDeliveryFrom: 200000,
  depositThreshold: 150000,
  depositPercent: 50,
};

export interface CartTotals {
  readonly subtotal: Centavos;
  readonly deliveryFee: Centavos;
  readonly total: Centavos;
  readonly itemCount: number;
  readonly depositRequired: boolean;
  readonly depositAmount: Centavos;
  readonly balanceOnCollection: Centavos;
  readonly freeDeliveryShortfall: Centavos;
}

export function lineTotal(line: CartLine): Centavos {
  return line.product.price * line.quantity;
}

export function computeTotals(
  lines: readonly CartLine[],
  mode: FulfilmentMode,
  policy: PricingPolicy = PRICING,
): CartTotals {
  const subtotal = sum(lines.map(lineTotal));
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  const qualifiesFreeDelivery = subtotal >= policy.freeDeliveryFrom;
  const deliveryFee = mode === 'delivery' && !qualifiesFreeDelivery ? policy.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  // A deposit is taken on big-ticket orders so the kitchen can buy in for them.
  const depositRequired = subtotal >= policy.depositThreshold;
  const depositAmount = depositRequired ? percentOf(total, policy.depositPercent) : 0;

  return {
    subtotal, deliveryFee, total, itemCount,
    depositRequired, depositAmount,
    balanceOnCollection: depositRequired ? total - depositAmount : 0,
    freeDeliveryShortfall:
      mode === 'delivery' && !qualifiesFreeDelivery ? policy.freeDeliveryFrom - subtotal : 0,
  };
}
