import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { q } from "@/services/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { ErrorState, SkeletonGrid } from "@/components/common/states";

export const Route = createFileRoute("/_store/collections")({
  head: () => ({
    meta: [
      { title: "Collections — Velloria Classic" },
      { name: "description", content: "Browse the Velloria Classic edit — women's, men's, footwear and accessories." },
      { property: "og:title", content: "Collections — Velloria Classic" },
      { property: "og:description", content: "Browse the Velloria Classic edit." },
    ],
  }),
  component: Collections,
});

function Collections() {
  const products = useQuery(q.products({}));
  const cats = useQuery(q.categories());
  const featured = products.data?.filter((p) => p.featured).slice(0, 4) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="eyebrow">Curated edits</p>
      <h1 className="mt-2 text-[28px] md:text-[34px]">Collections</h1>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Every Velloria Classic collection is hand-checked for quality and fit. Start with a category, or explore the full edit.
      </p>

      {cats.isError ? (
        <div className="mt-8"><ErrorState error={cats.error} onRetry={() => cats.refetch()} /></div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(cats.data ?? Array.from({ length: 4 })).map((c, i) =>
            c ? (
              <Link key={c.id} to="/shop" search={{ category: c.slug }} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal/90 via-teal/40 to-transparent p-4 pt-10">
                  <p className="font-display text-lg font-bold text-white">{c.name}</p>
                  {c.blurb && <p className="mt-0.5 text-xs text-white/75">{c.blurb}</p>}
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#10B981]">Shop now <ArrowRight className="h-3 w-3" /></p>
                </div>
              </Link>
            ) : (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
            ),
          )}
        </div>
      )}

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">The full edit</p>
            <h2 className="mt-2 text-[26px] md:text-[30px]">Featured pieces</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-accent underline underline-offset-4">Shop all</Link>
        </div>
        {products.isLoading ? (
          <SkeletonGrid count={4} />
        ) : products.isError ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
