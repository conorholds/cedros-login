-- F-35: Ensure verification_tokens indexes exist
--
-- The verification_tokens table was defined in 20241212000001 but the
-- idx_verify_type and idx_verify_expires indexes were only created in
-- 20241212000002. Installs that only ran 000001 may be missing them.

CREATE INDEX IF NOT EXISTS idx_verify_type
  ON verification_tokens(token_type);

CREATE INDEX IF NOT EXISTS idx_verify_expires
  ON verification_tokens(expires_at);
