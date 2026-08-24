'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, ImageSquare, Info, UploadSimple, X } from '@phosphor-icons/react/dist/ssr';
import {
  OCCASIONS, FLAVOURS, SERVING_TIERS, MAX_REFERENCE_BYTES, ACCEPTED_IMAGE_TYPES, CUSTOM_DEPOSIT,
} from '@/domain/orders/custom';
import { customLeadDaysFor, earliestDateFor } from '@/domain/fulfillment/leadtime';
import { ALLERGEN_LABELS, DIETARY_LABELS, type Allergen, type DietaryTag } from '@/domain/catalog/types';
import { peso } from '@/domain/money';
import { Field } from '../layout/ContactForm';

const AVOIDABLE: Allergen[] = ['gluten', 'dairy', 'eggs', 'tree-nuts', 'peanuts', 'soy', 'sesame'];
const DIETARY: DietaryTag[] = ['vegetarian', 'vegan', 'gluten-free', 'nut-free', 'eggless'];

export function CustomOrderForm() {
  const [servings, setServings] = useState(20);
  const [flavours, setFlavours] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ref: string; leadDays: number } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const leadDays = useMemo(() => customLeadDaysFor(servings), [servings]);
  const earliest = useMemo(() => earliestDateFor(new Date(), leadDays), [leadDays]);
  const earliestValue = `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, '0')}-${String(earliest.getDate()).padStart(2, '0')}`;

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // Object URLs hold the file in memory until revoked, so each replaced photo
  // would otherwise leak for the lifetime of the page.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pickFile = (f: File | null) => {
    setErrors((e) => ({ ...e, reference: '' }));
    if (!f) { setFile(null); setPreview(null); return; }
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
      setErrors((e) => ({ ...e, reference: 'Reference photos must be JPG, PNG, WEBP or HEIC.' }));
      return;
    }
    if (f.size > MAX_REFERENCE_BYTES) {
      setErrors((e) => ({ ...e, reference: 'That photo is over 5 MB. Please pick a smaller one.' }));
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    data.delete('flavours'); flavours.forEach((f) => data.append('flavours', f));
    data.delete('dietary'); dietary.forEach((d) => data.append('dietary', d));
    data.delete('avoidAllergens'); avoid.forEach((a) => data.append('avoidAllergens', a));
    data.set('servings', String(servings));
    if (file) data.set('reference', file); else data.delete('reference');

    try {
      const res = await fetch('/api/custom-orders', { method: 'POST', body: data });
      const body = await res.json();
      if (!res.ok) {
        setErrors(body.errors ?? { form: 'We could not send that. Please try again.' });
        setSubmitting(false);
        document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
      setResult({ ref: body.ref, leadDays: body.leadDays });
    } catch {
      setErrors({ form: 'We could not reach the shop. Check your connection and try again.' });
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="card p-8 text-center sm:p-10" role="status">
        <CheckCircle size={52} weight="fill" aria-hidden className="mx-auto mb-4" style={{ color: 'var(--ok)' }} />
        <h2 className="display text-[32px]" style={{ color: 'var(--brand-strong)' }}>Brief received</h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-[15.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Your reference is <strong style={{ color: 'var(--ink)' }}>{result.ref}</strong>. We will price it
          and come back to you within one working day, with a {peso(CUSTOM_DEPOSIT)} booking deposit to
          confirm the date.
        </p>
        <p className="mx-auto mt-4 max-w-[46ch] text-[14px]" style={{ color: 'var(--ink-muted)' }}>
          Nothing is charged yet. The deposit comes off the final quote.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
      <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="cake-heading">
        <h2 id="cake-heading" className="display text-[24px]" style={{ color: 'var(--brand-strong)' }}>The cake</h2>

        <Field id="occasion" label="Occasion" error={errors.occasion}>
          <select id="occasion" name="occasion" className="field" aria-invalid={Boolean(errors.occasion)} defaultValue="">
            <option value="" disabled>Choose one</option>
            {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>

        <fieldset>
          <legend className="mb-2 text-[14px] font-extrabold" style={{ color: 'var(--ink)' }}>
            How many people does it need to feed?
          </legend>
          <div className="flex flex-wrap gap-2">
            {SERVING_TIERS.map((t) => (
              <button key={t} type="button" onClick={() => setServings(t)} aria-pressed={servings === t}
                className="rounded-full px-4 py-2 text-[14px] font-bold transition-colors"
                style={{
                  background: servings === t ? 'var(--brand-strong)' : 'var(--surface)',
                  color: servings === t ? 'var(--brand-ink)' : 'var(--ink-soft)',
                  border: `1.5px solid ${servings === t ? 'var(--brand-strong)' : 'var(--border)'}`,
                }}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-3 max-w-[220px]">
            <label htmlFor="servings-exact" className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: 'var(--ink-muted)' }}>
              Or type an exact number
            </label>
            <input id="servings-exact" type="number" min={6} max={300} className="field" value={servings}
              onChange={(ev) => setServings(Number(ev.target.value))} aria-invalid={Boolean(errors.servings)} />
          </div>
          {errors.servings && <p role="alert" className="mt-2 text-[13px] font-bold" style={{ color: 'var(--danger)' }}>{errors.servings}</p>}
        </fieldset>

        <p className="flex items-start gap-2 rounded-[var(--radius-input)] p-3 text-[13.5px] font-semibold"
          style={{ background: 'var(--surface-2)', color: 'var(--warn)' }}>
          <Info size={16} weight="fill" aria-hidden className="mt-0.5 shrink-0" />
          A cake for {servings} needs <strong>{leadDays} days</strong> of notice. The earliest date we can
          take is {earliest.toLocaleDateString('en-PH', { weekday: 'long', day: 'numeric', month: 'long' })}.
        </p>

        <Field id="eventDate" label="Date you need it" error={errors.eventDate}>
          <input id="eventDate" name="eventDate" type="date" className="field" min={earliestValue}
            aria-invalid={Boolean(errors.eventDate)} />
        </Field>

        <fieldset>
          <legend className="mb-2 text-[14px] font-extrabold" style={{ color: 'var(--ink)' }}>Flavours</legend>
          <div className="flex flex-wrap gap-2">
            {FLAVOURS.map((f) => (
              <button key={f} type="button" onClick={() => toggle(flavours, setFlavours, f)} aria-pressed={flavours.includes(f)}
                className="rounded-full px-3.5 py-2 text-[13.5px] font-bold transition-colors"
                style={{
                  background: flavours.includes(f) ? 'var(--brand-strong)' : 'var(--surface)',
                  color: flavours.includes(f) ? 'var(--brand-ink)' : 'var(--ink-soft)',
                  border: `1.5px solid ${flavours.includes(f) ? 'var(--brand-strong)' : 'var(--border)'}`,
                }}>
                {f}
              </button>
            ))}
          </div>
          {errors.flavours && <p role="alert" className="mt-2 text-[13px] font-bold" style={{ color: 'var(--danger)' }}>{errors.flavours}</p>}
        </fieldset>
      </section>

      <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="design-heading">
        <h2 id="design-heading" className="display text-[24px]" style={{ color: 'var(--brand-strong)' }}>The design</h2>

        <Field id="designNotes" label="Describe what you have in mind"
          hint="Colours, tiers, the message to pipe, anything you have already decided." error={errors.designNotes}>
          <textarea id="designNotes" name="designNotes" rows={4} className="field resize-y"
            aria-invalid={Boolean(errors.designNotes)} placeholder="Two tiers, dusty pink, gold lettering that says Happy 60th Lola" />
        </Field>

        <div>
          <p className="mb-2 text-[14px] font-extrabold" style={{ color: 'var(--ink)' }}>Reference photo</p>
          {preview ? (
            <div className="flex items-start gap-4">
              <Image src={preview} alt="Your reference photo" width={128} height={128}
                className="h-32 w-32 object-cover" unoptimized
                style={{ borderRadius: 'var(--radius-input)', border: '1.5px solid var(--border)' }} />
              <div>
                <p className="text-[14px] font-bold" style={{ color: 'var(--ink)' }}>{file?.name}</p>
                <p className="text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>
                  {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                </p>
                <button type="button" onClick={() => { pickFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-bold underline underline-offset-4"
                  style={{ color: 'var(--brand-strong)' }}>
                  <X size={13} weight="bold" aria-hidden /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              className="flex cursor-pointer flex-col items-center gap-2 px-6 py-8 text-center transition-colors"
              style={{ borderRadius: 'var(--radius-input)', border: '2px dashed var(--border)', background: 'var(--surface-2)' }}
            >
              <UploadSimple size={26} weight="bold" aria-hidden style={{ color: 'var(--brand-strong)' }} />
              <span className="text-[14.5px] font-extrabold" style={{ color: 'var(--ink)' }}>
                Upload a photo of the look you want
              </span>
              <span className="text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>
                JPG, PNG, WEBP or HEIC. Up to 5 MB.
              </span>
              <input ref={fileRef} type="file" name="reference" accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className="sr-only" onChange={(ev) => pickFile(ev.target.files?.[0] ?? null)} />
            </label>
          )}
          {errors.reference && <p role="alert" className="mt-2 text-[13px] font-bold" style={{ color: 'var(--danger)' }}>{errors.reference}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>
            <ImageSquare size={14} weight="fill" aria-hidden />
            A screenshot from Instagram or Pinterest is perfect. We will not copy another baker&apos;s work exactly.
          </p>
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="diet-heading">
        <h2 id="diet-heading" className="display text-[24px]" style={{ color: 'var(--brand-strong)' }}>Dietary needs</h2>
        <p className="-mt-2 text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Tell us here rather than in the notes. If we cannot do it safely we will say so instead of guessing.
        </p>

        <fieldset>
          <legend className="mb-2 text-[14px] font-extrabold" style={{ color: 'var(--ink)' }}>It should be</legend>
          <div className="flex flex-wrap gap-2">
            {DIETARY.map((d) => (
              <button key={d} type="button" onClick={() => toggle(dietary, setDietary, d)} aria-pressed={dietary.includes(d)}
                className="rounded-full px-3.5 py-2 text-[13.5px] font-bold transition-colors"
                style={{
                  background: dietary.includes(d) ? 'var(--ok)' : 'var(--surface)',
                  color: dietary.includes(d) ? '#fff' : 'var(--ink-soft)',
                  border: `1.5px solid ${dietary.includes(d) ? 'var(--ok)' : 'var(--border)'}`,
                }}>
                {DIETARY_LABELS[d]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-[14px] font-extrabold" style={{ color: 'var(--ink)' }}>Must not contain</legend>
          <div className="flex flex-wrap gap-2">
            {AVOIDABLE.map((a) => (
              <button key={a} type="button" onClick={() => toggle(avoid, setAvoid, a)} aria-pressed={avoid.includes(a)}
                className="rounded-full px-3.5 py-2 text-[13.5px] font-bold transition-colors"
                style={{
                  background: avoid.includes(a) ? 'var(--danger)' : 'var(--surface)',
                  color: avoid.includes(a) ? '#fff' : 'var(--ink-soft)',
                  border: `1.5px solid ${avoid.includes(a) ? 'var(--danger)' : 'var(--border)'}`,
                }}>
                {ALLERGEN_LABELS[a]}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="card space-y-4 p-5 sm:p-6" aria-labelledby="you-heading">
        <h2 id="you-heading" className="display text-[24px]" style={{ color: 'var(--brand-strong)' }}>You</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Full name" error={errors.name}>
            <input id="name" name="name" className="field" autoComplete="name" aria-invalid={Boolean(errors.name)} />
          </Field>
          <Field id="phone" label="Mobile number" error={errors.phone}>
            <input id="phone" name="phone" type="tel" className="field" autoComplete="tel"
              placeholder="0917 428 3067" aria-invalid={Boolean(errors.phone)} />
          </Field>
        </div>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" className="field" autoComplete="email" aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field id="budget" label="Budget in pesos" hint="Optional, but it helps us design to something achievable.">
          <input id="budget" name="budget" type="number" min={0} step={100} className="field" placeholder="3500" />
        </Field>
      </section>

      {errors.form && (
        <p role="alert" className="flex items-center gap-2 rounded-[var(--radius-card)] p-4 text-[14px] font-bold"
          style={{ background: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}>
          {errors.form}
        </p>
      )}

      <div className="card p-5 sm:p-6">
        <p className="mb-4 text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          Sending this does not charge you. We price the brief, send it back within one working day, and
          take a <strong style={{ color: 'var(--ink)' }}>{peso(CUSTOM_DEPOSIT)}</strong> deposit only once
          you are happy. That deposit comes off the final total.
        </p>
        <button type="submit" disabled={submitting} className="btn btn-primary h-[54px] w-full text-[15px]">
          {submitting ? 'Sending your brief...' : 'Send the brief'}
        </button>
      </div>
    </form>
  );
}
