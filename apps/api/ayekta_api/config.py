from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = ""
    """Async Postgres URL, e.g. Supabase pooler: postgresql://user:pass@host:6543/postgres?sslmode=require"""

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    default_tenant_id: str = "00000000-0000-4000-8000-000000000001"
    """Used only when X-Tenant-Id header is omitted (local dev)."""

    sync_api_key: str = ""
    """If set, require Authorization: Bearer <sync_api_key> on /sync/*."""

    public_api_base_url: str = "http://127.0.0.1:8000"
    """Base URL embedded in dev presign PUT responses (browser must reach this host)."""

    s3_bucket: str = ""
    s3_region: str = "us-east-1"
    s3_endpoint_url: str = ""
    """Optional (MinIO, R2, etc.). Empty = AWS default for region."""
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    jwt_secret: str = ""
    """HS256 signing secret. When set with DATABASE_URL, issue JWTs at POST /auth/login."""

    jwt_expire_minutes: int = 1440
    """Access token lifetime (default 24h)."""


@lru_cache
def get_settings() -> Settings:
    return Settings()
