-- History of rotated/deleted wallets for audit trail.
-- Records old pubkey + metadata before hard-deleting wallet material.
-- Covers: main wallet rotation, derived wallet deletion (individual or bulk).

CREATE TABLE IF NOT EXISTS wallet_rotation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_wallet_id UUID NOT NULL,
    old_solana_pubkey VARCHAR(50) NOT NULL,
    derivation_index INTEGER NOT NULL DEFAULT 0,
    label VARCHAR(100),
    reason VARCHAR(20) NOT NULL,
    rotated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_rotation_history_user
    ON wallet_rotation_history(user_id, rotated_at DESC);
