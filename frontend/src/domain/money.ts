/**
 * Money is stored as integer centavos throughout the app. Floats are never used
 * for money: 0.1 + 0.2 !== 0.3 in IEEE-754, and that error compounds across a
 * cart of line items into off-by-one-centavo totals.
 */

export type Centavos = number;

const FORMATTER = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
});

export function peso(centavos: Centavos): string {
  return FORMATTER.format(centavos / 100);
}

/** Rounds half-up, matching how a cashier rounds a receipt. */
export function percentOf(centavos: Centavos, percent: number): Centavos {
  return Math.round((centavos * percent) / 100);
}

export function sum(values: readonly Centavos[]): Centavos {
  return values.reduce((a, b) => a + b, 0);
}
