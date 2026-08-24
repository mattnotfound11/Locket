import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_RULES } from '@/domain/fulfillment/slots';
import { PRODUCTS } from '@/domain/catalog/products';
import { CUSTOM_ORDER_LEAD_DAYS } from '@/domain/fulfillment/leadtime';

/**
 * The figures here are read from the same configuration the checkout enforces,
 * so the page cannot drift out of step with how the shop actually operates.
 */
const FACTS = [
  { value: String(PRODUCTS.length), label: 'things on the menu' },
  { value: String(DEFAULT_RULES.capacity.pickup), label: 'orders per pickup window' },
  { value: `${CUSTOM_ORDER_LEAD_DAYS} days`, label: 'notice for a custom cake' },
];

export function StoryPreview() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24" aria-labelledby="story-title">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="relative">
          <Image
            src="/products/about-craft.webp"
            alt="Cookies cooling in a lined basket on the Locket counter"
            width={900}
            height={1120}
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="w-full object-cover"
            style={{ borderRadius: 'var(--radius-card)', border: '1.5px solid var(--border)' }}
          />
          <Image
            src="/brand/locket-badge.png"
            alt=""
            aria-hidden
            width={150}
            height={150}
            className="absolute -bottom-7 -right-4 h-[118px] w-[118px] object-contain drop-shadow-lg lg:-right-10 lg:h-[150px] lg:w-[150px]"
          />
        </div>

        <div>
          <h2 id="story-title" className="display text-[36px] sm:text-[48px]" style={{ color: 'var(--brand-strong)' }}>
            A small kitchen that bakes to order
          </h2>
          <div className="mt-5 space-y-4 text-[16px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            <p>
              Locket started as a weekend cookie table and turned into a shopfront on Lopez Jaena
              Street. We still bake in small trays, which is why some things sell out by the afternoon.
            </p>
            <p>
              Everything is made the morning you collect it. That is the whole reason we cap how many
              orders each time slot can take.
            </p>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.label} className="card p-4">
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <span className="display block text-[34px] leading-none" style={{ color: 'var(--brand-strong)' }}>
                    {f.value}
                  </span>
                  <span className="mt-1.5 block text-[13px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                    {f.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <Link href="/about" className="btn btn-outline mt-8 h-12 px-6 text-sm">
            More about the shop
          </Link>
        </div>
      </div>
    </section>
  );
}
