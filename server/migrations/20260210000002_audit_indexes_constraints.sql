-- DB-06: Missing FK on audit_logs.session_id
-- DB-07: Missing size limit on auth_methods array

-- DB-06: FK from audit_logs.session_id to sessions
-- Use IF NOT EXISTS pattern via DO block for idempotency
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_audit_logs_session_id'
    AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE audit_logs
    ADD CONSTRAINT fk_audit_logs_session_id
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- DB-07: Limit auth_methods array to 10 entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chk_auth_methods_max_length'
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT chk_auth_methods_max_length
    CHECK (array_length(auth_methods, 1) IS NULL OR array_length(auth_methods, 1) <= 10);
  END IF;
END $$;
