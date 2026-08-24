import type { Order } from '@/domain/orders/order';
import { slotKey, fromDateKey, type SlotId } from '@/domain/fulfillment/slots';
import type { CustomOrderRequest } from '@/domain/orders/custom';

/**
 * Persistence port.
 *
 * The default implementation below keeps state in module memory. That is enough
 * to demonstrate real cap enforcement, but on serverless it is per-instance and
 * resets on cold start. Swapping in Postgres, Vercel KV or Supabase means
 * implementing this interface and changing the factory at the bottom of the
 * file; nothing in the domain or the UI needs to change.
 *
 * A production implementation must also make reserveSlot atomic, so two
 * simultaneous checkouts cannot both take the last space in a window
 * (SELECT ... FOR UPDATE, or a unique constraint on (slot, sequence)).
 */
export interface OrderRepository {
  /**
   * Booked counts for the given slot keys, in one call. Batched deliberately:
   * resolving a fortnight of windows one key at a time is ~150 sequential
   * round trips once this is backed by a real database.
   *
   * Every requested key comes back, including windows with no reservation, so
   * a caller can never mistake "absent" for "empty".
   */
  countsFor(keys: readonly string[]): Promise<Record<string, number>>;
  reserveSlot(slot: SlotId, mode: 'pickup' | 'delivery', capacity: number): Promise<boolean>;
  releaseSlot(slot: SlotId): Promise<void>;
  save(order: Order): Promise<void>;
  find(ref: string): Promise<Order | null>;
  saveCustomRequest(request: CustomOrderRequest): Promise<void>;
  findCustomRequest(ref: string): Promise<CustomOrderRequest | null>;
}

/** Small deterministic hash so the seeded demand looks organic but never shifts between renders. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Seeded demand. Weekends and late-afternoon windows fill first, which is what
 * a real bakery's Saturday looks like, and it means the cap logic is visible on
 * a freshly deployed site instead of every slot sitting empty.
 */
function seededBookings(slot: string): number {
  const [date, startRaw] = slot.split('|');
  const start = Number(startRaw);
  const day = fromDateKey(date).getDay(); // local parse; `new Date(key)` is UTC midnight
  const isWeekend = day === 0 || day === 6;
  const base = hash(slot) % 100;

  let load = base % 5;
  if (isWeekend) load += 3;
  if (start >= 15 * 60) load += 2;
  return Math.min(load, 8);
}

class InMemoryOrderRepository implements OrderRepository {
  private extra = new Map<string, number>();
  private orders = new Map<string, Order>();
  private customRequests = new Map<string, CustomOrderRequest>();
  private seedCache = new Map<string, number>();

  private seedFor(key: string): number {
    let v = this.seedCache.get(key);
    if (v === undefined) {
      v = seededBookings(key);
      this.seedCache.set(key, v);
    }
    return v;
  }

  async countsFor(keys: readonly string[]): Promise<Record<string, number>> {
    const out: Record<string, number> = {};
    for (const key of keys) out[key] = this.seedFor(key) + (this.extra.get(key) ?? 0);
    return out;
  }

  async countFor(key: string): Promise<number> {
    return this.seedFor(key) + (this.extra.get(key) ?? 0);
  }

  async reserveSlot(slot: SlotId, _mode: 'pickup' | 'delivery', capacity: number): Promise<boolean> {
    const key = slotKey(slot);
    const current = await this.countFor(key);
    if (current >= capacity) return false;
    this.extra.set(key, (this.extra.get(key) ?? 0) + 1);
    return true;
  }

  async releaseSlot(slot: SlotId): Promise<void> {
    const key = slotKey(slot);
    const current = this.extra.get(key) ?? 0;
    if (current > 0) this.extra.set(key, current - 1);
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.ref, order);
  }

  async find(ref: string): Promise<Order | null> {
    return this.orders.get(ref) ?? null;
  }

  async saveCustomRequest(request: CustomOrderRequest): Promise<void> {
    this.customRequests.set(request.ref, request);
  }

  async findCustomRequest(ref: string): Promise<CustomOrderRequest | null> {
    return this.customRequests.get(ref) ?? null;
  }
}

const globalForRepo = globalThis as unknown as { __locketRepo?: InMemoryOrderRepository };
const repo = globalForRepo.__locketRepo ?? new InMemoryOrderRepository();
globalForRepo.__locketRepo = repo;

export function getOrderRepository(): OrderRepository & { countFor(key: string): Promise<number> } {
  return repo;
}

/** Exposed so the slot picker can show seeded demand without a write. */
export function seededBookingsFor(key: string): number {
  return seededBookings(key);
}
