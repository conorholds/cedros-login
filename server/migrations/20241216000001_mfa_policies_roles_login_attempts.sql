-- Login attempts table (for lockout tracking)
-- NOTE: ON DELETE SET NULL is intentional - login attempts are retained for
-- security analysis even after user deletion. Uses email for lockout logic.
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(320) NOT NULL,
    ip_address TEXT,
    successful BOOLEAN NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts (lower(email));
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts (attempted_at DESC);

-- TOTP secrets table
CREATE TABLE IF NOT EXISTS totp_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    secret TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enabled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_totp_secrets_user ON totp_secrets(user_id);

-- TOTP recovery codes
CREATE TABLE IF NOT EXISTS totp_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(64) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    used_at TIMESTAMPTZ,
    CONSTRAINT totp_recovery_codes_user_code_unique UNIQUE (user_id, code_hash)
);

CREATE INDEX IF NOT EXISTS idx_totp_recovery_codes_user_used ON totp_recovery_codes(user_id, used);

-- Custom roles
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_roles_org_name_unique ON custom_roles(org_id, lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_roles_default_unique ON custom_roles(org_id)
    WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_custom_roles_org ON custom_roles(org_id);

-- ABAC policies
CREATE TABLE IF NOT EXISTS abac_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    permission VARCHAR(100) NOT NULL,
    conditions JSONB NOT NULL DEFAULT '{}',
    effect VARCHAR(10) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abac_policies_org_permission ON abac_policies(org_id, permission);
CREATE INDEX IF NOT EXISTS idx_abac_policies_org_enabled ON abac_policies(org_id, enabled);
CREATE INDEX IF NOT EXISTS idx_abac_policies_org_priority ON abac_policies(org_id, priority DESC);
