-- P-04: Drop redundant single-column index on session_id
-- The composite index idx_audit_logs_session_created (session_id, created_at DESC)
-- already covers session_id lookups, making this index unnecessary.
-- This reduces write overhead for audit log inserts.
-- Note: Index already dropped manually due to CONCURRENTLY limitation in migrations.

-- No-op: Index was dropped manually with DROP INDEX CONCURRENTLY
SELECT 1;
