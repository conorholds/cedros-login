-- R-H01: Add case-insensitive email index for efficient lookups
-- This index enables efficient case-insensitive email queries

-- Drop the existing case-sensitive index
DROP INDEX IF EXISTS idx_users_email;

-- Create a case-insensitive index using LOWER()
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

-- Add a unique constraint on LOWER(email) to enforce case-insensitive uniqueness
-- This complements the column-level UNIQUE which is case-sensitive
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique_lower ON users(LOWER(email));

-- D-05: Add case-insensitive unique constraint on invites(org_id, email)
-- Prevents inviting same email with different casing to same org
-- Drop the old case-sensitive constraint and replace with case-insensitive index
--
-- DB-07: WARNING - If database had duplicate invites differing only in email case
-- (e.g., "Joe@example.com" and "joe@example.com" for same org), the new unique
-- index creation below would fail. Before running this migration on production data,
-- verify no case-colliding duplicates exist:
--   SELECT org_id, LOWER(email), COUNT(*)
--   FROM invites GROUP BY org_id, LOWER(email) HAVING COUNT(*) > 1;
ALTER TABLE invites DROP CONSTRAINT IF EXISTS invites_org_email_unique;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_org_email_lower ON invites(org_id, LOWER(email));
