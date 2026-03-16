-- Sanctions screening settings (cedros-sunscreen integration)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('sanctions_enabled', 'false', 'sanctions', 'Enable sanctions screening against cedros-sunscreen', false),
  ('sanctions_api_url', '', 'sanctions', 'Sunscreen API base URL (e.g., https://sunscreen.cedros.io)', false),
  ('sanctions_refresh_interval_secs', '3600', 'sanctions', 'How often to refresh the sanctions list (seconds, min 60)', false)
ON CONFLICT (key) DO NOTHING;
