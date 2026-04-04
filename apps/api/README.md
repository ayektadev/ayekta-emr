# Ayekta API (FastAPI + Postgres)

Implements the **Phase 7 sync surface** (`POST /sync/push`, `/sync/pull`, `/sync/ack`) against **PostgreSQL**. The web app points `VITE_SYNC_API_BASE` here instead of the mock transport.

## Why this shape

- **Modular hosting**: any Postgres provider (Supabase, AWS RDS/Aurora, GCP Cloud SQL, Azure, self-hosted) — swap `DATABASE_URL` only.
- **HIPAA / BAA**: choose a provider and deployment tier that signs a BAA; this repo does not lock you to one vendor.
- **Spec alignment**: `migrations/001_core_tenant_chart_ingest.sql` is the first slice; `docs/v2/postgres-schema-draft.sql` remains the fuller normalized target (patients, encounters, versions, attachments, audit).

## Setup

1. **Python 3.11+**

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
# Optional: S3-compatible presigned uploads (`pip install -e ".[storage-s3]"` or `pip install boto3`).
```

2. **Database** — create a Supabase project (or any Postgres). Copy the **connection string** (often **Transaction** pooler for serverless). It must include SSL if the host requires it, e.g. `?sslmode=require`.

3. **Apply migrations** (once per database, in order):

```bash
psql "$DATABASE_URL" -f migrations/001_core_tenant_chart_ingest.sql
psql "$DATABASE_URL" -f migrations/002_attachment_ingest.sql
psql "$DATABASE_URL" -f migrations/003_attachment_presign.sql
psql "$DATABASE_URL" -f migrations/004_users_auth.sql
psql "$DATABASE_URL" -f migrations/005_normalized_clinical.sql
psql "$DATABASE_URL" -f migrations/006_encounter_server_revision.sql
psql "$DATABASE_URL" -f migrations/007_attachment_blueprint_columns.sql
```

4. **Environment** — copy `.env.example` to `.env` and fill values. For browser sync, set **`JWT_SECRET`** (and run migration **004**). Demo users: `surgeon` / `nurse` / `admin` with password equal to username (change in production).

**Chunk C (normalized clinical):** After **005**, each **`chart_bundle`** push upserts **`patients`**, **`patient_identifiers`** (`client_ishi`), **`encounters`** (`client_encounter_id` = `enc:{ishiId}`), and **`encounter_versions`** (`version_number = 0` draft mirror of the JSON). Stable server UUIDs are derived from tenant + client ids (see `ayekta_api/domain/chart_bundle_ingest.py`). JWT logins use the user’s **`facility_id`**; service-key / open-dev pushes use the tenant’s first active facility.

**Chunk D (pull + conflicts):** After **006**, **`encounters.server_revision`** increments on each successful ingest. **`POST /sync/push`** accepts optional **`baseServerRevision`**; mismatch → **409** with `{ detail: { message, serverRevision } }`. Successful push returns **`serverRevision`**. **`POST /sync/pull`** returns **`bundles`** (draft chart JSON per patient), **`cursor`** (`ISO|encounterUuid` for the last row when **`hasMore`**), and **`limit`** (default 50, max 200). Receipt insert remains idempotent per `clientId`; normalized ingest runs only when the receipt row is **new** (avoids double-bumping revision on replay).

**Chunk F (attachment metadata):** After **007**, **`attachment_ingests`** carries **`doc_type`**, **`checksum`** (SHA-256 hex for inline / dev BYTEA completes), **`uploaded_by`** / **`uploaded_at`** (JWT user when present), and optional **`encounter_id`** (FK when **`encounterClientId`** resolves to an existing server encounter). **`GET /attachments`** returns those fields. S3-only completes may leave **`checksum`** null until a separate verify step exists.

5. **Run**

```bash
uvicorn ayekta_api.main:app --reload --host 0.0.0.0 --port 8000
```

## Authentication

- If **`JWT_SECRET`** and **`SYNC_API_KEY`** are both **unset**, `/sync/*` and `/attachments/*` accept requests with only **`X-Tenant-Id`** (local dev only).
- If **`JWT_SECRET`** is set, clients must send **`Authorization: Bearer <accessToken>`** from **`POST /auth/login`** (tenant is taken from the token — do not rely on `X-Tenant-Id` to escalate scope).
- If **`SYNC_API_KEY`** is set, **`Authorization: Bearer <SYNC_API_KEY>`** is also accepted (scripts, legacy). Use **`X-Tenant-Id`** with the service key.

## Headers (web app)

- **`X-Tenant-Id`**: UUID of the tenant row when using **`SYNC_API_KEY`** or open dev mode. With JWT, optional; server uses token `tid`.
- **`Authorization`**: JWT from login (preferred for browsers) or `SYNC_API_KEY` when configured.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/ready` | DB connectivity |
| POST | `/auth/login` | Username/password → JWT (`tenantSlug` defaults to `default`) |
| POST | `/sync/push` | Idempotent chart bundle ingest |
| POST | `/sync/pull` | Paginated `chart_bundle` rows from normalized drafts (`cursor` = `updatedAt|encounterId` when more pages) |
| POST | `/sync/ack` | Mark clientIds acknowledged |
| POST | `/attachments/register` | Small inline ingest (base64 body, ≤2&nbsp;MB) |
| POST | `/attachments/presign` | Create deferred row; returns presigned PUT (S3 if `S3_BUCKET` + boto3) or dev `PUT /attachments/blob/{id}` |
| PUT | `/attachments/blob/{id}` | Finish dev presigned path (raw body, must match `byteSize`) |
| POST | `/attachments/{id}/complete` | Mark S3 upload complete after client PUT to bucket |
| GET | `/attachments?patientId=` | List completed attachments for a patient |
| GET | `/attachments/{id}/download` | Stream BYTEA or redirect to presigned S3 GET |

**Storage:** Set `PUBLIC_API_BASE_URL` to the URL the **browser** uses to reach this API (e.g. `http://127.0.0.1:8000`) so dev presign URLs are reachable. For production object storage, set `S3_BUCKET`, credentials, and optionally `S3_ENDPOINT_URL` (MinIO / R2).

## Conflict (409)

**`chart_bundle`** push with wrong **`baseServerRevision`**, or **missing** base when the server already has `server_revision > 0`, returns **409** (Blueprint §10 draft conflict). The web client pulls first, stores revision in IndexedDB, and retries per sync UI.
