-- S-23: Add session_id column to audit_logs for forensic correlation
-- This enables tracing all actions performed during a specific session

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT NULL;

-- Index for session-based queries (e.g., "show all actions from this session")
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs (session_id)
WHERE session_id IS NOT NULL;
