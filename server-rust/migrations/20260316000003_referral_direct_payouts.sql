-- Add payout wallet address to users
ALTER TABLE users ADD COLUMN payout_wallet_address VARCHAR(44);

-- Referral payouts tracking table
CREATE TABLE referral_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    trigger_type VARCHAR(20) NOT NULL,  -- 'signup', 'first_spend', 'spend'
    amount BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'failed'
    tx_signature VARCHAR(128),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_referral_payouts_referrer ON referral_payouts(referrer_id);
CREATE INDEX idx_referral_payouts_status ON referral_payouts(status) WHERE status = 'pending';

-- Add reward type setting
INSERT INTO system_settings (key, value)
VALUES ('referral_reward_type', 'credits')
ON CONFLICT (key) DO NOTHING;

-- Remove the now-unused currency setting
DELETE FROM system_settings WHERE key = 'referral_reward_currency';
