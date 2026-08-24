export type PaymentMethodId = 'gcash' | 'maya' | 'card' | 'cod';

export interface PaymentMethod {
  readonly id: PaymentMethodId;
  readonly name: string;
  readonly blurb: string;
  /** Whether this method can settle only a deposit rather than the full amount. */
  readonly supportsDeposit: boolean;
  /** Cash on delivery cannot be used to secure a big order on its own. */
  readonly availableForDepositOnly: boolean;
  readonly settlement: 'online' | 'on-collection';
}

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  {
    id: 'gcash', name: 'GCash', blurb: 'Pay from your GCash wallet. You will be redirected to confirm.',
    supportsDeposit: true, availableForDepositOnly: false, settlement: 'online',
  },
  {
    id: 'maya', name: 'Maya', blurb: 'Pay with your Maya balance or linked card.',
    supportsDeposit: true, availableForDepositOnly: false, settlement: 'online',
  },
  {
    id: 'card', name: 'Credit or debit card', blurb: 'Visa and Mastercard, processed over a secure connection.',
    supportsDeposit: true, availableForDepositOnly: false, settlement: 'online',
  },
  {
    id: 'cod', name: 'Cash on pickup or delivery', blurb: 'Pay the rider, or pay us when you collect.',
    supportsDeposit: false, availableForDepositOnly: true, settlement: 'on-collection',
  },
];

export const METHOD_BY_ID: Readonly<Record<PaymentMethodId, PaymentMethod>> =
  Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m])) as Record<PaymentMethodId, PaymentMethod>;

/**
 * Cash cannot cover an order that needs a deposit, because the whole point of
 * the deposit is to have money committed before the kitchen buys ingredients.
 */
export function methodAllowed(method: PaymentMethodId, depositRequired: boolean): boolean {
  return !(method === 'cod' && depositRequired);
}
