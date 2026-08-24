'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Basket, LockSimple, MopedFront, Storefront, Trash, Warning, Info,
} from '@phosphor-icons/react/dist/ssr';
import { useCart } from '@/lib/cart';
import { peso } from '@/domain/money';
import { PAYMENT_METHODS, methodAllowed, type PaymentMethodId } from '@/domain/payments/methods';
import { PRICING } from '@/domain/cart/totals';
import { leadTimeMessage } from '@/domain/fulfillment/leadtime';
import { formatSlotDate, type FulfilmentMode } from '@/domain/fulfillment/slots';
import {
  CITY_DISTRICTS, CAMPUS_ZONES, ZONE_BY_ID, isServiceableZone,
} from '@/domain/fulfillment/delivery';
import { SlotPicker } from './SlotPicker';
import { QuantityStepper } from '../menu/QuantityStepper';
import { Field } from '../layout/ContactForm';

type Selected = { date: string; start: number; label: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PH_PHONE = /^(\+?63|0)9\d{9}$/;

export function CheckoutClient() {
  const router = useRouter();
  const { lines, mode, setMode, setQuantity, remove, totals, leadTimeDays, hydrated } = useCart();

  const [slot, setSlot] = useState<Selected>(null);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
  const [zone, setZone] = useState('');
  const [chosenMethod, setMethod] = useState<PaymentMethodId>('gcash');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof typeof details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetails((d) => ({ ...d, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const availableMethods = useMemo(
    () => PAYMENT_METHODS.filter((m) => methodAllowed(m.id, totals.depositRequired)),
    [totals.depositRequired],
  );

  // If a deposit becomes required, cash can no longer cover the order. This is
  // derived rather than written back with setState during render, which would
  // queue an extra render pass on every keystroke while the basket is large.
  const method = methodAllowed(chosenMethod, totals.depositRequired)
    ? chosenMethod
    : (availableMethods[0]?.id ?? 'gcash');

  const validate = () => {
    const next: Record<string, string> = {};
    if (!details.name.trim()) next.name = 'We need a name for the order.';
    if (!EMAIL.test(details.email)) next.email = 'Enter a working email so we can send your receipt.';
    if (!PH_PHONE.test(details.phone.replace(/[\s-]/g, ''))) next.phone = 'Enter a mobile number like 0917 428 3067.';
    if (mode === 'delivery' && !isServiceableZone(zone)) next.zone = 'Choose which part of Iloilo City we are delivering to.';
    if (mode === 'delivery' && details.address.trim().length < 12) {
      next.address = ZONE_BY_ID[zone]?.kind === 'campus'
        ? 'Tell us the department or who to hand it to.'
        : 'A full delivery address, including the barangay.';
    }
    if (!slot) next.slot = 'Choose a collection window above.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          slot: { date: slot!.date, start: slot!.start },
          items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
          customer: details,
          paymentMethod: method,
          deliveryZone: mode === 'delivery' ? zone : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? 'We could not place that order. Please try again.');
        if (data.reason) setSlot(null);
        setSubmitting(false);
        return;
      }

      if (data.redirectUrl) { window.location.href = data.redirectUrl; return; }
      router.push(`/order/${data.ref}`);
    } catch {
      setServerError('We could not reach the shop. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6" aria-busy="true">
        <div className="skeleton h-[320px]" style={{ borderRadius: 'var(--radius-card)' }} />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 text-center sm:px-6 lg:py-28">
        <Basket size={54} weight="fill" aria-hidden className="mx-auto mb-4" style={{ color: 'var(--brand)' }} />
        <h1 className="display text-[36px] sm:text-[44px]" style={{ color: 'var(--brand-strong)' }}>
          Your basket is empty
        </h1>
        <p className="mx-auto mt-3 max-w-[44ch] text-[16px]" style={{ color: 'var(--ink-soft)' }}>
          Nothing in here yet. The cookies go first, if that helps you decide.
        </p>
        <Link href="/products" className="btn btn-primary mt-7 px-7 text-sm" style={{ height: 52 }}>
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} noValidate className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-10">
        <div className="min-w-0 space-y-6">
          {/* ---------------------------------------------------------- basket */}
          <section className="card p-5 sm:p-6" aria-labelledby="basket-heading">
            <h2 id="basket-heading" className="display mb-4 text-[24px]" style={{ color: 'var(--brand-strong)' }}>
              1. Your basket
            </h2>
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.product.id} className="flex gap-3.5 pb-4 last:pb-0" style={{ borderBottom: '1.5px dashed var(--border)' }}>
                  <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center">
                    <div className="blob absolute inset-0" aria-hidden />
                    <Image src={line.product.image} alt="" width={140} height={140} sizes="68px"
                      className="relative h-[60px] w-[60px] object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="display text-[17px]" style={{ color: 'var(--ink)' }}>{line.product.name}</p>
                    <p className="text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>
                      {peso(line.product.price)} {line.product.unit}
                    </p>
                    {line.product.leadTimeDays ? (
                      <p className="mt-1 text-[12px] font-bold" style={{ color: 'var(--warn)' }}>
                        {leadTimeMessage(line.product.leadTimeDays)}
                      </p>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(n) => setQuantity(line.product.id, n)}
                        label={line.product.name}
                        compact
                      />
                      <button type="button" onClick={() => remove(line.product.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ color: 'var(--ink-muted)' }} aria-label={`Remove ${line.product.name}`}>
                        <Trash size={15} weight="bold" />
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-[15px] font-extrabold tabular-nums" style={{ color: 'var(--ink)' }}>
                    {peso(line.product.price * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* ----------------------------------------------------- fulfilment */}
          <section className="card p-5 sm:p-6" aria-labelledby="when-heading">
            <h2 id="when-heading" className="display mb-4 text-[24px]" style={{ color: 'var(--brand-strong)' }}>
              2. How and when
            </h2>

            <div className="mb-5 grid gap-2 sm:grid-cols-2" role="group" aria-label="Pickup or delivery">
              {([
                { id: 'pickup', label: 'Collect from us', note: 'Free. Collected from our kitchen in Jaro.', icon: Storefront },
                { id: 'delivery', label: 'Delivery', note: `Iloilo City only. ${peso(PRICING.deliveryFee)}, free over ${peso(PRICING.freeDeliveryFrom)}.`, icon: MopedFront },
              ] as const).map((opt) => {
                const Icon = opt.icon;
                const active = mode === opt.id;
                return (
                  <button key={opt.id} type="button" onClick={() => setMode(opt.id as FulfilmentMode)}
                    aria-pressed={active}
                    className="flex items-start gap-3 p-4 text-left transition-colors"
                    style={{
                      borderRadius: 'var(--radius-input)',
                      background: active ? 'var(--brand-strong)' : 'var(--surface)',
                      color: active ? 'var(--brand-ink)' : 'var(--ink)',
                      border: `1.5px solid ${active ? 'var(--brand-strong)' : 'var(--border)'}`,
                    }}>
                    <Icon size={22} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
                    <span>
                      <span className="block text-[15px] font-extrabold">{opt.label}</span>
                      <span className="block text-[12.5px] opacity-85">{opt.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {leadTimeDays > 0 && (
              <p className="mb-4 flex items-start gap-2 rounded-[var(--radius-input)] p-3 text-[13.5px] font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--warn)' }}>
                <Info size={16} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
                Your basket includes a bake that needs {leadTimeDays} day{leadTimeDays === 1 ? '' : 's'} of notice, so earlier dates are closed.
              </p>
            )}

            <SlotPicker
              key={`${mode}-${leadTimeDays}`}
              mode={mode}
              leadTimeDays={leadTimeDays}
              selected={slot}
              onSelect={setSlot}
            />

            {errors.slot && (
              <p role="alert" className="mt-3 text-[13px] font-bold" style={{ color: 'var(--danger)' }}>{errors.slot}</p>
            )}
          </section>

          {/* -------------------------------------------------------- details */}
          <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="details-heading">
            <h2 id="details-heading" className="display text-[24px]" style={{ color: 'var(--brand-strong)' }}>
              3. Your details
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="co-name" label="Full name" error={errors.name}>
                <input id="co-name" className="field" value={details.name} onChange={set('name')}
                  aria-invalid={Boolean(errors.name)} autoComplete="name" />
              </Field>
              <Field id="co-phone" label="Mobile number" error={errors.phone}>
                <input id="co-phone" type="tel" className="field" value={details.phone} onChange={set('phone')}
                  aria-invalid={Boolean(errors.phone)} autoComplete="tel" placeholder="0917 428 3067" />
              </Field>
            </div>

            <Field id="co-email" label="Email" hint="Your receipt and order reference go here." error={errors.email}>
              <input id="co-email" type="email" className="field" value={details.email} onChange={set('email')}
                aria-invalid={Boolean(errors.email)} autoComplete="email" />
            </Field>

            {mode === 'delivery' && (
              <>
                <Field
                  id="co-zone"
                  label="Where in Iloilo City"
                  hint="We deliver across the city, plus scheduled drops at the campuses listed."
                  error={errors.zone}
                >
                  <select
                    id="co-zone"
                    className="field"
                    value={zone}
                    onChange={(e) => { setZone(e.target.value); setErrors((p) => ({ ...p, zone: '' })); }}
                    aria-invalid={Boolean(errors.zone)}
                  >
                    <option value="" disabled>Choose an area</option>
                    <optgroup label="Iloilo City districts">
                      {CITY_DISTRICTS.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </optgroup>
                    <optgroup label="Campus drop-off">
                      {CAMPUS_ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </optgroup>
                  </select>
                </Field>

                {ZONE_BY_ID[zone]?.note && (
                  <p
                    className="-mt-2 flex items-start gap-2 rounded-[var(--radius-input)] p-3 text-[13px] font-semibold"
                    style={{ background: 'var(--surface-2)', color: 'var(--ink-soft)' }}
                  >
                    <Info size={15} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
                    {ZONE_BY_ID[zone].note}
                  </p>
                )}

                <Field
                  id="co-address"
                  label={ZONE_BY_ID[zone]?.kind === 'campus' ? 'Department and who to hand it to' : 'Delivery address'}
                  hint={ZONE_BY_ID[zone]?.kind === 'campus'
                    ? 'For example: College of Nursing, ask for Marisol.'
                    : 'Street, barangay and any landmark that helps the rider.'}
                  error={errors.address}
                >
                  <textarea id="co-address" rows={3} className="field resize-y" value={details.address} onChange={set('address')}
                    aria-invalid={Boolean(errors.address)} autoComplete="street-address" />
                </Field>
              </>
            )}

            <Field id="co-notes" label="Anything we should know" hint="Allergies, a message to pipe, or where to leave it.">
              <textarea id="co-notes" rows={2} className="field resize-y" value={details.notes} onChange={set('notes')} />
            </Field>
          </section>

          {/* -------------------------------------------------------- payment */}
          <section className="card p-5 sm:p-6" aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="display mb-1 text-[24px]" style={{ color: 'var(--brand-strong)' }}>
              4. Payment
            </h2>
            <p className="mb-4 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: 'var(--ink-muted)' }}>
              <LockSimple size={14} weight="fill" aria-hidden /> Sent over an encrypted connection. We never see your card details.
            </p>

            {totals.depositRequired && (
              <p className="mb-4 flex items-start gap-2 rounded-[var(--radius-input)] p-3 text-[13.5px] font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--warn)' }}>
                <Info size={16} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
                Orders over {peso(PRICING.depositThreshold)} take a {PRICING.depositPercent}% deposit now.
                You pay the {peso(totals.balanceOnCollection)} balance when you collect.
              </p>
            )}

            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHODS.map((m) => {
                const allowed = methodAllowed(m.id, totals.depositRequired);
                const active = method === m.id;
                return (
                  <label key={m.id}
                    className="flex cursor-pointer items-start gap-3 p-3.5 transition-colors"
                    style={{
                      borderRadius: 'var(--radius-input)',
                      background: active ? 'color-mix(in srgb, var(--brand) 14%, transparent)' : 'var(--surface)',
                      border: `1.5px solid ${active ? 'var(--brand-strong)' : 'var(--border)'}`,
                      opacity: allowed ? 1 : 0.5,
                      cursor: allowed ? 'pointer' : 'not-allowed',
                    }}>
                    <input type="radio" name="payment" value={m.id} checked={active} disabled={!allowed}
                      onChange={() => setMethod(m.id)}
                      className="mt-1 h-[18px] w-[18px] shrink-0 accent-[var(--brand-strong)]" />
                    <span>
                      <span className="block text-[15px] font-extrabold" style={{ color: 'var(--ink)' }}>{m.name}</span>
                      <span className="block text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
                        {allowed ? m.blurb : 'Not available on orders that need a deposit.'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* --------------------------------------------------------- summary */}
        <aside className="card min-w-0 p-5 sm:p-6 lg:sticky lg:top-[88px]" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="display mb-4 text-[22px]" style={{ color: 'var(--brand-strong)' }}>
            Order summary
          </h2>

          <dl className="space-y-2.5 text-[14.5px]">
            <div className="flex justify-between gap-4">
              <dt style={{ color: 'var(--ink-soft)' }}>Subtotal ({totals.itemCount} item{totals.itemCount === 1 ? '' : 's'})</dt>
              <dd className="font-bold tabular-nums" style={{ color: 'var(--ink)' }}>{peso(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt style={{ color: 'var(--ink-soft)' }}>{mode === 'delivery' ? 'Delivery' : 'Pickup'}</dt>
              <dd className="font-bold tabular-nums" style={{ color: totals.deliveryFee === 0 ? 'var(--ok)' : 'var(--ink)' }}>
                {totals.deliveryFee === 0 ? 'Free' : peso(totals.deliveryFee)}
              </dd>
            </div>

            {totals.freeDeliveryShortfall > 0 && (
              <p className="text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>
                Add {peso(totals.freeDeliveryShortfall)} more for free delivery.
              </p>
            )}

            <div className="flex justify-between gap-4 pt-3" style={{ borderTop: '1.5px solid var(--border)' }}>
              <dt className="display text-[19px]" style={{ color: 'var(--ink)' }}>Total</dt>
              <dd className="display text-[19px] tabular-nums" style={{ color: 'var(--brand-strong)' }}>{peso(totals.total)}</dd>
            </div>

            {totals.depositRequired && (
              <>
                <div className="flex justify-between gap-4 pt-2">
                  <dt className="font-extrabold" style={{ color: 'var(--ink)' }}>Pay now ({PRICING.depositPercent}%)</dt>
                  <dd className="font-extrabold tabular-nums" style={{ color: 'var(--brand-strong)' }}>{peso(totals.depositAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt style={{ color: 'var(--ink-soft)' }}>On collection</dt>
                  <dd className="tabular-nums" style={{ color: 'var(--ink-soft)' }}>{peso(totals.balanceOnCollection)}</dd>
                </div>
              </>
            )}
          </dl>

          <div className="mt-5 rounded-[var(--radius-input)] p-3 text-[13px]" style={{ background: 'var(--surface-2)' }}>
            <p className="font-extrabold" style={{ color: 'var(--ink)' }}>
              {slot ? formatSlotDate(slot.date) : 'No window chosen yet'}
            </p>
            <p style={{ color: 'var(--ink-soft)' }}>
              {slot ? `${slot.label}, ${mode === 'delivery' ? 'delivered' : 'for pickup'}` : 'Pick a date and time in step 2.'}
            </p>
          </div>

          {serverError && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-[var(--radius-input)] p-3 text-[13.5px] font-bold"
              style={{ background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}>
              <Warning size={16} weight="fill" aria-hidden className="mt-0.5 shrink-0" /> {serverError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary mt-5 h-[54px] w-full text-[15px]">
            {submitting ? 'Placing your order...' : `Place order · ${peso(totals.depositRequired ? totals.depositAmount : totals.total)}`}
          </button>

          <p className="mt-3 text-center text-[12px]" style={{ color: 'var(--ink-muted)' }}>
            By ordering you agree to our collection and refund terms.
          </p>
        </aside>
      </div>
    </form>
  );
}
