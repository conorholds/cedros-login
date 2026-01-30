-- P-09: Composite index for brute-force protection query
-- Query pattern: SELECT COUNT(*) WHERE email = $1 AND successful = FALSE AND attempted_at > $2
-- This partial index optimizes the lockout check by covering all predicate columns

CREATE INDEX IF NOT EXISTS idx_login_attempts_lockout
    ON login_attempts(lower(email), attempted_at DESC)
    WHERE successful = FALSE;
