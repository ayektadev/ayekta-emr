-- Chunk D — monotonic server revision per encounter for optimistic concurrency (Blueprint §10).

ALTER TABLE encounters
  ADD COLUMN IF NOT EXISTS server_revision INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN encounters.server_revision IS 'Incremented on each chart_bundle ingest; client sends baseServerRevision to detect drift.';
