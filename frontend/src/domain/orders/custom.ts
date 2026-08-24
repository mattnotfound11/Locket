import { customLeadDaysFor, earliestDateFor } from '../fulfillment/leadtime';
import type { Allergen, DietaryTag } from '../catalog/types';
import type { Centavos } from '../money';

export const OCCASIONS = [
  'Birthday', 'Wedding', 'Anniversary', 'Christening', 'Debut',
  'Corporate', 'Graduation', 'Just because',
] as const;
export type Occasion = (typeof OCCASIONS)[number];

export const FLAVOURS = [
  'Ube macapuno', 'Dark chocolate', 'Vanilla bean', 'Red velvet',
  'Mocha', 'Lemon', 'Carrot', 'Pandan', 'Strawberries and cream',
] as const;
export type Flavour = (typeof FLAVOURS)[number];

export const SERVING_TIERS = [10, 20, 30, 40, 60, 80, 120] as const;

export interface ReferenceImage {
  readonly filename: string;
  readonly contentType: string;
  readonly bytes: number;
  /** Either a hosted URL (blob storage) or an inline data URL in the demo. */
  readonly url: string;
}

export interface CustomOrderRequest {
  readonly ref: string;
  readonly submittedAt: string;
  readonly occasion: Occasion;
  readonly eventDate: string;
  readonly servings: number;
  readonly flavours: readonly Flavour[];
  readonly dietary: readonly DietaryTag[];
  readonly avoidAllergens: readonly Allergen[];
  readonly designNotes: string;
  readonly reference?: ReferenceImage;
  readonly budget?: Centavos;
  readonly customer: { name: string; email: string; phone: string };
  readonly leadDays: number;
  readonly depositDue: Centavos;
  readonly status: 'received' | 'quoted' | 'confirmed';
}

export const MAX_REFERENCE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/** Flat booking fee that comes off the final quote. */
export const CUSTOM_DEPOSIT: Centavos = 100000;

export interface CustomOrderInput {
  occasion: string;
  eventDate: string;
  servings: number;
  flavours: string[];
  dietary: string[];
  avoidAllergens: string[];
  designNotes: string;
  name: string;
  email: string;
  phone: string;
  budget?: number;
}

export type ValidationErrors = Partial<Record<keyof CustomOrderInput | 'reference', string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Philippine mobile numbers: 09xxxxxxxxx, +639xxxxxxxxx, or 639xxxxxxxxx. */
const PH_PHONE = /^(\+?63|0)9\d{9}$/;

export function validateCustomOrder(input: CustomOrderInput, now: Date): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.name?.trim()) errors.name = 'Tell us who the cake is for.';
  if (!EMAIL.test(input.email ?? '')) errors.email = 'We need a working email to send the quote.';
  if (!PH_PHONE.test((input.phone ?? '').replace(/[\s-]/g, ''))) {
    errors.phone = 'Enter a mobile number like 0917 428 3067.';
  }
  if (!input.occasion) errors.occasion = 'Pick the occasion.';

  const servings = Number(input.servings);
  if (!Number.isFinite(servings) || servings < 6) {
    errors.servings = 'Custom cakes start at 6 servings.';
  } else if (servings > 300) {
    errors.servings = 'For more than 300 servings, please call the shop.';
  }

  if (!input.flavours?.length) errors.flavours = 'Choose at least one flavour.';

  if (!input.eventDate) {
    errors.eventDate = 'When do you need it?';
  } else {
    const leadDays = customLeadDaysFor(servings || 0);
    const earliest = earliestDateFor(now, leadDays);
    const chosen = new Date(`${input.eventDate}T00:00:00`);
    if (Number.isNaN(chosen.getTime())) {
      errors.eventDate = 'That date could not be read.';
    } else if (chosen < earliest) {
      errors.eventDate =
        `A cake this size needs ${leadDays} days. The earliest we can take is ` +
        `${earliest.toLocaleDateString('en-PH', { day: 'numeric', month: 'long' })}.`;
    }
  }

  if (!input.designNotes?.trim() || input.designNotes.trim().length < 12) {
    errors.designNotes = 'Describe the design, even roughly. A sentence is enough.';
  }

  return errors;
}
