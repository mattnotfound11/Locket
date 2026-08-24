import type { Centavos } from '../money';

export type CategoryId = 'cookies' | 'cupcakes' | 'cakes' | 'tarts-pies' | 'chilled';

export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly blurb: string;
  /** Token name from the pastel accent set, used for the category chip. */
  readonly accent: 'butter' | 'mint' | 'lilac' | 'sky' | 'pink';
}

/**
 * The nine Philippine FDA / Codex major allergens we declare. Every product
 * carries an explicit list, so "no allergens" is a deliberate empty array
 * rather than missing data.
 */
export type Allergen =
  | 'gluten' | 'dairy' | 'eggs' | 'tree-nuts' | 'peanuts'
  | 'soy' | 'sesame' | 'sulphites' | 'coconut';

export const ALLERGEN_LABELS: Readonly<Record<Allergen, string>> = {
  gluten: 'Gluten', dairy: 'Dairy', eggs: 'Eggs', 'tree-nuts': 'Tree nuts',
  peanuts: 'Peanuts', soy: 'Soy', sesame: 'Sesame', sulphites: 'Sulphites',
  coconut: 'Coconut',
};

export type DietaryTag =
  | 'vegetarian' | 'vegan' | 'gluten-free' | 'nut-free' | 'eggless' | 'contains-alcohol';

export const DIETARY_LABELS: Readonly<Record<DietaryTag, string>> = {
  vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten free',
  'nut-free': 'Nut free', eggless: 'Eggless', 'contains-alcohol': 'Contains alcohol',
};

/** Per-serving panel, required for anything sold sealed and shelf-stable. */
export interface NutritionPanel {
  readonly servingSize: string;
  readonly servingsPerPack: number;
  readonly calories: number;
  readonly fatG: number;
  readonly saturatedFatG: number;
  readonly carbsG: number;
  readonly sugarsG: number;
  readonly proteinG: number;
  readonly sodiumMg: number;
  readonly ingredients: string;
  readonly shelfLife: string;
}

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly category: CategoryId;
  readonly price: Centavos;
  readonly unit: string;
  readonly description: string;
  readonly image: string;
  readonly allergens: readonly Allergen[];
  readonly dietary: readonly DietaryTag[];
  /** Sealed retail items carry a full panel; counter items do not. */
  readonly prepacked?: NutritionPanel;
  readonly soldOut?: boolean;
  /** Bakes needing more than same-day notice, in whole days. */
  readonly leadTimeDays?: number;
  readonly bestseller?: boolean;
}
