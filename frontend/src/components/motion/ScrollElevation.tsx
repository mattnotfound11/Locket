'use client';

import { useEffect } from 'react';

/**
 * Marks the document once the page has scrolled past the header, so the sticky
 * bar can gain a border and shadow and separate itself from the content.
 *
 * Watches a zero-height sentinel with IntersectionObserver rather than
 * listening to scroll, which would fire on every frame.
 */
export function ScrollElevation() {
  useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.toggleAttribute('data-scrolled', !entry.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  return null;
}
