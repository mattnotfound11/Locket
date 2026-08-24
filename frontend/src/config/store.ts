/**
 * Single source of truth for everything about the physical business.
 * Address, hours, phone and map all render from here, so updating the shop
 * details in one place updates every page that shows them.
 */

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningHours {
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

/** Monday is closed; the shop bakes fresh Tuesday through Sunday. */
export const HOURS: Readonly<Record<DayIndex, OpeningHours | null>> = {
  0: { open: 10 * 60, close: 18 * 60 }, // Sunday
  1: null, // Monday
  2: { open: 9 * 60, close: 19 * 60 },
  3: { open: 9 * 60, close: 19 * 60 },
  4: { open: 9 * 60, close: 19 * 60 },
  5: { open: 9 * 60, close: 21 * 60 },
  6: { open: 9 * 60, close: 21 * 60 },
};

export const DAY_NAMES: Readonly<Record<DayIndex, string>> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday',
};

export function formatMinutes(m: number): string {
  const h24 = Math.floor(m / 60);
  const mins = m % 60;
  const suffix = h24 < 12 ? 'am' : 'pm';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return mins === 0 ? `${h12}${suffix}` : `${h12}:${String(mins).padStart(2, '0')}${suffix}`;
}

/** Groups consecutive days sharing the same hours, so the footer reads "Tue - Thu 9am - 7pm". */
export function summarisedHours(): { days: string; hours: string }[] {
  const order: DayIndex[] = [1, 2, 3, 4, 5, 6, 0];
  const rows: { days: string; hours: string }[] = [];
  let run: DayIndex[] = [];

  const label = (h: OpeningHours | null) =>
    h ? `${formatMinutes(h.open)} - ${formatMinutes(h.close)}` : 'Closed';

  const flush = () => {
    if (run.length === 0) return;
    const first = DAY_NAMES[run[0]].slice(0, 3);
    const last = DAY_NAMES[run[run.length - 1]].slice(0, 3);
    rows.push({
      days: run.length === 1 ? first : `${first} - ${last}`,
      hours: label(HOURS[run[0]]),
    });
    run = [];
  };

  for (const d of order) {
    if (run.length && label(HOURS[run[0]]) !== label(HOURS[d])) flush();
    run.push(d);
  }
  flush();
  return rows;
}

export function isOpenAt(date: Date): boolean {
  const h = HOURS[date.getDay() as DayIndex];
  if (!h) return false;
  const m = date.getHours() * 60 + date.getMinutes();
  return m >= h.open && m < h.close;
}

export const FULL_ADDRESS =
  `${STORE.address.line1}, ${STORE.address.line2}, ${STORE.address.city}, ` +
  `${STORE.address.region} ${STORE.address.postcode}`;

export const MAP_EMBED_SRC =
  `https://www.google.com/maps?q=${encodeURIComponent(STORE.mapQuery)}&output=embed`;

export const MAP_LINK =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.mapQuery)}`;
