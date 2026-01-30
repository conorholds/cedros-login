-- Solana wallet material table for non-custodial wallet storage
--
-- SECURITY MODEL:
-- - Server stores ONLY encrypted ciphertexts and metadata
-- - Server NEVER possesses >=2 plaintext shares simultaneously
-- - Server NEVER has access to PRF output or device key (k_device)
-- - Server NEVER has access to user password/PIN or derived key (k_user)
-- - All seed reconstruction and signing happens client-side
--
-- Shares:
-- - ShareA: Encrypted with k_user (Argon2id-derived from password/PIN)
-- - ShareB: Encrypted with k_device (HKDF-derived from WebAuthn PRF output)
-- - ShareC: Never stored on server (shown to user as BIP-39 mnemonic)

CREATE TABLE IF NOT EXISTS solana_wallet_material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Solana public key (Base58 encoded, 32-50 chars)
    solana_pubkey VARCHAR(50) NOT NULL,

    -- Scheme versioning for future migrations
    scheme_version SMALLINT NOT NULL DEFAULT 1,

    -- Shamir parameters (always 2-of-3 for this scheme)
    shamir_t SMALLINT NOT NULL,
    shamir_n SMALLINT NOT NULL,

    -- Share A: Encrypted with user secret (password or Wallet PIN)
    -- KDF: Argon2id with per-user salt
    share_a_ciphertext BYTEA NOT NULL,
    share_a_nonce BYTEA NOT NULL,           -- AES-GCM nonce (12 bytes)
    share_a_kdf_salt BYTEA NOT NULL,        -- Argon2id salt (16 bytes)
    share_a_kdf_params_json JSONB NOT NULL, -- {"m_cost": int, "t_cost": int, "p_cost": int}

    -- Share B: Encrypted with device key (derived from WebAuthn PRF)
    share_b_ciphertext BYTEA NOT NULL,
    share_b_nonce BYTEA NOT NULL,           -- AES-GCM nonce (12 bytes)
    passkey_credential_id BYTEA NOT NULL,   -- WebAuthn credential ID
    prf_salt BYTEA NOT NULL,                -- PRF extension salt (32 bytes)

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT solana_wallet_shamir_params_check CHECK (shamir_t = 2 AND shamir_n = 3),
    CONSTRAINT solana_wallet_pubkey_length CHECK (LENGTH(solana_pubkey) BETWEEN 32 AND 50),
    CONSTRAINT solana_wallet_nonce_a_length CHECK (LENGTH(share_a_nonce) = 12),
    CONSTRAINT solana_wallet_nonce_b_length CHECK (LENGTH(share_b_nonce) = 12),
    CONSTRAINT solana_wallet_kdf_salt_length CHECK (LENGTH(share_a_kdf_salt) >= 16),
    CONSTRAINT solana_wallet_prf_salt_length CHECK (LENGTH(prf_salt) = 32)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_wallet_user ON solana_wallet_material(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_solana_wallet_pubkey ON solana_wallet_material(solana_pubkey);
CREATE INDEX IF NOT EXISTS idx_solana_wallet_credential ON solana_wallet_material(passkey_credential_id);

-- Comment explaining the security model
COMMENT ON TABLE solana_wallet_material IS
    'Stores encrypted wallet shares for non-custodial Solana wallet. Server NEVER has access to >=2 plaintext shares or any decryption keys. Seed reconstruction requires client-side decryption of at least 2 shares.';
