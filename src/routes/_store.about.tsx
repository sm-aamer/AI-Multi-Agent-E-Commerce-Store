import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Landmark, Mail, Truck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_store/about")({
  head: () => ({
    meta: [
      { title: "About — Trendora" },
      { name: "description", content: "The story behind Trendora, plus delivery, payment and returns answers." },
      { property: "og:title", content: "About — Trendora" },
      { property: "og:description", content: "The story behind Trendora." },
    ],
  }),
  component: About,
});

const faqs = [
  {
    q: "How does delivery work?",
    a: "Orders are dispatched in 1–2 working days and delivered across Pakistan in 3–5 working days. Delivery is free on orders over Rs 25,000; a flat Rs 500 applies below that.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Cash on Delivery and Bank Transfer. For bank transfers, our team verifies your payment reference before the order ships.",
  },
  {
    q: "Can I return an item?",
    a: "Yes — unworn items with tags attached can be returned within 14 days of delivery. Raise a request from your order page and our team will review it.",
  },
  {
    q: "Do you have physical stores?",
    a: "Trendora is online-first for now, with plans for a Lahore flagship next season. Join the newsletter to hear about pop-ups first.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <p className="eyebrow">Our story</p>
      <h1 className="mt-2 text-[28px] md:text-[36px]">Fashion that earns its place.</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Trendora is a modern fashion destination built around a simple idea: fewer, better pieces. Every item in the
        collection is chosen for quality of material, honesty of price and how hard it works in a real wardrobe — from
        weekday layers to weekend staples.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-lg">How we select</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Small batches, natural fabrics and fit-first sampling. If a piece doesn't pass our wear tests, it doesn't
            make the collection.
          </p>
        </div>
        <div className="panel p-6">
          <h2 className="text-lg">Honest pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Transparent pricing in PKR with no fake discounts. When something is on sale, the original price is the one
            we actually sold at.
          </p>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-[24px] md:text-[28px]">Good to know</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="panel flex items-start gap-3 p-4"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><div><p className="font-semibold">Nationwide delivery</p><p className="mt-1 text-muted-foreground">3–5 working days, free over Rs 25,000.</p></div></div>
          <div className="panel flex items-start gap-3 p-4"><Banknote className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><div><p className="font-semibold">Cash on Delivery</p><p className="mt-1 text-muted-foreground">Pay when your order arrives.</p></div></div>
          <div className="panel flex items-start gap-3 p-4"><Landmark className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><div><p className="font-semibold">Bank Transfer</p><p className="mt-1 text-muted-foreground">Verified before shipping.</p></div></div>
          <div className="panel flex items-start gap-3 p-4"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><div><p className="font-semibold">Real support</p><p className="mt-1 text-muted-foreground">Mon–Sat, support@trendora.pk</p></div></div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-[24px] md:text-[28px]">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <div className="panel mt-14 flex flex-wrap items-center justify-between gap-4 bg-teal p-6 text-white">
        <div>
          <h2 className="text-xl text-white">Ready to refresh your rotation?</h2>
          <p className="mt-1 text-sm text-white/70">The new season edit is live now.</p>
        </div>
        <Link to="/shop" className="btn btn-primary">Shop the collection</Link>
      </div>
    </div>
  );
}
