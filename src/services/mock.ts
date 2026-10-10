// In-memory mock implementation of the API. Changes reset on page reload.
// Nothing here processes payments, verifies passwords, or persists to a database.
import * as db from "@/mocks/data";
import type { Category, Customer, Order, Product, ProductQuery, RefundRequest, RequestStatus, Session } from "@/types";
import { ApiError } from "./http";

const delay = <T,>(v: T, ms = 450) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), ms));
const state = {
  products: [...db.products], orders: [...db.orders], customers: [...db.customers], refunds: [...db.refundRequests],
  pricing: [...db.pricingSuggestions], descriptions: [...db.descriptionDrafts], categories: [...db.categories],
};

export const mockApi = {
  listCategories: () => delay(state.categories),
  saveCategory: (c: Category) => {
    const i = state.categories.findIndex((x) => x.id === c.id);
    if (i >= 0) state.categories[i] = c; else state.categories.push({ ...c, id: `c${Date.now()}` });
    return delay(c);
  },
  listProducts: (q: ProductQuery = {}) => {
    let list = state.products.filter((p) =>
      (!q.q || p.name.toLowerCase().includes(q.q.toLowerCase())) &&
      (!q.category || state.categories.find((c) => c.slug === q.category)?.id === p.categoryId) &&
      (q.minPrice === undefined || p.price >= q.minPrice) &&
      (q.maxPrice === undefined || p.price <= q.maxPrice));
    const s = q.sort ?? "featured";
    list = [...list].sort((a, b) =>
      s === "price-asc" ? a.price - b.price : s === "price-desc" ? b.price - a.price : s === "rating" ? b.rating - a.rating :
      s === "newest" ? b.id.localeCompare(a.id, undefined, { numeric: true }) : Number(!!b.featured) - Number(!!a.featured));
    return delay(list);
  },
  getProduct: (id: string) => {
    const p = state.products.find((x) => x.id === id);
    return p ? delay(p) : Promise.reject(new ApiError(404, "Product not found"));
  },
  saveProduct: (p: Product) => {
    const i = state.products.findIndex((x) => x.id === p.id);
    if (i >= 0) state.products[i] = p; else state.products.unshift({ ...p, id: `p${Date.now()}` });
    return delay(p);
  },
  deleteProduct: (id: string) => { state.products = state.products.filter((p) => p.id !== id); return delay(undefined); },

  login: (email: string, _password: string, admin = false): Promise<Session> => {
    if (admin) {
      if (email !== "admin@demo.com") return Promise.reject(new ApiError(401, "Use admin@demo.com for the demo admin."));
      return delay({ token: "mock-admin", user: { id: "a1", name: "Store Admin", email, createdAt: "2026-01-01", orders: 0, spent: 0, role: "admin" } });
    }
    const user = state.customers.find((c) => c.email === email) ?? state.customers[0];
    if (!user) return Promise.reject(new ApiError(401, "No demo customer accounts available."));
    return delay({ token: "mock-" + user.id, user: { ...user, email } });
  },
  register: (name: string, email: string, _password?: string): Promise<Session> => {
    if (state.customers.some((c) => c.email === email)) return Promise.reject(new ApiError(409, "An account with this email already exists."));
    const user: Customer = { id: `u${Date.now()}`, name, email, createdAt: new Date().toISOString().slice(0, 10), orders: 0, spent: 0, role: "customer" };
    state.customers.push(user);
    return delay({ token: "mock-" + user.id, user });
  },

  listOrders: (customerId?: string) => delay(state.orders.filter((o) => !customerId || o.customerId === customerId)),
  getOrder: (id: string) => {
    const o = state.orders.find((x) => x.id === id);
    return o ? delay(o) : Promise.reject(new ApiError(404, "Order not found"));
  },
  createOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus">) => {
    const order: Order = { ...o, id: `ORD-${1050 + state.orders.length}`, createdAt: new Date().toISOString().slice(0, 10), status: "pending",
      paymentStatus: o.paymentMethod === "bank_transfer" ? "awaiting_verification" : "unpaid" };
    state.orders.unshift(order);
    return delay(order, 900);
  },
  updateOrder: (id: string, patch: Partial<Order>) => {
    const o = state.orders.find((x) => x.id === id)!;
    Object.assign(o, patch);
    return delay(o);
  },

  listCustomers: () => delay(state.customers),

  listRefunds: () => delay(state.refunds),
  createRefund: (r: Omit<RefundRequest, "id" | "status" | "createdAt">) => {
    const req: RefundRequest = { ...r, id: `RR-${300 + state.refunds.length}`, status: "pending", createdAt: new Date().toISOString().slice(0, 10) };
    state.refunds.unshift(req);
    return delay(req);
  },
  decideRefund: (id: string, status: RequestStatus) => { const r = state.refunds.find((x) => x.id === id)!; r.status = status; return delay(r); },

  listRecommendations: () => delay(db.recommendations),
  listPricing: () => delay(state.pricing),
  decidePricing: (id: string, status: RequestStatus) => { const r = state.pricing.find((x) => x.id === id)!; r.status = status; return delay(r); },
  listDescriptions: () => delay(state.descriptions),
  decideDescription: (id: string, status: RequestStatus) => { const r = state.descriptions.find((x) => x.id === id)!; r.status = status; return delay(r); },
};
