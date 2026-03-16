-- Referral reward settings: amount, currency, and trigger mode

INSERT INTO system_settings (key, value)
VALUES
    ('referral_reward_lamports', '0'),
    ('referral_reward_currency', 'SOL'),
    ('referral_reward_trigger', 'on_signup')
ON CONFLICT (key) DO NOTHING;
