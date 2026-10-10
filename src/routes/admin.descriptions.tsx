import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { AgentNotice, PageHeader } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/common/states";
import type { RequestStatus } from "@/types";

export const Route = createFileRoute("/admin/descriptions")({
  head: () => ({ meta: [{ title: "AI descriptions — Maison Admin" }, { name: "description", content: "Review AI-generated product descriptions" }, { property: "og:title", content: "AI descriptions — Maison Admin" }, { property: "og:description", content: "Review AI-generated product descriptions" }] }),
  component: Descriptions,
});

function Descriptions() {
  const qc = useQueryClient();
  const drafts = useQuery(q.descriptions());
  const products = useQuery(q.products({}));
  const m = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => api.decideDescription(id, status),
    onSuccess: () => { toast.success("Decision saved"); qc.invalidateQueries({ queryKey: ["ai", "descriptions"] }); },
  });
  return (
    <>
      <PageHeader title="AI-generated descriptions" description="Compare drafts with current copy before publishing." />
      <AgentNotice agent="product description" />
      {drafts.isLoading ? <LoadingState /> : drafts.isError ? <ErrorState error={drafts.error} /> : !drafts.data!.length ? <EmptyState title="No drafts to review" /> : (
        <div className="space-y-4">
          {drafts.data!.map((d) => (
            <div key={d.id} className="panel p-5">
              <div className="flex items-center justify-between"><h3 className="text-lg">{products.data?.find((p) => p.id === d.productId)?.name ?? d.productId}</h3><StatusBadge status={d.status} /></div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm">
                <div><p className="eyebrow text-muted-foreground">Current</p><p className="mt-2 text-muted-foreground">{d.current}</p></div>
                <div className="rounded-md bg-secondary p-3"><p className="eyebrow">AI draft</p><p className="mt-2">{d.generated}</p></div>
              </div>
              {d.status === "pending" && (
                <div className="mt-4 flex justify-end gap-2">
                  <button className="btn btn-outline px-3 py-1.5" onClick={() => m.mutate({ id: d.id, status: "rejected" })}>Reject</button>
                  <button className="btn btn-success px-3 py-1.5" onClick={() => m.mutate({ id: d.id, status: "approved" })}>Approve</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
