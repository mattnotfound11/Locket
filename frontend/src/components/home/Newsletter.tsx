'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PaperPlaneTilt, CheckCircle } from '@phosphor-icons/react/dist/ssr';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setState('error');
      setMessage('That email does not look right. Check it and try again.');
      return;
    }
    setState('busy');
    // No mailing-list provider is wired up yet, so this only acknowledges locally.
    await new Promise((r) => setTimeout(r, 550));
    setState('done');
    setMessage('');
  };

  return (
    <section
      className="relative overflow-hidden py-16 lg:py-20"
      style={{ background: 'var(--color-butter)' }}
      aria-labelledby="newsletter-title"
    >
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[auto_1fr_1fr] lg:gap-12">
        <Image
          src="/brand/locket-badge.png"
          alt=""
          aria-hidden
          width={150}
          height={150}
          className="spin-slow mx-auto h-[112px] w-[112px] object-contain lg:h-[150px] lg:w-[150px]"
        />

        <h2 id="newsletter-title" className="display text-center text-[34px] leading-[0.95] sm:text-[44px] lg:text-left" style={{ color: '#5a3d0c' }}>
          Never miss<br />a drop.
        </h2>

        <div>
          <p className="mb-4 text-center text-[15px] leading-relaxed lg:text-left" style={{ color: '#6b4a12' }}>
            New flavours, seasonal bakes and the days we open early. No more than twice a month.
          </p>

          {state === 'done' ? (
            <p
              className="flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-bold lg:justify-start"
              style={{ background: '#fffaf4', color: 'var(--ok)' }}
              role="status"
            >
              <CheckCircle size={19} weight="fill" aria-hidden /> You are on the list.
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                  placeholder="you@example.ph"
                  aria-invalid={state === 'error'}
                  aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
                  className="field"
                  style={{ background: '#fffaf4', borderColor: state === 'error' ? 'var(--danger)' : '#e8c88a' }}
                />
              </div>
              <button type="submit" disabled={state === 'busy'} className="btn btn-primary h-[46px] px-6 text-sm">
                <PaperPlaneTilt size={16} weight="fill" aria-hidden />
                {state === 'busy' ? 'Adding...' : 'Subscribe'}
              </button>
            </form>
          )}

          {state === 'error' && (
            <p id="newsletter-error" role="alert" className="mt-2 text-[13.5px] font-bold" style={{ color: '#8c1d16' }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
