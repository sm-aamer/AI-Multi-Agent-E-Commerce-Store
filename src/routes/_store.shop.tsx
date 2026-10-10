import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { q } from "@/services/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { EmptyState, ErrorState, SkeletonGrid } from "@/components/common/states";
import type { ProductQuery } from "@/types";

const schema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "rating", "newest"]).optional(),
});

export const Route = createFileRoute("/_store/shop")({
  validateSearch: schema,
  head: () => ({
    meta: [
      { title: "Shop all — Maison" },
      { name: "description", content: "Browse outerwear, apparel, footwear and accessories. Filter by category and price." },
      { property: "og:title", content: "Shop all — Maison" },
      { property: "og:description", content: "Browse and filter the full Maison collection." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const set = (patch: Partial<ProductQuery>) => navigate({ search: (s) => ({ ...s, ...patch }) });
  const products = useQuery(q.products(search));
  const cats = useQuery(q.categories());
  const title = cats.data?.find((c) => c.slug === search.category)?.name ?? "Shop all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="text-4xl md:text-5xl">{title}</h1>
      {search.q && <p className="mt-2 text-sm text-muted-foreground">Results for “{search.q}”</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6 text-sm">
          <div>
            <label className="font-semibold" htmlFor="s">Search</label>
            <input id="s" className="field mt-2" defaultValue={search.q} key={search.q} placeholder="e.g. coat" onKeyDown={(e) => e.key === "Enter" && set({ q: e.currentTarget.value || undefined })} />
          </div>
          <div>
            <p className="font-semibold">Category</p>
            <div className="mt-2 flex flex-wrap gap-2 lg:flex-col">
              <button onClick={() => set({ category: undefined })} className={`text-left ${!search.category ? "font-semibold text-accent" : "text-muted-foreground"}`}>All</button>
              {cats.data?.map((c) => (
                <button key={c.id} onClick={() => set({ category: c.slug })} className={`text-left ${search.category === c.slug ? "font-semibold text-accent" : "text-muted-foreground"}`}>{c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold">Price</p>
            <div className="mt-2 flex items-center gap-2">
              <input type="number" min={0} className="field" placeholder="Min" defaultValue={search.minPrice} onBlur={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })} />
              <span>–</span>
              <input type="number" min={0} className="field" placeholder="Max" defaultValue={search.maxPrice} onBlur={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            {search.minPrice !== undefined && search.maxPrice !== undefined && search.minPrice > search.maxPrice && <p className="mt-1 text-xs text-destructive">Min price is higher than max price.</p>}
          </div>
          <button className="text-xs underline" onClick={() => navigate({ search: {} })}>Clear all filters</button>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">{products.data ? `${products.data.length} products` : " "}</p>
            <select className="field w-auto" value={search.sort ?? "featured"} onChange={(e) => set({ sort: e.target.value as ProductQuery["sort"] })} aria-label="Sort">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
          {products.isLoading ? <SkeletonGrid count={6} /> : products.isError ? <ErrorState error={products.error} onRetry={() => products.refetch()} /> :
            products.data!.length === 0 ? <EmptyState title="No products found" body="Try a different search or clear your filters." action={<button className="btn btn-outline" onClick={() => navigate({ search: {} })}>Clear filters</button>} /> : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                {products.data!.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
