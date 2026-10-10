import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/store/auth";
import { EmptyState, LoadingState } from "@/components/common/states";

export function RequireCustomer({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  if (!ready) return <LoadingState />;
  if (!session || session.user.role !== "customer")
    return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Please sign in" body="Sign in to view your orders." action={<Link to="/login" className="btn btn-primary">Sign in</Link>} /></div>;
  return <>{children}</>;
}
