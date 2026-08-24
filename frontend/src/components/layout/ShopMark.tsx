import Image from 'next/image';
import { Heart } from '@phosphor-icons/react/dist/ssr';
import { STORE } from '@/config/store';

/**
 * Shopfront illustration plus its strapline.
 *
 * The strapline used to be baked into the PNG in dark cocoa, which disappeared
 * against the dark theme's background. It is real text now, so it takes theme
 * tokens, stays crisp at any size, and can be read by a screen reader.
 */
export function ShopMark({
  width, className = '', priority = false, sizes = '520px', showCaption = true,
}: {
  width: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  showCaption?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Image
        src="/brand/locket-shop.png"
        alt={`The ${STORE.name} shopfront, hung with a pastel awning`}
        width={1078}
        height={920}
        priority={priority}
        sizes={sizes}
        className="h-auto w-full object-contain drop-shadow-xl"
        style={{ maxWidth: width }}
      />

      {showCaption && (
        <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
          <p
            className="flex items-center gap-2.5 text-[12px] font-extrabold uppercase tracking-[0.22em] sm:text-[13px]"
            style={{ color: 'var(--ink)' }}
          >
            <Heart size={13} weight="fill" aria-hidden style={{ color: 'var(--brand)' }} />
            {STORE.tagline}
            <Heart size={13} weight="fill" aria-hidden style={{ color: 'var(--brand)' }} />
          </p>
          <p
            className="flex items-center gap-2.5 text-[13px] font-extrabold uppercase tracking-[0.26em] sm:text-[15px]"
            style={{ color: 'var(--brand-strong)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-mint)' }} aria-hidden />
            {STORE.descriptor}
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-mint)' }} aria-hidden />
          </p>
        </div>
      )}
    </div>
  );
}
