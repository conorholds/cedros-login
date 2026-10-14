-- Mark server API keys as secret settings in existing and new databases.
UPDATE system_settings
SET is_secret = TRUE,
    encryption_version = CASE
        WHEN value = '' THEN COALESCE(encryption_version, 'v1')
        ELSE encryption_version
    END
WHERE key = 'server_metrics_api_key';
