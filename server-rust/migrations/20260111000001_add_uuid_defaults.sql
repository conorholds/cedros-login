-- DB-03, DB-04, DB-05: Add UUID default values for tables missing them
--
-- These tables were created without DEFAULT gen_random_uuid() on their primary keys.
-- While the application always provides IDs, having the default ensures robustness
-- and matches the pattern used by other tables.
--
-- Safe to run: ALTER COLUMN SET DEFAULT doesn't lock the table for writes.

-- DB-03: user_credentials.id
ALTER TABLE user_credentials
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- DB-04: webauthn_credentials.id
ALTER TABLE webauthn_credentials
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- DB-05: webauthn_challenges.challenge_id
ALTER TABLE webauthn_challenges
ALTER COLUMN challenge_id SET DEFAULT gen_random_uuid();
