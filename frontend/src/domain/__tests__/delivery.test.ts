import { describe, it, expect } from 'vitest';
import {
  DELIVERY_ZONES, CITY_DISTRICTS, CAMPUS_ZONES, ZONE_BY_ID,
  isServiceableZone, zoneLabel,
} from '@/domain/fulfillment/delivery';
import { STORE } from '@/config/store';

describe('the shop is in Iloilo City', () => {
  it('is registered in Iloilo City, not Metro Manila', () => {
    expect(STORE.address.city).toBe('Iloilo City');
    expect(STORE.address.region).toBe('Iloilo');
    expect(STORE.mapQuery).toContain('Iloilo City');
  });
});

describe('delivery is limited to the serviceable area', () => {
  it('covers all seven districts of Iloilo City', () => {
    expect(CITY_DISTRICTS).toHaveLength(7);
    for (const name of ['City Proper', 'Jaro', 'La Paz', 'Mandurriao', 'Molo', 'Lapuz']) {
      expect(CITY_DISTRICTS.map((z) => z.name)).toContain(name);
    }
  });

  it('includes the two named campuses', () => {
    const names = CAMPUS_ZONES.map((z) => z.name);
    expect(names).toContain('University of San Agustin');
    expect(names).toContain('St. Paul University Iloilo');
  });

  it('tells the customer where a campus drop actually happens', () => {
    for (const z of CAMPUS_ZONES) expect(z.note).toBeTruthy();
  });

  it('accepts every listed zone', () => {
    for (const z of DELIVERY_ZONES) expect(isServiceableZone(z.id)).toBe(true);
  });

  it('refuses anywhere outside the area', () => {
    // Other Panay towns and other cities are pickup-only, however it is typed.
    for (const id of ['bacolod', 'oton', 'pavia', 'manila', 'cebu-city', 'santa-barbara']) {
      expect(isServiceableZone(id)).toBe(false);
    }
  });

  it('refuses empty, missing and malformed input', () => {
    for (const id of ['', undefined, null, '   ', 'CITY-PROPER']) {
      expect(isServiceableZone(id as string)).toBe(false);
    }
  });

  it('does not let a prototype key masquerade as a zone', () => {
    // `'toString' in ZONE_BY_ID` would be true for a plain object literal.
    for (const id of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
      expect(isServiceableZone(id)).toBe(false);
    }
  });

  it('labels districts with the city and campuses by name', () => {
    expect(zoneLabel('jaro')).toBe('Jaro, Iloilo City');
    expect(zoneLabel('usa-iloilo')).toBe('University of San Agustin');
    expect(zoneLabel('nowhere')).toBe('Unknown area');
  });

  it('keeps zone ids unique', () => {
    expect(new Set(DELIVERY_ZONES.map((z) => z.id)).size).toBe(DELIVERY_ZONES.length);
    expect(Object.keys(ZONE_BY_ID)).toHaveLength(DELIVERY_ZONES.length);
  });
});
