-- F-29: Add UNIQUE index on user_withdrawal_log.tx_signature
--
-- Solana transaction signatures are globally unique. Without a UNIQUE
-- constraint, application bugs could insert duplicate withdrawal records.
-- (withdrawal_history.tx_signature was already fixed in 20260218000001.)

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_withdrawal_log_tx_unique
  ON user_withdrawal_log(tx_signature);
