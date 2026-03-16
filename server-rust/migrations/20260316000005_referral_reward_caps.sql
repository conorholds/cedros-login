-- Referral reward cap setting (0 = unlimited)
INSERT INTO system_settings (key, value)
VALUES ('referral_reward_max_per_referrer', '0')
ON CONFLICT (key) DO NOTHING;
