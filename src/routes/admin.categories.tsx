import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { FieldError } from "@/components/common/states";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@/types";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Trendora Admin" }, { name: "description", content: "Manage storefront categories" }, { property: "og:title", content: "Categories — Trendora Admin" }, { property: "og:description", content: "Manage storefront categories" }, { name: "robots", content: "noindex" }] }),
  component: Categories,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  slug: z.string().trim().min(2, "Slug is required").max(60).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  image: z.string().trim().min(1, "Image URL is required"),
  blurb: z.string().trim().max(120).optional(),
});
type Form = z.infer<typeof schema>;

function Categories() {
  const qc = useQueryClient();
  const cats = useQuery(q.categories());
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <>
      <PageHeader title="Categories" description="Storefront collections shown on the home page and filters (sample data)."
        action={<button className="btn btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Add category</button>} />
      <DataTable rows={cats.data} isLoading={cats.isLoading} error={cats.error} onRetry={() => cats.refetch()} emptyTitle="No categories"
        columns={[
          { header: "Category", cell: (c) => <div className="flex items-center gap-3"><img src={c.image} alt="" className="h-12 w-10 rounded object-cover" /><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug}</p></div></div> },
          { header: "Blurb", className: "max-w-xs", cell: (c) => <p className="text-muted-foreground">{c.blurb ?? "—"}</p> },
          { header: "", className: "text-right", cell: (c) => (
            <button className="btn btn-ghost px-2" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></button>
          ) },
        ]} />
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === "new" ? "Add category" : "Edit category"}</DialogTitle></DialogHeader>
          {editing && (
            <CategoryForm
              category={editing === "new" ? undefined : editing}
              saving={saving}
              onSubmit={async (f) => {
                setSaving(true);
                try {
                  await api.saveCategory({ ...(editing === "new" ? { id: "" } : editing), ...f } as Category);
                  toast.success(editing === "new" ? "Category added" : "Category updated");
                  qc.invalidateQueries({ queryKey: ["categories"] });
                  setEditing(null);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not save category");
                } finally {
                  setSaving(false);
                }
              }}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryForm({ category, onSubmit, onDone, saving }: {
  category?: Category;
  onSubmit: (f: Form) => Promise<void>;
  onDone: () => void;
  saving: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: category ?? { name: "", slug: "", image: "", blurb: "" },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div><label className="text-sm font-medium" htmlFor="cat-name">Name</label><input id="cat-name" className="field mt-1" {...register("name")} /><FieldError message={errors.name?.message} /></div>
      <div><label className="text-sm font-medium" htmlFor="cat-slug">Slug</label><input id="cat-slug" className="field mt-1" placeholder="e.g. outerwear" {...register("slug")} /><FieldError message={errors.slug?.message} /></div>
      <div><label className="text-sm font-medium" htmlFor="cat-image">Image URL</label><input id="cat-image" className="field mt-1" {...register("image")} /><FieldError message={errors.image?.message} /></div>
      <div><label className="text-sm font-medium" htmlFor="cat-blurb">Blurb (optional)</label><input id="cat-blurb" className="field mt-1" {...register("blurb")} /><FieldError message={errors.blurb?.message} /></div>
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
    </form>
  );
}
