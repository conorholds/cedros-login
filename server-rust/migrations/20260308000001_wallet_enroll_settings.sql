-- Auto wallet enrollment settings

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('postlogin_wallet_enroll_enabled', 'false', 'postlogin.wallet', 'Prompt new users to enroll an embedded wallet after signup', FALSE),
  ('wallet_enroll_solana_users', 'false', 'features', 'Also enroll Solana wallet users in embedded wallet (default: skip)', FALSE)
ON CONFLICT (key) DO NOTHING;
