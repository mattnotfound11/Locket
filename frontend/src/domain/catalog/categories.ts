import type { Category, CategoryId } from './types';

export const CATEGORIES: readonly Category[] = [
  { id: 'cookies', name: 'Cookies', blurb: 'The reason we opened. Baked in small trays, all day.', accent: 'butter' },
  { id: 'cupcakes', name: 'Cupcakes', blurb: 'Buttercream piped to order, never the day before.', accent: 'pink' },
  { id: 'cakes', name: 'Cakes', blurb: 'By the slice, or whole with two days notice.', accent: 'lilac' },
  { id: 'tarts-pies', name: 'Tarts & Pies', blurb: 'Butter pastry, blind-baked every morning.', accent: 'mint' },
  { id: 'chilled', name: 'Chilled & Treats', blurb: 'Cold cases, spoons required.', accent: 'sky' },
];

export const CATEGORY_BY_ID: Readonly<Record<CategoryId, Category>> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;
