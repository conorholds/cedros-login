-- F-32: Add index on sso_auth_states.provider_id FK column
--
-- The FK references sso_providers(id) but has no index.
-- Joins and filters on provider_id do sequential scan.

CREATE INDEX IF NOT EXISTS idx_sso_auth_states_provider
  ON sso_auth_states(provider_id);
