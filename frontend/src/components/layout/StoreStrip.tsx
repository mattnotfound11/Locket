import { MapPin, Clock, Phone, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { STORE, FULL_ADDRESS, MAP_EMBED_SRC, MAP_LINK, summarisedHours } from '@/config/store';
import { OpenStatus } from './OpenStatus';

/**
 * Address, hours, phone and a live map. Rendered inside the footer so it
 * appears on every page of the site without each page having to remember.
 */
export function StoreStrip() {
  const hours = summarisedHours();

  return (
    <section
      className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12"
      aria-label="Visit the shop"
    >
      <div className="grid gap-7 sm:grid-cols-2 lg:gap-8">
        <div>
          <h3 className="display mb-3 flex items-center gap-2 text-[19px]" style={{ color: 'var(--brand-strong)' }}>
            <MapPin size={20} weight="fill" /> Find us
          </h3>
          <address className="not-italic text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {STORE.address.line1}<br />
            {STORE.address.line2}<br />
            {STORE.address.city}, {STORE.address.region} {STORE.address.postcode}
          </address>
          <a
            href={MAP_LINK}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold underline underline-offset-4"
            style={{ color: 'var(--brand-strong)' }}
          >
            Open in Google Maps <ArrowSquareOut size={15} weight="bold" />
          </a>
        </div>

        <div>
          <h3 className="display mb-3 flex items-center gap-2 text-[19px]" style={{ color: 'var(--brand-strong)' }}>
            <Clock size={20} weight="fill" /> Hours
          </h3>
          <OpenStatus />
          <dl className="mt-3 space-y-1.5 text-[15px]">
            {hours.map((row) => (
              <div key={row.days} className="flex justify-between gap-4" style={{ color: 'var(--ink-soft)' }}>
                <dt className="font-bold" style={{ color: 'var(--ink)' }}>{row.days}</dt>
                <dd className="tabular-nums">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="sm:col-span-2">
          <h3 className="display mb-3 flex items-center gap-2 text-[19px]" style={{ color: 'var(--brand-strong)' }}>
            <Phone size={20} weight="fill" /> Talk to us
          </h3>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
            <a href={STORE.phoneHref} className="font-bold underline underline-offset-4" style={{ color: 'var(--ink)' }}>
              {STORE.phone}
            </a>
            <a href={`mailto:${STORE.email}`} className="underline underline-offset-4" style={{ color: 'var(--ink-soft)' }}>
              {STORE.email}
            </a>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden"
        style={{ borderRadius: 'var(--radius-card)', border: '1.5px solid var(--border)' }}
      >
        <iframe
          src={MAP_EMBED_SRC}
          title={`Map showing ${STORE.name} at ${FULL_ADDRESS}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[300px] w-full lg:h-full lg:min-h-[340px]"
          style={{ border: 0, filter: 'saturate(0.92)' }}
        />
      </div>
    </section>
  );
}
