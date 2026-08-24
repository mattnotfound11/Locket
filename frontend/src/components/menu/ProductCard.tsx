'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Check, Clock, Star } from '@phosphor-icons/react/dist/ssr';
import type { Product } from '@/domain/catalog/types';
import { peso } from '@/domain/money';
import { leadTimeMessage } from '@/domain/fulfillment/leadtime';
import { useCart } from '@/lib/cart';
import { AllergenLine, DietaryBadges } from './DietaryBadges';
import { NutritionDisclosure } from './NutritionDisclosure';
import { QuantityStepper } from './QuantityStepper';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = Boolean(product.soldOut);

  // Filtering the menu unmounts cards mid-timer, so the handle is kept and
  // cleared rather than left to fire against a gone component.
  const resetTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const handleAdd = () => {
    add(product.id, qty);
    setJustAdded(true);
    setQty(1);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setJustAdded(false), 1900);
  };

  return (
    <article
      className="card relative flex flex-col overflow-hidden p-5"
      aria-labelledby={`p-${product.id}`}
    >
      {product.bestseller && !soldOut && (
        <span
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold"
          style={{ background: 'var(--color-butter)', color: '#5a3d0c' }}
        >
          <Star size={12} weight="fill" aria-hidden /> Bestseller
        </span>
      )}

      <div className="relative mx-auto mb-4 flex h-[168px] w-[168px] items-center justify-center">
        <div className="blob absolute inset-0" aria-hidden />
        <Image
          src={product.image}
          alt={product.name}
          width={320}
          height={320}
          priority={priority}
          sizes="168px"
          className="relative h-[152px] w-[152px] object-contain drop-shadow-sm"
          style={{ filter: soldOut ? 'grayscale(0.85) opacity(0.55)' : undefined }}
        />
        {soldOut && (
          <span
            className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-full py-1.5 text-center text-[12px] font-extrabold uppercase tracking-wide"
            style={{ background: 'var(--ink)', color: 'var(--surface)' }}
          >
            Sold out today
          </span>
        )}
      </div>

      <h3 id={`p-${product.id}`} className="display text-[21px]" style={{ color: 'var(--brand-strong)' }}>
        {product.name}
      </h3>
      <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
        {product.description}
      </p>

      <div className="mt-3 space-y-2">
        <DietaryBadges dietary={product.dietary} />
        <AllergenLine allergens={product.allergens} />
      </div>

      {product.leadTimeDays ? (
        <p
          className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[12px] font-bold"
          style={{ background: 'var(--surface-2)', color: 'var(--warn)' }}
        >
          <Clock size={13} weight="fill" aria-hidden /> {leadTimeMessage(product.leadTimeDays)}
        </p>
      ) : null}

      {product.prepacked && <div className="mt-3"><NutritionDisclosure panel={product.prepacked} name={product.name} /></div>}

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3 pt-4" style={{ borderTop: '1.5px dashed var(--border)' }}>
        <div>
          <p className="display text-[24px]" style={{ color: 'var(--ink)' }}>{peso(product.price)}</p>
          <p className="text-[12px]" style={{ color: 'var(--ink-muted)' }}>{product.unit}</p>
        </div>

        {soldOut ? (
          <p className="text-[13px] font-bold" style={{ color: 'var(--ink-muted)' }}>
            Back tomorrow morning
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <QuantityStepper value={qty} onChange={setQty} label={product.name} compact />
            <button
              type="button"
              onClick={handleAdd}
              className="btn btn-primary h-10 px-4 text-[13px]"
            >
              {justAdded ? (<><Check size={15} weight="bold" aria-hidden /> Added</>) : 'Add to basket'}
            </button>
          </div>
        )}
      </div>

      <span aria-live="polite" className="sr-only">
        {justAdded ? `${product.name} added to your basket.` : ''}
      </span>
    </article>
  );
}
