import Link from 'next/link';
import { FacebookLogo, InstagramLogo, LockSimple, ArrowUp } from '@phosphor-icons/react/dist/ssr';
import { STORE } from '@/config/store';
import { CITY_DISTRICTS, CAMPUS_ZONES } from '@/domain/fulfillment/delivery';
import { StoreStrip } from './StoreStrip';
import { ShopMark } from './ShopMark';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/custom-orders', label: 'Custom cakes' },
  { href: '/contact', label: 'Contact' },
];

export function Footer() {
  return (
    <footer style={{ background: 'var(--bg-alt)', borderTop: '1.5px solid var(--border)' }}>
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        <StoreStrip />

        <div
          className="mt-14 grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]"
          style={{ borderTop: '1.5px solid var(--border)' }}
        >
          <div>
            <ShopMark width={220} sizes="220px" className="mb-5 items-start" />
            <p className="max-w-[34ch] text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              {STORE.tagline}. Baked each morning in {STORE.address.city}, and never the day before.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={STORE.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Locket on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a
                href={STORE.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Locket on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <h3 className="display mb-4 text-[19px]" style={{ color: 'var(--brand-strong)' }}>Browse</h3>
            <ul className="space-y-2.5">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] hover:underline" style={{ color: 'var(--ink-soft)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="display mb-4 text-[19px]" style={{ color: 'var(--brand-strong)' }}>Ordering</h3>
            <ul className="space-y-2.5 text-[15px]" style={{ color: 'var(--ink-soft)' }}>
              <li>Same-day orders close at 2pm</li>
              <li>Whole cakes need 2 days</li>
              <li>Custom cakes need 5 days</li>
              <li>Delivery inside {STORE.address.city} only</li>
            </ul>

            <h3 className="display mb-3 mt-7 text-[19px]" style={{ color: 'var(--brand-strong)' }}>
              Where we deliver
            </h3>
            <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              All seven districts of {STORE.address.city}: {CITY_DISTRICTS.map((z) => z.name).join(', ')}.
            </p>
            <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              Plus scheduled campus drops at {CAMPUS_ZONES.map((z) => z.name).join(' and ')}.
            </p>
            <p
              className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold"
              style={{ background: 'var(--surface)', color: 'var(--ink-soft)', border: '1.5px solid var(--border)' }}
            >
              <LockSimple size={15} weight="fill" /> Secure checkout over TLS
            </p>
          </div>
        </div>

        <div
          className="mt-12 flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: '1.5px solid var(--border)' }}
        >
          <p className="text-[13px]" style={{ color: 'var(--ink-muted)' }}>
            © {new Date().getFullYear()} {STORE.legalName}. All rights reserved.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold"
            style={{ color: 'var(--brand-strong)' }}
          >
            Back to top <ArrowUp size={14} weight="bold" />
          </a>
        </div>
      </div>
    </footer>
  );
}
