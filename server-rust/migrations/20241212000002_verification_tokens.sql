-- Verification tokens for email verification and password reset
CREATE TABLE IF NOT EXISTS verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_type VARCHAR(32) NOT NULL,  -- 'email_verify' | 'password_reset'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verify_user ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verify_token ON verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_verify_type ON verification_tokens(token_type);
CREATE INDEX IF NOT EXISTS idx_verify_expires ON verification_tokens(expires_at);
