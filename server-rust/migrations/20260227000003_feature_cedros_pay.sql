-- Feature flag for Cedros Pay integration (disabled by default).
--
-- When enabled (true):
--   - The "Integrations" tab appears in Admin > Auth Server settings
--   - The Cedros Pay API Key field becomes configurable
--   - Cedros Pay sections appear in the Permissions dashboard
--
-- When disabled (false, default):
--   - The Integrations tab is hidden from the admin dashboard
--   - No Cedros Pay API key is needed (e.g., integrated/co-located deployments
--     where cedros-login and cedros-pay share the same binary and use JWT/JWKS
--     for inter-service auth instead of API keys)
--
-- Toggle via: Admin Dashboard > Settings > Features, or directly:
--   UPDATE system_settings SET value = 'true' WHERE key = 'feature_cedros_pay';
INSERT INTO system_settings (key, value, category, description)
VALUES (
    'feature_cedros_pay',
    'false',
    'features',
    'Enable Cedros Pay integration (shows Integrations tab with API key configuration)'
)
ON CONFLICT (key) DO NOTHING;
