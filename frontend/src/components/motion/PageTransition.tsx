'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Plays a short enter animation on every route change.
 *
 * React's <ViewTransition> is the nicer tool for this, but it is a canary-only
 * API and is not exported by React 19.2.8, so this uses a keyed remount and a
 * CSS keyframe instead. It works in every browser and costs no bytes.
 *
 * The animation ends on `transform: none` so no containing block is left
 * behind, which would otherwise break `position: fixed` descendants.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
