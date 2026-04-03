-- Ayekta v2 — Postgres draft (Phase 1 lock; aligns with Engineering Blueprint §8)
-- Not applied by the web app yet; reference for upcoming FastAPI service.

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities (id),
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  UNIQUE (tenant_id, username)
);

CREATE TABLE device_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  trusted_until TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities (id),
  ayekta_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE,
  sex TEXT,
  phone TEXT,
  address_json JSONB,
  created_by UUID REFERENCES users (id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE patient_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  facility_id UUID REFERENCES facilities (id),
  is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities (id),
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  encounter_type TEXT NOT NULL,
  status TEXT NOT NULL,
  current_version_id UUID,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE encounter_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters (id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  authored_by UUID REFERENCES users (id),
  role TEXT,
  status TEXT NOT NULL,
  data_json JSONB NOT NULL,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES users (id),
  amendment_reason TEXT,
  supersedes_version_id UUID REFERENCES encounter_versions (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE encounters
  ADD CONSTRAINT encounters_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES encounter_versions (id);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  encounter_id UUID REFERENCES encounters (id),
  type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  uploaded_by UUID REFERENCES users (id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checksum TEXT
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities (id),
  user_id UUID REFERENCES users (id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata_json JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  device_id TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_version INT,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ
);
