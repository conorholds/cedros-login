-- Add step-up authentication tracking and Enterprise SSO tables
-- Phase 6: Step-Up Auth Framework
-- Phase 5: Enterprise SSO (OIDC)

-- Add last_strong_auth_at to sessions for step-up auth tracking
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS last_strong_auth_at TIMESTAMPTZ NULL;

-- SSO Providers table
-- Stores OIDC provider configuration per organization
CREATE TABLE IF NOT EXISTS sso_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuer_url TEXT NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    client_secret_encrypted TEXT NOT NULL,  -- AES-256-GCM encrypted
    scopes TEXT[] NOT NULL DEFAULT '{openid,email,profile}',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    allow_registration BOOLEAN NOT NULL DEFAULT TRUE,
    email_domain VARCHAR(255),  -- Optional domain restriction
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each org can have one enabled provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_sso_providers_org_enabled
    ON sso_providers(org_id) WHERE enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_sso_providers_org ON sso_providers(org_id);

-- SSO Auth State table (stores PKCE and nonce during OAuth flow)
CREATE TABLE IF NOT EXISTS sso_auth_states (
    state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    pkce_verifier TEXT NOT NULL,
    nonce TEXT NOT NULL,
    redirect_uri TEXT,  -- Where to redirect after auth
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cleanup of expired states
CREATE INDEX IF NOT EXISTS idx_sso_auth_states_expires ON sso_auth_states(expires_at);

-- Auto-update updated_at on sso_providers
DROP TRIGGER IF EXISTS update_sso_providers_updated_at ON sso_providers;
CREATE TRIGGER update_sso_providers_updated_at
    BEFORE UPDATE ON sso_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
