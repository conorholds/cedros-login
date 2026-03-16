-- Add referral code column to sso_auth_states so the referral code
-- survives the OIDC redirect round-trip and can be applied when the
-- callback creates a new user.

ALTER TABLE sso_auth_states
ADD COLUMN IF NOT EXISTS referral TEXT NULL;
