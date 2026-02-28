-- Seed settings keys referenced by the admin UI but missing from the database.
-- Without these rows, the frontend never receives the keys and the corresponding
-- inputs/toggles/dropdowns are invisible (same bug as email_provider).

-- Webhook notification toggles (category: webhook)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('webhook_notify_registrations', 'true', 'webhook', 'Notify when a new user registers', FALSE),
    ('webhook_notify_signins', 'true', 'webhook', 'Notify when a user signs in', FALSE),
    ('webhook_notify_deposits', 'true', 'webhook', 'Notify when a user makes a deposit', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Feature toggle (category: features)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('feature_credits', 'false', 'features', 'Enable the deposits and credits system', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Deposit general settings (category: deposit.general)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('solana_network', 'mainnet-beta', 'deposit.general', 'Solana network for deposits and withdrawals (mainnet-beta or devnet)', FALSE),
    ('deposit_company_token', 'USDC', 'deposit.general', 'Platform token for credit deposits (USDC, USDT, SOL, EURC)', FALSE),
    ('deposit_max_usd', '0', 'deposit.general', 'Maximum deposit per transaction in USD (0 = unlimited)', FALSE),
    ('deposit_min_usd', '1', 'deposit.general', 'Minimum deposit amount in USD equivalent', FALSE),
    ('deposit_micro_enabled', 'true', 'deposit.general', 'Allow small SOL deposits batched for efficiency', FALSE),
    ('deposit_gasless_swap_enabled', 'true', 'deposit.general', 'Allow deposits via Jupiter gasless swaps', FALSE),
    ('deposit_privacy_enabled', 'false', 'deposit.general', 'Hold deposits for a privacy period before withdrawal', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Deposit component settings (category: deposit)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('deposit_show_explainer', 'true', 'deposit', 'Show introductory explainer screen in deposit flow', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Treasury wallet address (category: withdrawal)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('treasury_wallet_address', '', 'withdrawal', 'Solana wallet address for privacy cash withdrawals and micro payment batches', FALSE)
ON CONFLICT (key) DO NOTHING;
