import type { Centavos } from '../money';
import type { FulfilmentMode, SlotId } from '../fulfillment/slots';
import type { PaymentMethodId } from '../payments/methods';

export type OrderStatus =
  | 'awaiting_payment' | 'paid' | 'deposit_paid' | 'pending_on_collection' | 'failed';

export interface OrderLineSnapshot {
  readonly productId: string;
  readonly name: string;
  readonly unitPrice: Centavos;
  readonly quantity: number;
}

export interface CustomerDetails {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly address?: string;
  readonly notes?: string;
}

export interface Order {
  readonly ref: string;
  readonly placedAt: string;
  readonly mode: FulfilmentMode;
  /** Set for delivery orders only: which serviceable zone it is going to. */
  readonly deliveryZone?: string;
  readonly slot: SlotId & { readonly label: string };
  readonly lines: readonly OrderLineSnapshot[];
  readonly customer: CustomerDetails;
  readonly subtotal: Centavos;
  readonly deliveryFee: Centavos;
  readonly total: Centavos;
  readonly amountDue: Centavos;
  readonly depositRequired: boolean;
  readonly balanceOnCollection: Centavos;
  readonly paymentMethod: PaymentMethodId;
  readonly status: OrderStatus;
  readonly gateway: string;
  readonly simulated: boolean;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Human-readable reference. Ambiguous glyphs (0/O, 1/I) are excluded so it can
 * be read down a phone line without spelling corrections.
 */
export function generateOrderRef(random: () => number = Math.random): string {
  let body = '';
  for (let i = 0; i < 6; i++) body += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return `LKT-${body}`;
}

export const STATUS_COPY: Readonly<Record<OrderStatus, string>> = {
  awaiting_payment: 'Waiting for payment',
  paid: 'Paid in full',
  deposit_paid: 'Deposit received',
  pending_on_collection: 'Pay on collection',
  failed: 'Payment failed',
};
