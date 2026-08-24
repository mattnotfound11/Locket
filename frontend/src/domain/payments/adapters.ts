import type { PaymentGateway, PaymentRequest, PaymentResult } from './gateway';

/**
 * Simulated driver. Used whenever no PSP credentials are configured, so the
 * whole checkout is walkable end to end without a merchant account.
 *
 * It does NOT move money. Every order it returns is marked simulated, and the
 * confirmation screen says so in plain language.
 */
export class SimulatedGateway implements PaymentGateway {
  readonly name = 'simulated';
  readonly isLive = false;

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const intentId = `sim_${request.orderRef.toLowerCase()}`;
    if (request.method === 'cod') {
      return { status: 'pending_on_collection', intentId };
    }
    return { status: 'paid', intentId };
  }
}

/**
 * PayMongo covers GCash, Maya and cards behind one API, which is why it is the
 * default choice for a Philippine storefront.
 *
 * Activate by setting PAYMONGO_SECRET_KEY. Card payments use a PaymentIntent;
 * GCash and Maya use a Source, which is why the two branches differ.
 */
export class PayMongoGateway implements PaymentGateway {
  readonly name = 'paymongo';
  readonly isLive = true;

  constructor(private readonly secretKey: string) {}

  private get authHeader() {
    return `Basic ${Buffer.from(`${this.secretKey}:`).toString('base64')}`;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (request.method === 'cod') {
      return { status: 'pending_on_collection', intentId: `cod_${request.orderRef}` };
    }

    try {
      if (request.method === 'gcash' || request.method === 'maya') {
        const res = await fetch('https://api.paymongo.com/v1/sources', {
          method: 'POST',
          headers: { Authorization: this.authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              attributes: {
                amount: request.amount,
                currency: 'PHP',
                type: request.method === 'maya' ? 'paymaya' : 'gcash',
                redirect: { success: request.returnUrl, failed: `${request.returnUrl}?failed=1` },
              },
            },
          }),
        });
        const body = await res.json();
        if (!res.ok) {
          return { status: 'failed', reason: body?.errors?.[0]?.detail ?? 'Wallet payment could not be started.' };
        }
        return {
          status: 'requires_action',
          redirectUrl: body.data.attributes.redirect.checkout_url,
          intentId: body.data.id,
        };
      }

      const res = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: { Authorization: this.authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: request.amount,
              currency: 'PHP',
              payment_method_allowed: ['card'],
              description: request.description,
            },
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        return { status: 'failed', reason: body?.errors?.[0]?.detail ?? 'Card payment could not be started.' };
      }
      return {
        status: 'requires_action',
        redirectUrl: `${request.returnUrl}?intent=${body.data.id}`,
        intentId: body.data.id,
      };
    } catch {
      return { status: 'failed', reason: 'Could not reach the payment provider. Please try again.' };
    }
  }
}

let cached: PaymentGateway | null = null;

export function getPaymentGateway(): PaymentGateway {
  if (cached) return cached;
  const key = process.env.PAYMONGO_SECRET_KEY;
  cached = key ? new PayMongoGateway(key) : new SimulatedGateway();
  return cached;
}
