import type { ReactNode } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";

export type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string };

export function DataTable<T extends { id: string }>({ rows, columns, isLoading, error, onRetry, emptyTitle = "Nothing here yet" }: {
  rows?: T[]; columns: Column<T>[]; isLoading?: boolean; error?: unknown; onRetry?: () => void; emptyTitle?: string;
}) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={emptyTitle} />;
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>{columns.map((c) => <th key={c.header} className={`p-3 font-semibold ${c.className ?? ""}`}>{c.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => <tr key={r.id} className="align-top">{columns.map((c) => <td key={c.header} className={`p-3 ${c.className ?? ""}`}>{c.cell(r)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
