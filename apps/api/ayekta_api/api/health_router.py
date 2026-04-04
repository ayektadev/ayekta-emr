from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
async def ready() -> dict[str, str]:
    """Optional DB check — fails if DATABASE_URL unset or DB unreachable."""
    try:
        from ayekta_api.db import get_pool

        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
    except Exception as e:
        return {"status": "not_ready", "detail": str(e)[:200]}
    return {"status": "ready"}
