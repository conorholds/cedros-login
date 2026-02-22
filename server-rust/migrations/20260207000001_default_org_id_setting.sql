-- Backfill default_org_id for existing installs that have a non-personal org.
-- New installs set this during setup; this migration covers upgrades.

INSERT INTO system_settings (key, value, category, description, is_secret)
SELECT
    'default_org_id',
    o.id::text,
    'org',
    'Default organization that new users are added to',
    FALSE
FROM organizations o
WHERE o.is_personal = FALSE
ORDER BY o.created_at ASC
LIMIT 1
ON CONFLICT (key) DO NOTHING;
