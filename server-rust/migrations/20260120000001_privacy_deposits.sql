-- Privacy Cash Integration: Deposit sessions, credits, and note storage
-- See /privacy-cash-integration-plan.md for detailed documentation

-- 1. Deposit sessions (tracks deposit intent and state)
CREATE TABLE IF NOT EXISTS deposit_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL REFERENCES sessions(id),
    wallet_address TEXT NOT NULL,
    wallet_type TEXT NOT NULL,  -- 'embedded' | 'external'
    currency TEXT NOT NULL DEFAULT 'SOL',
    unlock_expires_at TIMESTAMPTZ,  -- NULL for external wallets
    status TEXT NOT NULL DEFAULT 'pending',
    -- Status values:
    -- pending: waiting for SOL (embedded) or signed tx (external)
    -- detected: SOL received, processing
    -- processing: Privacy Cash tx in flight
    -- completed: credits issued
    -- expired: TTL elapsed without completion
    -- failed: error occurred
    detected_amount_lamports BIGINT,
    detected_tx_signature TEXT,  -- Solana tx that funded the wallet (for embedded)
    detected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    -- For byte-for-byte tx validation (CRITICAL for security)
    expected_message_hash TEXT,  -- SHA256 of unsigned tx message bytes
    expected_message_bytes BYTEA,  -- Full message for debugging (optional)
    -- Privacy Cash deposit tx (separate from source funding tx)
    privacy_deposit_tx_signature TEXT,
    -- Deposit amount after fee reservation
    deposit_amount_lamports BIGINT,  -- Amount actually deposited to Privacy Cash
    fee_buffer_lamports BIGINT,  -- Reserved for tx fees (embedded wallet only)
    -- Blockhash expiry (external wallets must sign before this time)
    tx_expires_at TIMESTAMPTZ,
    -- Retry tracking
    processing_attempts INT NOT NULL DEFAULT 0,
    last_processing_error TEXT,
    last_processing_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposit_sessions_user ON deposit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_sessions_wallet ON deposit_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_deposit_sessions_status ON deposit_sessions(status);
CREATE INDEX IF NOT EXISTS idx_deposit_sessions_session ON deposit_sessions(session_id);

-- 1b. Webhook events (separate table to avoid array growth issues)
-- Used for idempotency of Quicknode webhooks
CREATE TABLE IF NOT EXISTS deposit_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_session_id UUID REFERENCES deposit_sessions(id),
    wallet_address TEXT NOT NULL,  -- For events before session exists
    tx_signature TEXT NOT NULL UNIQUE,  -- Solana sigs are globally unique
    webhook_id TEXT,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_session ON deposit_webhook_events(deposit_session_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_wallet ON deposit_webhook_events(wallet_address);

-- 2. Privacy Cash notes (encrypted, server-only, NEVER exposed to clients)
-- Must be created before credit_transactions due to FK reference
CREATE TABLE IF NOT EXISTS privacy_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    deposit_session_id UUID REFERENCES deposit_sessions(id),
    -- Note encrypted with server-side AES-256-GCM key
    encrypted_note BYTEA NOT NULL,
    note_nonce BYTEA NOT NULL,  -- 12-byte AES-GCM nonce
    -- Key rotation support
    encryption_key_id TEXT NOT NULL DEFAULT 'v1',
    cipher_version TEXT NOT NULL DEFAULT 'aes-256-gcm',
    -- Commitment hash for lookup/deduplication (not secret)
    commitment_hash TEXT NOT NULL UNIQUE,
    amount_lamports BIGINT NOT NULL,
    fee_lamports BIGINT,  -- Privacy Cash withdrawal fee (for accounting)
    currency TEXT NOT NULL DEFAULT 'SOL',
    status TEXT NOT NULL DEFAULT 'pending',
    -- Status values:
    -- pending: note generated, tx not yet confirmed
    -- active: tx confirmed, can be withdrawn
    -- withdrawal_pending: withdrawal tx submitted
    -- withdrawn: successfully withdrawn to company wallet
    -- withdrawal_failed: withdrawal attempted but failed
    withdrawal_tx_signature TEXT,
    withdrawal_recipient TEXT,  -- company wallet address
    withdrawal_attempts INT NOT NULL DEFAULT 0,
    last_withdrawal_error TEXT,
    last_withdrawal_attempt_at TIMESTAMPTZ,
    deposited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_privacy_notes_user ON privacy_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_notes_status ON privacy_notes(status);
CREATE INDEX IF NOT EXISTS idx_privacy_notes_commitment ON privacy_notes(commitment_hash);
CREATE INDEX IF NOT EXISTS idx_privacy_notes_withdrawal_ready ON privacy_notes(status, deposited_at)
    WHERE status IN ('active', 'withdrawal_failed');

-- 3. Credit balances (one row per user per currency)
CREATE TABLE IF NOT EXISTS credit_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    balance BIGINT NOT NULL DEFAULT 0,  -- in smallest unit (lamports for SOL)
    currency TEXT NOT NULL DEFAULT 'SOL',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_credit_balances_user ON credit_balances(user_id);

-- 4. Credit transactions (immutable audit log)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount BIGINT NOT NULL,  -- positive = credit, negative = debit
    currency TEXT NOT NULL,
    tx_type TEXT NOT NULL,  -- 'deposit' | 'spend' | 'adjustment'
    deposit_session_id UUID REFERENCES deposit_sessions(id),
    privacy_note_id UUID REFERENCES privacy_notes(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at);

-- 5. Deposit configuration (admin-settable at runtime)
CREATE TABLE IF NOT EXISTS deposit_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO deposit_config (key, value) VALUES
    ('min_deposit_lamports', '0'),
    ('deposit_session_ttl_secs', '86400'),
    ('withdrawal_delay_hours', '48'),
    ('supported_currencies', '["SOL"]'),
    ('privacy_cash_withdrawal_fee_percent', '0.35'),
    ('privacy_cash_withdrawal_fee_fixed_lamports', '6000000')
ON CONFLICT (key) DO NOTHING;
