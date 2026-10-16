import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { q } from "@/services/queries";
import { AgentNotice, PageHeader } from "@/components/admin/AdminLayout";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";

export const Route = createFileRoute("/admin/recommendations")({
  head: () => ({
    meta: [
      { title: "AI recommendations — Velloria Classic Admin" },
      { name: "description", content: "AI merchandising recommendations" },
      { property: "og:title", content: "AI recommendations — Velloria Classic Admin" },
      { property: "og:description", content: "AI merchandising recommendations" },
    ],
  }),
  component: Recs,
});

function Recs() {
  const recs = useQuery(q.recommendations());
  const products = useQuery(q.products({}));
  return (
    <>
      <PageHeader
        title="AI recommendations"
        description="Merchandising insights from the recommendation agent."
      />
      <AgentNotice agent="recommendation" />
      {recs.isLoading ? (
        <LoadingState />
      ) : recs.isError ? (
        <ErrorState error={recs.error} />
      ) : !recs.data!.length ? (
        <EmptyState title="No recommendations yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recs.data!.map((r) => (
            <div key={r.id} className="panel p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg">{r.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {Math.round(r.confidence * 100)}% conf.
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.detail}</p>
              <div className="mt-4 flex gap-2">
                {r.productIds.map((id) => {
                  const p = products.data?.find((x) => x.id === id);
                  return p ? (
                    <img
                      key={id}
                      src={p.image}
                      alt={p.name}
                      title={p.name}
                      className="h-14 w-12 rounded object-cover"
                    />
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
