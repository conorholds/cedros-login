-- Image storage settings for S3-compatible object storage (avatars, images)
INSERT INTO system_settings (key, value, category, is_secret) VALUES
  ('image_storage_enabled', 'false', 'image_storage', FALSE),
  ('image_storage_provider', 's3', 'image_storage', FALSE),
  ('image_storage_bucket', '', 'image_storage', FALSE),
  ('image_storage_region', '', 'image_storage', FALSE),
  ('image_storage_endpoint', '', 'image_storage', FALSE),
  ('image_storage_access_key', '', 'image_storage', TRUE),
  ('image_storage_secret_key', '', 'image_storage', TRUE),
  ('image_storage_cdn_url', '', 'image_storage', FALSE)
ON CONFLICT (key) DO NOTHING;
