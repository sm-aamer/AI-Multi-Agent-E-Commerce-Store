// Single entry point for all data access. UI code imports `api` only.
// Toggle with VITE_USE_MOCK_API=false and point VITE_API_BASE_URL at FastAPI.
import type { AIRecommendation, Category, Customer, DescriptionDraft, Order, PricingSuggestion, Product, ProductQuery, RefundRequest, RequestStatus, Session } from "@/types";
import { http, qs, USE_MOCK } from "./http";
import { mockApi } from "./mock";

const j = (b: unknown) => JSON.stringify(b);

const restApi: typeof mockApi = {
  listCategories: () => http<Category[]>("/categories"),
  saveCategory: (c) => (c.id ? http<Category>(`/categories/${c.id}`, { method: "PUT", body: j(c) }) : http<Category>("/categories", { method: "POST", body: j(c) })),
  listProducts: (q = {}) => http<Product[]>(`/products${qs(q as ProductQuery)}`),
  getProduct: (id) => http<Product>(`/products/${id}`),
  saveProduct: (p) => (p.id ? http<Product>(`/products/${p.id}`, { method: "PUT", body: j(p) }) : http<Product>("/products", { method: "POST", body: j(p) })),
  deleteProduct: (id) => http<undefined>(`/products/${id}`, { method: "DELETE" }),
  login: (email, password, admin = false) => http<Session>(admin ? "/auth/admin/login" : "/auth/login", { method: "POST", body: j({ email, password }) }),
  register: (name, email, password) => http<Session>("/auth/register", { method: "POST", body: j({ name, email, password }) }),
  listOrders: (customerId) => http<Order[]>(customerId ? "/orders/me" : "/admin/orders"),
  getOrder: (id) => http<Order>(`/orders/${id}`),
  createOrder: (o) => http<Order>("/orders", { method: "POST", body: j(o) }),
  updateOrder: (id, patch) => http<Order>(`/admin/orders/${id}`, { method: "PATCH", body: j(patch) }),
  listCustomers: () => http<Customer[]>("/admin/customers"),
  listRefunds: () => http<RefundRequest[]>("/admin/refunds"),
  createRefund: (r) => http<RefundRequest>("/refunds", { method: "POST", body: j(r) }),
  decideRefund: (id, status: RequestStatus) => http<RefundRequest>(`/admin/refunds/${id}`, { method: "PATCH", body: j({ status }) }),
  // AI agent endpoints (LangGraph agents, to be implemented in the backend)
  listRecommendations: () => http<AIRecommendation[]>("/admin/ai/recommendations"),
  listPricing: () => http<PricingSuggestion[]>("/admin/ai/pricing"),
  decidePricing: (id, status) => http<PricingSuggestion>(`/admin/ai/pricing/${id}`, { method: "PATCH", body: j({ status }) }),
  listDescriptions: () => http<DescriptionDraft[]>("/admin/ai/descriptions"),
  decideDescription: (id, status) => http<DescriptionDraft>(`/admin/ai/descriptions/${id}`, { method: "PATCH", body: j({ status }) }),
};

export const api = USE_MOCK ? mockApi : restApi;
export { USE_MOCK };
