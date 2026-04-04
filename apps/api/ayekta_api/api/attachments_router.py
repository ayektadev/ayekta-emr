from __future__ import annotations

import base64
import hashlib
import re
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field

from ayekta_api.db import get_pool
from ayekta_api.deps import JWTPrincipal, Principal, api_tenant_id, require_api_principal
from ayekta_api.config import get_settings
from ayekta_api.domain.chart_bundle_ingest import encounter_uuid_for
from ayekta_api.storage_presign import dev_server_put_presign, s3_get_presign, s3_put_presign

router = APIRouter()

MAX_INLINE_BYTES = 2_000_000
MAX_PRESIGN_BYTES = 52_428_800


def _safe_filename(name: str) -> str:
    base = name.split("/")[-1].split("\\")[-1]
    base = re.sub(r"[^a-zA-Z0-9._-]+", "_", base).strip("._") or "file"
    return base[:180]


def _sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _uploaded_by_user_id(principal: Principal) -> Optional[UUID]:
    return principal.user_id if isinstance(principal, JWTPrincipal) else None


async def _resolve_encounter_fk(
    conn,
    tenant_id: UUID,
    encounter_client_id: Optional[str],
) -> Optional[UUID]:
    raw = (encounter_client_id or "").strip()
    if not raw:
        return None
    eid = encounter_uuid_for(tenant_id, raw)
    row = await conn.fetchrow(
        "SELECT id FROM encounters WHERE id = $1 AND tenant_id = $2",
        eid,
        tenant_id,
    )
    return eid if row else None


class AttachmentRegisterBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    patientId: str = Field(..., alias="patientId")
    filename: str
    mimeType: str = Field(..., alias="mimeType")
    byteSize: int = Field(..., alias="byteSize")
    contentBase64: Optional[str] = Field(None, alias="contentBase64")
    docType: str = Field("clinical", alias="docType", max_length=64)
    encounterClientId: Optional[str] = Field(None, alias="encounterClientId", max_length=256)


class PresignBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    patientId: str = Field(..., alias="patientId")
    filename: str
    mimeType: str = Field(..., alias="mimeType")
    byteSize: int = Field(..., alias="byteSize")
    docType: str = Field("clinical", alias="docType", max_length=64)
    encounterClientId: Optional[str] = Field(None, alias="encounterClientId", max_length=256)


@router.post("/register")
async def register_attachment(
    body: AttachmentRegisterBody,
    principal: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, str]:
    if body.byteSize > MAX_INLINE_BYTES:
        raise HTTPException(status_code=413, detail="File too large for inline ingest")

    payload: bytes | None = None
    if body.contentBase64:
        try:
            payload = base64.b64decode(body.contentBase64)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid base64 payload") from e
        if len(payload) > MAX_INLINE_BYTES:
            raise HTTPException(status_code=413, detail="Decoded payload too large")
        if len(payload) != body.byteSize:
            raise HTTPException(status_code=400, detail="byteSize does not match decoded length")

    uid = _uploaded_by_user_id(principal)
    checksum = _sha256_hex(payload) if payload else None
    now = datetime.now(timezone.utc)

    pool = await get_pool()
    async with pool.acquire() as conn:
        enc_id = await _resolve_encounter_fk(conn, tenant_id, body.encounterClientId)
        row = await conn.fetchrow(
            """
            INSERT INTO attachment_ingests (
              tenant_id, patient_id, filename, mime_type, byte_size, payload_bytea,
              ingest_status, storage_backend,
              doc_type, checksum, uploaded_by, uploaded_at, encounter_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'complete', 'inline', $7, $8, $9, $10, $11)
            RETURNING id
            """,
            tenant_id,
            body.patientId,
            body.filename,
            body.mimeType,
            body.byteSize,
            payload,
            body.docType,
            checksum,
            uid,
            now,
            enc_id,
        )

    if not row:
        raise HTTPException(status_code=500, detail="Insert failed")

    return {"id": str(row["id"]), "status": "stored"}


@router.post("/presign")
async def presign_upload(
    body: PresignBody,
    principal: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, object]:
    if body.byteSize < 1:
        raise HTTPException(status_code=400, detail="byteSize must be positive")
    if body.byteSize > MAX_PRESIGN_BYTES:
        raise HTTPException(status_code=413, detail="File too large for presigned upload")

    safe_name = _safe_filename(body.filename)
    pool = await get_pool()

    s3_key: str | None = None
    backend = "server_bytea"
    presign = None

    # Prefer S3 when bucket is configured and boto3 can build a client.
    async with pool.acquire() as conn:
        # Pre-compute id for S3 key path
        pre_id = await conn.fetchval("SELECT gen_random_uuid()")
        if not isinstance(pre_id, UUID):
            pre_id = UUID(str(pre_id))

        trial_key = f"{tenant_id}/{body.patientId}/{pre_id}_{safe_name}"
        presign = s3_put_presign(storage_key=trial_key, content_type=body.mimeType)
        if presign and presign.storage_key:
            s3_key = presign.storage_key
            backend = "s3"

        enc_id = await _resolve_encounter_fk(conn, tenant_id, body.encounterClientId)
        row = await conn.fetchrow(
            """
            INSERT INTO attachment_ingests (
              id, tenant_id, patient_id, filename, mime_type, byte_size, payload_bytea,
              ingest_status, storage_backend, storage_key,
              doc_type, encounter_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, NULL, 'awaiting_upload', $7, $8, $9, $10)
            RETURNING id
            """,
            pre_id,
            tenant_id,
            body.patientId,
            body.filename,
            body.mimeType,
            body.byteSize,
            backend,
            s3_key,
            body.docType,
            enc_id,
        )

    if not row:
        raise HTTPException(status_code=500, detail="Insert failed")

    aid = row["id"]
    if backend == "s3" and presign:
        return {
            "attachmentId": str(aid),
            "method": presign.method,
            "uploadUrl": presign.upload_url,
            "headers": presign.headers,
            "requiresAuthorization": presign.requires_authorization,
            "expiresIn": 3600,
            "storage": "s3",
        }

    settings = get_settings()
    dev = dev_server_put_presign(
        attachment_id=aid,
        public_base_url=settings.public_api_base_url,
        content_type=body.mimeType,
    )
    return {
        "attachmentId": str(aid),
        "method": dev.method,
        "uploadUrl": dev.upload_url,
        "headers": dev.headers,
        "requiresAuthorization": dev.requires_authorization,
        "expiresIn": 3600,
        "storage": "server_bytea",
    }


