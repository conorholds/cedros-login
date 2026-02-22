-- Backfill memberships for users not yet in the default org.
-- Previous migration only covered users with zero memberships;
-- this also catches users who have other memberships (e.g. personal org)
-- but are missing the default org membership.

INSERT INTO memberships (user_id, org_id, role)
SELECT u.id, s.value::uuid, 'member'
FROM users u
CROSS JOIN system_settings s
WHERE s.key = 'default_org_id'
  AND NOT EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.user_id = u.id AND m.org_id = s.value::uuid
  );
