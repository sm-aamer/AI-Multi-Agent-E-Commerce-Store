import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { q } from "@/services/queries";
import { useCart } from "@/store/cart";
import { money } from "@/lib/format";
import { EmptyState, LoadingState } from "@/components/common/states";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/_store/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — Maison" },
      { name: "description", content: "Product details, sizing and availability." },
      { property: "og:title", content: "Product details — Maison" },
      { property: "og:description", content: "Product details, sizing and availability." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = useQuery(q.product(id));
  const related = useQuery(q.products({}));
  const cart = useCart();
  const [size, setSize] = useState<string>();
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");

  if (product.isLoading) return <LoadingState label="Loading product…" />;
  if (product.isError || !product.data)
    return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Product not found" body="It may have been removed." action={<Link to="/shop" className="btn btn-primary">Back to shop</Link>} /></div>;
  const p = product.data;

  const add = () => {
    if (p.sizes && !size) return setErr("Please select a size.");
    cart.add(p.id, qty, size);
    toast.success(`${p.name} added to cart`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <Link to="/shop" className="text-sm text-muted-foreground">← Back to shop</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <img src={p.image} alt={p.name} className="aspect-[4/5] w-full rounded-md object-cover" />
        <div>
          <h1 className="text-4xl md:text-5xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-xl">{money(p.price)}</span>
            {p.compareAtPrice && <span className="text-muted-foreground line-through">{money(p.compareAtPrice)}</span>}
            <span className="ml-auto flex items-center gap-1 text-muted-foreground"><Star className="h-4 w-4 fill-accent text-accent" />{p.rating}</span>
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          {p.sizes && (
            <div className="mt-8">
              <p className="text-sm font-semibold">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => { setSize(s); setErr(""); }} className={`h-10 min-w-12 rounded-md border px-3 text-sm ${size === s ? "border-foreground bg-foreground text-background" : "hover:border-foreground"}`}>{s}</button>
                ))}
              </div>
              {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
            </div>
          )}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="p-3" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
            <button className="btn btn-primary flex-1 py-3" disabled={p.stock === 0} onClick={add}>{p.stock === 0 ? "Sold out" : "Add to cart"}</button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{p.stock === 0 ? "Currently unavailable" : p.stock < 10 ? `Only ${p.stock} left in stock` : "In stock"}</p>
        </div>
      </div>
      {related.data && (
        <section className="mt-20">
          <h2 className="mb-6 text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.data.filter((r) => r.categoryId === p.categoryId && r.id !== p.id).slice(0, 4).map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
