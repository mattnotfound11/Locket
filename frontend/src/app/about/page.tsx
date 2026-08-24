import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Leaf, Timer, Users } from '@phosphor-icons/react/dist/ssr';
import { PageIntro } from '@/components/layout/PageIntro';
import { STORE } from '@/config/store';

export const metadata: Metadata = {
  title: 'About',
  description:
    `How ${STORE.name} works: a small kitchen in ${STORE.address.city} that bakes to order, ` +
    'caps its collection windows, and labels every allergen on the menu.',
};

const VALUES = [
  { icon: Timer, title: 'Nothing sits overnight', body: 'We bake to the orders on the board. What does not sell goes to the team, not back in the case tomorrow.' },
  { icon: Leaf, title: 'Ingredients we can name', body: 'Real butter, real ube from Quezon, no shortening in the buttercream. The ingredient lists are on the menu.' },
  { icon: Users, title: 'Windows we can keep', body: 'Each collection hour has a hard cap. When it is full it is full, because a promised time should mean something.' },
  { icon: Heart, title: 'Allergens taken seriously', body: 'Every item declares its allergens. Tell us what to avoid on a custom order and we will say yes or say no honestly.' },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About"
        title="The shop on Sampaguita Street"
        lede={`${STORE.tagline}. What began as a weekend cookie table now runs as a small kitchen with a shopfront, a delivery bike and a very full Saturday.`}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="space-y-5 text-[16.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            <p className="text-[19px] font-bold" style={{ color: 'var(--ink)' }}>
              We opened because a cookie tray kept running out.
            </p>
            <p>
              Locket began at a weekend market stall with one recipe and a folding table. The tray
              would be empty by eleven, which is a nice problem until it happens every week and you
              start turning people away.
            </p>
            <p>
              The shop on Sampaguita Street opened so we could bake through the day instead of once
              before dawn. The kitchen is still small on purpose. Every batch is mixed, portioned and
              baked in trays that fit our ovens, which is the honest reason some things carry a sold
              out flag by mid afternoon.
            </p>
            <p>
              Custom work grew out of the same thing. People kept asking for the birthday version of
              something on the counter, so we built a proper brief form for it: the occasion, the
              date, how many it feeds, the flavours, and a photo of what you have in mind.
            </p>
          </div>

          <Image
            src="/products/about-counter.webp"
            alt="Rows of mini fruit tartlets arranged on the counter"
            width={1280}
            height={860}
            sizes="(max-width: 1024px) 100vw, 42vw"
            className="w-full object-cover"
            style={{ borderRadius: 'var(--radius-card)', border: '1.5px solid var(--border)' }}
          />
        </div>
      </section>

      <section
        className="py-16 lg:py-24"
        style={{ background: 'var(--bg-alt)', borderTop: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)' }}
        aria-labelledby="values-title"
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <h2 id="values-title" className="display max-w-[16ch] text-[36px] sm:text-[46px]" style={{ color: 'var(--brand-strong)' }}>
            Four things we will not bend on
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="flex gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
                  >
                    <Icon size={23} weight="fill" aria-hidden />
                  </span>
                  <div>
                    <h3 className="display text-[21px]" style={{ color: 'var(--ink)' }}>{v.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{v.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6 lg:py-24">
        <Image
          src="/brand/locket-storefront.png"
          alt={`The ${STORE.name} shopfront`}
          width={520}
          height={506}
          sizes="(max-width: 640px) 80vw, 420px"
          className="mx-auto mb-8 h-auto w-[280px] sm:w-[420px]"
        />
        <h2 className="display mx-auto max-w-[20ch] text-[32px] sm:text-[42px]" style={{ color: 'var(--brand-strong)' }}>
          Come by, or let us bring it to you
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn btn-primary px-7 text-sm" style={{ height: 52 }}>See the menu</Link>
          <Link href="/contact" className="btn btn-outline px-7 text-sm" style={{ height: 52 }}>Find the shop</Link>
        </div>
      </section>
    </>
  );
}
