-- L-11: Remove redundant WHERE clause from withdrawal_history unique index.
-- tx_signature is NOT NULL, so the partial index filter is unnecessary.
DROP INDEX IF EXISTS idx_withdrawal_history_tx_signature_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_withdrawal_history_tx_signature_unique
  ON withdrawal_history(tx_signature);

-- L-12: Add ON DELETE SET NULL to deposit_webhook_events FK.
-- Webhook events can exist before a session (wallet_address lookup),
-- so SET NULL is preferred over CASCADE.
ALTER TABLE deposit_webhook_events
  DROP CONSTRAINT IF EXISTS deposit_webhook_events_deposit_session_id_fkey,
  ADD CONSTRAINT deposit_webhook_events_deposit_session_id_fkey
    FOREIGN KEY (deposit_session_id)
    REFERENCES deposit_sessions(id)
    ON DELETE SET NULL;
