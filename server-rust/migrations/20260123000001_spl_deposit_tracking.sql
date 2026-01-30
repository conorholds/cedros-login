-- Add SPL token deposit tracking columns to deposit_sessions
-- For Jupiter gasless swaps: SPL token → SOL → Privacy Cash

-- Input token mint address (e.g., USDC mint)
ALTER TABLE deposit_sessions ADD COLUMN input_token_mint TEXT;

-- Input token amount (pre-swap, in token's smallest unit)
ALTER TABLE deposit_sessions ADD COLUMN input_token_amount BIGINT;

-- Swap transaction signature (Jupiter swap tx)
ALTER TABLE deposit_sessions ADD COLUMN swap_tx_signature TEXT;

-- Credit currency used for this deposit (e.g., 'USD' for USDC, 'SOL' for native)
ALTER TABLE deposit_sessions ADD COLUMN credit_currency TEXT;

-- Credit amount (pre-swap amount credited to user - company absorbs fees)
ALTER TABLE deposit_sessions ADD COLUMN credit_amount BIGINT;

-- Add held_balance column to credit_balances for hold/capture pattern
-- This allows placing holds on credits without immediately deducting
ALTER TABLE credit_balances ADD COLUMN IF NOT EXISTS held_balance BIGINT NOT NULL DEFAULT 0;

-- Add idempotency_key to credit_transactions for deduplication
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Add reference tracking columns to credit_transactions
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS reference_type TEXT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS hold_id UUID;

-- Index for finding deposits by input token
CREATE INDEX idx_deposit_sessions_input_token ON deposit_sessions(input_token_mint)
    WHERE input_token_mint IS NOT NULL;

-- Index for credit transaction idempotency
CREATE UNIQUE INDEX idx_credit_transactions_idempotency ON credit_transactions(idempotency_key)
    WHERE idempotency_key IS NOT NULL;

-- =============================================================================
-- Pending SPL Deposits
-- =============================================================================
-- Webhook-detected SPL token transfers that need user confirmation to process.
-- User must authenticate and confirm to trigger the Jupiter swap + Privacy Cash deposit.

CREATE TABLE pending_spl_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_address TEXT NOT NULL,

    -- Token info
    token_mint TEXT NOT NULL,
    -- Raw amount as received from webhook (may be decimal)
    token_amount_raw TEXT NOT NULL,
    -- Normalized amount in smallest unit (calculated from decimals)
    token_amount BIGINT,

    -- Source transaction
    tx_signature TEXT NOT NULL UNIQUE,  -- For deduplication

    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending',
    -- Status values:
    -- pending: awaiting user confirmation
    -- processing: swap in progress
    -- completed: successfully swapped and deposited
    -- failed: swap or deposit failed
    -- expired: TTL elapsed without user action

    -- Result tracking (filled after processing)
    deposit_session_id UUID REFERENCES deposit_sessions(id),
    error_message TEXT,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_pending_spl_deposits_user ON pending_spl_deposits(user_id);
CREATE INDEX idx_pending_spl_deposits_wallet ON pending_spl_deposits(wallet_address);
CREATE INDEX idx_pending_spl_deposits_status ON pending_spl_deposits(status);
CREATE INDEX idx_pending_spl_deposits_pending ON pending_spl_deposits(user_id, status)
    WHERE status = 'pending';

-- Comment explaining the SPL deposit flow
COMMENT ON COLUMN deposit_sessions.input_token_mint IS 'SPL token mint for gasless swaps (e.g., USDC mint address)';
COMMENT ON COLUMN deposit_sessions.input_token_amount IS 'Pre-swap amount in token smallest unit (user is credited this amount)';
COMMENT ON COLUMN deposit_sessions.swap_tx_signature IS 'Jupiter swap transaction signature';
COMMENT ON COLUMN deposit_sessions.credit_currency IS 'Currency credited to user (USD for stablecoins, SOL for native)';
COMMENT ON COLUMN deposit_sessions.credit_amount IS 'Amount credited to user (pre-swap, company absorbs fees)';
COMMENT ON TABLE pending_spl_deposits IS 'Webhook-detected SPL deposits awaiting user confirmation for Jupiter swap';
