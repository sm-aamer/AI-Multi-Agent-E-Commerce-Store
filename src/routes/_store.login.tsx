import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/common/AuthForm";
import { api, USE_MOCK } from "@/services/api";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/_store/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Velloria Classic" },
      { name: "description", content: "Sign in to view your orders." },
      { property: "og:title", content: "Sign in — Velloria Classic" },
      { property: "og:description", content: "Sign in to your Velloria Classic account." },
    ],
  }),
  component: Login,
});

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl">Welcome back</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">Sign in to track orders and request refunds.</p>
      <AuthForm
        mode="login"
        hint={USE_MOCK ? "Demo mode: any password works; try ayesha@example.com to see sample orders. Not real authentication." : undefined}
        onSubmit={async (v) => { const s = await api.login(v.email, v.password); signIn(s); navigate({ to: "/account" }); return s; }}
        footer={<p className="text-center text-sm">New here? <Link to="/register" className="underline">Create an account</Link></p>}
      />
    </div>
  );
}
