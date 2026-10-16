import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { q } from "@/services/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { EmptyState, ErrorState, SkeletonGrid } from "@/components/common/states";
import { FREE_SHIPPING_OVER, money } from "@/lib/format";
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
      { title: "Shop all — Velloria Classic" },
      {
        name: "description",
        content: "Browse the full Velloria Classic collection. Filter by category and price.",
      },
      { property: "og:title", content: "Shop all — Velloria Classic" },
      {
        property: "og:description",
        content: "Browse and filter the full Velloria Classic collection.",
      },
    ],
  }),
  component: Shop,
});

const priceRanges: { label: string; min?: number; max?: number }[] = [
  { label: "Any price" },
  { label: "Under $50", max: 49 },
  { label: "$50 – $150", min: 50, max: 150 },
  { label: "Over $150", min: 151 },
];

function FilterPanel({
  search,
  cats,
  set,
  clear,
}: {
  search: ProductQuery;
  cats: { id: string; name: string; slug: string }[] | undefined;
  set: (patch: Partial<ProductQuery>) => void;
  clear: () => void;
}) {
  return (
    <div className="space-y-7 text-sm">
      <div>
        <label htmlFor="filter-search" className="font-semibold">
          Search
        </label>
        <input
          id="filter-search"
          className="field mt-2"
          defaultValue={search.q}
          key={search.q}
          placeholder="e.g. coat"
          onKeyDown={(e) => e.key === "Enter" && set({ q: e.currentTarget.value || undefined })}
        />
      </div>
      <div>
        <p className="font-semibold">Category</p>
        <div className="mt-2 flex flex-col gap-1.5">
          <button
            onClick={() => set({ category: undefined })}
            className={`rounded-md px-2 py-1.5 text-left transition-colors ${!search.category ? "bg-mint font-semibold text-teal" : "text-muted-foreground hover:bg-muted"}`}
          >
            All categories
          </button>
          {cats?.map((c) => (
            <button
              key={c.id}
              onClick={() => set({ category: c.slug })}
              className={`rounded-md px-2 py-1.5 text-left transition-colors ${search.category === c.slug ? "bg-mint font-semibold text-teal" : "text-muted-foreground hover:bg-muted"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-semibold">Price</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {priceRanges.map((r) => {
            const active = search.minPrice === r.min && search.maxPrice === r.max;
            return (
              <button
                key={r.label}
                onClick={() => set({ minPrice: r.min, maxPrice: r.max })}
                className={`rounded-md px-2 py-1.5 text-left transition-colors ${active ? "bg-mint font-semibold text-teal" : "text-muted-foreground hover:bg-muted"}`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
      <button className="text-xs font-medium underline underline-offset-4" onClick={clear}>
        Clear all filters
      </button>
    </div>
  );
}

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [drawer, setDrawer] = useState(false);
  const set = (patch: Partial<ProductQuery>) => navigate({ search: (s) => ({ ...s, ...patch }) });
  const clear = () => navigate({ search: {} });
  const products = useQuery(q.products(search));
  const cats = useQuery(q.categories());
  const category = cats.data?.find((c) => c.slug === search.category);
  const isFiltered = Boolean(
    search.q || search.category || search.minPrice !== undefined || search.maxPrice !== undefined,
  );

  const crumbs = [
    { label: "Home", to: "/" as const },
    { label: "Shop", to: "/shop" as const },
    ...(category ? [{ label: category.name }] : []),
    ...(search.q ? [{ label: `“${search.q}”` }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          {crumbs.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {"to" in c && c.to ? (
                <Link to={c.to} className="hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] md:text-[34px]">
            {category?.name ?? (search.q ? `Results for “${search.q}”` : "Shop All")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.data
              ? `${products.data.length} product${products.data.length === 1 ? "" : "s"}`
              : " "}
            {!isFiltered && <span> · Free delivery over {money(FREE_SHIPPING_OVER)}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline px-4 py-2 lg:hidden" onClick={() => setDrawer(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select
            className="field w-auto"
            value={search.sort ?? "featured"}
            onChange={(e) => set({ sort: e.target.value as ProductQuery["sort"] })}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel search={search} cats={cats.data} set={set} clear={clear} />
        </aside>
        <div>
          {products.isLoading ? (
            <SkeletonGrid count={6} />
          ) : products.isError ? (
            <ErrorState error={products.error} onRetry={() => products.refetch()} />
          ) : products.data!.length === 0 ? (
            <EmptyState
              title="No products found"
              body="Try a different search or clear your filters to see the full collection."
              action={
                <button className="btn btn-primary" onClick={clear}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
              {products.data!.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div className="flex w-80 max-w-[85vw] flex-col bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3.5">
              <p className="font-display text-lg font-bold">Filters</p>
              <button onClick={() => setDrawer(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel search={search} cats={cats.data} set={set} clear={clear} />
            </div>
            <div className="border-t p-4">
              <button className="btn btn-primary w-full" onClick={() => setDrawer(false)}>
                Show {products.data?.length ?? 0} products
              </button>
            </div>
          </div>
          <button
            className="flex-1 bg-foreground/50"
            aria-label="Close filters"
            onClick={() => setDrawer(false)}
          />
        </div>
      )}
    </div>
  );
}
