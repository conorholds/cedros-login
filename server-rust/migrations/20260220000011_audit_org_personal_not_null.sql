-- F-40: Add NOT NULL to organizations.is_personal
--
-- Other boolean columns consistently use NOT NULL DEFAULT FALSE.
-- This column was added without NOT NULL, creating inconsistency.

UPDATE organizations SET is_personal = FALSE WHERE is_personal IS NULL;

ALTER TABLE organizations ALTER COLUMN is_personal SET NOT NULL;
