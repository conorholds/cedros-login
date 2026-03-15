-- Sidecar shared secrets as admin-manageable system settings.
-- Values are auto-generated on first startup if empty.
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('sidecar_api_key', '', 'privacy', 'API key for authenticating requests to the login-sidecar. Must also be set as SIDECAR_API_KEY env var on the sidecar container.', TRUE),
  ('note_encryption_key', '', 'privacy', 'AES-256 encryption key for privacy cash notes (base64-encoded). Must also be set as NOTE_ENCRYPTION_KEY env var on the sidecar container.', TRUE)
ON CONFLICT (key) DO NOTHING;
