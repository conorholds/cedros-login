-- Ensure image storage credentials are treated as encrypted secrets
UPDATE system_settings
SET is_secret = TRUE
WHERE key IN ('image_storage_access_key', 'image_storage_secret_key');
