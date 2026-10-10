import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartLines } from "@/hooks/use-cart-lines";
import { money, FREE_SHIPPING_OVER } from "@/lib/format";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";

export const Route = createFileRoute("/_store/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Trendora" },
      { name: "description", content: "Review items in your shopping cart." },
      { property: "og:title", content: "Your cart — Trendora" },
      { property: "og:description", content: "Review items in your shopping cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, lines, subtotal, shipping, total, isLoading, error } = useCartLines();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[28px] md:text-[34px]">Your Bag</h1>
        <Link to="/shop" className="text-sm font-medium text-accent underline underline-offset-4">Continue shopping</Link>
      </div>
      {isLoading ? <LoadingState /> : error ? <ErrorState error={error} /> : lines.length === 0 ? (
        <div className="mt-8"><EmptyState title="Your cart is empty" body="Discover pieces you'll love." action={<Link to="/shop" className="btn btn-primary">Start shopping</Link>} /></div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <ul className="divide-y border-y">
            {lines.map((l) => (
              <li key={l.productId + l.size} className="flex gap-4 py-5">
                <img src={l.product.image} alt={l.product.name} className="h-28 w-24 rounded-md object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link to="/product/$id" params={{ id: l.productId }} className="font-medium">{l.product.name}</Link>
                    <p>{money(l.lineTotal)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{l.size ? `Size ${l.size} · ` : ""}{money(l.product.price)} each</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-md border">
                      <button className="p-2" aria-label="Decrease" onClick={() => cart.setQty(l.productId, l.size, l.quantity - 1)}><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm">{l.quantity}</span>
                      <button className="p-2" aria-label="Increase" disabled={l.quantity >= l.product.stock} onClick={() => cart.setQty(l.productId, l.size, l.quantity + 1)}><Plus className="h-3 w-3" /></button>
                    </div>
                    <button className="text-muted-foreground hover:text-destructive" aria-label="Remove" onClick={() => cart.remove(l.productId, l.size)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="panel h-fit space-y-3 p-6 text-sm">
            <h2 className="text-xl">Summary</h2>
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div>
            {shipping > 0 && <p className="text-xs text-muted-foreground">Free shipping on orders over {money(FREE_SHIPPING_OVER)}.</p>}
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{money(total)}</span></div>
            <Link to="/checkout" className="btn btn-primary w-full">Proceed to Checkout</Link>
            <Link to="/shop" className="btn btn-ghost w-full text-muted-foreground">Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
