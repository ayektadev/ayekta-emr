from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ayekta_api.db import get_pool
from ayekta_api.deps import JWTPrincipal, Principal, api_tenant_id, require_api_principal, require_sync_auth
from ayekta_api.domain.chart_bundle_ingest import (
    assert_chart_push_concurrency,
    default_facility_id_for_tenant,
    ingest_chart_bundle,
)

router = APIRouter()


class SyncPushBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    clientId: str = Field(..., alias="clientId")
    entityType: str = Field(..., alias="entityType")
    entityId: str = Field(..., alias="entityId")
    versionId: Optional[str] = Field(None, alias="versionId")
    operation: str
    payloadHash: str = Field(..., alias="payloadHash")
    payloadJson: str = Field(..., alias="payloadJson")
    baseServerRevision: Optional[int] = Field(None, alias="baseServerRevision")


class SyncPullBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    cursor: Optional[str] = None
    limit: int = Field(default=50, ge=1, le=200)


class SyncAckBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    clientIds: list[str] = Field(default_factory=list, alias="clientIds")


def _parse_pull_cursor(raw: Optional[str]) -> Tuple[Optional[datetime], Optional[UUID]]:
    if not raw or not str(raw).strip():
        return None, None
    parts = str(raw).strip().split("|", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid cursor (expected ISO|encounterUuid)")
    ts_raw, id_raw = parts[0].strip(), parts[1].strip()
    try:
        ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        eid = UUID(id_raw)
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail="Invalid cursor format") from e
    return ts, eid


@router.post("/push")
async def sync_push(
    body: SyncPushBody,
    principal: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, Any]:
    try:
        payload_obj: Any = json.loads(body.payloadJson)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="payloadJson is not valid JSON") from e

    created_by = principal.user_id if isinstance(principal, JWTPrincipal) else None

    pool = await get_pool()
    new_server_revision: Optional[int] = None

    async with pool.acquire() as conn:
        exists = await conn.fetchval(
            "SELECT 1 FROM tenants WHERE id = $1",
            tenant_id,
        )
        if not exists:
            raise HTTPException(status_code=400, detail="Unknown tenant — run migrations / seed.")

        async with conn.transaction():
            row = await conn.fetchrow(
                """
                INSERT INTO chart_bundle_receipts (
                  tenant_id, client_id, entity_type, entity_id, version_id,
                  operation, payload_hash, payload_json
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
                ON CONFLICT (tenant_id, client_id) DO NOTHING
                RETURNING id
                """,
                tenant_id,
                body.clientId,
                body.entityType,
                body.entityId,
                body.versionId,
                body.operation,
                body.payloadHash,
                json.dumps(payload_obj),
            )

            status = "inserted" if row else "idempotent_replay"

            if body.entityType == "chart_bundle" and isinstance(payload_obj, dict) and row:
                to_ingest = dict(payload_obj)
                if not str(to_ingest.get("ishiId") or "").strip() and body.entityId:
                    to_ingest["ishiId"] = body.entityId
                ishi_key = str(to_ingest.get("ishiId") or body.entityId or "").strip()
                if ishi_key:
                    await assert_chart_push_concurrency(
                        conn,
                        tenant_id=tenant_id,
                        client_patient_id=ishi_key,
                        base_server_revision=body.baseServerRevision,
                    )

                if isinstance(principal, JWTPrincipal):
                    facility_id = principal.facility_id
                    fac_ok = await conn.fetchval(
                        "SELECT 1 FROM facilities WHERE id = $1 AND tenant_id = $2 AND is_active = true",
                        facility_id,
                        tenant_id,
                    )
                    if not fac_ok:
                        raise HTTPException(
                            status_code=400,
                            detail="JWT facility is not valid for this tenant.",
                        )
                else:
                    fid = await default_facility_id_for_tenant(conn, tenant_id)
                    if fid is None:
                        raise HTTPException(
                            status_code=400,
                            detail="No active facility for tenant — run migrations / seed.",
                        )
                    facility_id = fid

                new_server_revision = await ingest_chart_bundle(
                    conn,
                    tenant_id=tenant_id,
                    facility_id=facility_id,
                    payload=to_ingest,
                    created_by=created_by,
                )

            await conn.execute(
                """
                INSERT INTO sync_events (
                  tenant_id, entity_type, entity_id, operation, status, synced_at
                )
                VALUES ($1, $2, $3, $4, $5, now())
                """,
                tenant_id,
                body.entityType,
                body.entityId,
                body.operation,
                "received_" + status,
            )

    out: dict[str, Any] = {"status": "ok", "detail": status}
    if new_server_revision is not None and new_server_revision > 0:
        out["serverRevision"] = new_server_revision
    return out


@router.post("/pull")
async def sync_pull(
    body: SyncPullBody,
    _: None = Depends(require_sync_auth),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, Any]:
    pool = await get_pool()
    lim = body.limit
    c_ts, c_eid = _parse_pull_cursor((body.cursor or "").strip() or None)

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
              e.id AS encounter_id,
              p.client_patient_id AS entity_id,
              ev.data_json AS payload_json,
              e.server_revision,
              e.updated_at
            FROM encounters e
            INNER JOIN patients p ON p.id = e.patient_id
            INNER JOIN encounter_versions ev ON ev.id = e.current_version_id
            WHERE e.tenant_id = $1
              AND ev.version_number = 0
              AND ev.status = 'draft'
              AND (
                ($2::timestamptz IS NULL AND $3::uuid IS NULL)
                OR (e.updated_at > $2::timestamptz)
                OR (e.updated_at = $2::timestamptz AND e.id > $3::uuid)
              )
            ORDER BY e.updated_at ASC, e.id ASC
            LIMIT $4
            """,
            tenant_id,
            c_ts,
            c_eid,
            lim,
        )

    bundles: list[dict[str, Any]] = []
    for r in rows:
        bundles.append(
            {
                "entityType": "chart_bundle",
                "entityId": r["entity_id"],
                "payloadJson": r["payload_json"],
                "meta": {
                    "serverRevision": int(r["server_revision"]),
                    "updatedAt": r["updated_at"].isoformat() if r["updated_at"] else None,
                },
            }
        )

    has_more = len(rows) >= lim
    next_cursor: Optional[str] = None
    if rows and has_more:
        last = rows[-1]
        eid = last["encounter_id"]
        ut = last["updated_at"]
        if ut is not None:
            next_cursor = f"{ut.isoformat()}|{eid}"

    return {"bundles": bundles, "cursor": next_cursor, "hasMore": has_more}


@router.post("/ack")
async def sync_ack(
    body: SyncAckBody,
    _: None = Depends(require_sync_auth),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, str]:
    if not body.clientIds:
        return {"status": "ok", "detail": "noop"}

    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE chart_bundle_receipts
            SET acknowledged_at = COALESCE(acknowledged_at, now())
            WHERE tenant_id = $1 AND client_id = ANY($2::text[])
            """,
            tenant_id,
            body.clientIds,
        )

    return {"status": "ok"}
