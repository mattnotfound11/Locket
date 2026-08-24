import { NextResponse } from 'next/server';
import {
  availabilityCalendar, windowsForDate, slotKey, toDateKey,
  DEFAULT_RULES, type FulfilmentMode,
} from '@/domain/fulfillment/slots';
import { getOrderRepository } from '@/infrastructure/repositories/orders';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = (url.searchParams.get('mode') ?? 'pickup') as FulfilmentMode;

  const rawLead = Number(url.searchParams.get('leadDays') ?? '0');
  // Clamp: a hostile leadDays would otherwise push every date past the horizon.
  const leadTimeDays = Number.isFinite(rawLead)
    ? Math.min(Math.max(Math.floor(rawLead), 0), DEFAULT_RULES.horizonDays)
    : 0;

  if (mode !== 'pickup' && mode !== 'delivery') {
    return NextResponse.json({ error: 'mode must be pickup or delivery' }, { status: 400 });
  }

  const now = new Date();

  // Collect every window in range first, then resolve their counts in one call.
  const keys: string[] = [];
  for (let i = 0; i < DEFAULT_RULES.horizonDays; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dateKey = toDateKey(d);
    for (const w of windowsForDate(dateKey)) {
      keys.push(slotKey({ date: dateKey, start: w.start }));
    }
  }

  const bookings = await getOrderRepository().countsFor(keys);
  const days = availabilityCalendar({ mode, now, bookings, leadTimeDays });

  return NextResponse.json(
    { days, capacity: DEFAULT_RULES.capacity[mode], cutoff: DEFAULT_RULES.sameDayCutoff },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
