'use client';

import {
  createContext, useContext, useEffect, useMemo, useReducer, type ReactNode,
} from 'react';
import { PRODUCT_BY_ID } from '@/domain/catalog/products';
import { computeTotals, type CartLine } from '@/domain/cart/totals';
import { cartLeadTimeDays } from '@/domain/fulfillment/leadtime';
import type { FulfilmentMode } from '@/domain/fulfillment/slots';

interface StoredLine { productId: string; quantity: number }
interface State { lines: StoredLine[]; mode: FulfilmentMode; hydrated: boolean }

type Action =
  | { type: 'add'; productId: string; quantity?: number }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'setMode'; mode: FulfilmentMode }
  | { type: 'hydrate'; state: Pick<State, 'lines' | 'mode'> };

const STORAGE_KEY = 'locket.cart.v1';
const MAX_PER_LINE = 50;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const qty = action.quantity ?? 1;
      const existing = state.lines.find((l) => l.productId === action.productId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.productId === action.productId
              ? { ...l, quantity: Math.min(MAX_PER_LINE, l.quantity + qty) }
              : l),
        };
      }
      return { ...state, lines: [...state.lines, { productId: action.productId, quantity: qty }] };
    }
    case 'setQuantity': {
      if (action.quantity <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.productId === action.productId
            ? { ...l, quantity: Math.min(MAX_PER_LINE, action.quantity) }
            : l),
      };
    }
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.productId !== action.productId) };
    case 'clear':
      return { ...state, lines: [] };
    case 'setMode':
      return { ...state, mode: action.mode };
    case 'hydrate':
      return { ...state, ...action.state, hydrated: true };
  }
}

interface CartValue {
  lines: CartLine[];
  mode: FulfilmentMode;
  hydrated: boolean;
  totals: ReturnType<typeof computeTotals>;
  leadTimeDays: number;
  quantityOf: (productId: string) => number;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setMode: (mode: FulfilmentMode) => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], mode: 'pickup', hydrated: false });

  // Read once on mount. Storage can throw in private mode, so it is guarded.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Pick<State, 'lines' | 'mode'>;
        const lines = (parsed.lines ?? []).filter(
          (l) => PRODUCT_BY_ID[l.productId] && !PRODUCT_BY_ID[l.productId].soldOut,
        );
        dispatch({ type: 'hydrate', state: { lines, mode: parsed.mode === 'delivery' ? 'delivery' : 'pickup' } });
        return;
      }
    } catch {
      // Ignore unreadable storage and start with an empty basket.
    }
    dispatch({ type: 'hydrate', state: { lines: [], mode: 'pickup' } });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: state.lines, mode: state.mode }));
    } catch {
      // A full or blocked store must not break checkout.
    }
  }, [state.lines, state.mode, state.hydrated]);

  const value = useMemo<CartValue>(() => {
    const lines: CartLine[] = state.lines
      .map((l) => ({ product: PRODUCT_BY_ID[l.productId], quantity: l.quantity }))
      .filter((l) => Boolean(l.product));

    return {
      lines,
      mode: state.mode,
      hydrated: state.hydrated,
      totals: computeTotals(lines, state.mode),
      leadTimeDays: cartLeadTimeDays(lines),
      quantityOf: (id) => state.lines.find((l) => l.productId === id)?.quantity ?? 0,
      add: (productId, quantity) => dispatch({ type: 'add', productId, quantity }),
      setQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
      remove: (productId) => dispatch({ type: 'remove', productId }),
      clear: () => dispatch({ type: 'clear' }),
      setMode: (mode) => dispatch({ type: 'setMode', mode }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
