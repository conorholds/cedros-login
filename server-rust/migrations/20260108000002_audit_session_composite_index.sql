-- DB-03: Add composite index for session audit queries ordered by time
--
-- The existing idx_audit_logs_session_id only covers session_id.
-- This composite index optimizes queries like:
-- "SELECT * FROM audit_logs WHERE session_id = ? ORDER BY created_at DESC"
-- which is common for showing session activity timeline.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_session_time
    ON audit_logs(session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

COMMENT ON INDEX idx_audit_logs_session_time IS 'DB-03: Composite index for session audit timeline queries';
