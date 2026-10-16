import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/common/AuthForm";
import { api, USE_MOCK } from "@/services/api";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/_store/register")({
  head: () => ({
    meta: [
      { title: "Create account — Velloria Classic" },
      { name: "description", content: "Create a Velloria Classic account." },
      { property: "og:title", content: "Create account — Velloria Classic" },
      { property: "og:description", content: "Join Velloria Classic to track your orders." },
    ],
  }),
  component: Register,
});

function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-4xl">Create account</h1>
      <p className="mb-8 mt-2 text-sm text-muted-foreground">
        Track orders and get personalised picks.
      </p>
      <AuthForm
        mode="register"
        hint={USE_MOCK ? "Demo mode: accounts live in memory and reset on reload." : undefined}
        onSubmit={async (v) => {
          const s = await api.register(v.name!, v.email, v.password);
          signIn(s);
          navigate({ to: "/account" });
          return s;
        }}
        footer={
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
        }
      />
    </div>
  );
}
