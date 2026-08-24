import type { Centavos } from '../money';
import type { PaymentMethodId } from './methods';

export interface PaymentRequest {
  readonly orderRef: string;
  readonly amount: Centavos;
  readonly method: PaymentMethodId;
  readonly description: string;
  readonly customerEmail: string;
  readonly returnUrl: string;
}

export type PaymentResult =
  | { readonly status: 'requires_action'; readonly redirectUrl: string; readonly intentId: string }
  | { readonly status: 'paid'; readonly intentId: string }
  | { readonly status: 'pending_on_collection'; readonly intentId: string }
  | { readonly status: 'failed'; readonly reason: string };

/**
 * Port. The checkout only ever talks to this interface, so swapping the
 * simulated driver for a live PSP is a one-line change in the factory below
 * and touches no UI or domain code.
 */
export interface PaymentGateway {
  readonly name: string;
  readonly isLive: boolean;
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
}
