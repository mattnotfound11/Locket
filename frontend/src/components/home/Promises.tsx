import { Alarm, PaintBrushHousehold, MopedFront } from '@phosphor-icons/react/dist/ssr';

const PROMISES = [
  {
    icon: Alarm,
    accent: 'var(--color-butter)',
    title: 'Baked the same morning',
    body: 'Order before 2pm and it is ready the same day. Nothing on our counter was baked yesterday.',
  },
  {
    icon: PaintBrushHousehold,
    accent: 'var(--color-lilac)',
    title: 'Made to your brief',
    body: 'Send a reference photo, your flavours and your date. We quote within one working day.',
  },
  {
    icon: MopedFront,
    accent: 'var(--color-mint)',
    title: 'Delivered across Iloilo City',
    body: 'All seven districts, plus campus drops at San Agustin and St. Paul. Pick an hour that suits you.',
  },
];

export function Promises() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:pb-24" aria-label="Why order from Locket">
      <div className="grid gap-5 md:grid-cols-3">
        {PROMISES.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="card p-6 lg:p-7"
              style={{ marginTop: i === 1 ? undefined : 0, transform: i === 1 ? 'translateY(18px)' : undefined }}
            >
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: p.accent, color: '#4a2e1e' }}
              >
                <Icon size={24} weight="fill" aria-hidden />
              </span>
              <h3 className="display text-[22px]" style={{ color: 'var(--brand-strong)' }}>{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{p.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
