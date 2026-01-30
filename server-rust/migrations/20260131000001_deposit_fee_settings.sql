-- Deposit fee settings for configurable fee handling
--
-- Allows admin to configure who pays deposit fees (company vs user).
-- Fee deductions are applied at credit time.

INSERT INTO system_settings (key, value, category, description) VALUES
    ('deposit_fee_policy', 'company_pays_all', 'deposit',
     'Who pays deposit fees: company_pays_all, user_pays_swap, user_pays_privacy, user_pays_all'),
    ('privacy_fee_fixed_lamports', '6000000', 'deposit',
     'Privacy Cash fixed fee in lamports (0.006 SOL)'),
    ('privacy_fee_percent_bps', '35', 'deposit',
     'Privacy Cash percentage fee in basis points (0.35%)'),
    ('swap_fee_fixed_lamports', '1000000', 'deposit',
     'Jupiter swap fixed fee in lamports (~0.001 SOL)'),
    ('swap_fee_percent_bps', '10', 'deposit',
     'Jupiter swap percentage fee in basis points (0.1%)'),
    ('company_fee_fixed_lamports', '0', 'deposit',
     'Company processing fixed fee in lamports (default: 0)'),
    ('company_fee_percent_bps', '0', 'deposit',
     'Company processing percentage fee in basis points (default: 0%)')
ON CONFLICT (key) DO NOTHING;
