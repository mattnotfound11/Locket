/**
 * Single source of truth for everything about the physical business.
 * Address, hours, phone and map all render from here, so updating the shop
 * details in one place updates every page that shows them.
 */

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface FulfilmentHours {
  /** Minutes from midnight. */
  readonly open: number;
  readonly close: number;
}

export const STORE = {
  name: 'Locket',
  tagline: 'Sweet things, made with love',
  descriptor: 'Cookies & More',
  legalName: 'Locket Fine Bakes',

  // TODO: replace with the real shopfront address before launch.
  address: {
    line1: '24 Lopez Jaena Street',
    line2: 'Jaro',
    city: 'Iloilo City',
    region: 'Iloilo',
    postcode: '5000',
    country: 'Philippines',
  },

  phone: '+63 917 428 3067',
  phoneHref: 'tel:+639174283067',
  email: 'hello@locketbakes.ph',

  /**
   * Keyless Google Maps embed. The `output=embed` form needs no API key and no
   * billing account, which keeps the map working on every page without a secret.
   */
  mapQuery: 'Lopez Jaena Street, Jaro, Iloilo City, Iloilo',

  social: {
    facebook: 'https://facebook.com/locketbakes',
    instagram: 'https://instagram.com/locketbakes',
  },
} as const;

/**
 * When we hand over and deliver orders. Locket has no shopfront, so these are
 * NOT walk-in hours and are never shown as such: they exist only to generate
 * the collection and delivery windows the customer picks at checkout.
 *
 * Monday is a day off; we bake Tuesday through Sunday.
 */
export const FULFILMENT_HOURS: Readonly<Record<DayIndex, FulfilmentHours | null>> = {
  0: { open: 10 * 60, close: 18 * 60 }, // Sunday
  1: null, // Monday
  2: { open: 9 * 60, close: 19 * 60 },
  3: { open: 9 * 60, close: 19 * 60 },
  4: { open: 9 * 60, close: 19 * 60 },
  5: { open: 9 * 60, close: 21 * 60 },
  6: { open: 9 * 60, close: 21 * 60 },
};

export function formatMinutes(m: number): string {
  const h24 = Math.floor(m / 60);
  const mins = m % 60;
  const suffix = h24 < 12 ? 'am' : 'pm';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return mins === 0 ? `${h12}${suffix}` : `${h12}:${String(mins).padStart(2, '0')}${suffix}`;
}

export const FULL_ADDRESS =
  `${STORE.address.line1}, ${STORE.address.line2}, ${STORE.address.city}, ` +
  `${STORE.address.region} ${STORE.address.postcode}`;

export const MAP_EMBED_SRC =
  `https://www.google.com/maps?q=${encodeURIComponent(STORE.mapQuery)}&output=embed`;

export const MAP_LINK =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.mapQuery)}`;
