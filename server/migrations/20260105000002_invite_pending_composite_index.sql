-- R-06: Add composite index for pending invite queries
--
-- The find_pending_by_org query uses:
--   WHERE org_id = $1 AND accepted_at IS NULL AND expires_at > NOW()
--   ORDER BY created_at DESC
--
-- Current idx_invites_org_pending only covers (org_id) WHERE accepted_at IS NULL.
-- This composite index includes expires_at to support the full WHERE clause.

-- Drop the old index that only covers org_id
DROP INDEX IF EXISTS idx_invites_org_pending;

-- Create composite index for pending invite queries by org
-- Includes expires_at for the filter and created_at for the ORDER BY
CREATE INDEX idx_invites_pending_by_org ON invites(org_id, expires_at DESC, created_at DESC)
    WHERE accepted_at IS NULL;

-- The find_pending_by_email query uses:
--   WHERE LOWER(email) = LOWER($1) AND accepted_at IS NULL AND expires_at > NOW()
--   ORDER BY created_at DESC
--
-- Current idx_invites_email is on (email) not LOWER(email).
-- Create a new index on LOWER(email) for case-insensitive lookups.

-- Drop the old case-sensitive email index
DROP INDEX IF EXISTS idx_invites_email;

-- Create composite index for pending invite queries by email (case-insensitive)
CREATE INDEX idx_invites_pending_by_email ON invites(LOWER(email), expires_at DESC, created_at DESC)
    WHERE accepted_at IS NULL;
