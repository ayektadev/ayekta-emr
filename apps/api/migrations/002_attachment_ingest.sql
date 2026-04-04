-- Binary/metadata ingest for Phase 8 (dev-friendly; replace with S3 keys in production).

CREATE TABLE IF NOT EXISTS attachment_ingests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INT NOT NULL CHECK (byte_size >= 0),
  payload_bytea BYTEA,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachment_ingests_patient ON attachment_ingests (tenant_id, patient_id, created_at DESC);
