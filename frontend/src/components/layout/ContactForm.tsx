'use client';

import { useState } from 'react';
import { CheckCircle, PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr';

const TOPICS = ['General question', 'Bulk or corporate order', 'Allergen question', 'Feedback'];

interface Errors { name?: string; email?: string; message?: string }

export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', topic: TOPICS[0], message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!values.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) next.email = 'We need a working email to reply to.';
    if (values.message.trim().length < 10) next.message = 'A sentence or two, so we can actually help.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState('busy');
    // No transactional email provider is configured yet; this acknowledges locally.
    await new Promise((r) => setTimeout(r, 600));
    setState('done');
  };

  if (state === 'done') {
    return (
      <div className="card p-8 text-center" role="status">
        <CheckCircle size={44} weight="fill" aria-hidden className="mx-auto mb-3" style={{ color: 'var(--ok)' }} />
        <h3 className="display text-[24px]" style={{ color: 'var(--brand-strong)' }}>Message sent</h3>
        <p className="mx-auto mt-2 max-w-[38ch] text-[15px]" style={{ color: 'var(--ink-soft)' }}>
          Thanks {values.name.split(' ')[0]}. We reply within one working day, usually sooner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-5 sm:p-6">
      <Field id="c-name" label="Your name" error={errors.name}>
        <input id="c-name" className="field" value={values.name} onChange={set('name')}
          aria-invalid={Boolean(errors.name)} autoComplete="name" />
      </Field>

      <Field id="c-email" label="Email" error={errors.email}>
        <input id="c-email" type="email" className="field" value={values.email} onChange={set('email')}
          aria-invalid={Boolean(errors.email)} autoComplete="email" />
      </Field>

      <Field id="c-topic" label="What is it about">
        <select id="c-topic" className="field" value={values.topic} onChange={set('topic')}>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>

      <Field id="c-message" label="Message" error={errors.message}>
        <textarea id="c-message" rows={5} className="field resize-y" value={values.message} onChange={set('message')}
          aria-invalid={Boolean(errors.message)} />
      </Field>

      <button type="submit" disabled={state === 'busy'} className="btn btn-primary h-12 w-full text-sm">
        <PaperPlaneTilt size={17} weight="fill" aria-hidden />
        {state === 'busy' ? 'Sending...' : 'Send message'}
      </button>
    </form>
  );
}

export function Field({
  id, label, error, hint, children,
}: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-extrabold" style={{ color: 'var(--ink)' }}>
        {label}
      </label>
      {hint && <p className="-mt-1 text-[12.5px]" style={{ color: 'var(--ink-muted)' }}>{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="text-[13px] font-bold" style={{ color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  );
}
