-- F-21: Fix users.is_system_admin nullable column
--
-- The column was added as nullable BOOLEAN DEFAULT FALSE in migration
-- 20241214000001. A later migration (20260106000001) attempted to add it
-- as NOT NULL, but IF NOT EXISTS made it a no-op since the column existed.
-- Result: column is nullable, and NULL != FALSE in boolean logic.
--
-- Fix: Backfill any NULLs to FALSE, then enforce NOT NULL.

UPDATE users SET is_system_admin = FALSE WHERE is_system_admin IS NULL;

ALTER TABLE users ALTER COLUMN is_system_admin SET NOT NULL;
