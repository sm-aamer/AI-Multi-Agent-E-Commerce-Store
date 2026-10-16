import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Velloria Classic" },
      { name: "description", content: "Terms of service for the Velloria Classic prototype." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="text-[28px] md:text-[34px]">Terms of Service</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Last updated: October 2026 · Prototype terms text
      </p>
      <div className="mt-6 space-y-4 text-sm text-muted-foreground">
        <p>
          Welcome to Velloria Classic. This site is a frontend prototype: the catalogue, checkout,
          payments and admin dashboard are demonstrations built on mock data and are not a binding
          commercial offer.
        </p>
        <p>
          Prices are displayed in USD for illustration. Cash on Delivery and Bank Transfer options
          are simulated — no funds are collected and no orders are fulfilled in this demo.
        </p>
        <p>
          Product names, imagery and copy are illustrative. AI-assisted recommendations, pricing
          suggestions and description drafts shown in the admin area are sample outputs pending
          integration of the production agents.
        </p>
        <p>
          In production, orders will be governed by the published returns, delivery and warranty
          policies shown at checkout. Questions? Contact support@velloriaclassic.com.
        </p>
      </div>
    </div>
  ),
});
