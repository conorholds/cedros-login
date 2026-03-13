-- R2-C01: Add missing 'pending_retry' to deposit_sessions status CHECK constraint.
--
-- The original CHECK (20260218000001) omitted 'pending_retry' which is used by
-- the withdrawal worker retry path. Without it, any write of 'pending_retry'
-- fails with a constraint violation, silently breaking the retry flow.

ALTER TABLE deposit_sessions DROP CONSTRAINT IF EXISTS deposit_sessions_status_check;

ALTER TABLE deposit_sessions
  ADD CONSTRAINT deposit_sessions_status_check
  CHECK (status IN (
    'pending', 'detected', 'processing', 'completed',
    'partially_withdrawn', 'withdrawn', 'expired', 'failed',
    'pending_retry', 'pending_batch', 'batched'
  ));
