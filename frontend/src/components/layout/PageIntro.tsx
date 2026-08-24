import type { ReactNode } from 'react';

/**
 * Shared masthead for the inner pages. Keeps the eyebrow, title and lede in one
 * rhythm so the pages read as one site rather than five separate builds.
 */
export function PageIntro({
  eyebrow, title, lede, children,
}: { eyebrow?: string; title: string; lede: string; children?: ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-alt)', borderBottom: '1.5px solid var(--border)' }}>
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        <div className="max-w-[62ch]">
          {eyebrow && (
            <p className="mb-3 text-[13px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--brand)' }}>
              {eyebrow}
            </p>
          )}
          <h1 className="display text-[42px] sm:text-[58px] lg:text-[68px]" style={{ color: 'var(--brand-strong)' }}>
            {title}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            {lede}
          </p>
          {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
