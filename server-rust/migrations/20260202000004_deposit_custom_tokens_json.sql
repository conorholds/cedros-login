-- Add custom token definitions setting for admin-defined tokens
-- Allows admins to add tokens beyond the built-in list with full metadata

INSERT INTO system_settings (key, value, category, description) VALUES
    ('deposit_custom_tokens_json', '[]', 'deposit',
     'JSON array of custom token definitions: [{symbol, mint, decimals, logoUrl?}]')
ON CONFLICT (key) DO NOTHING;
