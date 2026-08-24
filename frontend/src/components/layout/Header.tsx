'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { List, X, ShoppingBag } from '@phosphor-icons/react/dist/ssr';
import { useCart } from '@/lib/cart';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const { totals, hydrated } = useCart();
  // The menu is remembered against the route it was opened on, so navigating
  // closes it without an effect that fights the render.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      className="site-header sticky top-0 z-40 backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 88%, transparent)', borderBottom: '1.5px solid var(--border)' }}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Locket home">
          <Image
            src="/brand/locket-badge.png"
            alt=""
            width={46}
            height={46}
            priority
            className="h-[46px] w-[46px] object-contain"
          />
          <span className="display hidden text-[22px] leading-none sm:block" style={{ color: 'var(--brand-strong)' }}>
            Locket
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="rounded-full px-4 py-2 text-[15px] font-bold transition-colors"
              style={{
                color: isActive(item.href) ? 'var(--brand-ink)' : 'var(--ink-soft)',
                background: isActive(item.href) ? 'var(--brand-strong)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link
            href="/checkout"
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors"
            style={{ border: '1.5px solid var(--border)', color: 'var(--ink)' }}
            aria-label={`Basket, ${hydrated ? totals.itemCount : 0} items`}
          >
            <ShoppingBag size={20} weight="bold" />
            {hydrated && totals.itemCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[21px] min-w-[21px] items-center justify-center rounded-full px-1 text-[11px] font-extrabold tabular-nums"
                style={{ background: 'var(--brand-strong)', color: 'var(--brand-ink)' }}
              >
                {totals.itemCount}
              </span>
            )}
          </Link>

          <Link href="/products" className="btn btn-primary hidden h-11 px-5 text-sm sm:inline-flex">
            Order now
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            style={{ border: '1.5px solid var(--border)', color: 'var(--ink)' }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden" style={{ borderTop: '1.5px solid var(--border)', background: 'var(--bg)' }}>
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className="rounded-full px-4 py-3 text-base font-bold"
                style={{
                  color: isActive(item.href) ? 'var(--brand-ink)' : 'var(--ink)',
                  background: isActive(item.href) ? 'var(--brand-strong)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/custom-orders" className="rounded-full px-4 py-3 text-base font-bold" style={{ color: 'var(--ink)' }}>
              Custom cakes
            </Link>
            <Link href="/products" className="btn btn-primary mt-2 h-12">Order now</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
