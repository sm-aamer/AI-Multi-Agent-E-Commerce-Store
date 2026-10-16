from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Velloria Classic API"
    environment: str = "development"
    debug: bool = True
    secret_key: str = "change-me-to-a-long-random-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/velloria"

    frontend_url: str = "http://localhost:8080"
    allowed_origins: str = "http://localhost:8080,http://127.0.0.1:8080"

    google_api_key: str = ""
    tavily_api_key: str = ""

    demo_admin_email: str = "admin@demo.com"
    demo_admin_password: str = "change-this-password"

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
