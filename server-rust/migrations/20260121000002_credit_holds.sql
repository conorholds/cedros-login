-- Credit holds and idempotency for professional-grade spending
-- Implements:
-- 1. Idempotency keys to prevent duplicate charges
-- 2. Hold/capture pattern for two-phase commits
-- 3. Reference tracking to link spends to orders/purchases

-- Add idempotency and reference tracking to credit_transactions
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS reference_type TEXT;  -- 'order', 'subscription', 'refund', etc.
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS reference_id UUID;    -- ID of the related entity
ALTER TABLE credit_transactions ADD COLUMN IF NOT EXISTS hold_id UUID;         -- Link to original hold if captured

-- Unique constraint on idempotency key (allows NULL - only enforced when present)
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_idempotency
    ON credit_transactions(user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

-- Index for looking up transactions by reference
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference
    ON credit_transactions(reference_type, reference_id)
    WHERE reference_type IS NOT NULL;

-- Credit holds table (reserves credits before capture)
-- Hold flow: create hold -> capture (converts to spend) OR release (cancels hold)
-- Expired holds are auto-released by background job
CREATE TABLE IF NOT EXISTS credit_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount BIGINT NOT NULL,           -- Amount held (always positive)
    currency TEXT NOT NULL DEFAULT 'SOL',

    -- Idempotency and reference tracking
    idempotency_key TEXT NOT NULL,    -- Required for holds to prevent duplicates
    reference_type TEXT,              -- What this hold is for
    reference_id UUID,                -- ID of related entity

    -- Hold lifecycle
    status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'captured', 'released', 'expired'
    expires_at TIMESTAMPTZ NOT NULL,  -- When hold auto-releases

    -- Metadata
    metadata JSONB,                   -- Additional context
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Captured transaction link (set when captured)
    captured_transaction_id UUID REFERENCES credit_transactions(id),

    -- Prevent duplicate holds with same idempotency key
    UNIQUE(user_id, idempotency_key)
);

-- Indexes for hold management
CREATE INDEX IF NOT EXISTS idx_credit_holds_user ON credit_holds(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_holds_status ON credit_holds(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_credit_holds_expires ON credit_holds(expires_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_credit_holds_reference ON credit_holds(reference_type, reference_id)
    WHERE reference_type IS NOT NULL;

-- Add held_balance to credit_balances for tracking reserved credits
ALTER TABLE credit_balances ADD COLUMN IF NOT EXISTS held_balance BIGINT NOT NULL DEFAULT 0;

-- Available balance = balance - held_balance
-- This ensures users can't spend credits that are on hold

COMMENT ON TABLE credit_holds IS
    'Reserves credits before final capture. Implements two-phase commit for purchases.';
COMMENT ON COLUMN credit_holds.idempotency_key IS
    'Client-provided key to prevent duplicate holds. Required.';
COMMENT ON COLUMN credit_holds.expires_at IS
    'Hold auto-releases after this time if not captured.';
COMMENT ON COLUMN credit_balances.held_balance IS
    'Sum of pending holds. Available = balance - held_balance.';
