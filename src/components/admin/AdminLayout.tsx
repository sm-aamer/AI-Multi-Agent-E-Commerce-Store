import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3, Boxes, CreditCard, FileText, LayoutDashboard, LogOut, Menu, Settings, RotateCcw,
  ShieldAlert, ShoppingCart, Sparkles, Tags, Users, X,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { LoadingState, MockBanner } from "@/components/common/states";

const groups = [
  { title: "Store", items: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/products", label: "Products", icon: Boxes },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/customers", label: "Customers", icon: Users },
  ] },
  { title: "Operations", items: [
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/refunds", label: "Refund Requests", icon: RotateCcw },
    { to: "/admin/fraud", label: "Fraud Review", icon: ShieldAlert },
  ] },
  { title: "AI agents", items: [
    { to: "/admin/recommendations", label: "AI Recommendations", icon: Sparkles },
    { to: "/admin/pricing", label: "Competitor Pricing", icon: Tags },
    { to: "/admin/descriptions", label: "Product SEO Assistant", icon: FileText },
  ] },
  { title: "System", items: [
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ] },
] as const;

export function AdminLayout() {
  const { session, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!ready) return <LoadingState />;
  if (session?.user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center"><h1 className="text-3xl">Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">Sign in with a Velloria Classic staff account to continue.</p>
          <Link to="/admin/login" className="btn btn-primary mt-6">Admin sign in</Link></div>
      </div>
    );
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link to="/admin" className="px-2 font-display text-2xl font-extrabold text-white">Velloria Classic <span className="text-xs font-sans font-medium text-sidebar-foreground/60">Admin</span></Link>
      {groups.map((g) => (
        <div key={g.title}>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">{g.title}</p>
          {g.items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} activeOptions={{ exact: to === "/admin" }}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"
              activeProps={{ className: "bg-sidebar-accent font-semibold text-white" }}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </div>
      ))}
      <div className="mt-auto space-y-1 border-t border-sidebar-border pt-4">
        <Link to="/" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"><BarChart3 className="h-4 w-4" />View store</Link>
        <button onClick={() => { signOut(); navigate({ to: "/admin/login", replace: true }); }} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"><LogOut className="h-4 w-4" />Sign out</button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <MockBanner />
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 bg-sidebar text-sidebar-foreground lg:block">{sidebar}</aside>
        {open && <div className="fixed inset-0 z-50 flex lg:hidden"><aside className="w-72 bg-sidebar text-sidebar-foreground">{sidebar}</aside><button className="flex-1 bg-foreground/40" aria-label="Close" onClick={() => setOpen(false)} /></div>}
        <div className="min-w-0 flex-1">
          <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:px-8">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground lg:hidden">Velloria Classic Admin</Link>
            <p className="ml-auto text-sm text-muted-foreground">{session.user.email}</p>
          </header>
          <main className="p-4 md:p-8"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-[26px] md:text-[30px]">{title}</h1>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
      {action}
    </div>
  );
}

export function AgentNotice({ agent }: { agent: string }) {
  return <p className="mb-6 rounded-md border border-info/30 bg-info/10 p-3 text-xs text-info">Output shown is sample data. The {agent} LangGraph agent is not connected yet — suggestions will come from the FastAPI backend.</p>;
}
