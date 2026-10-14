-- API Keys table for user authentication
-- Multiple labeled keys per user, stored as SHA256 hashes
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(64) NOT NULL UNIQUE,  -- SHA256 hex (64 chars)
    key_prefix VARCHAR(16) NOT NULL,       -- First chars for identification (e.g., "ck_abc123...")
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Index for looking up by user
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- User-facing labels must be unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_user_label ON api_keys(user_id, label);

-- Index for validating keys by prefix before constant-time hash comparison
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- Index for validating keys (lookup by hash)
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
