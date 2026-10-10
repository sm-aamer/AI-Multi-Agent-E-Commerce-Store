// MOCK DATA — prototype only. Never imported by UI directly; only by src/services/mock/*.
import apparel from "@/assets/cat-apparel.jpg";
import footwear from "@/assets/cat-footwear.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import hero from "@/assets/hero.jpg";
import type { AIRecommendation, Category, Customer, DescriptionDraft, Order, PricingSuggestion, Product, RefundRequest } from "@/types";

export const categories: Category[] = [
  { id: "c1", name: "Women's Fashion", slug: "women", image: hero, blurb: "Tailored layers, knitwear and trousers." },
  { id: "c2", name: "Men's Fashion", slug: "men", image: apparel, blurb: "Shirts, tees and outerwear, refined." },
  { id: "c3", name: "Footwear", slug: "footwear", image: footwear, blurb: "Sneakers, loafers and boots." },
  { id: "c4", name: "Accessories", slug: "accessories", image: accessories, blurb: "Bags, eyewear and finishing touches." },
];

const img: Record<string, string> = { c1: hero, c2: apparel, c3: footwear, c4: accessories };
// [name, price (PKR), categoryId, stock, rating, featured?, compareAtPrice?, isNew?, reviewCount?]
const raw: [string, number, string, number, number, boolean?, number?, boolean?, number?][] = [
  ["Camel Wool Overcoat", 34999, "c1", 12, 4.8, true, 42999, true, 126],
  ["Double-Breasted Trench", 28999, "c1", 3, 4.6, true, undefined, false, 84],
  ["Pleated Wide Trousers", 12499, "c1", 22, 4.5, false, undefined, true, 57],
  ["Merino Mock Neck", 14999, "c1", 18, 4.9, true, 17999, false, 203],
  ["Linen Relaxed Shirt", 9999, "c2", 40, 4.7, true, undefined, true, 141],
  ["Organic Cotton Tee", 4499, "c2", 120, 4.4, false, undefined, true, 312],
  ["Quilted Liner Jacket", 19999, "c2", 0, 4.3, false, undefined, false, 45],
  ["Leather Court Sneaker", 16999, "c3", 25, 4.6, true, undefined, false, 168],
  ["Suede Penny Loafer", 18499, "c3", 9, 4.8, false, undefined, true, 92],
  ["Chelsea Boot", 22999, "c3", 6, 4.5, false, undefined, false, 76],
  ["Cognac Leather Tote", 24999, "c4", 14, 4.9, true, 28999, true, 118],
  ["Tortoise Sunglasses", 8999, "c4", 30, 4.2, false, undefined, false, 64],
];
export const products: Product[] = raw.map(([name, price, categoryId, stock, rating, featured, compareAtPrice, isNew, reviewCount], i) => ({
  id: `p${i + 1}`,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description: `The ${name.toLowerCase()} is cut from carefully sourced materials and finished by hand. A considered wardrobe staple designed to be worn season after season.`,
  price, compareAtPrice, categoryId, stock, rating, featured, isNew, reviewCount,
  image: img[categoryId]!,
  material: categoryId === "c4" ? "Full-grain leather & acetate" : categoryId === "c3" ? "Leather upper, cushioned sole" : "Premium natural-fibre blend",
  sizes: categoryId === "c4" ? undefined : categoryId === "c3" ? ["40", "41", "42", "43", "44"] : ["XS", "S", "M", "L", "XL"],
}));

