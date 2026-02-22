-- Wallet v2: Server-side signing architecture
--
-- SECURITY MODEL CHANGE:
-- - Share A: Encrypted ciphertext on server (unchanged storage, but decryption happens server-side)
-- - Share B: Plaintext on server (SSS math protects it - 1 share reveals nothing)
-- - Server combines shares JIT for signing, wipes immediately after
-- - User provides credential (password/PIN/passkey) to unlock Share A
--
-- Auth methods for Share A:
-- - 'password': Email users reuse login password (Argon2id KDF)
-- - 'pin': OAuth users create wallet PIN (Argon2id KDF, hash stored in this table)
-- - 'passkey': Users with passkey login use PRF extension (HKDF)

-- Add new columns
ALTER TABLE solana_wallet_material ADD COLUMN IF NOT EXISTS share_b BYTEA;
ALTER TABLE solana_wallet_material ADD COLUMN IF NOT EXISTS share_a_auth_method VARCHAR(20);
ALTER TABLE solana_wallet_material ADD COLUMN IF NOT EXISTS share_a_pin_hash VARCHAR(255);

-- Bump scheme_version for new wallets (v2)
-- Existing v1 wallets would need a migration process (not handled here)
COMMENT ON COLUMN solana_wallet_material.scheme_version IS 'v1=client-side signing, v2=server-side signing';

-- For existing data, we can't automatically migrate (would need user action)
-- New enrollments will use v2 schema

-- Make share_b NOT NULL for new rows (after migration of existing data)
-- For now, allow NULL to support gradual migration
-- In production, run data migration then: ALTER COLUMN share_b SET NOT NULL;

-- Update constraints for new columns
DO $$ BEGIN
    ALTER TABLE solana_wallet_material
        ADD CONSTRAINT solana_wallet_auth_method_check
            CHECK (share_a_auth_method IN ('password', 'pin', 'passkey') OR share_a_auth_method IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Constraint: PIN hash required for PIN auth method
DO $$ BEGIN
    ALTER TABLE solana_wallet_material
        ADD CONSTRAINT solana_wallet_pin_hash_check
            CHECK (share_a_auth_method != 'pin' OR share_a_pin_hash IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Constraint: PRF salt required for passkey auth method
DO $$ BEGIN
    ALTER TABLE solana_wallet_material
        ADD CONSTRAINT solana_wallet_passkey_prf_check
            CHECK (share_a_auth_method != 'passkey' OR prf_salt IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop old Share B encryption columns (after migration)
-- These were for client-side PRF decryption which is no longer needed
-- Keep passkey_credential_id and prf_salt - repurposed for passkey auth on Share A

-- Note: In production, run these after migrating existing wallets:
-- ALTER TABLE solana_wallet_material DROP COLUMN share_b_ciphertext;
-- ALTER TABLE solana_wallet_material DROP COLUMN share_b_nonce;
-- For now, keep them to allow gradual migration

-- Update table comment
COMMENT ON TABLE solana_wallet_material IS
    'Stores wallet material for server-side signing. Share A encrypted with user credential (password/PIN/passkey). Share B stored plaintext (SSS protects it). Server combines shares JIT for signing.';

-- Add comments for new columns
COMMENT ON COLUMN solana_wallet_material.share_b IS 'Plaintext Share B (SSS 2-of-3 protects it - 1 share reveals nothing)';
COMMENT ON COLUMN solana_wallet_material.share_a_auth_method IS 'Auth method for Share A: password (email users), pin (OAuth users), passkey';
COMMENT ON COLUMN solana_wallet_material.share_a_pin_hash IS 'Argon2id hash of wallet PIN (for PIN auth method only)';
