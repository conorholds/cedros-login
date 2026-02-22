-- M-15: Resolve duplicate index name conflict
--
-- Both 20260121000002_credit_holds and 20260123000001_spl_deposit_tracking define
-- idx_credit_transactions_idempotency with different column sets:
--   1) (user_id, idempotency_key) — per-user uniqueness (correct)
--   2) (idempotency_key) — global uniqueness (too restrictive)
--
-- Due to IF NOT EXISTS, only the first definition (per-user) actually gets created.
-- This migration ensures the canonical definition regardless of prior state.

DROP INDEX IF EXISTS idx_credit_transactions_idempotency;
CREATE UNIQUE INDEX idx_credit_transactions_idempotency
    ON credit_transactions(user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
