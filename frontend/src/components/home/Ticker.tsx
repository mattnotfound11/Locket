import { STORE } from '@/config/store';

const WORDS = [STORE.tagline, STORE.descriptor, 'Baked in Iloilo', 'Same-day pickup', 'Custom cakes'];

/** The one marquee on the site. It carries the brand line, nothing functional. */
export function Ticker() {
  const strip = [...WORDS, ...WORDS];
  return (
    <div
      className="overflow-hidden py-4"
      style={{ background: 'var(--brand-strong)' }}
      aria-hidden
    >
      <div className="marquee-track gap-8">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-8">
            {strip.map((w, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-8">
                <span
                  className="display whitespace-nowrap text-[19px] uppercase tracking-wide"
                  style={{ color: 'var(--brand-ink)' }}
                >
                  {w}
                </span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--brand-ink)', opacity: 0.55 }} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
