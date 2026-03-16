-- Seed payout worker settings for automated referral payout processing
INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES
    ('payout_auto_enabled', 'false', 'referral', 'Enable automated referral payout processing', false),
    ('payout_poll_interval_secs', '3600', 'referral', 'How often the payout worker polls for pending payouts (seconds)', false),
    ('payout_batch_size', '50', 'referral', 'Maximum number of payouts to process per worker cycle', false)
ON CONFLICT (key) DO NOTHING;
