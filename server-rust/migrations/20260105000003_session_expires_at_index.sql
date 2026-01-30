-- R-07: Update active session index to include expires_at
--
-- The find_active_by_user_id query uses:
--   WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
--   ORDER BY created_at DESC
--
-- Current idx_sessions_active only covers (user_id, created_at DESC) WHERE revoked_at IS NULL.
-- Adding expires_at allows the query planner to use the index for the expires_at filter.
--
-- NOTE: We cannot use `expires_at > NOW()` in the partial index WHERE clause because
-- NOW() is evaluated once at index creation time, not at query time. Instead, we
-- include expires_at in the index columns so it can be used for range scans.

-- Drop the old index
DROP INDEX IF EXISTS idx_sessions_active;

-- Create improved composite index for active session queries
-- Column order: user_id (equality), expires_at (range), created_at (sort)
CREATE INDEX idx_sessions_active ON sessions(user_id, expires_at DESC, created_at DESC)
    WHERE revoked_at IS NULL;
