import { Warning } from '@phosphor-icons/react/dist/ssr';
import { ALLERGEN_LABELS, DIETARY_LABELS, type Allergen, type DietaryTag } from '@/domain/catalog/types';

export function DietaryBadges({ dietary }: { dietary: readonly DietaryTag[] }) {
  if (dietary.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Dietary suitability">
      {dietary.map((d) => (
        <li
          key={d}
          className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
          style={{
            background: 'color-mix(in srgb, var(--ok) 14%, transparent)',
            color: 'var(--ok)',
          }}
        >
          {DIETARY_LABELS[d]}
        </li>
      ))}
    </ul>
  );
}

/**
 * Allergens are stated as a sentence rather than icons. Icon-only allergen
 * labelling is guesswork for the person who most needs to read it.
 */
export function AllergenLine({ allergens }: { allergens: readonly Allergen[] }) {
  return (
    <p
      className="flex items-start gap-1.5 text-[12.5px] leading-snug"
      style={{ color: 'var(--ink-muted)' }}
    >
      <Warning size={14} weight="fill" className="mt-[2px] shrink-0" aria-hidden />
      <span>
        <span className="sr-only">Allergen information: </span>
        {allergens.length === 0
          ? 'No declared major allergens. Made in a kitchen that handles gluten, dairy, eggs and nuts.'
          : `Contains ${allergens.map((a) => ALLERGEN_LABELS[a].toLowerCase()).join(', ')}. Made in a kitchen that handles gluten, dairy, eggs and nuts.`}
      </span>
    </p>
  );
}
