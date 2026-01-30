-- Treasury wallet configuration for SOL micro deposit batching
--
-- Enables org-level (or global) treasury wallet assignment.
-- Treasury wallet receives micro deposits and batches them into
-- Jupiter swaps when threshold is reached.

-- Treasury configuration per org (NULL org_id = global default)
CREATE TABLE treasury_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- NULL = global default treasury, otherwise org-specific
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,

    -- The admin user whose embedded wallet is used as treasury
    treasury_user_id UUID NOT NULL REFERENCES users(id),

    -- Wallet address (derived from user's wallet_materials.solana_pubkey)
    wallet_address TEXT NOT NULL,

    -- Encrypted private key for signing batch swaps
    -- Format: base64(nonce || ciphertext) using AES-256-GCM
    -- Same pattern as deposit_sessions.stored_share_b
    encrypted_private_key TEXT NOT NULL,
    encryption_key_id TEXT NOT NULL DEFAULT 'v1',

    -- Audit trail
    authorized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    authorized_by UUID NOT NULL REFERENCES users(id),

    -- Only one treasury per org (including global with NULL org_id)
    UNIQUE (org_id)
);

-- Note: UNIQUE constraint on org_id handles NULL specially in PostgreSQL.
-- To ensure only one global treasury (org_id IS NULL), add partial unique index:
CREATE UNIQUE INDEX idx_treasury_config_global
    ON treasury_config ((1))
    WHERE org_id IS NULL;

-- Index for org lookups
CREATE INDEX idx_treasury_config_org ON treasury_config(org_id)
    WHERE org_id IS NOT NULL;

-- Add batch tracking columns to deposit_sessions
ALTER TABLE deposit_sessions
    ADD COLUMN batch_id UUID,
    ADD COLUMN batched_at TIMESTAMPTZ;

-- Index for finding pending batch deposits
CREATE INDEX idx_deposit_sessions_pending_batch
    ON deposit_sessions(status, deposit_type)
    WHERE status = 'pending_batch' AND deposit_type = 'sol_micro';

-- System settings for batch configuration
INSERT INTO system_settings (key, value, category, description) VALUES
    ('micro_batch_threshold_usd', '10', 'deposit',
     'Minimum accumulated USD value before triggering batch swap. Default: $10 (Jupiter minimum)'),
    ('micro_batch_poll_secs', '300', 'deposit',
     'How often to check for batchable micro deposits in seconds. Default: 5 min')
ON CONFLICT (key) DO NOTHING;
