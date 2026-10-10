// Wishlist — saved locally in the browser (prototype, no backend).
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "trendora.wishlist";
type Ctx = {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => boolean; // returns true when now saved
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
};
const WishlistContext = createContext<Ctx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setIds(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(ids)); }, [ids, ready]);

  const value: Ctx = {
    ids,
    count: ids.length,
    has: (id) => ids.includes(id),
    toggle: (id) => {
      const saved = !ids.includes(id);
      setIds((xs) => (saved ? [...xs, id] : xs.filter((x) => x !== id)));
      return saved;
    },
    remove: (id) => setIds((xs) => xs.filter((x) => x !== id)),
    clear: () => setIds([]),
  };
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const c = useContext(WishlistContext);
  if (!c) throw new Error("useWishlist must be inside WishlistProvider");
  return c;
};
