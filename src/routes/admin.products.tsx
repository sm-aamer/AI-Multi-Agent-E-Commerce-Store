import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { q } from "@/services/queries";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/admin/DataTable";
import { FieldError } from "@/components/common/states";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/types";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Maison Admin" }, { name: "description", content: "Manage products" }, { property: "og:title", content: "Products — Maison Admin" }, { property: "og:description", content: "Manage products" }] }),
  component: Products,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  description: z.string().trim().min(10, "At least 10 characters").max(2000),
  price: z.coerce.number().positive("Price must be greater than 0"),
  categoryId: z.string().min(1, "Choose a category"),
  stock: z.coerce.number().int("Whole number").min(0, "Cannot be negative"),
  image: z.string().trim().min(1, "Image URL is required"),
});
type Form = z.infer<typeof schema>;

function Products() {
  const qc = useQueryClient();
  const products = useQuery(q.products({}));
  const cats = useQuery(q.categories());
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const del = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => { toast.success("Product deleted"); qc.invalidateQueries({ queryKey: ["products"] }); },
  });

  return (
    <>
      <PageHeader title="Products" description="Add, edit and remove catalogue items." action={<button className="btn btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Add product</button>} />
      <DataTable rows={products.data} isLoading={products.isLoading} error={products.error} onRetry={() => products.refetch()} emptyTitle="No products yet"
        columns={[
          { header: "Product", cell: (p) => <div className="flex items-center gap-3"><img src={p.image} alt="" className="h-12 w-10 rounded object-cover" /><span className="font-medium">{p.name}</span></div> },
          { header: "Category", cell: (p) => cats.data?.find((c) => c.id === p.categoryId)?.name },
          { header: "Price", cell: (p) => money(p.price) },
          { header: "Stock", cell: (p) => <span className={p.stock === 0 ? "text-destructive" : p.stock < 5 ? "text-warning" : ""}>{p.stock}</span> },
          { header: "", className: "text-right", cell: (p) => (
            <div className="flex justify-end gap-1">
              <button className="btn btn-ghost px-2" aria-label="Edit" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></button>
              <button className="btn btn-ghost px-2 text-destructive" aria-label="Delete" onClick={() => confirm(`Delete ${p.name}?`) && del.mutate(p.id)}><Trash2 className="h-4 w-4" /></button>
            </div>
          ) },
        ]} />
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add product" : "Edit product"}</DialogTitle></DialogHeader>
          {editing && <ProductForm product={editing === "new" ? undefined : editing} categories={cats.data ?? []} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductForm({ product, categories, onDone }: { product?: Product; categories: { id: string; name: string }[]; onDone: () => void }) {
  const qc = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema) as never,
    defaultValues: product ?? { name: "", description: "", price: 0, categoryId: "", stock: 0, image: "" },
  });
  const img = watch("image");
  const submit = async (f: Form) => {
    await api.saveProduct({ ...(product ?? { id: "", slug: "", rating: 0 }), ...f, slug: f.name.toLowerCase().replace(/\s+/g, "-") } as Product);
    toast.success(product ? "Product updated" : "Product added");
    qc.invalidateQueries({ queryKey: ["products"] });
    onDone();
  };
  const field = (name: keyof Form, label: string, type = "text") => (
    <div><label className="text-sm font-medium" htmlFor={name}>{label}</label><input id={name} type={type} step="any" className="field mt-1" {...register(name)} /><FieldError message={errors[name]?.message} /></div>
  );
  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      {field("name", "Name")}
      <div><label className="text-sm font-medium" htmlFor="description">Description</label><textarea id="description" className="field mt-1 min-h-24" {...register("description")} /><FieldError message={errors.description?.message} /></div>
      <div className="grid grid-cols-2 gap-4">{field("price", "Price (USD)", "number")}{field("stock", "Stock", "number")}</div>
      <div><label className="text-sm font-medium" htmlFor="categoryId">Category</label>
        <select id="categoryId" className="field mt-1" {...register("categoryId")}><option value="">Select…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <FieldError message={errors.categoryId?.message} /></div>
      {field("image", "Image URL")}
      {img && <img src={img} alt="Preview" className="h-24 w-20 rounded object-cover" />}
      <p className="text-xs text-muted-foreground">File upload will be handled by the FastAPI backend; paste a URL for now.</p>
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button><button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save"}</button></div>
    </form>
  );
}
