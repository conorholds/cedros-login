-- Pending Wallet Recovery: Temporary storage for recovery data
--
-- Stores recovery data (Share C or full seed) until user acknowledges receipt.
-- Data is deleted after acknowledgment or expires automatically.
--
-- Flow:
-- 1. During wallet enrollment, if recovery_mode != 'none', store recovery data here
-- 2. UI prompts user to write down recovery phrase
-- 3. User acknowledges receipt via API call
-- 4. Server deletes the record
--
-- Security: This is temporary storage. Data expires and auto-deletes if not acknowledged.

CREATE TABLE IF NOT EXISTS pending_wallet_recovery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link to user (one pending recovery per user)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Type of recovery data stored
    -- 'share_c' = Share C only (BIP-39 mnemonic for the share)
    -- 'full_seed' = Full seed (BIP-39 mnemonic for entire seed, portable to other wallets)
    recovery_type TEXT NOT NULL CHECK (recovery_type IN ('share_c', 'full_seed')),

    -- Base64-encoded recovery data
    -- For share_c: the hex-encoded share converted to BIP-39 words
    -- For full_seed: the seed converted to BIP-39 mnemonic (12 words for 16-byte seed)
    recovery_data TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Auto-expire after 24 hours if not acknowledged
    -- Prevents indefinite storage of sensitive recovery data
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

    -- Only one pending recovery per user
    CONSTRAINT pending_wallet_recovery_user_unique UNIQUE (user_id)
);

-- Index for cleanup job to find expired records
CREATE INDEX IF NOT EXISTS idx_pending_wallet_recovery_expires_at ON pending_wallet_recovery(expires_at);

-- Comment for documentation
COMMENT ON TABLE pending_wallet_recovery IS
    'Temporary storage for wallet recovery data. Deleted after user acknowledges or expires after 24h.';

COMMENT ON COLUMN pending_wallet_recovery.recovery_data IS
    'Base64-encoded recovery phrase. Share C hex as BIP-39 or full seed as BIP-39 mnemonic.';
