import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MockBanner } from "@/components/common/states";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";

const nav = [
  { label: "Home", to: "/" as const },
  { label: "New Arrivals", to: "/shop" as const, search: { sort: "newest" as const } },
  { label: "Collections", to: "/collections" as const },
  { label: "About", to: "/about" as const },
];

export function SearchBox({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  return (
    <form
      className={`relative ${className}`}
      role="search"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        navigate({ to: "/shop", search: { q: term.trim() || undefined } });
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className={`field pl-9 ${dark ? "border-white/25 bg-white/10 text-white placeholder:text-white/60 focus:border-[#10B981]" : ""}`}
      />
    </form>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

export function StoreLayout() {
  const { count } = useCart();
  const { ids } = useWishlist();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const user = session?.user.role === "customer" ? session.user : null;

  return (
    <div className="flex min-h-screen flex-col">
      <MockBanner />
      <div className="bg-[#172323] px-4 py-1.5 text-center text-xs font-medium text-[#D1FAE5]">
        New season. New essentials.
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-teal text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-5 px-4 md:h-16 md:px-8">
          <button className="lg:hidden" onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight text-white md:text-2xl">
            Velloria Classic
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
            <Link
              to="/"
              activeProps={{ className: "text-accent" }}
              inactiveProps={{ className: "text-white/80 hover:text-white" }}
              className="px-3 py-2 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="ml-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669]"
            >
              Shop
            </Link>
            {nav.slice(1).map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={"search" in n ? n.search : undefined}
                activeProps={{ className: "text-accent" }}
                inactiveProps={{ className: "text-white/80 hover:text-white" }}
                className="px-3 py-2 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-0.5">
            <button
              className="btn btn-ghost px-2.5 py-2 text-white hover:bg-white/10 hover:text-white"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              to={user ? "/account" : "/login"}
              className="btn btn-ghost hidden px-2.5 py-2 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
              aria-label="Account"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/wishlist"
              className="btn btn-ghost relative px-2.5 py-2 text-white hover:bg-white/10 hover:text-white"
              aria-label={`Wishlist, ${ids.length} saved`}
            >
              <Heart className="h-[18px] w-[18px]" />
              <CountBadge count={ids.length} />
            </Link>
            <Link
              to="/cart"
              className="btn btn-ghost relative px-2.5 py-2 text-white hover:bg-white/10 hover:text-white"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <CountBadge count={count} />
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 bg-teal px-4 py-3">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <SearchBox className="flex-1 md:max-w-md" dark />
              <button className="btn btn-primary" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {drawer && (
          <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <aside className="flex w-72 flex-col bg-teal text-white">
              <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                <span className="font-display text-xl font-extrabold">Velloria Classic</span>
                <button onClick={() => setDrawer(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4 text-sm font-medium">
                <Link to="/" onClick={() => setDrawer(false)} className="rounded-md px-3 py-2.5 text-white/90 hover:bg-white/10">Home</Link>
                <Link to="/shop" onClick={() => setDrawer(false)} className="rounded-md bg-accent px-3 py-2.5 font-semibold text-white">Shop</Link>
                {nav.slice(1).map((n) => (
                  <Link
                    key={n.label}
                    to={n.to}
                    search={"search" in n ? n.search : undefined}
                    onClick={() => setDrawer(false)}
                    className="rounded-md px-3 py-2.5 text-white/90 hover:bg-white/10"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="px-4 pb-3">
                <SearchBox dark />
              </div>
              <div className="mt-auto border-t border-white/10 p-4 text-sm">
                <Link to={user ? "/account" : "/login"} onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-white/90 hover:bg-white/10">
                  <User className="h-4 w-4" />{user ? user.name.split(" ")[0] : "Sign in"}
                </Link>
                <Link to="/wishlist" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-white/90 hover:bg-white/10">
                  <Heart className="h-4 w-4" />Wishlist{ids.length > 0 && ` (${ids.length})`}
                </Link>
                <Link to="/cart" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-white/90 hover:bg-white/10">
                  <ShoppingBag className="h-4 w-4" />Shopping bag{count > 0 && ` (${count})`}
                </Link>
              </div>
            </aside>
            <button className="flex-1 bg-foreground/50" aria-label="Close menu" onClick={() => setDrawer(false)} />
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 bg-teal text-white/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm md:grid-cols-4 md:px-8">
          <div>
            <p className="font-display text-2xl font-extrabold text-white">Velloria Classic</p>
            <p className="mt-3 leading-relaxed text-white/70">
              Thoughtfully selected fashion essentials for everyday confidence. Premium quality, honest pricing,
              delivered across Pakistan.
            </p>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Shop</p>
            <Link to="/shop" className="block text-white/70 hover:text-white">Shop all</Link>
            <Link to="/shop" search={{ sort: "newest" }} className="block text-white/70 hover:text-white">New arrivals</Link>
            <Link to="/collections" className="block text-white/70 hover:text-white">Collections</Link>
            <Link to="/shop" search={{ category: "women" }} className="block text-white/70 hover:text-white">Women's fashion</Link>
            <Link to="/shop" search={{ category: "men" }} className="block text-white/70 hover:text-white">Men's fashion</Link>
            <Link to="/shop" search={{ category: "footwear" }} className="block text-white/70 hover:text-white">Footwear</Link>
            <Link to="/shop" search={{ category: "accessories" }} className="block text-white/70 hover:text-white">Accessories</Link>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Customer support</p>
            <Link to="/account" className="block text-white/70 hover:text-white">My account</Link>
            <Link to="/account" className="block text-white/70 hover:text-white">Order history</Link>
            <Link to="/wishlist" className="block text-white/70 hover:text-white">Wishlist</Link>
            <Link to="/about" className="block text-white/70 hover:text-white">About &amp; FAQ</Link>
            <Link to="/feedback" className="block text-white/70 hover:text-white">Send feedback</Link>
            <a href="mailto:support@velloriaclassic.com" className="block text-white/70 hover:text-white">support@velloriaclassic.com</a>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Payment &amp; delivery</p>
            <p className="text-white/70">Cash on Delivery</p>
            <p className="text-white/70">Bank Transfer</p>
            <p className="text-white/70">Free delivery over $250</p>
            <p className="text-white/70">Order updates by email &amp; SMS</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/60 md:flex-row md:px-8">
            <p>© 2026 Velloria Classic. All rights reserved.</p>
            <div className="flex gap-5">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
