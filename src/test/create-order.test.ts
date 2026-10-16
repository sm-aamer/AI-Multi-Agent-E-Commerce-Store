import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/http";
import { createOrderWithGuestFallback, type OrderRequest } from "@/lib/create-order";
import type { Order } from "@/types";

const request: OrderRequest = {
  customerId: "customer-1",
  customerName: "Test Customer",
  email: "test@example.com",
  phone: "03001234567",
  address: { line1: "1 Test Street", city: "Lahore", postalCode: "54000", country: "Pakistan" },
  items: [{ productId: "product-1", name: "Test Product", price: 50, quantity: 1 }],
  subtotal: 50,
  shipping: 10,
  total: 60,
  paymentMethod: "cod",
};

const order: Order = {
  ...request,
  id: "order-1",
  createdAt: "2026-10-13",
  status: "pending",
  paymentStatus: "unpaid",
};

describe("createOrderWithGuestFallback", () => {
  it("clears an expired session and retries the order as a guest", async () => {
    const createOrder = vi
      .fn<(order: OrderRequest) => Promise<Order>>()
      .mockRejectedValueOnce(new ApiError(401, "Invalid authentication token"))
      .mockResolvedValueOnce(order);
    const clearSession = vi.fn();

    await expect(createOrderWithGuestFallback(createOrder, request, clearSession)).resolves.toEqual(
      {
        order,
        sessionExpiredFallback: true,
      },
    );
    expect(createOrder).toHaveBeenCalledTimes(2);
    expect(createOrder).toHaveBeenNthCalledWith(2, request);
    expect(clearSession).toHaveBeenCalledOnce();
  });

  it("does not retry errors other than an authentication failure", async () => {
    const error = new ApiError(409, "Insufficient stock");
    const createOrder = vi.fn<(order: OrderRequest) => Promise<Order>>().mockRejectedValue(error);
    const clearSession = vi.fn();

    await expect(createOrderWithGuestFallback(createOrder, request, clearSession)).rejects.toBe(
      error,
    );
    expect(createOrder).toHaveBeenCalledOnce();
    expect(clearSession).not.toHaveBeenCalled();
  });
});
