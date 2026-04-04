-- Chunk C — normalized patients / encounters / versions (Blueprint §8 subset).
-- Client ISHI / enc:* ids are TEXT; server UUIDs are deterministic (see chart_bundle_ingest.py).

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities (id) ON DELETE CASCADE,
  client_patient_id TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  dob DATE,
  sex TEXT,
  phone TEXT,
  address_json JSONB,
  created_by UUID REFERENCES users (id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, client_patient_id)
);

CREATE INDEX IF NOT EXISTS idx_patients_tenant ON patients (tenant_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS patient_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  facility_id UUID REFERENCES facilities (id),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (patient_id, type, value)
);

CREATE TABLE IF NOT EXISTS encounters (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities (id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  encounter_type TEXT NOT NULL DEFAULT 'outpatient_surgical',
  status TEXT NOT NULL DEFAULT 'draft',
  current_version_id UUID,
  created_by UUID REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_encounter_id TEXT NOT NULL,
  UNIQUE (tenant_id, client_encounter_id)
);

CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters (tenant_id, patient_id);

CREATE TABLE IF NOT EXISTS encounter_versions (
  id UUID PRIMARY KEY,
  encounter_id UUID NOT NULL REFERENCES encounters (id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  authored_by UUID REFERENCES users (id),
  role TEXT,
  status TEXT NOT NULL,
  data_json JSONB NOT NULL,
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  amendment_reason TEXT,
  supersedes_version_id UUID REFERENCES encounter_versions (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (encounter_id, version_number)
);

ALTER TABLE encounters DROP CONSTRAINT IF EXISTS encounters_current_version_fk;
ALTER TABLE encounters
  ADD CONSTRAINT encounters_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES encounter_versions (id)
  DEFERRABLE INITIALLY DEFERRED;

COMMENT ON COLUMN patients.client_patient_id IS 'Client ISHI / stable patient key from chart JSON (ishiId).';
COMMENT ON COLUMN encounters.client_encounter_id IS 'Client encounter id, typically enc:{ishiId}.';
COMMENT ON COLUMN encounter_versions.version_number IS '0 = server-mirrored draft from chart_bundle push; 1+ reserved for signed chain later.';
