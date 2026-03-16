-- KYC Identity Verification (Stripe Identity)
--
-- Adds KYC status tracking to users and a KYC sessions audit trail table.
-- Settings are seeded into system_settings for admin configuration.

-- Add KYC columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users (kyc_status);

-- KYC sessions table (audit trail of verification attempts)
CREATE TABLE IF NOT EXISTS kyc_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_session_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  redirect_url TEXT,
  error_code TEXT,
  error_reason TEXT,
  provider_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT kyc_sessions_status_check CHECK (status IN ('pending', 'verified', 'failed', 'canceled'))
);
CREATE INDEX IF NOT EXISTS idx_kyc_sessions_user_id ON kyc_sessions (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_kyc_sessions_provider_session ON kyc_sessions (provider, provider_session_id);

-- Seed KYC settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('kyc_enabled', 'false', 'kyc', 'Enable KYC identity verification', false),
  ('kyc_provider', 'stripe', 'kyc', 'KYC provider (stripe)', false),
  ('kyc_api_secret_key', '', 'kyc', 'Stripe secret key for Identity API', true),
  ('kyc_webhook_secret', '', 'kyc', 'Stripe webhook endpoint secret (whsec_...)', true),
  ('kyc_enforcement_mode', 'none', 'kyc', 'When to enforce KYC: none, withdrawals, deposits, all, optional', false),
  ('kyc_expiry_days', '0', 'kyc', 'Days until verification expires (0 = never)', false),
  ('kyc_redirect_url', '', 'kyc', 'URL to redirect users to after verification', false),
  ('kyc_document_types', 'driving_license,id_card,passport', 'kyc', 'Accepted document types', false),
  ('kyc_require_selfie', 'true', 'kyc', 'Require selfie match against document photo', false)
ON CONFLICT (key) DO NOTHING;
