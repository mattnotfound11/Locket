'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle, Warning, MapPin, FlaskIcon } from '@phosphor-icons/react/dist/ssr';
import type { Order } from '@/domain/orders/order';
import { STATUS_COPY } from '@/domain/orders/order';
import { formatSlotDate } from '@/domain/fulfillment/slots';
import { peso } from '@/domain/money';
import { METHOD_BY_ID } from '@/domain/payments/methods';
import { STORE, MAP_LINK } from '@/config/store';
import { zoneLabel } from '@/domain/fulfillment/delivery';
import { useCart } from '@/lib/cart';

export function OrderConfirmation({ orderRef }: { orderRef: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const { clear } = useCart();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderRef}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('missing'))))
      .then((data: { order: Order }) => {
        if (cancelled) return;
        setOrder(data.order);
        setState('ready');
        clear(); // The basket has become an order; do not leave it filled.
      })
      .catch(() => { if (!cancelled) setState('missing'); });
    return () => { cancelled = true; };
    // clear is stable for the life of the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderRef]);

  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-[760px] px-4 py-20 sm:px-6" aria-busy="true">
        <div className="skeleton h-[420px]" style={{ borderRadius: 'var(--radius-card)' }} />
        <span className="sr-only">Loading your order</span>
      </div>
    );
  }

  if (state === 'missing' || !order) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-24 text-center sm:px-6">
        <Warning size={48} weight="fill" aria-hidden className="mx-auto mb-4" style={{ color: 'var(--warn)' }} />
        <h1 className="display text-[34px]" style={{ color: 'var(--brand-strong)' }}>We cannot find that order</h1>
        <p className="mx-auto mt-3 max-w-[46ch] text-[15.5px]" style={{ color: 'var(--ink-soft)' }}>
          Reference <strong>{orderRef}</strong> is not on our system. If you have just paid, call the shop
          on {STORE.phone} and we will find it.
        </p>
        <Link href="/products" className="btn btn-primary mt-7 px-6 text-sm" style={{ height: 50 }}>Back to the menu</Link>
      </div>
    );
  }

  const collectionDate = formatSlotDate(order.slot.date, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-6 lg:py-20">
      <div className="mb-8 text-center">
        <CheckCircle size={56} weight="fill" aria-hidden className="mx-auto mb-4" style={{ color: 'var(--ok)' }} />
        <h1 className="display text-[38px] sm:text-[48px]" style={{ color: 'var(--brand-strong)' }}>
          That is booked in
        </h1>
        <p className="mt-3 text-[16px]" style={{ color: 'var(--ink-soft)' }}>
          Thanks {order.customer.name.split(' ')[0]}. Your reference is{' '}
          <strong className="tabular-nums" style={{ color: 'var(--ink)' }}>{order.ref}</strong>.
        </p>
      </div>

      {order.simulated && (
        <p
          className="mb-6 flex items-start gap-2.5 p-4 text-[13.5px] font-semibold"
          style={{
            borderRadius: 'var(--radius-card)',
            background: 'var(--surface-2)',
            color: 'var(--warn)',
            border: '1.5px solid var(--border)',
          }}
          role="note"
        >
          <FlaskIcon size={18} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
          <span>
            <strong>Demonstration order.</strong> No payment provider is connected to this deployment,
            so no money moved and no card was charged. Connecting a live provider is a configuration
            change, not a code change.
          </span>
        </p>
      )}

      <section className="card mb-5 p-5 sm:p-6" aria-labelledby="collect-heading">
        <h2 id="collect-heading" className="display mb-4 text-[22px]" style={{ color: 'var(--brand-strong)' }}>
          {order.mode === 'delivery' ? 'Delivery window' : 'Collection window'}
        </h2>
        <p className="display text-[26px]" style={{ color: 'var(--ink)' }}>{collectionDate}</p>
        <p className="mt-1 text-[17px] font-bold" style={{ color: 'var(--ink-soft)' }}>{order.slot.label}</p>

        {order.mode === 'delivery' ? (
          <p className="mt-4 text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            Going to <strong style={{ color: 'var(--ink)' }}>{order.customer.address}</strong>
            {order.deliveryZone ? ` (${zoneLabel(order.deliveryZone)})` : ''}. The rider
            will call {order.customer.phone} on arrival.
          </p>
        ) : (
          <a href={MAP_LINK} target="_blank" rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-[14.5px] font-bold underline underline-offset-4"
            style={{ color: 'var(--brand-strong)' }}>
            <MapPin size={16} weight="fill" aria-hidden />
            {STORE.address.line1}, {STORE.address.line2}
          </a>
        )}
      </section>

      <section className="card mb-5 p-5 sm:p-6" aria-labelledby="items-heading">
        <h2 id="items-heading" className="display mb-4 text-[22px]" style={{ color: 'var(--brand-strong)' }}>What you ordered</h2>
        <ul className="space-y-2.5">
          {order.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-4 text-[15px]">
              <span style={{ color: 'var(--ink-soft)' }}>
                <strong style={{ color: 'var(--ink)' }}>{l.quantity} ×</strong> {l.name}
              </span>
              <span className="shrink-0 font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
                {peso(l.unitPrice * l.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-2 pt-4 text-[15px]" style={{ borderTop: '1.5px dashed var(--border)' }}>
          <div className="flex justify-between gap-4">
            <dt style={{ color: 'var(--ink-soft)' }}>Subtotal</dt>
            <dd className="tabular-nums" style={{ color: 'var(--ink)' }}>{peso(order.subtotal)}</dd>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between gap-4">
              <dt style={{ color: 'var(--ink-soft)' }}>Delivery</dt>
              <dd className="tabular-nums" style={{ color: 'var(--ink)' }}>{peso(order.deliveryFee)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-2" style={{ borderTop: '1.5px solid var(--border)' }}>
            <dt className="display text-[18px]" style={{ color: 'var(--ink)' }}>Total</dt>
            <dd className="display text-[18px] tabular-nums" style={{ color: 'var(--brand-strong)' }}>{peso(order.total)}</dd>
          </div>
          {order.depositRequired && (
            <>
              <div className="flex justify-between gap-4">
                <dt style={{ color: 'var(--ink-soft)' }}>Paid now</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{peso(order.amountDue)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: 'var(--ink-soft)' }}>Due on collection</dt>
                <dd className="font-bold tabular-nums" style={{ color: 'var(--ink)' }}>{peso(order.balanceOnCollection)}</dd>
              </div>
            </>
          )}
        </dl>

        <p className="mt-4 text-[13.5px]" style={{ color: 'var(--ink-muted)' }}>
          {METHOD_BY_ID[order.paymentMethod].name} · {STATUS_COPY[order.status]}
        </p>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/products" className="btn btn-primary px-6 text-sm" style={{ height: 50 }}>Order something else</Link>
        <a href={STORE.phoneHref} className="btn btn-outline px-6 text-sm" style={{ height: 50 }}>Call the shop</a>
      </div>
    </div>
  );
}
