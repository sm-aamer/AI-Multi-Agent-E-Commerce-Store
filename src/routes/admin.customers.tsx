import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Maison Admin" }, { name: "description", content: "Customer list" }, { property: "og:title", content: "Customers — Maison Admin" }, { property: "og:description", content: "Customer list" }] }),
  component: Customers,
});

function Customers() {
  const customers = useQuery(q.customers());
  const [s, setS] = useState("");
  const rows = customers.data?.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(s.toLowerCase()));
  return (
    <>
      <PageHeader title="Customers" description="Registered customer accounts." action={<input className="field w-64" placeholder="Search name or email" value={s} onChange={(e) => setS(e.target.value)} />} />
      <DataTable rows={rows} isLoading={customers.isLoading} error={customers.error} emptyTitle="No customers found"
        columns={[
          { header: "Name", cell: (c) => <span className="font-medium">{c.name}</span> },
          { header: "Email", cell: (c) => c.email },
          { header: "Phone", cell: (c) => c.phone ?? "—" },
          { header: "Joined", cell: (c) => c.createdAt },
          { header: "Orders", cell: (c) => c.orders },
          { header: "Spent", cell: (c) => money(c.spent) },
        ]} />
    </>
  );
}
