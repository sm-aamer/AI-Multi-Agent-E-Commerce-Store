import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { ErrorState, LoadingState, StatusBadge } from "@/components/common/states";
import type { OrderStatus } from "@/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — Velloria Classic Admin" }, { name: "description", content: "Store overview" }, { property: "og:title", content: "Overview — Velloria Classic Admin" }, { property: "og:description", content: "Store overview" }, { name: "robots", content: "noindex" }] }),
  component: Overview,
});

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return <div className="panel p-5"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-[26px] font-extrabold">{value}</p>{sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}</div>;
}

const chartAxis = { stroke: "#667574", fontSize: 11 };
const chartTooltipStyle = { borderRadius: 8, border: "1px solid #DCE5E2", fontSize: 12, fontFamily: "Inter, sans-serif" };

const allStatuses: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function Overview() {
  const orders = useQuery(q.orders());
  const products = useQuery(q.products({}));
  const customers = useQuery(q.customers());

  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders.data ?? []) {
      if (o.status === "cancelled") continue;
      map.set(o.createdAt, (map.get(o.createdAt) ?? 0) + o.total);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date: date.slice(5), total }));
  }, [orders.data]);

  const statusCounts = useMemo(
    () => allStatuses.map((s) => ({ status: s, count: (orders.data ?? []).filter((o) => o.status === s).length })),
    [orders.data],
  );

  if (orders.isLoading || products.isLoading || customers.isLoading) return <LoadingState />;
  if (orders.isError) return <ErrorState error={orders.error} onRetry={() => orders.refetch()} />;
  if (products.isError) return <ErrorState error={products.error} onRetry={() => products.refetch()} />;
  if (customers.isError) return <ErrorState error={customers.error} onRetry={() => customers.refetch()} />;
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-base font-bold">Sales by day</h2>
          <p className="text-xs text-muted-foreground">Non-cancelled orders, USD</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDay} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE5E2" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: "#DCE5E2" }} tick={chartAxis} />
                <YAxis tickLine={false} axisLine={false} tick={chartAxis} width={64} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip cursor={{ fill: "rgba(16,185,129,0.06)" }} contentStyle={chartTooltipStyle} formatter={(v) => [money(Number(v)), "Sales"]} />
                <Bar dataKey="total" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-base font-bold">Orders by status</h2>
          <p className="text-xs text-muted-foreground">Fulfilment pipeline</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE5E2" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={{ stroke: "#DCE5E2" }} tick={chartAxis} />
                <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} tick={chartAxis} width={90} />
                <Tooltip cursor={{ fill: "rgba(16,43,43,0.05)" }} contentStyle={chartTooltipStyle} formatter={(v) => [v, "Orders"]} />
                <Bar dataKey="count" fill="#102B2B" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/admin/payments" className="panel p-5 transition-colors hover:border-foreground"><p className="font-semibold">{awaiting} bank transfers awaiting verification</p><p className="text-sm text-muted-foreground">Review references →</p></Link>
        <Link to="/admin/fraud" className="panel p-5 transition-colors hover:border-foreground"><p className="font-semibold">{flagged} orders flagged for fraud</p><p className="text-sm text-muted-foreground">Review risk signals →</p></Link>
      </div>
      <h2 className="mb-3 mt-8 text-xl">Recent orders</h2>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3 font-semibold">Order</th><th className="p-3 font-semibold">Customer</th><th className="p-3 font-semibold">Status</th><th className="p-3 text-right font-semibold">Total</th></tr>
          </thead>
          <tbody className="divide-y">
            {o.slice(0, 5).map((x) => (
              <tr key={x.id} className="hover:bg-muted/40"><td className="p-3 font-medium">{x.id}</td><td className="p-3">{x.customerName}</td><td className="p-3"><StatusBadge status={x.status} /></td><td className="p-3 text-right">{money(x.total)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
