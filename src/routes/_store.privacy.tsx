import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Velloria Classic" },
      { name: "description", content: "How Velloria Classic handles your information." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h1 className="text-[28px] md:text-[34px]">Privacy Policy</h1>
      <p className="mt-1 text-xs text-muted-foreground">Last updated: October 2026 · Prototype policy text</p>
      <div className="prose-sm mt-6 space-y-4 text-sm text-muted-foreground">
        <p>
          Velloria Classic (this prototype) collects only the information you enter at checkout or registration — your name,
          email, phone and delivery address — to place and track orders.
        </p>
        <p>
          In this demo stage, no data leaves your browser: accounts, carts and orders are simulated with in-memory mock
          data and reset on reload. No payment is ever processed and no card details are collected.
        </p>
        <p>
          When connected to the production backend, order data will be stored securely and used only to fulfil your
          orders, provide support and — with your consent — send newsletter updates. You may request deletion of your
          account and order history at any time by contacting support@velloriaclassic.com.
        </p>
        <p>We do not sell customer data to third parties.</p>
      </div>
    </div>
  ),
});
