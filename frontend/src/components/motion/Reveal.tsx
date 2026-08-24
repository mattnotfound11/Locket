'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * Reveals its children when they scroll into view.
 *
 * Uses one shared IntersectionObserver rather than a scroll listener: scroll
 * handlers run on every frame and are the usual cause of janky reveal effects.
 * Only opacity and transform are animated, so the whole thing stays on the
 * compositor.
 *
 * Elements are unobserved once shown, so scrolling back up does not replay the
 * animation, and the observer set stays small on long pages.
 */

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-reveal', 'shown');
          observer?.unobserve(entry.target);
        }
      },
      // Fire slightly before the element is fully on screen so the motion has
      // finished by the time the reader's eye arrives.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
  }
  return observer;
}

export type RevealVariant = 'up' | 'fade' | 'scale' | 'left' | 'right';

export function Reveal({
  children,
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  /** Milliseconds. Used to stagger siblings. */
  delay?: number;
  className?: string;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: show immediately and never animate.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('data-reveal', 'shown');
      return;
    }

    const io = getObserver();
    if (!io) {
      el.setAttribute('data-reveal', 'shown');
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal="hidden"
      data-reveal-variant={variant}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Convenience wrapper that staggers a list of children. */
export function RevealGroup({
  children, step = 70, variant = 'up', className = '', childClassName = '',
}: {
  children: ReactNode[];
  step?: number;
  variant?: RevealVariant;
  className?: string;
  childClassName?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} variant={variant} delay={i * step} className={childClassName}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
