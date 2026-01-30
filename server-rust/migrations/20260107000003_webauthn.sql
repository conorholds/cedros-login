-- WebAuthn credentials table for passkeys and security keys

CREATE TABLE webauthn_credentials (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Base64URL-encoded credential ID from authenticator
    credential_id TEXT NOT NULL UNIQUE,
    -- Base64URL-encoded public key (COSE format)
    public_key TEXT NOT NULL,
    -- Signature counter for replay attack prevention
    sign_count INT NOT NULL DEFAULT 0,
    -- Transport hints (usb, nfc, ble, internal, hybrid)
    transports TEXT[],
    -- Authenticator AAGUID (identifies authenticator model)
    aaguid TEXT,
    -- Whether this is a discoverable/resident credential (passkey)
    is_discoverable BOOLEAN NOT NULL DEFAULT false,
    -- Whether the credential is backup eligible
    backup_eligible BOOLEAN NOT NULL DEFAULT false,
    -- Whether the credential is currently backed up
    backup_state BOOLEAN NOT NULL DEFAULT false,
    -- User-friendly label (e.g., "MacBook Pro", "YubiKey")
    label VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- Index for finding credentials by user
CREATE INDEX idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);

-- Index for finding discoverable credentials (passkeys)
CREATE INDEX idx_webauthn_credentials_discoverable ON webauthn_credentials(user_id, is_discoverable)
    WHERE is_discoverable = TRUE;

COMMENT ON TABLE webauthn_credentials IS 'WebAuthn passkeys and security keys';
COMMENT ON COLUMN webauthn_credentials.credential_id IS 'Base64URL-encoded credential ID from authenticator';
COMMENT ON COLUMN webauthn_credentials.public_key IS 'Base64URL-encoded COSE public key';
COMMENT ON COLUMN webauthn_credentials.sign_count IS 'Signature counter for replay attack detection';
COMMENT ON COLUMN webauthn_credentials.is_discoverable IS 'True for passkeys that can be used for username-less auth';

-- WebAuthn challenges table for registration/authentication ceremonies
CREATE TABLE webauthn_challenges (
    challenge_id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- Serialized challenge state
    state TEXT NOT NULL,
    -- Challenge type: register or authenticate
    challenge_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for expiration cleanup
CREATE INDEX idx_webauthn_challenges_expires_at ON webauthn_challenges(expires_at);

COMMENT ON TABLE webauthn_challenges IS 'Temporary storage for WebAuthn ceremony state';
