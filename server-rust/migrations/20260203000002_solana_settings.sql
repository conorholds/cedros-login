-- Solana settings for deposit confirmation and on-chain operations
-- These settings are read by the sidecar from the database

INSERT INTO system_settings (key, value, category, description) VALUES
    -- Solana RPC (admin UI configurable)
    ('solana_rpc_url', 'https://api.mainnet-beta.solana.com', 'deposit.general',
     'Solana RPC endpoint URL for confirming deposits and on-chain operations'),
    -- Jupiter API key (admin UI configurable)
    ('jupiter_api_key', '', 'deposit.general',
     'Jupiter Ultra API key for gasless swaps (get free key at https://portal.jup.ag)')
ON CONFLICT (key) DO NOTHING;
