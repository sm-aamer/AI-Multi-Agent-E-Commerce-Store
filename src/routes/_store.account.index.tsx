import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { q } from "@/services/queries";
import { useAuth } from "@/store/auth";
import { money } from "@/lib/format";
import { RequireCustomer } from "@/components/store/RequireCustomer";
import { EmptyState, ErrorState, LoadingState, StatusBadge } from "@/components/common/states";

export const Route = createFileRoute("/_store/account/")({
  head: () => ({
    meta: [
      { title: "My orders — Velloria Classic" },
      { name: "description", content: "Your order history." },
      { property: "og:title", content: "My orders — Velloria Classic" },
      { property: "og:description", content: "Your order history." },
    ],
  }),
  component: () => (
    <RequireCustomer>
      <Orders />
    </RequireCustomer>
  ),
});

function Orders() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const orders = useQuery(q.orders(session!.user.id));
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-4xl">Hello, {session!.user.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground">{session!.user.email}</p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            signOut();
            navigate({ to: "/login", replace: true });
          }}
        >
          Sign out
        </button>
      </div>
      <h2 className="mb-4 mt-10 text-2xl">Order history</h2>
      {orders.isLoading ? (
        <LoadingState />
      ) : orders.isError ? (
        <ErrorState error={orders.error} onRetry={() => orders.refetch()} />
      ) : orders.data!.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="When you place an order it will appear here."
          action={
            <Link to="/shop" className="btn btn-primary">
              Shop now
            </Link>
          }
        />
      ) : (
        <div className="panel divide-y">
          {orders.data!.map((o) => (
            <Link
              key={o.id}
              to="/account/orders/$id"
              params={{ id: o.id }}
              className="flex flex-wrap items-center gap-4 p-4 hover:bg-muted"
            >
              <div className="flex-1">
                <p className="font-semibold">{o.id}</p>
                <p className="text-xs text-muted-foreground">
                  {o.createdAt} · {o.items.length} item(s)
                </p>
              </div>
              <StatusBadge status={o.status} />
              <p className="w-24 text-right font-medium">{money(o.total)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
