import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { AgentNotice, PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/common/states";
import type { RequestStatus } from "@/types";

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({
    meta: [
      { title: "Competitor pricing — Velloria Classic Admin" },
      { name: "description", content: "AI pricing suggestions" },
      { property: "og:title", content: "Competitor pricing — Velloria Classic Admin" },
      { property: "og:description", content: "AI pricing suggestions" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const qc = useQueryClient();
  const rows = useQuery(q.pricing());
  const products = useQuery(q.products({}));
  const m = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      api.decidePricing(id, status),
    onSuccess: () => {
      toast.success("Decision saved");
      qc.invalidateQueries({ queryKey: ["ai", "pricing"] });
    },
  });
  return (
    <>
      <PageHeader
        title="Competitor pricing suggestions"
        description="Review price changes proposed from competitor monitoring."
      />
      <AgentNotice agent="competitor pricing" />
      <DataTable
        rows={rows.data}
        isLoading={rows.isLoading}
        error={rows.error}
        emptyTitle="No suggestions"
        columns={[
          {
            header: "Product",
            cell: (r) => (
              <span className="font-medium">
                {products.data?.find((p) => p.id === r.productId)?.name ?? r.productId}
              </span>
            ),
          },
          { header: "Current", cell: (r) => money(r.currentPrice) },
          { header: "Competitor avg", cell: (r) => money(r.competitorAvg) },
          {
            header: "Suggested",
            cell: (r) => (
              <span
                className={
                  r.suggestedPrice < r.currentPrice
                    ? "text-destructive"
                    : r.suggestedPrice > r.currentPrice
                      ? "text-success"
                      : ""
                }
              >
                {money(r.suggestedPrice)}
              </span>
            ),
          },
          {
            header: "Rationale",
            className: "max-w-xs",
            cell: (r) => <p className="text-muted-foreground">{r.rationale}</p>,
          },
          { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
          {
            header: "",
            className: "text-right",
            cell: (r) =>
              r.status === "pending" ? (
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-success px-3 py-1.5"
                    onClick={() => m.mutate({ id: r.id, status: "approved" })}
                  >
                    Apply
                  </button>
                  <button
                    className="btn btn-outline px-3 py-1.5"
                    onClick={() => m.mutate({ id: r.id, status: "rejected" })}
                  >
                    Dismiss
                  </button>
                </div>
              ) : null,
          },
        ]}
      />
    </>
  );
}
