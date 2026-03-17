-- Referral system: per-user referral codes + referrer tracking

-- Add referral columns (nullable initially for backfill)
ALTER TABLE users ADD COLUMN referral_code VARCHAR(8) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Backfill existing users with unique 8-char hex codes
UPDATE users SET referral_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT || id::TEXT), 1, 8))
WHERE referral_code IS NULL;

-- Now enforce NOT NULL on referral_code
ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL;

-- Index on referred_by for counting referrals
CREATE INDEX idx_users_referred_by ON users(referred_by) WHERE referred_by IS NOT NULL;

-- Seed feature flag (disabled by default)
INSERT INTO system_settings (key, value, category)
VALUES ('feature_referrals_enabled', 'false', 'referral')
ON CONFLICT (key) DO NOTHING;
