-- Pre-migration rows do not record rotation ancestry. Revoke them rather than
-- guessing which active session belongs to an old logout/refresh credential.
ALTER TABLE sessions ADD COLUMN family_id UUID;
UPDATE sessions SET family_id = id,
    revoked_at = COALESCE(revoked_at, NOW()),
    revoked_reason = 'session_family_migration';
-- No default: old writers cannot silently create untracked rotation families.
ALTER TABLE sessions ALTER COLUMN family_id SET NOT NULL;
CREATE INDEX idx_sessions_family_id ON sessions (family_id);
