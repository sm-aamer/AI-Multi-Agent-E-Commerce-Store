import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const saved = wishlist.has(product.id);
  const quickAddSize = product.sizes?.[0];

  const quickAdd = () => {
    cart.add(product.id, 1, quickAddSize);
    toast.success(`${product.name}${quickAddSize ? ` (${quickAddSize})` : ""} added to bag`);
  };

  return (
    <div className="group">
      <div className="relative">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="block aspect-[4/5] overflow-hidden rounded-xl bg-muted"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.isNew && <span className="chip bg-teal text-white">New</span>}
            {product.compareAtPrice && product.stock > 0 && (
              <span className="chip bg-accent text-white">Sale</span>
            )}
            {product.stock === 0 && (
              <span className="chip bg-white/95 text-foreground">Sold out</span>
            )}
          </div>
        </Link>
        <button
          className="absolute right-3 top-3"
          aria-label={
            saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
          }
          onClick={() => {
            const nowSaved = wishlist.toggle(product.id);
            toast(
              nowSaved
                ? `${product.name} saved to wishlist`
                : `${product.name} removed from wishlist`,
            );
          }}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-colors ${saved ? "bg-accent text-white" : "bg-white/95 text-foreground hover:text-accent"}`}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
          </span>
        </button>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2 text-sm">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="font-semibold leading-snug hover:text-accent"
        >
          {product.name}
        </Link>
        <p className="shrink-0 font-semibold">
          {product.compareAtPrice && (
            <span className="mr-1.5 font-normal text-muted-foreground line-through">
              {money(product.compareAtPrice)}
            </span>
          )}
          {money(product.price)}
        </p>
      </div>
      {product.rating > 0 && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {product.rating.toFixed(1)}
          {product.reviewCount ? <span>({product.reviewCount})</span> : null}
        </p>
      )}
      <button
        className="btn btn-outline mt-3 w-full py-2 text-xs"
        disabled={product.stock === 0}
        onClick={quickAdd}
      >
        {product.stock === 0 ? "Sold out" : "Add to Bag"}
      </button>
    </div>
  );
}
