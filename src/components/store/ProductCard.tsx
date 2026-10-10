import { Link } from "@tanstack/react-router";
import type { Product } from "@/types";
import { money } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/product/$id" params={{ id: product.id }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
        <img src={product.image} alt={product.name} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.stock === 0 && <span className="absolute left-3 top-3 rounded-full bg-background px-2 py-0.5 text-xs font-semibold">Sold out</span>}
        {product.compareAtPrice && product.stock > 0 && <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Sale</span>}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2 text-sm">
        <p className="font-medium">{product.name}</p>
        <p className="shrink-0">
          {product.compareAtPrice && <span className="mr-1.5 text-muted-foreground line-through">{money(product.compareAtPrice)}</span>}
          {money(product.price)}
        </p>
      </div>
    </Link>
  );
}
