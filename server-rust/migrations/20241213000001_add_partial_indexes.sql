-- Add partial indexes for efficient querying of unused/active records

-- Index for finding valid (unused) verification tokens
-- Used when looking up tokens for validation
CREATE INDEX IF NOT EXISTS idx_verify_unused ON verification_tokens(token_hash) WHERE used_at IS NULL;

-- Index for finding valid (unused) nonces
-- Used when validating Solana signatures
CREATE INDEX IF NOT EXISTS idx_nonces_unused ON solana_nonces(nonce) WHERE used_at IS NULL;

-- Index for finding active (non-revoked) sessions
-- Used when validating refresh tokens
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(refresh_token_hash) WHERE revoked_at IS NULL;
