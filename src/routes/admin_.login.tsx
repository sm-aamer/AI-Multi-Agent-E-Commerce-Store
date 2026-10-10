import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/common/AuthForm";
import { MockBanner } from "@/components/common/states";
import { api, USE_MOCK } from "@/services/api";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Maison" },
      { name: "description", content: "Staff sign in for the Maison admin dashboard." },
      { property: "og:title", content: "Admin sign in — Maison" },
      { property: "og:description", content: "Staff sign in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-sidebar">
      <MockBanner />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="panel w-full max-w-sm p-8">
          <p className="font-display text-2xl">Maison <span className="text-sm text-muted-foreground">Admin</span></p>
          <h1 className="mb-6 mt-4 text-2xl">Staff sign in</h1>
          <AuthForm
            mode="login"
            hint={USE_MOCK ? "Demo: admin@demo.com with any 6+ character password. Not real authentication." : undefined}
            onSubmit={async (v) => { const s = await api.login(v.email, v.password, true); signIn(s); navigate({ to: "/admin" }); return s; }}
            footer={<Link to="/" className="block text-center text-sm underline">Back to store</Link>}
          />
        </div>
      </div>
    </div>
  );
}
