-- Referral reward cap setting (0 = unlimited)
INSERT INTO system_settings (key, value, category)
VALUES ('referral_reward_max_per_referrer', '0', 'referral')
ON CONFLICT (key) DO NOTHING;
