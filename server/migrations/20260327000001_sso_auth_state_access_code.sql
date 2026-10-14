-- Add access code column to sso_auth_states so signup gating can be enforced
-- after the OIDC redirect completes and before a new SSO user is created.

ALTER TABLE sso_auth_states
ADD COLUMN IF NOT EXISTS access_code TEXT NULL;
