import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { q } from "@/services/queries";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { money } from "@/lib/format";
import { LoadingState } from "@/components/common/states";
import { ProductCard } from "@/components/store/ProductCard";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/_store/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — Velloria Classic" },
      { name: "description", content: "Product details, sizing and availability at Velloria Classic." },
      { property: "og:title", content: "Product details — Velloria Classic" },
      { property: "og:description", content: "Product details, sizing and availability." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = useQuery(q.product(id));
  const related = useQuery(q.products({}));
  const cats = useQuery(q.categories());
  const cart = useCart();
  const wishlist = useWishlist();
  const [size, setSize] = useState<string>();
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [err, setErr] = useState("");

  const p = product.data;
  const gallery = useMemo(() => {
    if (!p) return [] as string[];
    const cat = cats.data?.find((c) => c.id === p.categoryId);
    return [...new Set([p.image, cat?.image, hero].filter(Boolean) as string[])];
  }, [p, cats.data]);

  useEffect(() => { setImgIndex(0); }, [id]);

  if (product.isLoading) return <LoadingState label="Loading product…" />;
  if (product.isError || !p)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <div className="panel flex flex-col items-center px-6 py-14 text-center">
          <h1 className="text-2xl">Product not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been removed from the collection.</p>
          <Link to="/shop" className="btn btn-primary mt-6">Back to shop</Link>
        </div>
      </div>
    );

  const category = cats.data?.find((c) => c.id === p.categoryId);
  const saved = wishlist.has(p.id);

  const add = () => {
    if (p.sizes && !size) return setErr("Please select a size.");
    cart.add(p.id, qty, size);
    toast.success(`${p.name}${size ? ` (${size})` : ""} added to bag`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li className="flex items-center gap-1.5"><Link to="/" className="hover:text-foreground">Home</Link><span>/</span></li>
          <li className="flex items-center gap-1.5"><Link to="/shop" className="hover:text-foreground">Shop</Link><span>/</span></li>
          {category && (
            <li className="flex items-center gap-1.5">
              <Link to="/shop" search={{ category: category.slug }} className="hover:text-foreground">{category.name}</Link><span>/</span>
            </li>
          )}
          <li className="font-medium text-foreground">{p.name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div>
          <img src={gallery[imgIndex] ?? p.image} alt={p.name} className="aspect-[4/5] w-full rounded-xl object-cover" />
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setImgIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === imgIndex}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${i === imgIndex ? "border-accent" : "border-transparent hover:border-border"}`}
                >
                  <img src={src} alt="" className="h-20 w-16 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {p.isNew && <span className="chip bg-teal text-white">New season</span>}
          <h1 className="mt-3 text-[30px] leading-tight md:text-[38px]">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-2xl font-bold">{money(p.price)}</span>
            {p.compareAtPrice && <span className="text-muted-foreground line-through">{money(p.compareAtPrice)}</span>}
            {p.compareAtPrice && (
              <span className="chip bg-mint text-teal">Save {money(p.compareAtPrice - p.price)}</span>
            )}
            {p.rating > 0 && (
              <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {p.rating.toFixed(1)}
                {p.reviewCount ? <span>({p.reviewCount} reviews)</span> : null}
              </span>
            )}
          </div>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>

          {p.sizes && (
            <div className="mt-8">
              <p className="text-sm font-semibold">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setErr(""); }}
                    className={`h-10 min-w-12 rounded-lg border px-3 text-sm transition-colors ${size === s ? "border-teal bg-teal text-white" : "hover:border-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button className="p-3" onClick={() => setQty(Math.min(Math.max(p.stock, 1), qty + 1))} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
            <button className="btn btn-primary flex-1 py-3" disabled={p.stock === 0} onClick={add}>
              {p.stock === 0 ? "Sold out" : "Add to Bag"}
            </button>
            <button
              className={`btn px-3 py-3 ${saved ? "btn-primary" : "btn-outline"}`}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => {
                const nowSaved = wishlist.toggle(p.id);
                toast(nowSaved ? `${p.name} saved to wishlist` : `${p.name} removed from wishlist`);
              }}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            {p.stock === 0
              ? "Currently unavailable"
              : p.stock < 10
                ? `Only ${p.stock} left in stock — order soon.`
                : "In stock and ready to ship."}
          </p>

          <div className="panel mt-8 divide-y text-sm">
            <div className="flex items-center gap-3 p-4">
              <Truck className="h-4 w-4 shrink-0 text-accent" />
              <p>Free delivery on orders over $250 · Cash on Delivery available</p>
            </div>
            {p.material && (
              <div className="p-4">
                <p className="font-semibold">Material & care</p>
                <p className="mt-1 text-muted-foreground">{p.material}. Wash cold or dry clean — see care label.</p>
              </div>
            )}
            <div className="p-4">
              <p className="font-semibold">Delivery & returns</p>
              <p className="mt-1 text-muted-foreground">
                Dispatched in 1–2 working days. Free returns within 14 days on unworn items with tags attached.
              </p>
            </div>
          </div>
        </div>
      </div>

      {related.data && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-[26px] md:text-[30px]">You may also like</h2>
            <Link to="/shop" search={{ category: category?.slug }} className="text-sm font-medium text-accent underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.data
              .filter((r) => r.categoryId === p.categoryId && r.id !== p.id)
              .slice(0, 4)
              .map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
