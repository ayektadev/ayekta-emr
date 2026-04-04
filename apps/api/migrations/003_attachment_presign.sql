-- Presigned / deferred binary ingest (S3 or dev PUT). Keeps BYTEA for inline + dev server path.

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS ingest_status TEXT NOT NULL DEFAULT 'complete';

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS storage_backend TEXT NOT NULL DEFAULT 'inline';

ALTER TABLE attachment_ingests
  ADD COLUMN IF NOT EXISTS storage_key TEXT;

COMMENT ON COLUMN attachment_ingests.ingest_status IS 'awaiting_upload | complete | failed';
COMMENT ON COLUMN attachment_ingests.storage_backend IS 'inline | server_bytea | s3';
