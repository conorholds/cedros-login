-- Derived wallets: multiple wallets per user from a single SSS enrollment.
-- Index 0 = default wallet (lives in solana_wallet_material.solana_pubkey).
-- Index N > 0 = HKDF-derived wallets stored here.

CREATE TABLE IF NOT EXISTS derived_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    derivation_index INTEGER NOT NULL CHECK (derivation_index > 0),
    solana_pubkey VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, derivation_index),
    UNIQUE(solana_pubkey)
);

CREATE INDEX IF NOT EXISTS idx_derived_wallets_user ON derived_wallets(user_id);
