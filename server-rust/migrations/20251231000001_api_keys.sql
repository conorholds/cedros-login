-- API Keys table for user authentication
-- One key per user, stored as SHA256 hash
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA256 hex (64 chars)
    key_prefix VARCHAR(16) NOT NULL,       -- First chars for identification (e.g., "ck_abc123...")
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    CONSTRAINT one_key_per_user UNIQUE (user_id)
);

-- Index for looking up by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- Index for validating keys (lookup by hash)
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
