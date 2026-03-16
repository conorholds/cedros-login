-- Add spend_transaction_id to referral_payouts for on_every_spend dedup
ALTER TABLE referral_payouts ADD COLUMN spend_transaction_id UUID;

-- Index for fast dedup lookups
CREATE INDEX idx_referral_payouts_spend_tx ON referral_payouts(referrer_id, spend_transaction_id)
WHERE spend_transaction_id IS NOT NULL;
