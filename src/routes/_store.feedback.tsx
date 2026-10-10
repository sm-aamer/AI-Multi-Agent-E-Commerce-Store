import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { api, USE_MOCK } from "@/services/api";
import { useAuth } from "@/store/auth";
import { FieldError } from "@/components/common/states";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  rating: z.coerce.number().int().min(1, "Choose a 1–5 star rating").max(5, "Choose a 1–5 star rating"),
  message: z.string().trim().min(10, "Tell us a little more (min 10 characters)").max(1000, "Keep feedback under 1,000 characters"),
  orderId: z.string().trim().max(30, "Order numbers are short").optional(),
});
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/_store/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — Velloria Classic" },
      { name: "description", content: "Share feedback about your Velloria Classic experience." },
      { property: "og:title", content: "Feedback — Velloria Classic" },
      { property: "og:description", content: "Share feedback about your Velloria Classic experience." },
    ],
  }),
  component: Feedback,
});

function Feedback() {
  const { session } = useAuth();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", rating: 0, message: "", orderId: "" },
  });
  const rating = watch("rating");

  useEffect(() => {
    if (session?.user.role === "customer") {
      setValue("name", session.user.name);
      setValue("email", session.user.email);
    }
  }, [session, setValue]);

  const onSubmit = async (f: Form) => {
    try {
      await api.submitFeedback({ ...f, rating: Number(f.rating), orderId: f.orderId?.trim() || undefined });
      setSent(true);
      toast.success("Thank you for your feedback");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send feedback — please try again");
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="panel p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-[26px]">Thank you</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your feedback has been received — it helps us shape the collection and the experience around it.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button className="btn btn-primary" onClick={() => { reset({ name: "", email: "", rating: 0, message: "", orderId: "" }); setSent(false); }}>Send another</button>
            <Link to="/shop" className="btn btn-outline">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 md:px-8">
      <p className="eyebrow">We listen</p>
      <h1 className="mt-2 text-[28px] md:text-[34px]">Share your feedback</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what worked and what didn't — every submission is read by our team.
      </p>

      <p className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
        Prototype notice: submissions are <span className="font-semibold">simulated in demo mode</span> and are not stored.
        Connecting this form to production requires a <span className="font-mono">POST /feedback</span> endpoint on the
        FastAPI backend (fields: name, email, rating, message, order_id) — the frontend service layer is already wired for it.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="panel mt-6 space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fb-name" className="text-sm font-medium">Name</label>
            <input id="fb-name" className="field mt-1" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label htmlFor="fb-email" className="text-sm font-medium">Email</label>
            <input id="fb-email" type="email" className="field mt-1" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium" id="fb-rating-label">Rating</p>
          <div className="mt-1.5 flex items-center gap-1" role="radiogroup" aria-labelledby="fb-rating-label">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                onClick={() => setValue("rating", n, { shouldValidate: true })}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star className={`h-7 w-7 ${n <= Number(rating) ? "fill-warning text-warning" : "text-border"}`} />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">{rating ? `${rating}/5` : "Not rated"}</span>
          </div>
          <FieldError message={errors.rating?.message} />
        </div>

        <div>
          <label htmlFor="fb-order" className="text-sm font-medium">Order number <span className="text-muted-foreground">(optional)</span></label>
          <input id="fb-order" className="field mt-1" placeholder="e.g. ORD-1042" {...register("orderId")} />
          <FieldError message={errors.orderId?.message} />
        </div>

        <div>
          <label htmlFor="fb-message" className="text-sm font-medium">Message</label>
          <textarea id="fb-message" className="field mt-1 min-h-32" placeholder="What did you love? What could be better?" {...register("message")} />
          <FieldError message={errors.message?.message} />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? "Sending…" : "Submit feedback"}
        </button>
        {!USE_MOCK && <p className="text-center text-xs text-muted-foreground">Sent to the Velloria Classic support team.</p>}
      </form>
    </div>
  );
}
