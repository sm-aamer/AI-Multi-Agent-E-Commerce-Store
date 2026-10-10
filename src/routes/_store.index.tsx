import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { q } from "@/services/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { SearchBox } from "@/components/store/StoreLayout";
import { ErrorState, SkeletonGrid } from "@/components/common/states";

export const Route = createFileRoute("/_store/")({
  head: () => ({
    meta: [
      { title: "Maison — Considered fashion, curated by AI" },
      { name: "description", content: "Shop outerwear, apparel, footwear and accessories with AI-assisted curation." },
      { property: "og:title", content: "Maison — Considered fashion, curated by AI" },
      { property: "og:description", content: "Shop outerwear, apparel, footwear and accessories." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = useQuery(q.products({ sort: "featured" }));
  const cats = useQuery(q.categories());
  return (
    <>
      <section className="relative overflow-hidden bg-secondary">
        <img src={hero} alt="Model wearing camel wool overcoat" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 md:px-8">
          <div className="max-w-lg rounded-lg bg-background/70 p-6 backdrop-blur md:bg-transparent md:p-0 md:backdrop-blur-none">
            <p className="eyebrow">Autumn / Winter 2026</p>
            <h1 className="mt-4 text-5xl leading-[1.05] md:text-7xl">Quiet layers for colder days.</h1>
            <p className="mt-5 text-muted-foreground">Timeless outerwear and knitwear, with recommendations tailored to how you dress.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary">Shop the collection <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/shop" search={{ category: "outerwear" }} className="btn btn-outline">Outerwear</Link>
            </div>
            <SearchBox className="mt-6 max-w-sm" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-end justify-between"><h2 className="text-3xl md:text-4xl">Shop by category</h2></div>
        {cats.isError ? <ErrorState error={cats.error} onRetry={() => cats.refetch()} /> : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(cats.data ?? Array.from({ length: 4 })).map((c, i) => c ? (
              <Link key={c.id} to="/shop" search={{ category: c.slug }} className="group relative aspect-[3/4] overflow-hidden rounded-md">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-4">
                  <p className="font-display text-xl text-background">{c.name}</p>
                </div>
              </Link>
            ) : <div key={i} className="aspect-[3/4] animate-pulse rounded-md bg-muted" />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="eyebrow">Editor's edit</p><h2 className="mt-2 text-3xl md:text-4xl">Featured pieces</h2></div>
          <Link to="/shop" className="text-sm underline underline-offset-4">View all</Link>
        </div>
        {featured.isLoading ? <SkeletonGrid count={4} /> : featured.isError ? <ErrorState error={featured.error} onRetry={() => featured.refetch()} /> : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {featured.data!.filter((p) => p.featured).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
