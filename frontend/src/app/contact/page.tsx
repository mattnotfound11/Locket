import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, EnvelopeSimple, ChatCircleDots, Cake } from '@phosphor-icons/react/dist/ssr';
import { PageIntro } from '@/components/layout/PageIntro';
import { ContactForm } from '@/components/layout/ContactForm';
import { STORE, FULL_ADDRESS, MAP_EMBED_SRC, MAP_LINK, summarisedHours } from '@/config/store';
import { OpenStatus } from '@/components/layout/OpenStatus';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Find ${STORE.name} at ${FULL_ADDRESS}. Phone ${STORE.phone}, or send a message.`,
};

const CHANNELS = [
  { icon: Phone, title: 'Call the counter', body: STORE.phone, href: STORE.phoneHref, note: 'Fastest during opening hours.' },
  { icon: EnvelopeSimple, title: 'Email us', body: STORE.email, href: `mailto:${STORE.email}`, note: 'We reply within one working day.' },
  { icon: Cake, title: 'Custom cake brief', body: 'Start an order', href: '/custom-orders', note: 'Quotes come back within one working day.' },
];

export default function ContactPage() {
  const hours = summarisedHours();

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Come and find us"
        lede={`We are on Lopez Jaena Street in Jaro, a short ride from the plaza. We deliver across ${STORE.address.city} and run scheduled drops at University of San Agustin and St. Paul University Iloilo.`}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map((c) => {
            const Icon = c.icon;
            const external = c.href.startsWith('mailto') || c.href.startsWith('tel');
            const inner = (
              <>
                <span
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
                >
                  <Icon size={21} weight="fill" aria-hidden />
                </span>
                <h2 className="display text-[19px]" style={{ color: 'var(--ink)' }}>{c.title}</h2>
                <p className="mt-1 text-[15px] font-bold" style={{ color: 'var(--brand-strong)' }}>{c.body}</p>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--ink-muted)' }}>{c.note}</p>
              </>
            );
            return external ? (
              <a key={c.title} href={c.href} className="card p-5 transition-transform hover:-translate-y-0.5">{inner}</a>
            ) : (
              <Link key={c.title} href={c.href} className="card p-5 transition-transform hover:-translate-y-0.5">{inner}</Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <h2 className="display mb-2 flex items-center gap-2 text-[30px]" style={{ color: 'var(--brand-strong)' }}>
              <ChatCircleDots size={26} weight="fill" aria-hidden /> Send a message
            </h2>
            <p className="mb-6 text-[15.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              For anything that is not a custom cake brief. Bulk orders, corporate boxes, or a question
              about an allergen.
            </p>
            <ContactForm />
          </div>

          <div>
            <h2 className="display mb-4 text-[30px]" style={{ color: 'var(--brand-strong)' }}>The shop</h2>

            <div className="card mb-4 p-5">
              <OpenStatus />
              <address className="mt-4 not-italic text-[15.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                {STORE.address.line1}<br />
                {STORE.address.line2}<br />
                {STORE.address.city}, {STORE.address.region} {STORE.address.postcode}<br />
                {STORE.address.country}
              </address>

              <dl className="mt-5 space-y-1.5 pt-4 text-[15px]" style={{ borderTop: '1.5px dashed var(--border)' }}>
                {hours.map((row) => (
                  <div key={row.days} className="flex justify-between gap-4" style={{ color: 'var(--ink-soft)' }}>
                    <dt className="font-bold" style={{ color: 'var(--ink)' }}>{row.days}</dt>
                    <dd className="tabular-nums">{row.hours}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="overflow-hidden" style={{ borderRadius: 'var(--radius-card)', border: '1.5px solid var(--border)' }}>
              <iframe
                src={MAP_EMBED_SRC}
                title={`Map showing ${STORE.name} at ${FULL_ADDRESS}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[380px] w-full"
                style={{ border: 0 }}
              />
            </div>
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline mt-4 h-12 w-full text-sm"
            >
              Get directions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
