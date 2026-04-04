-- Ayekta API — minimal operational schema for Phase 7 sync ingest.
-- Compatible with Supabase, AWS RDS, GCP Cloud SQL, etc. (standard Postgres).
-- Full normalized clinical tables remain in docs/v2/postgres-schema-draft.sql and will be
-- applied in a later migration once ISHI / ayekta_id mapping is finalized.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS chart_bundle_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  version_id TEXT,
  operation TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  UNIQUE (tenant_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_chart_bundle_receipts_entity
  ON chart_bundle_receipts (tenant_id, entity_id, received_at DESC);

-- Blueprint §8 sync_events — entity_id as TEXT for now (client ISHI / opaque ids).
CREATE TABLE IF NOT EXISTS sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  device_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_version INT,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ
);

INSERT INTO tenants (id, name, slug, status) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Default', 'default', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO facilities (id, tenant_id, name, timezone) VALUES
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Main', 'UTC')
ON CONFLICT (id) DO NOTHING;
