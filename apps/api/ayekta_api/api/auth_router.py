from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from uuid import UUID

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ayekta_api.config import get_settings
from ayekta_api.db import get_pool

router = APIRouter()


class LoginBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    username: str = Field(..., min_length=1, max_length=128)
    password: str = Field(..., min_length=1, max_length=256)
    tenantSlug: Optional[str] = Field(None, alias="tenantSlug")


def _issue_token(
    *,
    user_id: UUID,
    tenant_id: UUID,
    facility_id: UUID,
    role: str,
    username: str,
    display_name: str,
) -> tuple[str, int]:
    settings = get_settings()
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT not configured on server (set JWT_SECRET)")
    now = datetime.now(timezone.utc)
    exp_min = max(5, min(settings.jwt_expire_minutes, 60 * 24 * 7))
    exp = now + timedelta(minutes=exp_min)
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "tid": str(tenant_id),
        "fid": str(facility_id),
        "role": role,
        "usr": username,
        "fn": display_name,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return token, exp_min * 60


@router.post("/login")
async def login(body: LoginBody) -> dict[str, Any]:
    settings = get_settings()
    if not settings.database_url:
        raise HTTPException(status_code=503, detail="Database not configured")
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT not configured on server (set JWT_SECRET)")

    slug = (body.tenantSlug or "default").strip() or "default"
    pool = await get_pool()
    async with pool.acquire() as conn:
        tid = await conn.fetchval("SELECT id FROM tenants WHERE slug = $1 AND status = 'active'", slug)
        if tid is None:
            raise HTTPException(status_code=400, detail="Unknown or inactive tenant slug")

        row = await conn.fetchrow(
            """
            SELECT id, password_hash, full_name, role, tenant_id, facility_id, is_active
            FROM users
            WHERE tenant_id = $1 AND lower(username) = lower($2)
            """,
            tid,
            body.username.strip(),
        )

    if not row or not row["is_active"]:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    raw_hash = row["password_hash"]
    if isinstance(raw_hash, memoryview):
        hash_bytes = raw_hash.tobytes()
    else:
        hash_bytes = str(raw_hash).encode("utf-8")
    try:
        ok = bcrypt.checkpw(body.password.encode("utf-8"), hash_bytes)
    except (ValueError, TypeError):
        ok = False
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    uid = row["id"]
    token, expires_in = _issue_token(
        user_id=uid,
        tenant_id=row["tenant_id"],
        facility_id=row["facility_id"],
        role=row["role"],
        username=body.username.strip(),
        display_name=row["full_name"],
    )

    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE users SET last_login_at = now() WHERE id = $1",
            uid,
        )

    return {
        "accessToken": token,
        "tokenType": "Bearer",
        "expiresIn": expires_in,
        "user": {
            "id": str(uid),
            "username": body.username.strip(),
            "displayName": row["full_name"],
            "role": row["role"],
            "tenantId": str(row["tenant_id"]),
            "facilityId": str(row["facility_id"]),
        },
    }
