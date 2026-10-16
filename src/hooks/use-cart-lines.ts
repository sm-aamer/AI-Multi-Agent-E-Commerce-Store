import { useQuery } from "@tanstack/react-query";
import { q } from "@/services/queries";
import { useCart } from "@/store/cart";
import { shippingFor } from "@/lib/format";

export function useCartLines() {
  const cart = useCart();
  const products = useQuery(q.products({}));
  const lines = cart.items.flatMap((i) => {
    const product = products.data?.find((p) => p.id === i.productId);
    return product ? [{ ...i, product, lineTotal: product.price * i.quantity }] : [];
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = shippingFor(subtotal);
  return {
    cart,
    lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    isLoading: products.isLoading,
    error: products.error,
  };
}
