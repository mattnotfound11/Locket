'use client';

import { useMemo, useState } from 'react';
import { FunnelSimple, MagnifyingGlass, X } from '@phosphor-icons/react/dist/ssr';
import { PRODUCTS } from '@/domain/catalog/products';
import { CATEGORIES } from '@/domain/catalog/categories';
import { ALLERGEN_LABELS, type Allergen, type CategoryId } from '@/domain/catalog/types';
import { ProductCard } from './ProductCard';

const FILTERABLE_ALLERGENS: Allergen[] = ['gluten', 'dairy', 'eggs', 'tree-nuts', 'peanuts', 'soy'];

export function MenuBrowser() {
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [avoid, setAvoid] = useState<Allergen[]>([]);
  const [hideSoldOut, setHideSoldOut] = useState(false);
  const [query, setQuery] = useState('');

  const toggleAvoid = (a: Allergen) =>
    setAvoid((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (hideSoldOut && p.soldOut) return false;
      if (avoid.some((a) => p.allergens.includes(a))) return false;
      if (q && !`${p.name} ${p.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, avoid, hideSoldOut, query]);

  const grouped = useMemo(() => {
    return CATEGORIES
      .map((c) => ({ category: c, items: visible.filter((p) => p.category === c.id) }))
      .filter((g) => g.items.length > 0);
  }, [visible]);

  const filtersActive = avoid.length > 0 || hideSoldOut || query.trim() !== '' || category !== 'all';

  const clearAll = () => {
    setCategory('all'); setAvoid([]); setHideSoldOut(false); setQuery('');
  };

  return (
    <>
      <div className="card mb-10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={18}
              weight="bold"
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--ink-muted)' }}
            />
            <label htmlFor="menu-search" className="sr-only">Search the menu</label>
            <input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for ube, brownie, tart..."
              className="field pl-10"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-bold" style={{ color: 'var(--ink)' }}>
            <input
              type="checkbox"
              checked={hideSoldOut}
              onChange={(e) => setHideSoldOut(e.target.checked)}
              className="h-[18px] w-[18px] accent-[var(--brand-strong)]"
            />
            Only what is available now
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            Everything
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.name}
            </FilterChip>
          ))}
        </div>

        <div className="mt-5 pt-5" style={{ borderTop: '1.5px dashed var(--border)' }}>
          <p className="mb-2.5 flex items-center gap-2 text-[13px] font-extrabold" style={{ color: 'var(--ink)' }}>
            <FunnelSimple size={15} weight="bold" aria-hidden />
            Hide anything containing
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Hide items containing these allergens">
            {FILTERABLE_ALLERGENS.map((a) => (
              <FilterChip key={a} active={avoid.includes(a)} onClick={() => toggleAvoid(a)}>
                {ALLERGEN_LABELS[a]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-[13.5px]" style={{ color: 'var(--ink-soft)' }} aria-live="polite">
            Showing <strong style={{ color: 'var(--ink)' }}>{visible.length}</strong> of {PRODUCTS.length} items
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold underline underline-offset-4"
              style={{ color: 'var(--brand-strong)' }}
            >
              <X size={13} weight="bold" aria-hidden /> Clear filters
            </button>
          )}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="display mb-2 text-[26px]" style={{ color: 'var(--brand-strong)' }}>
            Nothing matches that
          </p>
          <p className="mx-auto mb-6 max-w-[42ch] text-[15px]" style={{ color: 'var(--ink-soft)' }}>
            Try removing an allergen filter, or search for something else. If you need a bake we do not
            list, we can make it to order.
          </p>
          <button type="button" onClick={clearAll} className="btn btn-outline h-11 px-6 text-sm">
            Reset the menu
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {grouped.map(({ category: c, items }, groupIndex) => (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id={`cat-${c.id}`} className="display text-[30px] sm:text-[34px]" style={{ color: 'var(--brand-strong)' }}>
                    {c.name}
                  </h2>
                  <p className="mt-1 text-[15px]" style={{ color: 'var(--ink-soft)' }}>{c.blurb}</p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-[12.5px] font-extrabold"
                  style={{ background: `var(--color-${c.accent})`, color: '#4a2e1e' }}
                >
                  {items.length} item{items.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={groupIndex === 0 && i < 3} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full px-3.5 py-1.5 text-[13.5px] font-bold transition-colors"
      style={{
        background: active ? 'var(--brand-strong)' : 'var(--surface)',
        color: active ? 'var(--brand-ink)' : 'var(--ink-soft)',
        border: `1.5px solid ${active ? 'var(--brand-strong)' : 'var(--border)'}`,
      }}
    >
      {children}
    </button>
  );
}
