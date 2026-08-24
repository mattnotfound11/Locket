/**
 * Locket delivers inside Iloilo City only, plus scheduled drop-offs at a small
 * number of school campuses. Anywhere else is pickup or nothing.
 *
 * This is enforced, not just described: checkout makes the customer pick a zone
 * and the order route re-checks it, so a delivery to Bacolod cannot be booked by
 * typing it into the address box.
 */

export type ZoneKind = 'district' | 'campus';

export interface DeliveryZone {
  readonly id: string;
  readonly name: string;
  readonly kind: ZoneKind;
  /** Shown under the selector to set expectations about the drop. */
  readonly note?: string;
}

/** The seven districts that make up Iloilo City. */
export const CITY_DISTRICTS: readonly DeliveryZone[] = [
  { id: 'city-proper', name: 'City Proper', kind: 'district' },
  { id: 'jaro', name: 'Jaro', kind: 'district' },
  { id: 'la-paz', name: 'La Paz', kind: 'district' },
  { id: 'mandurriao', name: 'Mandurriao', kind: 'district' },
  { id: 'molo', name: 'Molo', kind: 'district' },
  { id: 'arevalo', name: 'Arevalo (Villa)', kind: 'district' },
  { id: 'lapuz', name: 'Lapuz', kind: 'district' },
];

/**
 * Campus drops go to one agreed meeting point rather than a room number, so the
 * rider is not walking a building looking for someone.
 */
export const CAMPUS_ZONES: readonly DeliveryZone[] = [
  {
    id: 'usa-iloilo',
    name: 'University of San Agustin',
    kind: 'campus',
    note: 'Handed over at the General Luna Street gate. Bring a student or staff ID.',
  },
  {
    id: 'spu-iloilo',
    name: 'St. Paul University Iloilo',
    kind: 'campus',
    note: 'Handed over at the main gate lobby. Bring a student or staff ID.',
  },
];

export const DELIVERY_ZONES: readonly DeliveryZone[] = [...CITY_DISTRICTS, ...CAMPUS_ZONES];

/**
 * Null-prototype map. A plain object literal inherits from Object.prototype, so
 * `'toString' in map` is true and an inherited key would pass the area check.
 */
export const ZONE_BY_ID: Readonly<Record<string, DeliveryZone>> = Object.assign(
  Object.create(null) as Record<string, DeliveryZone>,
  Object.fromEntries(DELIVERY_ZONES.map((z) => [z.id, z])),
);

export function isServiceableZone(id: string | undefined | null): boolean {
  return typeof id === 'string' && Object.hasOwn(ZONE_BY_ID, id);
}

export function zoneLabel(id: string): string {
  if (!isServiceableZone(id)) return 'Unknown area';
  const z = ZONE_BY_ID[id];
  return z.kind === 'campus' ? z.name : `${z.name}, Iloilo City`;
}

export const OUT_OF_AREA_MESSAGE =
  'We only deliver inside Iloilo City and to the campuses listed. ' +
  'For anywhere else, choose pickup or call the shop and we will work something out.';
