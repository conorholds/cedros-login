-- Login-owned account referral attribution.
--
-- Reward accounting belongs to downstream extensions. The login
-- service only owns the account-level code and referred-by relationship.

ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;

UPDATE users
SET referral_code = UPPER(SUBSTRING(MD5(id::text), 1, 10))
WHERE referral_code IS NULL OR referral_code = '';

ALTER TABLE users ALTER COLUMN referral_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code
    ON users(referral_code);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_referred_by
    ON users(referred_by);
