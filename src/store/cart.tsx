import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "@/types";

const KEY = "aiecom.cart";
type Ctx = {
  items: CartItem[];
  add: (productId: string, quantity?: number, size?: string) => void;
  setQty: (productId: string, size: string | undefined, quantity: number) => void;
  remove: (productId: string, size?: string) => void;
  clear: () => void;
  count: number;
};
const CartContext = createContext<Ctx | null>(null);
const same = (a: CartItem, id: string, size?: string) => a.productId === id && a.size === size;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  const value: Ctx = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    add: (productId, quantity = 1, size) =>
      setItems((xs) => xs.some((x) => same(x, productId, size))
        ? xs.map((x) => (same(x, productId, size) ? { ...x, quantity: x.quantity + quantity } : x))
        : [...xs, { productId, quantity, size }]),
    setQty: (id, size, q) => setItems((xs) => xs.map((x) => (same(x, id, size) ? { ...x, quantity: Math.max(1, q) } : x))),
    remove: (id, size) => setItems((xs) => xs.filter((x) => !same(x, id, size))),
    clear: () => setItems([]),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
};
