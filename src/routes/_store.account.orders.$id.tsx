import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { q } from "@/services/queries";
import { api } from "@/services/api";
import { money } from "@/lib/format";
import { RequireCustomer } from "@/components/store/RequireCustomer";
import { EmptyState, FieldError, LoadingState, StatusBadge } from "@/components/common/states";
import type { Order, RequestType } from "@/types";

export const Route = createFileRoute("/_store/account/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order details — Maison" },
      { name: "description", content: "Order status, items, and refund or cancellation requests." },
      { property: "og:title", content: "Order details — Maison" },
      { property: "og:description", content: "Order status and details." },
    ],
  }),
  component: () => <RequireCustomer><OrderDetail /></RequireCustomer>,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const order = useQuery(q.order(id));
  if (order.isLoading) return <LoadingState />;
  if (!order.data) return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Order not found" action={<Link to="/account" className="btn btn-primary">My orders</Link>} /></div>;
  const o = order.data;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <Link to="/account" className="text-sm text-muted-foreground">← All orders</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3"><h1 className="text-4xl">{o.id}</h1><StatusBadge status={o.status} /></div>
      <p className="text-sm text-muted-foreground">Placed {o.createdAt}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="panel divide-y">
          {o.items.map((i) => (
            <div key={i.productId + i.size} className="flex justify-between p-4 text-sm"><span>{i.name}{i.size ? ` (${i.size})` : ""} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>
          ))}
          <div className="space-y-1 p-4 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{o.shipping ? money(o.shipping) : "Free"}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{money(o.total)}</span></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel space-y-1 p-4 text-sm">
            <p className="font-semibold">Payment</p>
            <p>{o.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
            <StatusBadge status={o.paymentStatus} />
            {o.bankReference && <p className="text-xs text-muted-foreground">Ref: {o.bankReference}</p>}
          </div>
          <div className="panel p-4 text-sm"><p className="font-semibold">Delivery</p><p>{o.customerName}</p><p className="text-muted-foreground">{o.address.line1}, {o.address.city} {o.address.postalCode}, {o.address.country}</p></div>
        </div>
      </div>
      <RequestForm order={o} />
    </div>
  );
}

function RequestForm({ order }: { order: Order }) {
  const qc = useQueryClient();
  const canCancel = order.status === "pending" || order.status === "confirmed";
  const canRefund = order.status === "delivered";
  const [type, setType] = useState<RequestType>(canCancel ? "cancellation" : "refund");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const m = useMutation({
    mutationFn: () => api.createRefund({ orderId: order.id, customerName: order.customerName, type, reason: reason.trim(), amount: order.total }),
    onSuccess: () => { toast.success("Request submitted for review"); setReason(""); qc.invalidateQueries({ queryKey: ["refunds"] }); },
    onError: (e) => setErr(e instanceof Error ? e.message : "Failed"),
  });
  if (!canCancel && !canRefund) return <p className="mt-10 text-sm text-muted-foreground">Refunds are available after delivery; cancellations before shipping.</p>;
  return (
    <section className="panel mt-10 p-6">
      <h2 className="text-2xl">Request a {canCancel ? "cancellation" : "refund"}</h2>
      {m.isSuccess ? <p className="mt-3 text-sm text-success">Your request has been submitted. Our team will review it shortly.</p> : (
        <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); if (reason.trim().length < 10) return setErr("Please describe the reason (min 10 characters)."); setErr(""); m.mutate(); }}>
          <select className="field max-w-xs" value={type} onChange={(e) => setType(e.target.value as RequestType)}>
            {canCancel && <option value="cancellation">Cancel order</option>}
            {canRefund && <option value="refund">Refund</option>}
          </select>
          <textarea className="field min-h-24" maxLength={500} placeholder="Tell us what happened" value={reason} onChange={(e) => setReason(e.target.value)} />
          <FieldError message={err} />
          <button className="btn btn-primary" disabled={m.isPending}>{m.isPending ? "Submitting…" : "Submit request"}</button>
        </form>
      )}
    </section>
  );
}
