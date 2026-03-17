-- Referral reward settings: amount, currency, and trigger mode

INSERT INTO system_settings (key, value, category)
VALUES
    ('referral_reward_lamports', '0', 'referral'),
    ('referral_reward_currency', 'SOL', 'referral'),
    ('referral_reward_trigger', 'on_signup', 'referral')
ON CONFLICT (key) DO NOTHING;
