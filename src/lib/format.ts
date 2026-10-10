export const money = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
export const SHIPPING_FLAT = 10;
export const FREE_SHIPPING_OVER = 250;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT);
