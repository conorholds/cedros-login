-- Add PartiallyWithdrawn status and withdrawal history table
-- Supports full audit trail for partial withdrawal cycles

-- 1. Update status documentation (status is TEXT, so no enum change needed)
-- Status values after this migration:
-- pending: waiting for SOL (embedded) or signed tx (external)
-- detected: SOL received, processing
-- processing: Privacy Cash tx in flight / claimed for withdrawal
-- completed: credits issued, waiting for privacy period to elapse
-- partially_withdrawn: some funds withdrawn, awaiting next withdrawal cycle
-- withdrawn: fully withdrawn to company wallet
-- expired: TTL elapsed without completion
-- failed: error occurred

-- 2. Update index to include partially_withdrawn status for withdrawal pickup
DROP INDEX IF EXISTS idx_deposit_sessions_withdrawal_ready;
CREATE INDEX idx_deposit_sessions_withdrawal_ready
    ON deposit_sessions(status, withdrawal_available_at)
    WHERE status IN ('completed', 'partially_withdrawn')
      AND stored_share_b IS NOT NULL;

-- 3. Create withdrawal history table for full audit trail
CREATE TABLE withdrawal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deposit_session_id UUID NOT NULL REFERENCES deposit_sessions(id),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Withdrawal details
    amount_lamports BIGINT NOT NULL,
    tx_signature TEXT NOT NULL,

    -- Running totals at time of withdrawal
    cumulative_withdrawn_lamports BIGINT NOT NULL,
    remaining_lamports BIGINT NOT NULL,

    -- Whether this was the final withdrawal
    is_final BOOLEAN NOT NULL DEFAULT FALSE,

    -- For debugging/analytics
    withdrawal_percentage SMALLINT,  -- 30-70 for partial, 100 for full

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_withdrawal_history_deposit ON withdrawal_history(deposit_session_id);
CREATE INDEX idx_withdrawal_history_user ON withdrawal_history(user_id);
CREATE INDEX idx_withdrawal_history_created ON withdrawal_history(created_at);
CREATE INDEX idx_withdrawal_history_tx ON withdrawal_history(tx_signature);

COMMENT ON TABLE withdrawal_history IS
    'Audit trail for all withdrawal transactions, including partial withdrawals';
COMMENT ON COLUMN withdrawal_history.cumulative_withdrawn_lamports IS
    'Total amount withdrawn from this deposit including this withdrawal';
COMMENT ON COLUMN withdrawal_history.remaining_lamports IS
    'Amount remaining in deposit after this withdrawal (0 if is_final=true)';
