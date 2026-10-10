import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { ErrorState, LoadingState, StatusBadge } from "@/components/common/states";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — Maison Admin" }, { name: "description", content: "Store overview" }, { property: "og:title", content: "Overview — Maison Admin" }, { property: "og:description", content: "Store overview" }] }),
  component: Overview,
});

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return <div className="panel p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p>{sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}</div>;
}

function Overview() {
  const orders = useQuery(q.orders());
  const products = useQuery(q.products({}));
  const customers = useQuery(q.customers());
  if (orders.isLoading || products.isLoading || customers.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState error={orders.error} onRetry={() => orders.refetch()} />;
  const o = orders.data!, p = products.data!, c = customers.data!;
  const sales = o.filter((x) => x.status !== "cancelled").reduce((s, x) => s + x.total, 0);
  const pending = o.filter((x) => x.status === "pending").length;
  const lowStock = p.filter((x) => x.stock < 5).length;
  const flagged = o.filter((x) => (x.fraudScore ?? 0) > 0.5).length;
  const awaiting = o.filter((x) => x.paymentStatus === "awaiting_verification").length;

  return (
    <>
      <PageHeader title="Overview" description="Snapshot of store performance (sample data)." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total sales" value={money(sales)} sub={`${o.length} orders`} />
        <Stat label="Orders" value={o.length} sub={`${pending} pending`} />
        <Stat label="Products" value={p.length} sub={`${lowStock} low / out of stock`} />
        <Stat label="Customers" value={c.length} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/admin/payments" className="panel p-5 hover:border-foreground"><p className="font-semibold">{awaiting} bank transfers awaiting verification</p><p className="text-sm text-muted-foreground">Review references →</p></Link>
        <Link to="/admin/fraud" className="panel p-5 hover:border-foreground"><p className="font-semibold">{flagged} orders flagged for fraud</p><p className="text-sm text-muted-foreground">Review risk signals →</p></Link>
      </div>
      <h2 className="mb-3 mt-8 text-xl">Recent orders</h2>
      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y">
            {o.slice(0, 5).map((x) => (
              <tr key={x.id}><td className="p-3 font-medium">{x.id}</td><td className="p-3">{x.customerName}</td><td className="p-3"><StatusBadge status={x.status} /></td><td className="p-3 text-right">{money(x.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
