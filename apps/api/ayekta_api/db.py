from __future__ import annotations

from typing import Optional

import asyncpg

from ayekta_api.config import get_settings

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        url = get_settings().database_url
        if not url:
            raise RuntimeError("DATABASE_URL is not set — add Supabase or Postgres connection string.")
        _pool = await asyncpg.create_pool(url, min_size=1, max_size=10)
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
