import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { AgentNotice, PageHeader } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/common/states";

export const Route = createFileRoute("/admin/fraud")({
  head: () => ({ meta: [{ title: "Fraud review — Maison Admin" }, { name: "description", content: "Review flagged orders" }, { property: "og:title", content: "Fraud review — Maison Admin" }, { property: "og:description", content: "Review flagged orders" }] }),
  component: Fraud,
});

function Fraud() {
  const qc = useQueryClient();
  const orders = useQuery(q.orders());
  const m = useMutation({
    mutationFn: ({ id, ok }: { id: string; ok: boolean }) => api.updateOrder(id, ok ? { fraudScore: 0 } : { status: "cancelled" }),
    onSuccess: () => { toast.success("Decision saved"); qc.invalidateQueries({ queryKey: ["orders"] }); },
  });
  if (orders.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState error={orders.error} />;
  const flagged = orders.data!.filter((o) => (o.fraudScore ?? 0) > 0.5 && o.status !== "cancelled");
  return (
    <>
      <PageHeader title="Fraud-flagged orders" description="Orders with a risk score above 0.5." />
      <AgentNotice agent="fraud detection" />
      {flagged.length === 0 ? <EmptyState title="No flagged orders" body="All clear for now." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {flagged.map((o) => (
            <div key={o.id} className="panel p-5">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">{o.id}</p><p className="text-sm text-muted-foreground">{o.customerName} · {money(o.total)} · {o.paymentMethod === "cod" ? "COD" : "Bank transfer"}</p></div>
                <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">Risk {Math.round((o.fraudScore ?? 0) * 100)}%</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-destructive" style={{ width: `${(o.fraudScore ?? 0) * 100}%` }} /></div>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{o.fraudReasons?.map((r) => <li key={r}>{r}</li>)}</ul>
              <div className="mt-4 flex items-center gap-2"><StatusBadge status={o.status} />
                <div className="ml-auto flex gap-2">
                  <button className="btn btn-outline px-3 py-1.5" disabled={m.isPending} onClick={() => m.mutate({ id: o.id, ok: true })}>Mark safe</button>
                  <button className="btn btn-danger px-3 py-1.5" disabled={m.isPending} onClick={() => m.mutate({ id: o.id, ok: false })}>Cancel order</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
