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
import type { OrderStatus } from "@/types";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Maison Admin" }, { name: "description", content: "Manage orders" }, { property: "og:title", content: "Orders — Maison Admin" }, { property: "og:description", content: "Manage orders" }] }),
  component: Orders,
});
const statuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function Orders() {
  const qc = useQueryClient();
  const orders = useQuery(q.orders());
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const upd = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => api.updateOrder(id, { status }),
    onSuccess: (o) => { toast.success(`${o.id} marked ${o.status}`); qc.invalidateQueries({ queryKey: ["orders"] }); },
  });
  const rows = orders.data?.filter((o) => !filter || o.status === filter);
  return (
    <>
      <PageHeader title="Orders" description="Track and update order status."
        action={<select className="field w-auto" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus)}><option value="">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>} />
      <DataTable rows={rows} isLoading={orders.isLoading} error={orders.error} emptyTitle="No orders match"
        columns={[
          { header: "Order", cell: (o) => <><p className="font-medium">{o.id}</p><p className="text-xs text-muted-foreground">{o.createdAt}</p></> },
          { header: "Customer", cell: (o) => <><p>{o.customerName}</p><p className="text-xs text-muted-foreground">{o.address.city}</p></> },
          { header: "Payment", cell: (o) => <><p className="text-xs">{o.paymentMethod === "cod" ? "COD" : "Bank transfer"}</p><StatusBadge status={o.paymentStatus} /></> },
          { header: "Total", cell: (o) => money(o.total) },
          { header: "Status", cell: (o) => (
            <select className="field w-auto py-1 capitalize" value={o.status} disabled={upd.isPending} onChange={(e) => upd.mutate({ id: o.id, status: e.target.value as OrderStatus })}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) },
        ]} />
    </>
  );
}
