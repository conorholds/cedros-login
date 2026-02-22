-- Backfill memberships for existing users who have no memberships.
-- Assigns them to the default org (from system_settings) as 'member'.
-- This fixes the admin Team page showing "No organizations found" for
-- users who existed before org-based membership was required.

INSERT INTO memberships (user_id, org_id, role)
SELECT u.id, s.value::uuid, 'member'
FROM users u
CROSS JOIN system_settings s
WHERE s.key = 'default_org_id'
  AND NOT EXISTS (
    SELECT 1 FROM memberships m WHERE m.user_id = u.id
  );
