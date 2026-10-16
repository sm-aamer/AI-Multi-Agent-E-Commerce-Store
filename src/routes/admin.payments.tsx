import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/common/states";
import type { PaymentStatus } from "@/types";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Bank transfers — Velloria Classic Admin" },
      { name: "description", content: "Verify bank transfers" },
      { property: "og:title", content: "Bank transfers — Velloria Classic Admin" },
      { property: "og:description", content: "Verify bank transfers" },
    ],
  }),
  component: Payments,
});

function Payments() {
  const qc = useQueryClient();
  const orders = useQuery(q.orders());
  const m = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: PaymentStatus }) =>
      api.updateOrder(id, {
        paymentStatus,
        ...(paymentStatus === "verified" ? { status: "confirmed" as const } : {}),
      }),
    onSuccess: (o) => {
      toast.success(`Payment for ${o.id} ${o.paymentStatus}`);
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  const rows = orders.data?.filter((o) => o.paymentMethod === "bank_transfer");
  return (
    <>
      <PageHeader
        title="Bank transfer verification"
        description="Match customer references against your bank statement before confirming."
      />
      <DataTable
        rows={rows}
        isLoading={orders.isLoading}
        error={orders.error}
        emptyTitle="No bank transfer orders"
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
          { header: "Customer", cell: (o) => o.customerName },
          {
            header: "Reference",
            cell: (o) => (
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {o.bankReference ?? "—"}
              </code>
            ),
          },
          { header: "Amount", cell: (o) => money(o.total) },
          { header: "Status", cell: (o) => <StatusBadge status={o.paymentStatus} /> },
          {
            header: "",
            className: "text-right",
            cell: (o) =>
              o.paymentStatus === "awaiting_verification" ? (
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-success px-3 py-1.5"
                    disabled={m.isPending}
                    onClick={() => m.mutate({ id: o.id, paymentStatus: "verified" })}
                  >
                    Verify
                  </button>
                  <button
                    className="btn btn-danger px-3 py-1.5"
                    disabled={m.isPending}
                    onClick={() => m.mutate({ id: o.id, paymentStatus: "rejected" })}
                  >
                    Reject
                  </button>
                </div>
              ) : null,
          },
        ]}
      />
    </>
  );
}
