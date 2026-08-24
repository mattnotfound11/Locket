'use client';

import { useState } from 'react';
import { CaretDown, Package } from '@phosphor-icons/react/dist/ssr';
import type { NutritionPanel } from '@/domain/catalog/types';

const ROWS: { key: keyof NutritionPanel; label: string; unit: string }[] = [
  { key: 'calories', label: 'Energy', unit: 'kcal' },
  { key: 'fatG', label: 'Total fat', unit: 'g' },
  { key: 'saturatedFatG', label: 'Saturated fat', unit: 'g' },
  { key: 'carbsG', label: 'Carbohydrate', unit: 'g' },
  { key: 'sugarsG', label: 'of which sugars', unit: 'g' },
  { key: 'proteinG', label: 'Protein', unit: 'g' },
  { key: 'sodiumMg', label: 'Sodium', unit: 'mg' },
];

/** Sealed retail items carry a full panel, so it lives with the product. */
export function NutritionDisclosure({ panel, name }: { panel: NutritionPanel; name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderTop: '1.5px dashed var(--border)' }} className="pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-[13px] font-extrabold"
        style={{ color: 'var(--brand-strong)' }}
      >
        <Package size={16} weight="fill" aria-hidden />
        Nutrition and ingredients
        <CaretDown
          size={14}
          weight="bold"
          aria-hidden
          className="ml-auto transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="mt-3 text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
          <p className="mb-2 font-bold" style={{ color: 'var(--ink)' }}>
            Per {panel.servingSize} · {panel.servingsPerPack} serving{panel.servingsPerPack === 1 ? '' : 's'} per pack
          </p>
          <table className="w-full">
            <caption className="sr-only">Nutrition information for {name}</caption>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.key} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  <th scope="row" className="py-1.5 text-left font-semibold">{r.label}</th>
                  <td className="py-1.5 text-right tabular-nums">
                    {panel[r.key] as number} {r.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3"><span className="font-bold" style={{ color: 'var(--ink)' }}>Ingredients: </span>{panel.ingredients}</p>
          <p className="mt-2"><span className="font-bold" style={{ color: 'var(--ink)' }}>Storage: </span>{panel.shelfLife}</p>
        </div>
      )}
    </div>
  );
}
