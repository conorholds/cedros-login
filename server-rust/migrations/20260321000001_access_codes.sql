-- Signup volume control + access codes
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT access_codes_type_check CHECK (
    code_type IN ('global', 'limited', 'user_invite')
  )
);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes (code);
CREATE INDEX IF NOT EXISTS idx_access_codes_created_by ON access_codes (created_by);
CREATE INDEX IF NOT EXISTS idx_access_codes_type ON access_codes (code_type);

-- Signup gating settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('signup_limit_enabled', 'false', 'signup', 'Enable signup volume limiting', false),
  ('signup_limit_period', 'daily', 'signup', 'Volume limit period: daily, weekly, monthly', false),
  ('signup_limit_max', '100', 'signup', 'Maximum new signups per period', false),
  ('signup_access_code_enabled', 'false', 'signup', 'Require an access code to sign up', false),
  ('signup_access_code', '', 'signup', 'Global access code (all signup methods)', true),
  ('signup_user_codes_enabled', 'false', 'signup', 'Allow users to generate invite codes', false),
  ('signup_user_codes_per_period', '5', 'signup', 'Max invite codes each user can generate per period', false),
  ('signup_user_codes_period', 'monthly', 'signup', 'Period for user invite code budget: daily, weekly, monthly', false)
ON CONFLICT (key) DO NOTHING;
