-- Deposit token display settings for admin-controlled token lists
-- Controls quick action buttons and custom token dropdown in the deposit flow

INSERT INTO system_settings (key, value, category, description) VALUES
    ('deposit_quick_action_tokens', 'USDC,USDT,EURC', 'deposit',
     'Comma-separated token symbols shown as quick actions in the deposit flow'),
    ('deposit_custom_tokens', 'SOL,USDC,USDT,EURC,USD1,PYUSD,USDH,CASH,BONK,ORE', 'deposit',
     'Comma-separated token symbols shown in the custom token list')
ON CONFLICT (key) DO NOTHING;
