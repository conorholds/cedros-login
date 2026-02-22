-- Add logging configuration settings
-- These can be changed at runtime via admin dashboard

INSERT INTO system_settings (key, value, category, description) VALUES
    -- Logging settings
    ('server_log_level', 'info', 'server', 'Log level: trace, debug, info, warn, error'),
    ('server_log_format', 'json', 'server', 'Log format: json (structured) or pretty (human-readable)'),
    ('server_environment', 'development', 'server', 'Deployment environment: development, staging, production'),

    -- API key placeholders
    ('server_cedros_pay_api_key', '', 'server', 'API key for Cedros Pay integration'),
    ('server_metrics_api_key', '', 'server', 'API key for Prometheus metrics endpoint')
ON CONFLICT (key) DO NOTHING;
