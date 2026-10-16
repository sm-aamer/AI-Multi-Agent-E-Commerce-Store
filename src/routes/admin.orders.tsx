import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/common/states";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Order, OrderStatus } from "@/types";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Velloria Classic Admin" },
      { name: "description", content: "Manage orders" },
      { property: "og:title", content: "Orders — Velloria Classic Admin" },
      { property: "og:description", content: "Manage orders" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Orders,
});
const statuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function Orders() {
  const qc = useQueryClient();
  const orders = useQuery(q.orders());
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [detail, setDetail] = useState<Order | null>(null);
  const upd = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrder(id, { status }),
    onSuccess: (o) => {
      toast.success(`${o.id} marked ${o.status}`);
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update order"),
  });
  const rows = orders.data?.filter((o) => !filter || o.status === filter);
  return (
    <>
      <PageHeader
        title="Orders"
        description="Track, inspect and update order status."
        action={
          <select
            className="field w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value as OrderStatus | "")}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />
      <DataTable
        rows={rows}
        isLoading={orders.isLoading}
        error={orders.error}
        emptyTitle="No orders match"
        columns={[
          {
            header: "Order",
            cell: (o) => (
              <>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">{o.createdAt}</p>
              </>
            ),
          },
          {
            header: "Customer",
            cell: (o) => (
              <>
                <p>{o.customerName}</p>
                <p className="text-xs text-muted-foreground">{o.address.city}</p>
              </>
            ),
          },
          {
            header: "Payment",
            cell: (o) => (
              <>
                <p className="text-xs">{o.paymentMethod === "cod" ? "COD" : "Bank transfer"}</p>
                <StatusBadge status={o.paymentStatus} />
              </>
            ),
          },
          { header: "Total", cell: (o) => money(o.total) },
          {
            header: "Status",
            cell: (o) => (
              <select
                className="field w-auto py-1 capitalize"
                value={o.status}
                disabled={upd.isPending}
                onChange={(e) => upd.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                aria-label={`Status for ${o.id}`}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ),
          },
          {
            header: "",
            className: "text-right",
            cell: (o) => (
              <button className="btn btn-outline px-3 py-1.5" onClick={() => setDetail(o)}>
                Details
              </button>
            ),
          },
        ]}
      />
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {detail.id} · {detail.customerName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <StatusBadge status={detail.paymentStatus} />
                  <span className="text-xs text-muted-foreground">Placed {detail.createdAt}</span>
                </div>
                <div className="panel divide-y">
                  {detail.items.map((i) => (
                    <div key={i.productId + i.size} className="flex justify-between p-3">
                      <span>
                        {i.name}
                        {i.size ? ` (${i.size})` : ""} × {i.quantity}
                      </span>
                      <span className="font-medium">{money(i.price * i.quantity)}</span>
                    </div>
                  ))}
                  <div className="space-y-1 p-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{money(detail.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{detail.shipping ? money(detail.shipping) : "Free"}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{money(detail.total)}</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="font-semibold">Delivery</p>
                    <p className="mt-1 text-muted-foreground">
                      {detail.customerName}
                      <br />
                      {detail.email}
                      <br />
                      {detail.phone}
                      <br />
                      {detail.address.line1}, {detail.address.city} {detail.address.postalCode},{" "}
                      {detail.address.country}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="font-semibold">Payment</p>
                    <p className="mt-1 text-muted-foreground">
                      {detail.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}
                      {detail.bankReference && (
                        <>
                          <br />
                          Reference:{" "}
                          <span className="font-medium text-foreground">
                            {detail.bankReference}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {detail.fraudScore !== undefined && (
                  <div
                    className={`rounded-lg p-3 ${detail.fraudScore > 0.5 ? "bg-destructive/10" : "bg-muted/60"}`}
                  >
                    <p className="font-semibold">
                      Fraud signals · Risk {Math.round(detail.fraudScore * 100)}%
                    </p>
                    {detail.fraudReasons?.length ? (
                      <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                        {detail.fraudReasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-muted-foreground">No notable signals.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
