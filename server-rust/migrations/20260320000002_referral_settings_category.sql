-- Assign the 'referral' category to referral settings that were created
-- before the category column was required.
UPDATE system_settings SET category = 'referral' WHERE key IN (
  'feature_referrals_enabled',
  'referral_reward_lamports',
  'referral_reward_type',
  'referral_reward_trigger',
  'referral_reward_max_per_referrer'
) AND (category IS NULL OR category = '');
