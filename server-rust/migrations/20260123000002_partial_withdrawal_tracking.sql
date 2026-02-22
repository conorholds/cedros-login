-- Add partial withdrawal tracking to deposit_sessions
-- Supports withdrawing random amounts over multiple cycles to prevent timing analysis

-- Amount already withdrawn from this deposit (cumulative)
-- When withdrawn_amount_lamports >= deposit_amount_lamports, the session is fully withdrawn
ALTER TABLE deposit_sessions ADD COLUMN IF NOT EXISTS withdrawn_amount_lamports BIGINT NOT NULL DEFAULT 0;

-- Update the withdrawal ready index to include partially withdrawn sessions
-- A session is ready for withdrawal if:
-- 1. status = 'completed' (deposit confirmed)
-- 2. stored_share_b IS NOT NULL (has encrypted key)
-- 3. withdrawal_available_at <= NOW() (privacy period elapsed)
-- 4. withdrawn_amount_lamports < deposit_amount_lamports (not fully withdrawn)
DROP INDEX IF EXISTS idx_deposit_sessions_withdrawal_ready;
CREATE INDEX IF NOT EXISTS idx_deposit_sessions_withdrawal_ready
    ON deposit_sessions(status, withdrawal_available_at)
    WHERE status = 'completed'
      AND stored_share_b IS NOT NULL;

-- Add comment explaining partial withdrawal support
COMMENT ON COLUMN deposit_sessions.withdrawn_amount_lamports IS
    'Cumulative amount withdrawn from Privacy Cash (supports partial withdrawals over multiple cycles)';
