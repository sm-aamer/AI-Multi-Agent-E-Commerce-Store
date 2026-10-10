import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { USE_MOCK } from "@/services/api";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-md bg-muted" />
          <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
          <div className="mt-2 h-4 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <h3 className="mt-4 text-xl">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <h3 className="mt-3 text-lg">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted-foreground">{error instanceof Error ? error.message : "Unexpected error"}</p>
      {onRetry && <button className="btn btn-outline mt-4" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
}

export function MockBanner() {
  if (!USE_MOCK) return null;
  return (
    <div className="bg-warning/20 px-4 py-1.5 text-center text-xs text-foreground">
Prototype mode — Velloria Classic demo data only. Payments, sign-in and saved orders are not real until the backend is connected.
    </div>
  );
}

const tones: Record<string, string> = {
  pending: "bg-warning/20 text-foreground", awaiting_verification: "bg-warning/20 text-foreground", unpaid: "bg-muted text-muted-foreground",
  confirmed: "bg-info/15 text-info", shipped: "bg-info/15 text-info",
  delivered: "bg-success/15 text-success", verified: "bg-success/15 text-success", approved: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive", rejected: "bg-destructive/10 text-destructive",
};
export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tones[status] ?? "bg-muted"}`}>{status.replace(/_/g, " ")}</span>;
}
