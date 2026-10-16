import type { Order } from "@/types";
import { ApiError } from "@/services/http";

export type OrderRequest = Omit<Order, "id" | "createdAt" | "status" | "paymentStatus">;

export async function createOrderWithGuestFallback(
  createOrder: (order: OrderRequest) => Promise<Order>,
  order: OrderRequest,
  clearSession: () => void,
): Promise<{ order: Order; sessionExpiredFallback: boolean }> {
  try {
    return { order: await createOrder(order), sessionExpiredFallback: false };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    clearSession();
    return { order: await createOrder(order), sessionExpiredFallback: true };
  }
}
