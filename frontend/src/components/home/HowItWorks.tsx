import { BowlFood, CalendarCheck, CreditCard, HandHeart } from '@phosphor-icons/react/dist/ssr';

const STEPS = [
  { icon: BowlFood, title: 'Fill your basket', body: 'Browse the menu by category. Allergens are on every card.' },
  { icon: CalendarCheck, title: 'Pick a window', body: 'Choose pickup or delivery, then an hour. Full windows are shown as full.' },
  { icon: CreditCard, title: 'Pay your way', body: 'GCash, Maya, card, or cash when you collect. One page, no account needed.' },
  { icon: HandHeart, title: 'Collect it warm', body: 'We box it just before your window opens, not the night before.' },
];

export function HowItWorks() {
  return (
    <section
      className="py-16 lg:py-24"
      style={{ background: 'var(--bg-alt)', borderTop: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)' }}
      aria-labelledby="how-title"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <h2 id="how-title" className="display max-w-[18ch] text-[36px] sm:text-[48px]" style={{ color: 'var(--brand-strong)' }}>
          Ordering takes about a minute
        </h2>

        <ol className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="relative pl-16">
                <span
                  className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
                >
                  <Icon size={23} weight="fill" aria-hidden />
                </span>
                <h3 className="display text-[20px]" style={{ color: 'var(--ink)' }}>{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
