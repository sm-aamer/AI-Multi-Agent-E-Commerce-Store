// Domain types — mirror these with Pydantic schemas in the FastAPI backend.

export type Category = { id: string; name: string; slug: string; image: string; blurb?: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  stock: number;
  image: string;
  rating: number;
  reviewCount?: number;
  featured?: boolean;
  isNew?: boolean;
  sizes?: string[];
  material?: string;
};

export type CartItem = { productId: string; quantity: number; size?: string };

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "bank_transfer" | "cod";
export type PaymentStatus = "unpaid" | "awaiting_verification" | "verified" | "rejected";

export type Address = { line1: string; city: string; postalCode: string; country: string };

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  address: Address;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bankReference?: string;
  fraudScore?: number;
  fraudReasons?: string[];
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  orders: number;
  spent: number;
  role: "customer" | "admin";
};

export type RequestType = "refund" | "cancellation";
export type RequestStatus = "pending" | "approved" | "rejected";
export type RefundRequest = {
  id: string;
  orderId: string;
  customerName: string;
  type: RequestType;
  reason: string;
  amount: number;
  status: RequestStatus;
  createdAt: string;
};

export type AIRecommendation = {
  id: string;
  title: string;
  detail: string;
  productIds: string[];
  confidence: number;
};
export type PricingSuggestion = {
  id: string;
  productId: string;
  currentPrice: number;
  competitorAvg: number;
  suggestedPrice: number;
  rationale: string;
  status: RequestStatus;
};
export type DescriptionDraft = {
  id: string;
  productId: string;
  current: string;
  generated: string;
  seoTitle?: string;
  seoDescription?: string;
  status: RequestStatus;
};

export type ProductQuery = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "rating" | "newest";
};

export type Session = { token: string; user: Customer };

export type FeedbackInput = {
  name: string;
  email: string;
  rating: number;
  message: string;
  orderId?: string;
};
