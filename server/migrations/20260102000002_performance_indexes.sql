-- Performance indexes for common query patterns

-- D-01: Index for audit logs by target (resource-level audit trails)
CREATE INDEX IF NOT EXISTS idx_audit_logs_target
    ON audit_logs(target_type, target_id, created_at DESC);

-- D-06: Partial index for active sessions (non-revoked)
CREATE INDEX IF NOT EXISTS idx_sessions_active
    ON sessions(user_id, created_at DESC)
    WHERE revoked_at IS NULL;

-- D-07: Index for login attempts by IP address (rate limiting)
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip
    ON login_attempts(ip_address, attempted_at DESC)
    WHERE ip_address IS NOT NULL;

-- D-09: Index for outbox events by status and type (monitoring queries)
CREATE INDEX IF NOT EXISTS idx_outbox_events_pending
    ON outbox_events(event_type, created_at)
    WHERE status = 'pending';

-- D-08: Index for TOTP recovery code validation (user_id + code_hash lookup)
CREATE INDEX IF NOT EXISTS idx_totp_recovery_codes_lookup
    ON totp_recovery_codes(user_id, code_hash)
    WHERE used = FALSE;
