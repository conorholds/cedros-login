-- F-41: Add composite index on credit_transactions(user_id, created_at DESC)
--
-- The most common query pattern is "get user's transaction history ordered
-- by date". Without a composite index, PostgreSQL must fetch by user_id
-- then sort by created_at, which is wasteful for large histories.

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
  ON credit_transactions(user_id, created_at DESC);