export const customers: Customer[] = [
  { id: "u1", name: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 1234567", createdAt: "2026-03-14", orders: 3, spent: 84500, role: "customer" },
  { id: "u2", name: "Bilal Ahmed", email: "bilal@example.com", phone: "+92 321 7654321", createdAt: "2026-05-02", orders: 1, spent: 34999, role: "customer" },
  { id: "u3", name: "Sara Malik", email: "sara@example.com", createdAt: "2026-07-21", orders: 2, spent: 129400, role: "customer" },
  { id: "u4", name: "Omar Farooq", email: "omar@example.com", createdAt: "2026-09-01", orders: 0, spent: 0, role: "customer" },
];

const addr = { line1: "12 Main Boulevard, Gulberg", city: "Lahore", postalCode: "54000", country: "Pakistan" };
export const orders: Order[] = [
  { id: "ORD-1042", customerId: "u1", customerName: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 1234567", address: addr, items: [{ productId: "p1", name: "Camel Wool Overcoat", price: 34999, quantity: 1, size: "M" }], subtotal: 34999, shipping: 0, total: 34999, status: "delivered", paymentMethod: "bank_transfer", paymentStatus: "verified", bankReference: "HBL-88213", fraudScore: 0.05, createdAt: "2026-09-20" },
  { id: "ORD-1043", customerId: "u1", customerName: "Ayesha Khan", email: "ayesha@example.com", phone: "+92 300 1234567", address: addr, items: [{ productId: "p5", name: "Linen Relaxed Shirt", price: 9999, quantity: 2, size: "S" }, { productId: "p12", name: "Tortoise Sunglasses", price: 8999, quantity: 1 }], subtotal: 28997, shipping: 0, total: 28997, status: "shipped", paymentMethod: "cod", paymentStatus: "unpaid", fraudScore: 0.12, createdAt: "2026-10-02" },
  { id: "ORD-1044", customerId: "u2", customerName: "Bilal Ahmed", email: "bilal@example.com", phone: "+92 321 7654321", address: { ...addr, city: "Karachi" }, items: [{ productId: "p1", name: "Camel Wool Overcoat", price: 34999, quantity: 1, size: "L" }], subtotal: 34999, shipping: 0, total: 34999, status: "pending", paymentMethod: "bank_transfer", paymentStatus: "awaiting_verification", bankReference: "MCB-55102", fraudScore: 0.18, createdAt: "2026-10-08" },
  { id: "ORD-1045", customerId: "u3", customerName: "Sara Malik", email: "sara@example.com", phone: "+92 333 0000000", address: { ...addr, city: "Islamabad" }, items: [{ productId: "p11", name: "Cognac Leather Tote", price: 24999, quantity: 3 }, { productId: "p9", name: "Suede Penny Loafer", price: 18499, quantity: 2, size: "42" }], subtotal: 111995, shipping: 0, total: 111995, status: "pending", paymentMethod: "cod", paymentStatus: "unpaid", fraudScore: 0.81, fraudReasons: ["High order value for new account", "Shipping city differs from previous orders", "Multiple high-value units"], createdAt: "2026-10-09" },
  { id: "ORD-1046", customerId: "u3", customerName: "Sara Malik", email: "sara@example.com", phone: "+92 333 0000000", address: addr, items: [{ productId: "p4", name: "Merino Mock Neck", price: 14999, quantity: 1, size: "M" }], subtotal: 14999, shipping: 500, total: 15499, status: "confirmed", paymentMethod: "bank_transfer", paymentStatus: "awaiting_verification", bankReference: "UBL-11907", fraudScore: 0.67, fraudReasons: ["Bank reference reused across accounts"], createdAt: "2026-10-09" },
];

export const refundRequests: RefundRequest[] = [
  { id: "RR-201", orderId: "ORD-1042", customerName: "Ayesha Khan", type: "refund", reason: "Coat sleeves too long, would like a refund.", amount: 34999, status: "pending", createdAt: "2026-09-28" },
  { id: "RR-202", orderId: "ORD-1046", customerName: "Sara Malik", type: "cancellation", reason: "Ordered the wrong size.", amount: 15499, status: "pending", createdAt: "2026-10-09" },
];

export const recommendations: AIRecommendation[] = [
  { id: "r1", title: "Bundle: Overcoat + Mock Neck", detail: "Customers who bought the overcoat frequently added knitwear within 7 days.", productIds: ["p1", "p4"], confidence: 0.86 },
  { id: "r2", title: "Restock Quilted Liner Jacket", detail: "Out of stock with high wishlist activity ahead of winter.", productIds: ["p7"], confidence: 0.74 },
  { id: "r3", title: "Feature footwear on home page", detail: "Footwear CTR rose 22% last week.", productIds: ["p8", "p9"], confidence: 0.63 },
];

export const pricingSuggestions: PricingSuggestion[] = [
  { id: "ps1", productId: "p1", currentPrice: 34999, competitorAvg: 32400, suggestedPrice: 33499, rationale: "Three competitors list similar wool overcoats between Rs 31,900–34,500.", status: "pending" },
  { id: "ps2", productId: "p6", currentPrice: 4499, competitorAvg: 5200, suggestedPrice: 4899, rationale: "Priced below market; room to increase margin.", status: "pending" },
  { id: "ps3", productId: "p10", currentPrice: 22999, competitorAvg: 23400, suggestedPrice: 22999, rationale: "Aligned with market. No change recommended.", status: "approved" },
];

export const descriptionDrafts: DescriptionDraft[] = [
  { id: "d1", productId: "p2", current: products[1]!.description, generated: "A modern take on a heritage silhouette. Water-resistant cotton gabardine, storm flap and a belted waist make this trench as practical as it is polished.", seoTitle: "Double-Breasted Trench Coat — Trendora", seoDescription: "Water-resistant cotton gabardine trench with storm flap and belted waist. Free delivery across Pakistan, cash on delivery available.", status: "pending" },
  { id: "d2", productId: "p8", current: products[7]!.description, generated: "Clean Italian leather on a cushioned rubber cupsole. The everyday sneaker, refined — pairs with tailoring and denim alike.", seoTitle: "Leather Court Sneakers — Premium Quality | Trendora", seoDescription: "Italian leather court sneakers on a cushioned cupsole. Everyday comfort, refined. Sizes 40–44 with cash on delivery.", status: "pending" },
];
