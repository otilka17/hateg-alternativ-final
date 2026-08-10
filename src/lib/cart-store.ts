import { create } from "zustand";
import type { CartItem } from "./menu-data.ts";
import { SANDWICH_NAMES } from "./menu-data.ts";

// Weekly offer promo logic — same rotation as WeeklyOffer.tsx
const WEEKLY_OFFERS_COUNT = 7;
function getActiveOfferIndex(): number {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return weekNumber % WEEKLY_OFFERS_COUNT;
}

/**
 * Calculates a sandwich promo discount when the "2 Sandwich-uri la preț de 1.5" offer is active (index 1).
 * Returns the discount amount in RON (25% off the cheaper sandwich for every pair).
 */
export function getSandwichPromoDiscount(items: CartItem[]): number {
  const activeIndex = getActiveOfferIndex();
  // Index 1 = "2 Sandwich-uri la preț de 1.5"
  if (activeIndex !== 1) return 0;

  // Collect all sandwich items (flattened by qty)
  const sandwichPrices: number[] = [];
  for (const item of items) {
    if (SANDWICH_NAMES.includes(item.name.toLowerCase())) {
      for (let i = 0; i < item.qty; i++) {
        sandwichPrices.push(item.price);
      }
    }
  }

  if (sandwichPrices.length < 2) return 0;

  // Sort descending so cheaper ones get the discount
  sandwichPrices.sort((a, b) => b - a);

  // For every pair, discount 25% off the cheaper one
  const pairs = Math.floor(sandwichPrices.length / 2);
  let discount = 0;
  for (let i = 0; i < pairs; i++) {
    const cheaperIndex = i * 2 + 1;
    discount += Math.round(sandwichPrices[cheaperIndex] * 0.25 * 100) / 100;
  }

  return discount;
}

type CartStore = {
  items: CartItem[];
  addItem: (name: string, price: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalQty: () => number;
  totalPrice: () => number;
};

const loadFromStorage = (): CartItem[] => {
  try {
    const s = localStorage.getItem("metanoia_cart");
    return s ? (JSON.parse(s) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem("metanoia_cart", JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadFromStorage(),

  addItem: (name, price) => {
    const existing = get().items.find((i) => i.name === name);
    let updated: CartItem[];
    if (existing) {
      updated = get().items.map((i) =>
        i.name === name ? { ...i, qty: i.qty + 1 } : i
      );
    } else {
      const newItem: CartItem = { id: `${Date.now()}-${Math.random()}`, name, price, qty: 1 };
      updated = [...get().items, newItem];
    }
    saveToStorage(updated);
    set({ items: updated });
  },

  removeItem: (id) => {
    const updated = get().items.filter((i) => i.id !== id);
    saveToStorage(updated);
    set({ items: updated });
  },

  clearCart: () => {
    saveToStorage([]);
    set({ items: [] });
  },

  totalQty: () => get().items.reduce((s, i) => s + i.qty, 0),
  totalPrice: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
