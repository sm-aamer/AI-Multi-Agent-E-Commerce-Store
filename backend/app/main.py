from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.routes.auth import router as auth_router
from app.api.routes.catalog import router as catalog_router
from app.api.routes.orders import router as orders_router
from app.core.config import get_settings
from app.db.database import engine

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="FastAPI backend for the AI-powered e-commerce platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name.lower().replace(" ", "-")}


@app.get("/api/v1/health")
def readiness_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=503,
            detail={"status": "degraded", "database": "unavailable"},
        ) from exc
    return {
        "status": "ok",
        "app": settings.app_name.lower().replace(" ", "-"),
        "database": "connected",
    }


@app.get("/")
def root():
    return {"message": "Welcome to the Velloria Classic API"}


app.include_router(auth_router)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(catalog_router, prefix="/api/v1")
app.include_router(orders_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.debug)
