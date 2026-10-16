// TanStack Query key/option factories wrapping the service layer.
import { queryOptions } from "@tanstack/react-query";
import type { ProductQuery } from "@/types";
import { api } from "./api";

export const q = {
  categories: () => queryOptions({ queryKey: ["categories"], queryFn: api.listCategories }),
  products: (f: ProductQuery = {}) =>
    queryOptions({ queryKey: ["products", f], queryFn: () => api.listProducts(f) }),
  product: (id: string) =>
    queryOptions({ queryKey: ["product", id], queryFn: () => api.getProduct(id), retry: false }),
  orders: (customerId?: string) =>
    queryOptions({
      queryKey: ["orders", customerId ?? "all"],
      queryFn: () => api.listOrders(customerId),
    }),
  order: (id: string) =>
    queryOptions({ queryKey: ["order", id], queryFn: () => api.getOrder(id), retry: false }),
  customers: () => queryOptions({ queryKey: ["customers"], queryFn: api.listCustomers }),
  refunds: () => queryOptions({ queryKey: ["refunds"], queryFn: api.listRefunds }),
  recommendations: () =>
    queryOptions({ queryKey: ["ai", "recs"], queryFn: api.listRecommendations }),
  pricing: () => queryOptions({ queryKey: ["ai", "pricing"], queryFn: api.listPricing }),
  descriptions: () =>
    queryOptions({ queryKey: ["ai", "descriptions"], queryFn: api.listDescriptions }),
};
