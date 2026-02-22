-- Multi-wallet + API key wallet auth migration
-- Allows multiple API keys per user (with labels) and multiple wallets (one default + one per API key).

-- =============================================================================
-- api_keys: allow multiple keys per user with labels
-- =============================================================================

-- Drop one-key-per-user constraint
ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS one_key_per_user;

-- Add label column (human-readable identifier per key)
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS label VARCHAR(100) NOT NULL DEFAULT 'default';

-- Enforce unique (user_id, label) so each user's keys have distinct labels
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_user_label ON api_keys(user_id, label);

-- =============================================================================
-- solana_wallet_material: allow multiple wallets per user (one per API key)
-- =============================================================================

-- Drop user_id UNIQUE to allow multiple wallets per user
ALTER TABLE solana_wallet_material DROP CONSTRAINT IF EXISTS solana_wallet_material_user_id_key;
DROP INDEX IF EXISTS idx_solana_wallet_user;

-- Add optional api_key_id FK (NULL = default/account-level wallet)
ALTER TABLE solana_wallet_material
    ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL;

-- One default wallet per user (api_key_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_user_default
    ON solana_wallet_material(user_id) WHERE api_key_id IS NULL;

-- One wallet per API key
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_api_key
    ON solana_wallet_material(api_key_id) WHERE api_key_id IS NOT NULL;

-- Update auth method CHECK to include 'api_key'
ALTER TABLE solana_wallet_material DROP CONSTRAINT IF EXISTS solana_wallet_auth_method_check;
ALTER TABLE solana_wallet_material
    ADD CONSTRAINT solana_wallet_auth_method_check
        CHECK (share_a_auth_method IN ('password', 'pin', 'passkey', 'api_key'));
