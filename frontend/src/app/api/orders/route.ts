import { NextResponse } from 'next/server';
import { PRODUCT_BY_ID } from '@/domain/catalog/products';
import { computeTotals, type CartLine } from '@/domain/cart/totals';
import { cartLeadTimeDays } from '@/domain/fulfillment/leadtime';
import {
  DEFAULT_RULES, slotsForDate, slotKey, type FulfilmentMode,
} from '@/domain/fulfillment/slots';
import { generateOrderRef, type Order, type OrderStatus } from '@/domain/orders/order';
import { methodAllowed, type PaymentMethodId } from '@/domain/payments/methods';
import { getPaymentGateway } from '@/domain/payments/adapters';
import { getOrderRepository } from '@/infrastructure/repositories/orders';
import { isServiceableZone, OUT_OF_AREA_MESSAGE } from '@/domain/fulfillment/delivery';

export const dynamic = 'force-dynamic';

interface PlaceOrderBody {
  mode: FulfilmentMode;
  slot: { date: string; start: number };
  items: { productId: string; quantity: number }[];
  customer: { name: string; email: string; phone: string; address?: string; notes?: string };
  paymentMethod: PaymentMethodId;
  deliveryZone?: string;
  payDepositOnly?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PH_PHONE = /^(\+?63|0)9\d{9}$/;

export async function POST(request: Request) {
  let body: PlaceOrderBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const { mode, slot, items, customer, paymentMethod } = body;

  if (mode !== 'pickup' && mode !== 'delivery') {
    return NextResponse.json({ error: 'Choose pickup or delivery.' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your basket is empty.' }, { status: 400 });
  }
  if (!customer?.name?.trim()) {
    return NextResponse.json({ error: 'We need a name for the order.' }, { status: 400 });
  }
  if (!EMAIL.test(customer?.email ?? '')) {
    return NextResponse.json({ error: 'Enter a working email address.' }, { status: 400 });
  }
  if (!PH_PHONE.test((customer?.phone ?? '').replace(/[\s-]/g, ''))) {
    return NextResponse.json({ error: 'Enter a mobile number like 0917 428 3067.' }, { status: 400 });
  }
  if (mode === 'delivery' && !customer?.address?.trim()) {
    return NextResponse.json({ error: 'Delivery needs a full address.' }, { status: 400 });
  }
  // We only serve Iloilo City and the listed campuses. Checked here as well as
  // in the form, so a delivery outside the area cannot be booked by posting
  // straight at the API.
  if (mode === 'delivery' && !isServiceableZone(body.deliveryZone)) {
    return NextResponse.json({ error: OUT_OF_AREA_MESSAGE }, { status: 400 });
  }

  // Rebuild the cart from the catalogue. Prices are never trusted from the client.
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = PRODUCT_BY_ID[item.productId];
    if (!product) {
      return NextResponse.json({ error: `Unknown item: ${item.productId}` }, { status: 400 });
    }
    if (product.soldOut) {
      return NextResponse.json({ error: `${product.name} sold out while you were ordering.` }, { status: 409 });
    }
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
      return NextResponse.json({ error: `Invalid quantity for ${product.name}.` }, { status: 400 });
    }
    lines.push({ product, quantity });
  }

  const totals = computeTotals(lines, mode);

  if (!methodAllowed(paymentMethod, totals.depositRequired)) {
    return NextResponse.json(
      { error: 'Orders this size need a deposit, so cash on collection cannot be used on its own.' },
      { status: 400 },
    );
  }

  // Re-check the slot server-side. The client may have been sitting on the page.
  const repo = getOrderRepository();
  const leadTimeDays = cartLeadTimeDays(lines);
  const key = slotKey(slot);
  const bookings = { [key]: await repo.countFor(key) };

  const resolved = slotsForDate({
    dateKey: slot.date, mode, now: new Date(), bookings, leadTimeDays,
  }).find((s) => s.start === slot.start);

  if (!resolved) {
    return NextResponse.json({ error: 'That time slot does not exist.' }, { status: 400 });
  }
  if (!resolved.available) {
    return NextResponse.json(
      { error: 'That slot was taken while you were checking out. Please pick another.', reason: resolved.reason },
      { status: 409 },
    );
  }

  const reserved = await repo.reserveSlot(slot, mode, DEFAULT_RULES.capacity[mode]);
  if (!reserved) {
    return NextResponse.json(
      { error: 'That slot just filled up. Please pick another.', reason: 'full' },
      { status: 409 },
    );
  }

  // 32^6 makes a clash vanishingly unlikely, but `save` would overwrite a real
  // order rather than fail, so it is worth a few retries to be certain.
  let ref = generateOrderRef();
  for (let attempt = 0; attempt < 5 && (await repo.find(ref)); attempt++) {
    ref = generateOrderRef();
  }
  const payDeposit = totals.depositRequired || body.payDepositOnly === true;
  const amountDue = payDeposit && totals.depositAmount > 0 ? totals.depositAmount : totals.total;

  const gateway = getPaymentGateway();
  const origin = new URL(request.url).origin;

  const result = await gateway.createPayment({
    orderRef: ref,
    amount: amountDue,
    method: paymentMethod,
    description: `Locket order ${ref}`,
    customerEmail: customer.email,
    returnUrl: `${origin}/order/${ref}`,
  });

  if (result.status === 'failed') {
    await repo.releaseSlot(slot); // Never hold a window for an order that did not happen.
    return NextResponse.json({ error: result.reason }, { status: 402 });
  }

  const status: OrderStatus =
    result.status === 'pending_on_collection' ? 'pending_on_collection'
      : result.status === 'requires_action' ? 'awaiting_payment'
        : payDeposit && totals.depositAmount > 0 ? 'deposit_paid' : 'paid';

  const order: Order = {
    ref,
    placedAt: new Date().toISOString(),
    mode,
    deliveryZone: mode === 'delivery' ? body.deliveryZone : undefined,
    slot: { ...slot, label: resolved.label },
    lines: lines.map((l) => ({
      productId: l.product.id, name: l.product.name,
      unitPrice: l.product.price, quantity: l.quantity,
    })),
    customer,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    amountDue,
    depositRequired: payDeposit && totals.depositAmount > 0,
    balanceOnCollection: payDeposit && totals.depositAmount > 0 ? totals.total - amountDue : 0,
    paymentMethod,
    status,
    gateway: gateway.name,
    simulated: !gateway.isLive,
  };

  await repo.save(order);

  return NextResponse.json({
    ref,
    order,
    redirectUrl: result.status === 'requires_action' ? result.redirectUrl : null,
  });
}
