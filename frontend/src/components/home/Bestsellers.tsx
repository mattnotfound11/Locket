import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { PRODUCTS } from '@/domain/catalog/products';
import { peso } from '@/domain/money';

/** Horizontal scroll-snap rail, so breadth reads without a wall of cards. */
export function Bestsellers() {
  const picks = PRODUCTS.filter((p) => p.bestseller || !p.soldOut).slice(0, 8);

  return (
    <section className="py-16 lg:py-24" aria-labelledby="bestsellers-title" style={{ background: 'var(--bg-alt)' }}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="bestsellers-title" className="display text-[36px] sm:text-[46px]" style={{ color: 'var(--brand-strong)' }}>
              What sells out first
            </h2>
            <p className="mt-2 max-w-[52ch] text-[16px]" style={{ color: 'var(--ink-soft)' }}>
              The trays we refill most. Swipe through, or see the whole menu.
            </p>
          </div>
          <Link href="/products" className="btn btn-outline h-11 px-5 text-sm">
            Full menu <ArrowRight size={15} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:max-w-[1400px]">
        {picks.map((p) => (
          <Link
            key={p.id}
            href="/products"
            className="card group w-[230px] shrink-0 snap-start p-4 text-center transition-transform hover:-translate-y-1"
          >
            <div className="relative mx-auto mb-3 flex h-[140px] w-[140px] items-center justify-center">
              <div className="blob absolute inset-0" aria-hidden />
              <Image
                src={p.image}
                alt={p.name}
                width={280}
                height={280}
                sizes="140px"
                className="relative h-[126px] w-[126px] object-contain"
              />
            </div>
            <h3 className="display text-[17px]" style={{ color: 'var(--brand-strong)' }}>{p.name}</h3>
            <p className="mt-1 text-[15px] font-extrabold" style={{ color: 'var(--ink)' }}>{peso(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
