import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { MockBanner } from "@/components/common/states";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";

const nav = [
  { label: "Shop all", search: {} },
  { label: "Outerwear", search: { category: "outerwear" } },
  { label: "Apparel", search: { category: "apparel" } },
  { label: "Footwear", search: { category: "footwear" } },
  { label: "Accessories", search: { category: "accessories" } },
];

export function SearchBox({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form className={`relative ${className}`} onSubmit={(e) => { e.preventDefault(); navigate({ to: "/shop", search: { q: q || undefined } }); }}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className="field pl-9" />
    </form>
  );
}

export function StoreLayout() {
  const { count } = useCart();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const user = session?.user.role === "customer" ? session.user : null;

  return (
    <div className="flex min-h-screen flex-col">
      <MockBanner />
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-8">
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <Link to="/" className="font-display text-2xl tracking-tight">Maison</Link>
          <nav className="hidden gap-6 text-sm lg:flex">
            {nav.map((n) => (
              <Link key={n.label} to="/shop" search={n.search} className="text-muted-foreground hover:text-foreground">{n.label}</Link>
            ))}
          </nav>
          <SearchBox className="ml-auto hidden w-64 md:block" />
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link to={user ? "/account" : "/login"} className="btn btn-ghost px-3" aria-label="Account">
              <User className="h-5 w-5" /><span className="hidden text-sm sm:inline">{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
            <Link to="/cart" className="btn btn-ghost relative px-3" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">{count}</span>}
            </Link>
          </div>
        </div>
        {open && (
          <div className="border-t px-4 py-4 lg:hidden">
            <SearchBox className="mb-4 md:hidden" />
            <nav className="flex flex-col gap-3 text-sm">
              {nav.map((n) => <Link key={n.label} to="/shop" search={n.search} onClick={() => setOpen(false)}>{n.label}</Link>)}
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-24 border-t bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm md:grid-cols-4 md:px-8">
          <div><p className="font-display text-2xl">Maison</p><p className="mt-2 text-muted-foreground">AI-Powered E-Commerce Platform — capstone prototype.</p></div>
          <div className="space-y-2"><p className="font-semibold">Shop</p>{nav.slice(1).map((n) => <Link key={n.label} to="/shop" search={n.search} className="block text-muted-foreground">{n.label}</Link>)}</div>
          <div className="space-y-2"><p className="font-semibold">Account</p><Link to="/account" className="block text-muted-foreground">Orders</Link><Link to="/cart" className="block text-muted-foreground">Cart</Link></div>
          <div className="space-y-2"><p className="font-semibold">Staff</p><Link to="/admin/login" className="block text-muted-foreground">Admin dashboard</Link></div>
        </div>
      </footer>
    </div>
  );
}
