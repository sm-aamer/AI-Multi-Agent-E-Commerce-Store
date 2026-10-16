import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { AgentNotice, PageHeader } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/common/states";
import type { RequestStatus } from "@/types";

export const Route = createFileRoute("/admin/descriptions")({
  head: () => ({
    meta: [
      { title: "Product SEO Assistant — Velloria Classic Admin" },
      { name: "description", content: "Review AI-generated descriptions and SEO metadata" },
      { property: "og:title", content: "Product SEO Assistant — Velloria Classic Admin" },
      { property: "og:description", content: "Review AI-generated descriptions and SEO metadata" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SeoAssistant,
});

function SeoAssistant() {
  const qc = useQueryClient();
  const drafts = useQuery(q.descriptions());
  const products = useQuery(q.products({}));
  const m = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      api.decideDescription(id, status),
    onSuccess: () => {
      toast.success("Decision saved");
      qc.invalidateQueries({ queryKey: ["ai", "descriptions"] });
    },
  });
  return (
    <>
      <PageHeader
        title="Product SEO Assistant"
        description="Compare AI-generated copy and metadata with the current listing before publishing."
      />
      <AgentNotice agent="product description" />
      {drafts.isLoading ? (
        <LoadingState />
      ) : drafts.isError ? (
        <ErrorState error={drafts.error} />
      ) : !drafts.data!.length ? (
        <EmptyState title="No drafts to review" />
      ) : (
        <div className="space-y-4">
          {drafts.data!.map((d) => {
            const product = products.data?.find((p) => p.id === d.productId);
            return (
              <div key={d.id} className="panel p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">{product?.name ?? d.productId}</h3>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="eyebrow text-muted-foreground">Current copy</p>
                    <p className="mt-2 text-muted-foreground">{d.current}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <p className="eyebrow">AI draft</p>
                    <p className="mt-2">{d.generated}</p>
                  </div>
                </div>
                {(d.seoTitle || d.seoDescription) && (
                  <div className="mt-4 rounded-lg border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      SEO metadata preview
                    </p>
                    <p className="mt-2 text-sm font-semibold text-info">
                      {d.seoTitle ?? `${product?.name} — Velloria Classic`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.seoDescription ?? "No meta description generated yet."}
                    </p>
                    {d.seoTitle && d.seoTitle.length > 60 && (
                      <p className="mt-1 text-xs text-warning">
                        Title is {d.seoTitle.length} characters — aim for under 60.
                      </p>
                    )}
                  </div>
                )}
                {d.status === "pending" && (
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="btn btn-outline px-3 py-1.5"
                      onClick={() => m.mutate({ id: d.id, status: "rejected" })}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-success px-3 py-1.5"
                      onClick={() => m.mutate({ id: d.id, status: "approved" })}
                    >
                      Approve & publish
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
