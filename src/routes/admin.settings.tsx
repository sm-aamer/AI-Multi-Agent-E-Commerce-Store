import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Velloria Classic Admin" }, { name: "description", content: "Store settings" }, { property: "og:title", content: "Settings — Velloria Classic Admin" }, { property: "og:description", content: "Store settings" }, { name: "robots", content: "noindex" }] }),
  component: Settings,
});

function Row({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Settings() {
  const [storeName, setStoreName] = useState("Velloria Classic");
  const [supportEmail, setSupportEmail] = useState("support@velloriaclassic.com");
  const [currency, setCurrency] = useState("USD");
  const [bankAccount, setBankAccount] = useState("Velloria Classic Retail · IBAN PK00 DEMO 0000 0000 0000 · Demo Bank");
  const [freeOver, setFreeOver] = useState("250");
  const [flatShipping, setFlatShipping] = useState("10");
  const [codEnabled, setCodEnabled] = useState(true);
  const [bankEnabled, setBankEnabled] = useState(true);

  return (
    <>
      <PageHeader title="Settings" description="Store configuration. Demo only — changes are not persisted and have no effect on the prototype." />
      <p className="mb-6 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
        These settings mirror what will live in the FastAPI backend (and environment variables) later. Saving here only shows the intended behaviour.
      </p>
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="panel space-y-4 p-6">
          <h2 className="text-lg">Store profile</h2>
          <Row id="set-name" label="Store name"><input id="set-name" className="field mt-1" value={storeName} onChange={(e) => setStoreName(e.target.value)} /></Row>
          <Row id="set-email" label="Support email" hint="Shown in the footer and used for order emails."><input id="set-email" type="email" className="field mt-1" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} /></Row>
          <Row id="set-currency" label="Currency"><select id="set-currency" className="field mt-1" value={currency} onChange={(e) => setCurrency(e.target.value)}><option>USD</option><option disabled>PKR (coming later)</option></select></Row>
        </section>

        <section className="panel space-y-4 p-6">
          <h2 className="text-lg">Payments</h2>
          <Row id="set-cod" label="Cash on Delivery">
            <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> Offer COD at checkout</label>
          </Row>
          <Row id="set-bank" label="Bank Transfer">
            <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={bankEnabled} onChange={(e) => setBankEnabled(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> Offer bank transfer at checkout</label>
          </Row>
          <Row id="set-bank-acc" label="Bank account details" hint="Placeholder account shown to customers at checkout.">
            <textarea id="set-bank-acc" className="field mt-1 min-h-16" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
          </Row>
        </section>

        <section className="panel space-y-4 p-6">
          <h2 className="text-lg">Shipping</h2>
          <Row id="set-free" label="Free delivery threshold (USD)"><input id="set-free" type="number" min={0} className="field mt-1" value={freeOver} onChange={(e) => setFreeOver(e.target.value)} /></Row>
          <Row id="set-flat" label="Flat delivery fee (USD)"><input id="set-flat" type="number" min={0} className="field mt-1" value={flatShipping} onChange={(e) => setFlatShipping(e.target.value)} /></Row>
        </section>

        <section className="panel flex flex-col justify-between gap-4 p-6">
          <div>
            <h2 className="text-lg">Danger zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">Reset all demo state in this browser — cart, wishlist and sign-in session.</p>
          </div>
          <button
            className="btn btn-danger self-start"
            onClick={() => {
              ["velloria.cart", "velloria.wishlist", "velloria.session", "velloria.token"].forEach((k) => localStorage.removeItem(k));
              toast.success("Local demo data cleared — reload to see the effect.");
            }}
          >
            Clear local demo data
          </button>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="btn btn-primary" onClick={() => toast.success("Settings saved (demo only — nothing persisted).")}>Save settings</button>
      </div>
    </>
  );
}
