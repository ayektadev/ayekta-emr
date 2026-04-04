-- Chunk F — Blueprint §attachments metadata parity on `attachment_ingests` (incremental; keeps BYTEA/S3 pipeline).
-- Aligns with `docs/v2/postgres-schema-draft.sql` attachments row (type, checksum, uploaded_by, uploaded_at, encounter_id).

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS doc_type TEXT NOT NULL DEFAULT 'unspecified';

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS checksum TEXT;

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES users (id);

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS encounter_id UUID REFERENCES encounters (id) ON DELETE SET NULL;

UPDATE attachment_ingests
SET uploaded_at = created_at
WHERE uploaded_at IS NULL AND ingest_status = 'complete';

COMMENT ON COLUMN attachment_ingests.doc_type IS 'Blueprint "type": clinical | consent | imaging | lab | other | unspecified';
COMMENT ON COLUMN attachment_ingests.checksum IS 'SHA-256 hex when computed server-side (inline / server_bytea); NULL for S3 until verified elsewhere.';
COMMENT ON COLUMN attachment_ingests.uploaded_by IS 'User who completed upload (JWT sub); NULL for API key / open dev.';
COMMENT ON COLUMN attachment_ingests.uploaded_at IS 'When binary ingest finished; backfilled from created_at for legacy complete rows.';
COMMENT ON COLUMN attachment_ingests.encounter_id IS 'Server encounter UUID when client encounter exists (resolved from encounterClientId + tenant).';
