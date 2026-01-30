-- Add explicit rejection metadata for credit refund requests

ALTER TABLE credit_refund_requests
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

-- Optional index for admin review
CREATE INDEX IF NOT EXISTS idx_credit_refund_requests_rejected_at
    ON credit_refund_requests(rejected_at DESC)
    WHERE rejected_at IS NOT NULL;
