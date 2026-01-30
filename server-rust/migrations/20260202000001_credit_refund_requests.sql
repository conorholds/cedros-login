-- Credits refund requests
--
-- Purpose:
-- - Persist user refund requests for admin review
-- - Allow admins to process refunds as idempotent ledger adjustments
--
-- Notes:
-- - `amount_lamports` is the smallest unit for the currency (lamports for SOL, micros for USD)
-- - `original_transaction_id` points at the original credit transaction being refunded

CREATE TABLE IF NOT EXISTS credit_refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Original credit transaction being refunded
    original_transaction_id UUID NOT NULL REFERENCES credit_transactions(id) ON DELETE RESTRICT,

    -- Amount requested in smallest unit (lamports for SOL, micros for USD)
    amount_lamports BIGINT NOT NULL,
    currency TEXT NOT NULL,

    -- User-provided reason
    reason TEXT NOT NULL,

    -- Lifecycle
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Processing metadata
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_amount_lamports BIGINT,
    processed_transaction_id UUID REFERENCES credit_transactions(id) ON DELETE SET NULL,
    processed_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_credit_refund_requests_status_created
    ON credit_refund_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_refund_requests_user
    ON credit_refund_requests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_refund_requests_original_tx
    ON credit_refund_requests(original_transaction_id);
