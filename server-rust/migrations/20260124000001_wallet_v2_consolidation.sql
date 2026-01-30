-- Wallet v2 Consolidation: Remove v1 columns, enforce v2 constraints
--
-- PRECONDITION: No existing wallet records (verified before running)
--
-- This migration finalizes the v2 server-side signing architecture:
-- - Share A: Encrypted on server, decrypted JIT with user credential
-- - Share B: Plaintext on server (SSS math protects it)
-- - Share C: User's recovery phrase (never stored)

-- Step 1: Drop v1-only columns (no longer needed for server-side signing)
ALTER TABLE solana_wallet_material
    DROP COLUMN IF EXISTS share_b_ciphertext,
    DROP COLUMN IF EXISTS share_b_nonce;

-- Step 2: Drop obsolete constraint from v1 (share_b_nonce length check)
ALTER TABLE solana_wallet_material
    DROP CONSTRAINT IF EXISTS solana_wallet_nonce_b_length;

-- Step 3: Make v2 columns NOT NULL (required for server-side signing)
-- share_b must always be present for v2 wallets
ALTER TABLE solana_wallet_material
    ALTER COLUMN share_b SET NOT NULL;

-- share_a_auth_method must always be present
ALTER TABLE solana_wallet_material
    ALTER COLUMN share_a_auth_method SET NOT NULL;

-- Step 4: Change scheme_version default to 2
ALTER TABLE solana_wallet_material
    ALTER COLUMN scheme_version SET DEFAULT 2;

-- Step 5: Make passkey-specific columns nullable (not needed for password/PIN auth)
-- These were NOT NULL in v1 (passkey-required) but v2 supports multiple auth methods
ALTER TABLE solana_wallet_material
    ALTER COLUMN passkey_credential_id DROP NOT NULL,
    ALTER COLUMN prf_salt DROP NOT NULL;

-- Step 6: Make KDF columns nullable (not needed for passkey auth)
ALTER TABLE solana_wallet_material
    ALTER COLUMN share_a_kdf_salt DROP NOT NULL,
    ALTER COLUMN share_a_kdf_params_json DROP NOT NULL;

-- Step 7: Drop the old prf_salt length constraint (was required for v1)
-- Re-add as a conditional constraint that only applies when prf_salt is present
ALTER TABLE solana_wallet_material
    DROP CONSTRAINT IF EXISTS solana_wallet_prf_salt_length;

ALTER TABLE solana_wallet_material
    ADD CONSTRAINT solana_wallet_prf_salt_length
        CHECK (prf_salt IS NULL OR LENGTH(prf_salt) = 32);

-- Step 8: Drop the old KDF salt length constraint
-- Re-add as a conditional constraint
ALTER TABLE solana_wallet_material
    DROP CONSTRAINT IF EXISTS solana_wallet_kdf_salt_length;

ALTER TABLE solana_wallet_material
    ADD CONSTRAINT solana_wallet_kdf_salt_length
        CHECK (share_a_kdf_salt IS NULL OR LENGTH(share_a_kdf_salt) >= 16);

-- Step 9: Add constraint ensuring proper fields for each auth method
-- Password auth: requires KDF salt and params
ALTER TABLE solana_wallet_material
    ADD CONSTRAINT solana_wallet_password_auth_check
        CHECK (share_a_auth_method != 'password' OR (share_a_kdf_salt IS NOT NULL AND share_a_kdf_params_json IS NOT NULL));

-- PIN auth: requires KDF salt, params, and PIN hash
ALTER TABLE solana_wallet_material
    ADD CONSTRAINT solana_wallet_pin_auth_check
        CHECK (share_a_auth_method != 'pin' OR (share_a_kdf_salt IS NOT NULL AND share_a_kdf_params_json IS NOT NULL AND share_a_pin_hash IS NOT NULL));

-- Step 10: Drop old PIN hash check (replaced by pin_auth_check above)
ALTER TABLE solana_wallet_material
    DROP CONSTRAINT IF EXISTS solana_wallet_pin_hash_check;

-- Step 11: share_b length validation
-- Note: Share size varies based on seed size and secrets.js prefix format.
-- UI uses 16-byte seed → ~17-18 byte shares. Validation done at application layer.

-- Step 12: Drop credential index (not used in v2)
DROP INDEX IF EXISTS idx_solana_wallet_credential;

-- Update table comment
COMMENT ON TABLE solana_wallet_material IS
    'Wallet material for server-side signing (v2 only). Share A encrypted with user credential. Share B stored plaintext. Server combines shares JIT for signing, wipes immediately after.';
