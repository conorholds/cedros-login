-- B-09: Add composite indexes for common audit log query patterns
-- These indexes support multi-column filters with ORDER BY created_at DESC

-- Index for: org_id + actor_user_id queries (covers patterns 1, 2)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_actor
    ON audit_logs(org_id, actor_user_id, created_at DESC);

-- Index for: org_id + event_type queries (covers pattern 3)
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_type
    ON audit_logs(org_id, event_type, created_at DESC);

-- Index for: actor_user_id + event_type queries (covers pattern 4)
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_type
    ON audit_logs(actor_user_id, event_type, created_at DESC);
