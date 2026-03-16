-- Track historical referral codes so old codes still resolve to the right user.
-- When a user regenerates or changes their referral code the old code is inserted here.
-- This lets referrals made with a stale link still be credited to the correct user.

CREATE TABLE referral_code_history (
    code VARCHAR(16) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referral_code_history_user ON referral_code_history(user_id);
