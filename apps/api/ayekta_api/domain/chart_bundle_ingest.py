"""Upsert normalized clinical rows from client chart JSON (Chunk C)."""

from __future__ import annotations

import json
from typing import Any, Optional
from uuid import UUID, uuid5

import asyncpg

# Deterministic namespace for v5 UUIDs (Ayekta sync ingest).
NAMESPACE_AYEKTA_SYNC = UUID("018f0845-4b91-7e60-8000-000000000001")


def patient_uuid_for(tenant_id: UUID, client_patient_id: str) -> UUID:
    return uuid5(NAMESPACE_AYEKTA_SYNC, f"{tenant_id}:patient:{client_patient_id}")


def encounter_uuid_for(tenant_id: UUID, client_encounter_id: str) -> UUID:
    return uuid5(NAMESPACE_AYEKTA_SYNC, f"{tenant_id}:encounter:{client_encounter_id}")


def draft_version_uuid_for(tenant_id: UUID, encounter_id: UUID) -> UUID:
    return uuid5(NAMESPACE_AYEKTA_SYNC, f"{tenant_id}:draft_version:{encounter_id}")


def _str(v: Any) -> str:
    if v is None:
        return ""
    return str(v).strip()


def _optional_date(s: str) -> Optional[str]:
    t = _str(s)
    if not t:
        return None
    return t[:10] if len(t) >= 10 else t


async def default_facility_id_for_tenant(conn: asyncpg.Connection, tenant_id: UUID) -> Optional[UUID]:
    row = await conn.fetchrow(
        """
        SELECT id FROM facilities
        WHERE tenant_id = $1 AND is_active = true
        ORDER BY created_at ASC
        LIMIT 1
        """,
        tenant_id,
    )
    return row["id"] if row else None


async def assert_chart_push_concurrency(
    conn: asyncpg.Connection,
    *,
    tenant_id: UUID,
    client_patient_id: str,
    base_server_revision: Optional[int],
) -> None:
    """Optimistic concurrency for chart_bundle (Chunk D / Blueprint §10)."""
    from fastapi import HTTPException

    enc_id = f"enc:{client_patient_id}"
    eid = encounter_uuid_for(tenant_id, enc_id)
    row = await conn.fetchrow("SELECT server_revision FROM encounters WHERE id = $1", eid)

    if base_server_revision is None:
        if row is not None and int(row["server_revision"]) > 0:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "This patient already exists on the server. Pull the latest chart, then push with baseServerRevision.",
                    "serverRevision": int(row["server_revision"]),
                },
            )
        return

    if row is None:
        if base_server_revision != 0:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "No server encounter yet; expected base revision 0.",
                    "serverRevision": 0,
                },
            )
        return

    cur = int(row["server_revision"])
    if cur != base_server_revision:
        raise HTTPException(
            status_code=409,
            detail={
                "message": "Server chart revision does not match. Pull the latest chart, then push again.",
                "serverRevision": cur,
            },
        )


async def ingest_chart_bundle(
    conn: asyncpg.Connection,
    *,
    tenant_id: UUID,
    facility_id: UUID,
    payload: dict[str, Any],
    created_by: Optional[UUID] = None,
) -> int:
    """
    Upsert patient + encounter + mirrored draft version (version_number = 0) from PatientData-shaped JSON.
    """
    ishi = _str(payload.get("ishiId"))
    if not ishi:
        return 0

    demo = payload.get("demographics")
    if not isinstance(demo, dict):
        demo = {}

    first = _str(demo.get("firstName"))
    last = _str(demo.get("lastName"))
    dob = _optional_date(_str(demo.get("dob")))
    sex = _str(demo.get("gender")) or None
    phone = _str(demo.get("phone")) or None
    addr = _str(demo.get("address"))
    address_json = json.dumps({"text": addr}) if addr else None

    pid = patient_uuid_for(tenant_id, ishi)
    client_enc_id = f"enc:{ishi}"
    eid = encounter_uuid_for(tenant_id, client_enc_id)
    vid = draft_version_uuid_for(tenant_id, eid)
    data_json = json.dumps(payload)

    await conn.execute(
        """
        INSERT INTO patients (
          id, tenant_id, facility_id, client_patient_id,
          first_name, last_name, dob, sex, phone, address_json, created_by, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10::jsonb, $11, now())
        ON CONFLICT (tenant_id, client_patient_id) DO UPDATE SET
          facility_id = EXCLUDED.facility_id,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          dob = EXCLUDED.dob,
          sex = EXCLUDED.sex,
          phone = EXCLUDED.phone,
          address_json = EXCLUDED.address_json,
          updated_at = now()
        """,
        pid,
        tenant_id,
        facility_id,
        ishi,
        first or "Unknown",
        last or "Unknown",
        dob,
        sex,
        phone,
        address_json,
        created_by,
    )

    await conn.execute(
        """
        INSERT INTO patient_identifiers (patient_id, type, value, facility_id, is_primary)
        VALUES ($1, 'client_ishi', $2, $3, true)
        ON CONFLICT (patient_id, type, value) DO NOTHING
        """,
        pid,
        ishi,
        facility_id,
    )

    await conn.execute(
        """
        INSERT INTO encounters (
          id, tenant_id, facility_id, patient_id, encounter_type, status,
          current_version_id, created_by, created_at, updated_at, client_encounter_id
        )
        VALUES ($1, $2, $3, $4, 'outpatient_surgical', 'draft', NULL, $5, now(), now(), $6)
        ON CONFLICT (tenant_id, client_encounter_id) DO UPDATE SET
          facility_id = EXCLUDED.facility_id,
          patient_id = EXCLUDED.patient_id,
          updated_at = now()
        """,
        eid,
        tenant_id,
        facility_id,
        pid,
        created_by,
        client_enc_id,
    )

    await conn.execute(
        """
        INSERT INTO encounter_versions (
          id, encounter_id, version_number, authored_by, role, status, data_json, created_at
        )
        VALUES ($1, $2, 0, $3, NULL, 'draft', $4::jsonb, now())
        ON CONFLICT (encounter_id, version_number) DO UPDATE SET
          data_json = EXCLUDED.data_json,
          created_at = now()
        """,
        vid,
        eid,
        created_by,
        data_json,
    )

    await conn.execute(
        """
        UPDATE encounters SET current_version_id = $1, updated_at = now() WHERE id = $2
        """,
        vid,
        eid,
    )

    rev_row = await conn.fetchrow(
        """
        UPDATE encounters
        SET server_revision = server_revision + 1, updated_at = now()
        WHERE id = $1
        RETURNING server_revision
        """,
        eid,
    )
    return int(rev_row["server_revision"]) if rev_row else 0
