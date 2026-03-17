-- Token gating settings (Solana wallet holdings verification)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('token_gating_enabled', 'false', 'token_gating', 'Enable Solana token gating for wallet holdings verification', false),
  ('token_gating_rpc_url', '', 'token_gating', 'Solana RPC/DAS endpoint URL (e.g., Helius, QuickNode). Must support DAS for NFT gating.', true),
  ('token_gating_rules', '[]', 'token_gating', 'JSON array of token gate rules (managed via admin API)', false),
  ('token_gating_cache_ttl_secs', '60', 'token_gating', 'Cache TTL for wallet holdings queries (seconds)', false)
ON CONFLICT (key) DO NOTHING;
