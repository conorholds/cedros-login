-- Unified credential tracking table
-- Provides a normalized view of all user authentication methods

CREATE TABLE user_credentials (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_type VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    disabled_at TIMESTAMPTZ,
    metadata JSONB,

    CONSTRAINT valid_credential_type CHECK (
        credential_type IN (
            'password',
            'webauthn_passkey',
            'webauthn_security_key',
            'totp',
            'oauth_google',
            'oauth_apple',
            'solana',
            'sso_oidc'
        )
    )
);

-- Index for finding credentials by user
CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);

-- Index for finding active credentials by user and type
CREATE INDEX idx_user_credentials_user_type ON user_credentials(user_id, credential_type)
    WHERE disabled_at IS NULL;

-- Index for finding credentials by type (for admin queries)
CREATE INDEX idx_user_credentials_type ON user_credentials(credential_type);

COMMENT ON TABLE user_credentials IS 'Unified tracking of all user authentication credentials';
COMMENT ON COLUMN user_credentials.credential_type IS 'Type of credential: password, webauthn_passkey, webauthn_security_key, totp, oauth_google, oauth_apple, solana, sso_oidc';
COMMENT ON COLUMN user_credentials.label IS 'User-friendly label for the credential (e.g., "Work laptop", "YubiKey")';
COMMENT ON COLUMN user_credentials.disabled_at IS 'Soft-delete timestamp; NULL means credential is active';
COMMENT ON COLUMN user_credentials.metadata IS 'Additional credential-specific data (JSON)';
