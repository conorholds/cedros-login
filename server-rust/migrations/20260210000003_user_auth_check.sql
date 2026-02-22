-- DB-03: Ensure user has at least one authentication identifier
-- Prevents impossible state where user can't log in via any method

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_user_has_auth_identifier'
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT chk_user_has_auth_identifier
    CHECK (
      email IS NOT NULL
      OR wallet_address IS NOT NULL
      OR google_id IS NOT NULL
      OR apple_id IS NOT NULL
    );
  END IF;
END $$;
