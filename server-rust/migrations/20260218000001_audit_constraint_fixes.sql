-- Audit remediation: constraint fixes (findings M-05, M-10, M-14, M-06)
--
-- M-05: credit_refund_requests.user_id ON DELETE CASCADE silently deletes
--       pending refunds on user deletion. Change to RESTRICT for financial safety.
-- M-10: withdrawal_history.tx_signature lacks UNIQUE — Solana signatures are
--       globally unique and duplicates would inflate withdrawal totals.
-- M-14: abac_policies.effect has no CHECK — invalid values cause evaluation errors.
-- M-06: deposit_sessions.status has no CHECK — typos persist silently.

-- M-05: Prevent cascading deletes of financial records
ALTER TABLE credit_refund_requests
  DROP CONSTRAINT IF EXISTS credit_refund_requests_user_id_fkey,
  ADD CONSTRAINT credit_refund_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- M-10: Prevent duplicate withdrawal records
CREATE UNIQUE INDEX IF NOT EXISTS idx_withdrawal_history_tx_signature_unique
  ON withdrawal_history(tx_signature) WHERE tx_signature IS NOT NULL;

-- M-14: Constrain ABAC policy effects to valid values
ALTER TABLE abac_policies
  ADD CONSTRAINT abac_policies_effect_check CHECK (effect IN ('allow', 'deny'));

-- M-06: Constrain deposit session status to known values
ALTER TABLE deposit_sessions
  ADD CONSTRAINT deposit_sessions_status_check
  CHECK (status IN (
    'pending', 'detected', 'processing', 'completed',
    'partially_withdrawn', 'withdrawn', 'expired', 'failed',
    'pending_batch', 'batched'
  ));
