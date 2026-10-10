import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, type ReactNode } from "react";
import { FieldError } from "./states";
import type { Session } from "@/types";

const loginSchema = z.object({ email: z.string().trim().email("Enter a valid email"), password: z.string().min(6, "Password must be at least 6 characters") });
const registerSchema = loginSchema.extend({ name: z.string().trim().min(2, "Enter your name").max(100), confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = { name?: string; email: string; password: string; confirm?: string };

export function AuthForm({ mode, onSubmit, footer, hint }: { mode: "login" | "register"; onSubmit: (v: Values) => Promise<Session>; footer?: ReactNode; hint?: ReactNode }) {
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(mode === "login" ? loginSchema : registerSchema) as never });
  const submit = async (v: Values) => {
    setError("");
    try { await onSubmit(v); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
  };
  const field = (name: keyof Values, label: string, type = "text") => (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} type={type} className="field mt-1" {...register(name)} />
      <FieldError message={errors[name]?.message} />
    </div>
  );
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {mode === "register" && field("name", "Full name")}
      {field("email", "Email", "email")}
      {field("password", "Password", "password")}
      {mode === "register" && field("confirm", "Confirm password", "password")}
      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <button disabled={isSubmitting} className="btn btn-primary w-full">{isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {footer}
    </form>
  );
}
