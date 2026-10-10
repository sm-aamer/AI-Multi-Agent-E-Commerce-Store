import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ArrowRight, BadgeCheck, Headphones, Search, ShieldCheck, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import editorial from "@/assets/cat-apparel.jpg";
import { q } from "@/services/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { ErrorState, SkeletonGrid } from "@/components/common/states";

export const Route = createFileRoute("/_store/")({
  head: () => ({
    meta: [
      { title: "Velloria Classic — Find Your Style. Own Every Moment." },
      { name: "description", content: "Shop thoughtfully selected fashion essentials — outerwear, apparel, footwear and accessories." },
      { property: "og:title", content: "Velloria Classic — Find Your Style. Own Every Moment." },
      { property: "og:description", content: "Explore the new season edit at Velloria Classic." },
    ],
  }),
  component: Home,
});

function DiscoveryBar() {
  const navigate = useNavigate();
  const cats = useQuery(q.categories());
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const [minPrice, maxPrice] = price.split("-");
    navigate({
      to: "/shop",
      search: {
        q: term.trim() || undefined,
        category: category || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-8">
      <form
        onSubmit={submit}
        className="panel grid gap-3 rounded-xl p-4 shadow-[0_12px_40px_-16px_rgb(16_43_43/0.25)] md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end md:gap-4 md:p-5"
        aria-label="Find products"
      >
        <div>
          <label htmlFor="disc-q" className="text-xs font-semibold text-muted-foreground">Search</label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="disc-q"
              className="field pl-9"
              placeholder="e.g. wool coat"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="disc-cat" className="text-xs font-semibold text-muted-foreground">Category</label>
          <select id="disc-cat" className="field mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {cats.data?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="disc-price" className="text-xs font-semibold text-muted-foreground">Price</label>
          <select id="disc-price" className="field mt-1.5" value={price} onChange={(e) => setPrice(e.target.value)}>
            <option value="">Any price</option>
            <option value="-50">Under $50</option>
            <option value="50-150">$50 – $150</option>
            <option value="150-">Over $150</option>
          </select>
        </div>
        <button className="btn btn-primary h-[42px] w-full md:w-auto" type="submit">
          Search
        </button>
      </form>
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setState("error");
    setState("done");
  };
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="rounded-2xl bg-teal px-6 py-12 text-center text-white md:px-16">
        <p className="eyebrow text-[#10B981]">Stay in the loop</p>
        <h2 className="mt-3 text-[26px] text-white md:text-[32px]">New drops, early access.</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
          Join the Velloria Classic list for new arrivals, seasonal edits and members-only offers. No spam — unsubscribe anytime.
        </p>
        {state === "done" ? (
          <p className="mx-auto mt-6 max-w-sm rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-[#D1FAE5]">
            You're on the list — welcome to Velloria Classic.
          </p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              aria-label="Email address"
              placeholder="you@example.com"
              className="field border-white/25 bg-white/10 text-white placeholder:text-white/60 focus:border-[#10B981]"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
            />
            <button className="btn btn-primary shrink-0" type="submit">Subscribe</button>
          </form>
        )}
        {state === "error" && <p className="mt-3 text-sm text-[#FCA5A5]">Please enter a valid email address.</p>}
      </div>
    </section>
  );
}

function Home() {
  const products = useQuery(q.products({}));
  const cats = useQuery(q.categories());
  const featured = products.data?.filter((p) => p.featured).slice(0, 4) ?? [];
  const arrivals = products.data?.filter((p) => p.isNew).slice(0, 4) ?? [];
  const benefits = [
    { icon: Truck, title: "Cash on Delivery", body: "Pay in cash when your order arrives, anywhere in Pakistan." },
    { icon: ShieldCheck, title: "Bank Transfer", body: "Prefer transfer? Verified by our team before shipping." },
    { icon: Headphones, title: "Customer Support", body: "Real humans, Mon–Sat, ready to help with your order." },
    { icon: BadgeCheck, title: "Clear Order Updates", body: "Track every step from confirmation to delivery." },
  ];

  return (
    <>
      {/* A. Hero */}
      <section className="relative overflow-hidden bg-teal">
        <img
          src={hero}
          alt="Model wearing a camel wool overcoat from the new season collection"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal via-teal/70 to-transparent md:via-teal/40" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-20 md:min-h-[640px] md:px-8">
          <div className="max-w-xl text-white">
            <p className="eyebrow text-[#10B981]">The New Season Edit</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
              Find Your Style.<br className="hidden sm:block" /> Own Every Moment.
            </h1>
            <p className="mt-5 max-w-md text-base text-white/80">
              Explore thoughtfully selected fashion essentials designed for everyday confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary px-6 py-3">
                Shop Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" search={{ sort: "newest" }} className="btn btn-light px-6 py-3">
                Explore New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* B. Discovery bar */}
      <div className="relative z-10 -mt-8">
        <DiscoveryBar />
      </div>

      {/* C. Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Curated for you</p>
            <h2 className="mt-2 text-[26px] md:text-[32px]">Shop by Category</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-accent underline underline-offset-4">View all</Link>
        </div>
        {cats.isError ? (
          <ErrorState error={cats.error} onRetry={() => cats.refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(cats.data ?? Array.from({ length: 4 })).map((c, i) =>
              c ? (
                <Link key={c.id} to="/shop" search={{ category: c.slug }} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal/90 via-teal/40 to-transparent p-4 pt-10">
                    <p className="font-display text-lg font-bold text-white">{c.name}</p>
                    {c.blurb && <p className="mt-0.5 text-xs text-white/75">{c.blurb}</p>}
                  </div>
                </Link>
              ) : (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
              ),
            )}
          </div>
        )}
      </section>

      {/* D. Trending Products */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Most wanted</p>
            <h2 className="mt-2 text-[26px] md:text-[32px]">Trending Now</h2>
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

      {/* E. New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Just landed</p>
            <h2 className="mt-2 text-[26px] md:text-[32px]">New Arrivals</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fresh pieces added this week — limited stock.</p>
          </div>
          <Link to="/shop" search={{ sort: "newest" }} className="text-sm font-medium text-accent underline underline-offset-4">View All</Link>
        </div>
        {products.isLoading ? (
          <SkeletonGrid count={4} />
        ) : products.isError ? (
          <ErrorState error={products.error} onRetry={() => products.refetch()} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {arrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* F. Editorial Campaign Banner */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={editorial} alt="Velloria Classic editorial — everyday essentials" className="h-80 w-full object-cover md:h-96" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal/85 via-teal/50 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 flex items-center px-6 md:px-14">
            <div className="max-w-lg text-white">
              <p className="eyebrow text-[#10B981]">The Edit</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white md:text-[38px]">Everyday Essentials. Elevated.</h2>
              <p className="mt-3 max-w-sm text-sm text-white/80">
                Considered pieces that work harder in your wardrobe — from weekday layers to weekend staples.
              </p>
              <Link to="/collections" className="btn btn-primary mt-6 px-6 py-3">Explore the Edit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* G. Brand Benefits */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint text-teal">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* H. Newsletter */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <Newsletter />
      </section>
    </>
  );
}
