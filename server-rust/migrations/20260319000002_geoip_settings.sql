-- GeoIP country screening settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('sanctions_geoip_header', '', 'sanctions', 'HTTP header containing the client''s ISO country code. Common values: CF-IPCountry (Cloudflare), X-Vercel-IP-Country (Vercel). Leave empty to disable country screening.', false)
ON CONFLICT (key) DO NOTHING;
