-- API users for JWT login (Chunk B). Passwords are bcrypt hashes; demo passwords match usernames.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities (id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('surgeon', 'nurse', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, username)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_username ON users (tenant_id, lower(username));

-- Demo accounts (password = username). Rotate in production.
INSERT INTO users (id, tenant_id, facility_id, username, password_hash, full_name, role) VALUES
  (
    '00000000-0000-4000-8000-000000000010',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'surgeon',
    '$2b$12$BqdETW4rVVekr4Rvp2v77.15qi/Vnc99wkRPB7VTBA.bDnIMOYtAq',
    'Demo Surgeon',
    'surgeon'
  ),
  (
    '00000000-0000-4000-8000-000000000011',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'nurse',
    '$2b$12$u95m.KPLKD7Xkv8/s/dgTeMRu8AZUwKna3pk3SNDgzQ2PCjScPGN.',
    'Demo Nurse',
    'nurse'
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'admin',
    '$2b$12$RDnYo8RJX9J93r1PmNUpTuuTomX9rh./eBfSasGlL9hRqgBLVOfqq',
    'Demo Admin',
    'admin'
  )
ON CONFLICT (tenant_id, username) DO NOTHING;