@router.put("/blob/{attachment_id}")
async def upload_blob(
    attachment_id: UUID,
    request: Request,
    principal: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, str]:
    raw = await request.body()
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT byte_size, ingest_status, storage_backend
            FROM attachment_ingests
            WHERE id = $1 AND tenant_id = $2
            """,
            attachment_id,
            tenant_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Attachment not found")
        if row["ingest_status"] != "awaiting_upload":
            raise HTTPException(status_code=409, detail="Upload already finalized or not pending")
        if row["storage_backend"] != "server_bytea":
            raise HTTPException(status_code=400, detail="Use object storage PUT for this attachment")
        expected = row["byte_size"]
        if expected is not None and len(raw) != int(expected):
            raise HTTPException(
                status_code=400,
                detail=f"Body length {len(raw)} does not match declared byte_size {expected}",
            )
        if len(raw) > MAX_PRESIGN_BYTES:
            raise HTTPException(status_code=413, detail="Payload too large")

        uid = _uploaded_by_user_id(principal)
        digest = _sha256_hex(raw)
        now = datetime.now(timezone.utc)
        await conn.execute(
            """
            UPDATE attachment_ingests
            SET payload_bytea = $1, ingest_status = 'complete', storage_backend = 'server_bytea',
                checksum = $4, uploaded_at = $5, uploaded_by = COALESCE($6, uploaded_by)
            WHERE id = $2 AND tenant_id = $3
            """,
            raw,
            attachment_id,
            tenant_id,
            digest,
            now,
            uid,
        )

    return {"id": str(attachment_id), "status": "stored"}


@router.post("/{attachment_id}/complete")
async def complete_s3_upload(
    attachment_id: UUID,
    principal: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
) -> dict[str, str]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT ingest_status, storage_backend
            FROM attachment_ingests
            WHERE id = $1 AND tenant_id = $2
            """,
            attachment_id,
            tenant_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Attachment not found")
        if row["storage_backend"] != "s3":
            raise HTTPException(status_code=400, detail="Not an S3-deferred attachment")
        if row["ingest_status"] != "awaiting_upload":
            raise HTTPException(status_code=409, detail="Already complete")

        uid = _uploaded_by_user_id(principal)
        now = datetime.now(timezone.utc)
        await conn.execute(
            """
            UPDATE attachment_ingests
            SET ingest_status = 'complete', uploaded_at = $3, uploaded_by = COALESCE($4, uploaded_by)
            WHERE id = $1 AND tenant_id = $2
            """,
            attachment_id,
            tenant_id,
            now,
            uid,
        )

    return {"id": str(attachment_id), "status": "complete"}


@router.get("")
async def list_attachments(
    patientId: str,
    _: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
) -> list[dict[str, object]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
              a.id, a.filename, a.mime_type, a.byte_size, a.created_at, a.storage_backend,
              a.doc_type, a.checksum, a.uploaded_at, a.uploaded_by, a.encounter_id
            FROM attachment_ingests a
            WHERE a.tenant_id = $1 AND a.patient_id = $2 AND a.ingest_status = 'complete'
            ORDER BY COALESCE(a.uploaded_at, a.created_at) DESC
            """,
            tenant_id,
            patientId,
        )

    return [
        {
            "id": str(r["id"]),
            "filename": r["filename"],
            "mimeType": r["mime_type"],
            "byteSize": r["byte_size"],
            "createdAt": r["created_at"].isoformat() if r["created_at"] else None,
            "storageBackend": r["storage_backend"],
            "docType": r["doc_type"],
            "checksum": r["checksum"],
            "uploadedAt": r["uploaded_at"].isoformat() if r["uploaded_at"] else None,
            "uploadedBy": str(r["uploaded_by"]) if r["uploaded_by"] else None,
            "encounterId": str(r["encounter_id"]) if r["encounter_id"] else None,
        }
        for r in rows
    ]


@router.get("/{attachment_id}/download")
async def download_attachment(
    attachment_id: UUID,
    _: Principal = Depends(require_api_principal),
    tenant_id: UUID = Depends(api_tenant_id),
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT filename, mime_type, payload_bytea, storage_backend, storage_key, ingest_status
            FROM attachment_ingests
            WHERE id = $1 AND tenant_id = $2
            """,
            attachment_id,
            tenant_id,
        )

    if not row or row["ingest_status"] != "complete":
        raise HTTPException(status_code=404, detail="Attachment not found")

    if row["storage_backend"] == "s3" and row["storage_key"]:
        getp = s3_get_presign(storage_key=row["storage_key"])
        if not getp:
            raise HTTPException(status_code=503, detail="S3 download not configured")
        return RedirectResponse(url=getp.url, status_code=302)

    blob = row["payload_bytea"]
    if not blob:
        raise HTTPException(status_code=404, detail="No inline payload for this attachment")

    filename = row["filename"] or "attachment"
    mime = row["mime_type"] or "application/octet-stream"

    def iterfile():
        yield bytes(blob)

    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(iterfile(), media_type=mime, headers=headers)
