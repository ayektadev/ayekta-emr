from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Union
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException, Request

from ayekta_api.config import get_settings


@dataclass(frozen=True)
class JWTPrincipal:
    user_id: UUID
    tenant_id: UUID
    facility_id: UUID
    role: str
    username: str
    display_name: str


@dataclass(frozen=True)
class SyncKeyPrincipal:
    """Bearer matches SYNC_API_KEY (automation / legacy clients)."""


@dataclass(frozen=True)
class OpenPrincipal:
    """Neither JWT nor API key configured — local dev only."""


Principal = Union[JWTPrincipal, SyncKeyPrincipal, OpenPrincipal]


def resolve_tenant_id(x_tenant_id: Optional[str]) -> UUID:
    if x_tenant_id:
        try:
            return UUID(x_tenant_id)
        except ValueError as e:
            raise HTTPException(status_code=400, detail="X-Tenant-Id must be a UUID") from e
    try:
        return UUID(get_settings().default_tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=500, detail="DEFAULT_TENANT_ID misconfigured") from e


def tenant_header(x_tenant_id: Optional[str] = Header(default=None, alias="X-Tenant-Id")) -> UUID:
    return resolve_tenant_id(x_tenant_id)


def _decode_jwt_bearer(token: str) -> JWTPrincipal:
    settings = get_settings()
    if not settings.jwt_secret or not token:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(status_code=401, detail="Token expired") from e
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e

    try:
        return JWTPrincipal(
            user_id=UUID(data["sub"]),
            tenant_id=UUID(data["tid"]),
            facility_id=UUID(data["fid"]),
            role=str(data["role"]),
            username=str(data.get("usr", "")),
            display_name=str(data.get("fn", "")),
        )
    except (KeyError, ValueError, TypeError) as e:
        raise HTTPException(status_code=401, detail="Malformed token claims") from e


async def require_api_principal(
    request: Request,
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> Principal:
    """
    Accepts, in order:
    1) Bearer matching SYNC_API_KEY (if set)
    2) Valid JWT (if JWT_SECRET set)
    3) If neither secret is set — open principal (dev only; tenant from X-Tenant-Id).
    """
    _ = request
    settings = get_settings()
    auth = authorization or ""
    bearer = auth.removeprefix("Bearer ").strip() if auth.startswith("Bearer ") else auth.strip()

    sync_key = (settings.sync_api_key or "").strip()
    jwt_secret = (settings.jwt_secret or "").strip()

    if not jwt_secret and not sync_key:
        return OpenPrincipal()

    if not bearer:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    if sync_key and bearer == sync_key:
        return SyncKeyPrincipal()

    if jwt_secret:
        return _decode_jwt_bearer(bearer)

    raise HTTPException(status_code=401, detail="Invalid bearer token")


async def api_tenant_id(
    principal: Principal = Depends(require_api_principal),  # type: ignore[misc]
    x_tenant_id: Optional[str] = Header(default=None, alias="X-Tenant-Id"),
) -> UUID:
    if isinstance(principal, JWTPrincipal):
        return principal.tenant_id
    return resolve_tenant_id(x_tenant_id)


# Back-compat name used by older modules
async def require_sync_auth(
    principal: Principal = Depends(require_api_principal),  # type: ignore[misc]
) -> None:
    if isinstance(principal, OpenPrincipal):
        return
    _ = principal
