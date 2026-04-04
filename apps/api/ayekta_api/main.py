from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ayekta_api.api.attachments_router import router as attachments_router
from ayekta_api.api.auth_router import router as auth_router
from ayekta_api.api.health_router import router as health_router
from ayekta_api.api.sync_router import router as sync_router
from ayekta_api.config import get_settings
from ayekta_api.db import close_pool, get_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    _ = app
    try:
        if get_settings().database_url:
            await get_pool()
    except Exception:
        pass
    yield
    await close_pool()


def create_app() -> FastAPI:
    settings = get_settings()
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

    app = FastAPI(
        title="Ayekta API",
        version="0.1.0",
        lifespan=lifespan,
        description="Postgres-backed sync and future clinical endpoints. Host-agnostic (Supabase, RDS, Cloud SQL).",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(auth_router, prefix="/auth")
    app.include_router(sync_router, prefix="/sync")
    app.include_router(attachments_router, prefix="/attachments")
    return app


app = create_app()
