-- PERF-002: Add composite indexes for membership queries
-- These indexes optimize the common query patterns:
-- - find_by_user: WHERE user_id = ? ORDER BY joined_at DESC
-- - find_by_org: WHERE org_id = ? ORDER BY joined_at ASC

-- Index for user-based queries (joined_at DESC for most recent first)
CREATE INDEX IF NOT EXISTS idx_memberships_user_joined
ON memberships(user_id, joined_at DESC);

-- Index for org-based queries (joined_at ASC for oldest first)
CREATE INDEX IF NOT EXISTS idx_memberships_org_joined
ON memberships(org_id, joined_at ASC);
