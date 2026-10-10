import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/common/states";
import type { RequestStatus } from "@/types";

export const Route = createFileRoute("/admin/refunds")({
  head: () => ({ meta: [{ title: "Refunds — Trendora Admin" }, { name: "description", content: "Approve or reject refunds" }, { property: "og:title", content: "Refunds — Trendora Admin" }, { property: "og:description", content: "Approve or reject refunds" }] }),
  component: Refunds,
});

function Refunds() {
  const qc = useQueryClient();
  const refunds = useQuery(q.refunds());
  const m = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => api.decideRefund(id, status),
    onSuccess: (r) => { toast.success(`${r.id} ${r.status}`); qc.invalidateQueries({ queryKey: ["refunds"] }); },
  });
  return (
    <>
      <PageHeader title="Refunds & cancellations" description="Review customer requests. Approving does not move money in this prototype." />
      <DataTable rows={refunds.data} isLoading={refunds.isLoading} error={refunds.error} emptyTitle="No requests"
        columns={[
          { header: "Request", cell: (r) => <><p className="font-medium">{r.id}</p><p className="text-xs capitalize text-muted-foreground">{r.type} · {r.orderId}</p></> },
          { header: "Customer", cell: (r) => r.customerName },
          { header: "Reason", className: "max-w-xs", cell: (r) => <p className="text-muted-foreground">{r.reason}</p> },
          { header: "Amount", cell: (r) => money(r.amount) },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          { header: "", className: "text-right", cell: (r) => r.status === "pending" ? (
            <div className="flex justify-end gap-2">
              <button className="btn btn-success px-3 py-1.5" disabled={m.isPending} onClick={() => m.mutate({ id: r.id, status: "approved" })}>Approve</button>
              <button className="btn btn-danger px-3 py-1.5" disabled={m.isPending} onClick={() => m.mutate({ id: r.id, status: "rejected" })}>Reject</button>
            </div>
          ) : null },
        ]} />
    </>
  );
}
