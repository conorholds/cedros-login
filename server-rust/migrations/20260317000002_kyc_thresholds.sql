-- KYC Threshold-Based Triggers
--
-- Adds amount-based thresholds that trigger KYC enforcement independently
-- of the global enforcement mode. A threshold of 0 means disabled.

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('kyc_cumulative_deposit_usd', '0', 'kyc', 'Trigger KYC when total deposits exceed this USD amount (0 = disabled)', false),
  ('kyc_single_deposit_usd', '0', 'kyc', 'Trigger KYC when a single deposit exceeds this USD amount (0 = disabled)', false),
  ('kyc_single_purchase_usd', '0', 'kyc', 'Trigger KYC when a single purchase exceeds this USD amount (0 = disabled)', false)
ON CONFLICT (key) DO NOTHING;
