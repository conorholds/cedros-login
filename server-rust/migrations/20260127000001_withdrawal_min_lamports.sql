-- Add minimum withdrawal amount setting to prevent processing tiny withdrawals
-- that would waste transaction fees relative to the withdrawal amount.
--
-- Default: 1,000,000,000 lamports (1 SOL)
--
-- Fee breakdown for Privacy Cash withdrawals:
--   - Base fee: ~0.006 SOL
--   - Percentage fee: 0.35% of withdrawal amount
--   - Jupiter swap fees: ~0.001 SOL
--
-- At 1 SOL minimum: total fees ~0.0105 SOL (~1% of withdrawal)
-- At 0.1 SOL: total fees ~0.0074 SOL (~7% of withdrawal)
-- At 0.01 SOL: total fees ~0.007 SOL (~70% of withdrawal) - wasteful!

INSERT INTO system_settings (key, value, category, description) VALUES
    ('withdrawal_min_lamports', '1000000000', 'withdrawal', 'Minimum amount to withdraw (lamports). Deposits below this remain pending. Default: 1 SOL. Fees are ~0.006 SOL + 0.35% + Jupiter, so smaller withdrawals lose significant value to fees.')
ON CONFLICT (key) DO NOTHING;
