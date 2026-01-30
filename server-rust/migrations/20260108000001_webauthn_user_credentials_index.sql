-- DB-02: Add composite index for listing user WebAuthn credentials
--
-- Optimizes queries that list all credentials for a user ordered by creation time.
-- This is used in the credential management UI to show credentials newest-first.
--
-- The existing idx_webauthn_credentials_user_id index only covers user_id,
-- so ordered queries require a separate sort operation.

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webauthn_credentials_user_all
    ON webauthn_credentials(user_id, created_at DESC);

COMMENT ON INDEX idx_webauthn_credentials_user_all IS 'DB-02: Composite index for listing credentials by user ordered by creation time';
