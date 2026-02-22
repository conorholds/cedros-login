-- User-initiated withdrawal log (distinct from withdrawal_history which tracks
-- privacy-cash partial withdrawals from deposit sessions).
CREATE TABLE IF NOT EXISTS user_withdrawal_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token_type TEXT NOT NULL,        -- 'sol' or 'spl'
    token_mint TEXT,                 -- NULL for SOL, mint address for SPL
    amount TEXT NOT NULL,            -- Raw amount string (lamports for SOL, smallest unit for SPL)
    destination TEXT NOT NULL,       -- Destination address
    tx_signature TEXT NOT NULL,      -- On-chain transaction signature
    fee_lamports BIGINT NOT NULL,   -- Transaction fee
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_withdrawal_log_user ON user_withdrawal_log(user_id, created_at DESC);
CREATE INDEX idx_user_withdrawal_log_created ON user_withdrawal_log(created_at DESC);
