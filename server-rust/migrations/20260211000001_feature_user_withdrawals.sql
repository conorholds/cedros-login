-- Feature flag for user withdrawals (disabled by default)
-- Allows users to withdraw SOL/SPL tokens from their embedded wallet to external addresses.
INSERT INTO system_settings (key, value, category, description)
VALUES (
    'feature_user_withdrawals',
    'false',
    'features',
    'Allow users to withdraw SOL/SPL tokens from embedded wallet to external addresses'
)
ON CONFLICT (key) DO NOTHING;
