import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Cake } from '@phosphor-icons/react/dist/ssr';
import { STORE } from '@/config/store';
import { ShopMark } from '@/components/layout/ShopMark';

/**
 * Small cut-outs orbit the shopfront illustration rather than the headline, so
 * nothing ever lands on top of the type. Light-background shots only; the dark
 * ones read as heavy discs against the blush field.
 */
const ORBIT = [
  { src: '/products/cotton-candy-swirl.webp', className: '-left-7 top-6 h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28', delay: '0s' },
  { src: '/products/funfetti-cupcake.webp', className: '-right-6 top-28 h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24', delay: '1.6s' },
  { src: '/products/strawberry-cream-cupcake.webp', className: 'bottom-[26%] -left-9 h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24', delay: '2.9s' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(980px 480px at 12% 4%, color-mix(in srgb, var(--brand) 24%, transparent), transparent 60%),' +
            'radial-gradient(720px 420px at 92% 82%, color-mix(in srgb, var(--color-butter) 30%, transparent), transparent 64%)',
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="text-center lg:text-left">
          <h1
            id="hero-title"
            className="display text-[56px] leading-[0.9] sm:text-[78px] lg:text-[92px] xl:text-[104px]"
            style={{ color: 'var(--brand-strong)' }}
          >
            SWEET
            <br />
            THINGS
          </h1>
          <p
            className="mt-1 text-[28px] sm:text-[36px] lg:text-[42px]"
            style={{ fontFamily: 'var(--font-hand)', color: 'var(--ink)' }}
          >
            made with love
          </p>

          <p
            className="mx-auto mt-6 max-w-[46ch] text-[16.5px] leading-relaxed sm:text-[18px] lg:mx-0"
            style={{ color: 'var(--ink-soft)' }}
          >
            Cookies, cupcakes and cakes baked each morning in {STORE.address.city}. Order online and
            pick the hour you want to collect.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link href="/products" className="btn btn-primary px-7 text-[15px]" style={{ height: 52 }}>
              Order now <ArrowRight size={17} weight="bold" aria-hidden />
            </Link>
            <Link href="/custom-orders" className="btn btn-outline px-7 text-[15px]" style={{ height: 52 }}>
              <Cake size={17} weight="fill" aria-hidden /> Custom cakes
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px]">
          <ShopMark
            width={520}
            priority
            sizes="(max-width: 1024px) 90vw, 520px"
            className="relative z-10"
          />

          {ORBIT.map((o) => (
            <Image
              key={o.src}
              src={o.src}
              alt=""
              aria-hidden
              width={220}
              height={220}
              sizes="112px"
              className={`float-slow pointer-events-none absolute z-20 hidden rounded-full object-cover shadow-lg sm:block ${o.className}`}
              style={{ animationDelay: o.delay }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
