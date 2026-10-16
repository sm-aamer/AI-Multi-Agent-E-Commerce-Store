# Velloria Classic Backend

This folder contains the FastAPI service for the AI-powered e-commerce platform described in the BRD.

## Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
# source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The settings loader reads `backend/.env` based on the backend source path, so the server can be started from the repository root or the backend directory. The local `.env` file is ignored by Git.

## Database migrations

Apply schema changes before starting the API:

```bash
python -m alembic -c alembic.ini upgrade head
```

The migrations create user, catalog, and order tables without altering the existing `customers` table. The curated-catalog migration adds eight sample listings and creates the women's and men's categories only when they are missing. Existing products and category images are preserved.

The sample USD prices, stock counts, and size runs are placeholders; update them to confirmed store values before accepting real orders.

## Required environment variables

Copy `.env.example` to `.env` and fill the values before running the backend.

- `SECRET_KEY` or `JWT_SECRET_KEY`: used for signing auth tokens.
- `DATABASE_URL`: PostgreSQL connection string.
- `GOOGLE_API_KEY`: Gemini API access for AI description and recommendation flows.
- `TAVILY_API_KEY`: web search for competitor pricing and product discovery.
- `FRONTEND_URL` / `ALLOWED_ORIGINS`: allow your frontend origin (for example, `http://localhost:8080`).
- `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD`: optional local demo credentials for admin login.

## Health endpoints

- `GET /health` checks that the API process is responding.
- `GET /api/v1/health` runs `SELECT 1` against PostgreSQL and returns HTTP 503 if the database is unavailable.
- `GET /docs` exposes the versioned API routes for local development.

## Implemented API

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, and `POST /api/v1/auth/admin/login` use PostgreSQL-backed accounts, bcrypt password hashes, and signed JWTs.
- `GET /api/v1/categories` and `GET /api/v1/products` read the database. Catalog writes require an admin JWT.
- `POST /api/v1/orders`, `GET /api/v1/orders/me`, `GET /api/v1/orders/{id}`, and admin order list/update routes persist orders. Checkout recalculates prices and shipping from database products and reserves stock.

The storefront uses live API mode for local development via the ignored root `.env.local`. Apply the migrations to create the starter catalog before trying checkout. Refund workflows, AI agent endpoints, and initial admin provisioning still need implementation. Do not treat the current app as production-ready for real commerce until those items and a production deployment/security review are complete.
