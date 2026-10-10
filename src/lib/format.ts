// Prices are quoted in Pakistani Rupees throughout the prototype.
export const money = (n: number) => `Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n)}`;
export const SHIPPING_FLAT = 500;
export const FREE_SHIPPING_OVER = 25000;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT);
