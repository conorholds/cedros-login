-- Prevent duplicate referral payouts at the database level.
-- These partial unique indexes enforce dedup for:
--   1. One-time rewards (signup, first_spend): one per (referrer, referred_user, trigger_type)
--   2. Per-spend rewards: one per (referrer, spend_transaction_id)

-- Signup + first_spend: at most one payout per referrer+referred+trigger combination
CREATE UNIQUE INDEX IF NOT EXISTS uk_referral_payout_pair_trigger
    ON referral_payouts (referrer_id, referred_user_id, trigger_type)
    WHERE trigger_type IN ('signup', 'first_spend');

-- Every-spend: at most one payout per referrer+spend_transaction
CREATE UNIQUE INDEX IF NOT EXISTS uk_referral_payout_spend_tx
    ON referral_payouts (referrer_id, spend_transaction_id)
    WHERE spend_transaction_id IS NOT NULL;

-- Add status check constraint to include 'cancelled' as a valid status
-- (existing migration only listed pending/processing/completed/failed)
ALTER TABLE referral_payouts
    DROP CONSTRAINT IF EXISTS referral_payouts_status_check;
ALTER TABLE referral_payouts
    ADD CONSTRAINT referral_payouts_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));
