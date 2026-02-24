-- Seed wallet_recovery_mode setting so the Embedded Wallet admin page
-- renders its settings grid instead of "No additional settings available."

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('wallet_recovery_mode', 'share_c_only', 'features', 'How users can recover their wallet if they lose access', FALSE)
ON CONFLICT (key) DO NOTHING;
