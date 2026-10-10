import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { q } from "@/services/queries";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/store/ProductCard";
import { EmptyState, ErrorState, SkeletonGrid } from "@/components/common/states";

export const Route = createFileRoute("/_store/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Velloria Classic" },
      { name: "description", content: "Products you've saved for later." },
      { property: "og:title", content: "Wishlist — Velloria Classic" },
      { property: "og:description", content: "Products you've saved for later." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { ids } = useWishlist();
  const products = useQuery(q.products({}));
  const saved = products.data?.filter((p) => ids.includes(p.id)) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="eyebrow">Saved for later</p>
      <h1 className="mt-2 text-[28px] md:text-[34px]">My Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ids.length} item{ids.length === 1 ? "" : "s"} saved — stored in this browser for the demo.</p>
      <div className="mt-8">
        {products.isLoading ? (
          <SkeletonGrid count={4} />
        ) : products.isError ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : saved.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            body="Tap the heart on any product to save it here."
            action={<Link to="/shop" className="btn btn-primary">Discover products</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {saved.map((p) => (
              <div key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
      {saved.length > 0 && (
        <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5" /> Use the heart on a card to remove it from your wishlist.
        </p>
      )}
    </div>
  );
}
