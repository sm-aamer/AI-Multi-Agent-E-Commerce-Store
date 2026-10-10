# Evolve Shop Ui

Build a modern, responsive full-stack e-commerce frontend for my capstone project named **AI-Powered E-Commerce Platform**.

**Important architecture requirements:**
- Use React, TypeScript, and Tailwind CSS.
- The primary backend will be a separately developed FastAPI REST API with PostgreSQL and SQLAlchemy.
- Do not create a Supabase dependency or another mandatory backend.
- Keep API calls in a separate service layer so I can connect my FastAPI endpoints later.
- Use realistic mock data initially and clearly separate it from production API integration.
- Make the project GitHub-friendly and maintainable.

**Customer Store pages:**
1. Home page with navigation, hero section, featured products, categories, and search.
2. Product listing page with search, category filters, price filters, and sorting.
3. Product details page.
4. Shopping cart with quantity updates and subtotal.
5. Checkout page with customer details, delivery address, and two payment methods: Bank Transfer and Cash on Delivery (COD).
6. Customer registration, login, order history, and order details.
7. Refund and cancellation request interface.

**Admin Dashboard pages:**
1. Admin login and protected dashboard layout.
2. Overview with order, product, customer, and sales summaries.
3. Product management with add, edit, delete, category, stock, and image fields.
4. Order management with status updates.
5. Customer management.
6. Bank transfer verification interface.
7. Refund approval and rejection interface.
8. Fraud-flagged orders review page.
9. AI recommendations, competitor pricing suggestions, and AI-generated product description review pages.

**Design requirements:**
- Professional, modern fashion e-commerce design.
- Responsive on desktop, tablet, and mobile.
- Separate customer and admin layouts.
- Reusable React components and clear folder structure.
- Include loading states, empty states, validation messages, and error states.
- Use mock data only for the initial prototype. Do not pretend that payment processing, authentication, or database persistence is working until connected to a real backend.

First generate the complete UI and navigation. Keep the code organized for later integration with FastAPI, PostgreSQL, and five LangGraph AI agents. Do not implement the AI agents yet.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/965f4278-cafa-4444-b626-680ee420701c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
