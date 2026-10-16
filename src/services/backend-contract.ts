// FastAPI / LangGraph backend contract for the BRD-driven platform.
// Keep this in sync with the production API so the UI remains backend-ready.

export const backendContract = {
  health: { method: "GET", path: "/health" },
  auth: {
    login: { method: "POST", path: "/auth/login", body: { email: "string", password: "string" } },
    adminLogin: {
      method: "POST",
      path: "/auth/admin/login",
      body: { email: "string", password: "string" },
    },
    register: {
      method: "POST",
      path: "/auth/register",
      body: { name: "string", email: "string", password: "string" },
    },
  },
  categories: {
    list: { method: "GET", path: "/categories" },
    create: {
      method: "POST",
      path: "/categories",
      body: { name: "string", slug: "string", image: "string", blurb: "string | undefined" },
    },
    update: {
      method: "PUT",
      path: "/categories/{id}",
      body: { name: "string", slug: "string", image: "string", blurb: "string | undefined" },
    },
  },
  products: {
    list: { method: "GET", path: "/products" },
    get: { method: "GET", path: "/products/{id}" },
    create: {
      method: "POST",
      path: "/products",
      body: {
        name: "string",
        slug: "string",
        description: "string",
        price: "number",
        categoryId: "string",
        stock: "number",
        image: "string",
      },
    },
    update: {
      method: "PUT",
      path: "/products/{id}",
      body: {
        name: "string",
        slug: "string",
        description: "string",
        price: "number",
        categoryId: "string",
        stock: "number",
        image: "string",
      },
    },
    delete: { method: "DELETE", path: "/products/{id}" },
  },
  orders: {
    list: { method: "GET", path: "/admin/orders" },
    myOrders: { method: "GET", path: "/orders/me" },
    get: { method: "GET", path: "/orders/{id}" },
    create: {
      method: "POST",
      path: "/orders",
      body: {
        customerId: "string",
        customerName: "string",
        email: "string",
        phone: "string",
        address: { line1: "string", city: "string", postalCode: "string", country: "string" },
        items: [
          {
            productId: "string",
            name: "string",
            price: "number",
            quantity: "number",
            size: "string | undefined",
          },
        ],
        subtotal: "number",
        shipping: "number",
        total: "number",
        paymentMethod: "bank_transfer | cod",
        bankReference: "string | undefined",
      },
    },
    update: {
      method: "PATCH",
      path: "/admin/orders/{id}",
      body: {
        status: "pending | confirmed | shipped | delivered | cancelled | undefined",
        paymentStatus: "unpaid | awaiting_verification | verified | rejected | undefined",
        fraudScore: "number | undefined",
      },
    },
  },
  refunds: {
    list: { method: "GET", path: "/admin/refunds" },
    create: {
      method: "POST",
      path: "/refunds",
      body: {
        orderId: "string",
        customerName: "string",
        type: "refund | cancellation",
        reason: "string",
        amount: "number",
      },
    },
    decide: {
      method: "PATCH",
      path: "/admin/refunds/{id}",
      body: { status: "pending | approved | rejected" },
    },
  },
  customers: { list: { method: "GET", path: "/admin/customers" } },
  ai: {
    recommendations: { method: "GET", path: "/admin/ai/recommendations" },
    pricing: { method: "GET", path: "/admin/ai/pricing" },
    pricingDecision: {
      method: "PATCH",
      path: "/admin/ai/pricing/{id}",
      body: { status: "pending | approved | rejected" },
    },
    descriptions: { method: "GET", path: "/admin/ai/descriptions" },
    descriptionDecision: {
      method: "PATCH",
      path: "/admin/ai/descriptions/{id}",
      body: { status: "pending | approved | rejected" },
    },
  },
  feedback: {
    submit: {
      method: "POST",
      path: "/feedback",
      body: {
        name: "string",
        email: "string",
        rating: "number",
        message: "string",
        orderId: "string | undefined",
      },
    },
  },
} as const;

export type BackendContract = typeof backendContract;
