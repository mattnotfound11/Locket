import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { CUSTOM_ORDER_LEAD_DAYS } from '@/domain/fulfillment/leadtime';
import { CUSTOM_DEPOSIT } from '@/domain/orders/custom';
import { peso } from '@/domain/money';
import { Reveal } from '@/components/motion/Reveal';

export function CustomCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24" aria-labelledby="custom-title">
      <Reveal
        variant="scale"
        className="relative grid items-center gap-8 overflow-hidden p-7 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:p-14"
        style={{ background: 'var(--brand-strong)', borderRadius: 'var(--radius-card)' }}
      >
        <div>
          <h2
            id="custom-title"
            className="display text-[38px] leading-[0.95] sm:text-[52px]"
            style={{ color: 'var(--brand-ink)' }}
          >
            Wedding? Birthday?<br />Send us the photo.
          </h2>
          <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed" style={{ color: 'var(--brand-ink)', opacity: 0.92 }}>
            Tell us the occasion, the date and how many people it needs to feed. Upload a reference
            image and we will quote it within one working day.
          </p>

          <ul className="mt-6 space-y-2 text-[15px] font-semibold" style={{ color: 'var(--brand-ink)', opacity: 0.92 }}>
            <li>{CUSTOM_ORDER_LEAD_DAYS} days notice for most cakes, 10 for the large ones</li>
            <li>{peso(CUSTOM_DEPOSIT)} booking deposit, taken off the final quote</li>
            <li>Dietary needs and allergens handled at the brief stage</li>
          </ul>

          <Link
            href="/custom-orders"
            className="btn mt-8 h-13 px-7 text-[15px]"
            style={{ background: 'var(--brand-ink)', color: 'var(--brand-strong)', height: 52 }}
          >
            Start a custom order <ArrowRight size={17} weight="bold" aria-hidden />
          </Link>
        </div>

        <div className="relative">
          <Image
            src="/products/celebration.webp"
            alt="A tall confetti celebration cake finished with sprinkles"
            width={900}
            height={1180}
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="w-full object-cover"
            style={{ borderRadius: 'var(--radius-card)' }}
          />
        </div>
      </Reveal>
    </section>
  );
}
