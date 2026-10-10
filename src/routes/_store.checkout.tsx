import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Banknote, Landmark } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { useAuth } from "@/store/auth";
import { useCartLines } from "@/hooks/use-cart-lines";
import { money } from "@/lib/format";
import { EmptyState, FieldError, LoadingState } from "@/components/common/states";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  line1: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(80),
  postalCode: z.string().trim().min(3, "Enter a postal code").max(12),
  country: z.string().trim().min(2, "Enter your country"),
  paymentMethod: z.enum(["bank_transfer", "cod"]),
  bankReference: z.string().trim().max(50).optional(),
}).refine((v) => v.paymentMethod !== "bank_transfer" || (v.bankReference && v.bankReference.length >= 4), { path: ["bankReference"], message: "Enter your bank transfer reference" });
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/_store/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Maison" },
      { name: "description", content: "Enter delivery details and choose Bank Transfer or Cash on Delivery." },
      { property: "og:title", content: "Checkout — Maison" },
      { property: "og:description", content: "Secure checkout with Bank Transfer or COD." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { session } = useAuth();
  const { cart, lines, subtotal, shipping, total, isLoading } = useCartLines();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: "cod", country: "Pakistan", name: session?.user.name ?? "", email: session?.user.email ?? "" },
  });
  const method = watch("paymentMethod");

  if (isLoading) return <LoadingState />;
  if (lines.length === 0) return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Nothing to check out" action={<Link to="/shop" className="btn btn-primary">Go shopping</Link>} /></div>;

  const onSubmit = async (f: Form) => {
    setSubmitError("");
    try {
      const order = await api.createOrder({
        customerId: session?.user.id ?? "guest", customerName: f.name, email: f.email, phone: f.phone,
        address: { line1: f.line1, city: f.city, postalCode: f.postalCode, country: f.country },
        items: lines.map((l) => ({ productId: l.productId, name: l.product.name, price: l.product.price, quantity: l.quantity, size: l.size })),
        subtotal, shipping, total, paymentMethod: f.paymentMethod, bankReference: f.bankReference,
      });
      cart.clear();
      toast.success(`Order ${order.id} placed`);
      navigate({ to: "/account/orders/$id", params: { id: order.id } });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not place order");
    }
  };

  const F = ({ name, label, type = "text", span }: { name: keyof Form; label: string; type?: string; span?: boolean }) => (
    <div key={name} className={span ? "sm:col-span-2" : ""}>
      <label className="text-sm font-medium" htmlFor={name}>{label}</label>
      <input id={name} type={type} className="field mt-1" {...register(name)} />
      <FieldError message={errors[name]?.message} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-10">
        <h1 className="text-4xl">Checkout</h1>
        <section>
          <h2 className="mb-4 text-xl">Customer details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {F({ name: "name", label: "Full name", span: true })}
            {F({ name: "email", label: "Email", type: "email" })}
            {F({ name: "phone", label: "Phone", type: "tel" })}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-xl">Delivery address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {F({ name: "line1", label: "Street address", span: true })}
            {F({ name: "city", label: "City" })}
            {F({ name: "postalCode", label: "Postal code" })}
            {F({ name: "country", label: "Country", span: true })}
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-xl">Payment method</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {([["cod", "Cash on Delivery", "Pay in cash when your order arrives.", Banknote], ["bank_transfer", "Bank Transfer", "Transfer to our account; we verify before shipping.", Landmark]] as const).map(([v, t, d, Icon]) => (
              <label key={v} className={`panel flex cursor-pointer gap-3 p-4 ${method === v ? "border-foreground ring-1 ring-foreground" : ""}`}>
                <input type="radio" value={v} {...register("paymentMethod")} className="mt-1 accent-[var(--accent)]" />
                <div><p className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4" />{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
              </label>
            ))}
          </div>
          {method === "bank_transfer" && (
            <div className="panel mt-4 space-y-3 bg-secondary p-4 text-sm">
              <p className="font-semibold">Bank details (sample)</p>
              <p className="text-muted-foreground">Account: Maison Retail · IBAN PK00 DEMO 0000 0000 0000 · Bank: Demo Bank</p>
              <div>
                <label className="font-medium" htmlFor="bankReference">Transfer reference / transaction ID</label>
                <input id="bankReference" className="field mt-1" {...register("bankReference")} />
                <FieldError message={errors.bankReference?.message} />
              </div>
              <p className="text-xs text-muted-foreground">No payment is processed by this prototype. An admin manually verifies transfers.</p>
            </div>
          )}
        </section>
      </div>
      <aside className="panel h-fit space-y-3 p-6 text-sm lg:sticky lg:top-24">
        <h2 className="text-xl">Order summary</h2>
        {lines.map((l) => (
          <div key={l.productId + l.size} className="flex justify-between gap-2"><span>{l.product.name} × {l.quantity}</span><span>{money(l.lineTotal)}</span></div>
        ))}
        <div className="flex justify-between border-t pt-3"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div>
        <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{money(total)}</span></div>
        {submitError && <p className="text-xs text-destructive">{submitError}</p>}
        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">{isSubmitting ? "Placing order…" : "Place order"}</button>
      </aside>
    </form>
  );
}
