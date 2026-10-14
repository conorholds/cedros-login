-- Seed runtime-configurable OAuth credential settings.
-- Empty value = "not set, fall back to static config".
-- Handlers use `.filter(|s| !s.is_empty())` so empty is treated as None.

INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES
    ('auth_google_client_id', '', 'auth.google', 'Google OAuth client ID (overrides static config)', FALSE),
    ('auth_apple_client_id', '', 'auth.apple', 'Apple Services ID (overrides static config)', FALSE),
    ('auth_apple_team_id', '', 'auth.apple', 'Apple Team ID (overrides static config)', FALSE)
ON CONFLICT (key) DO NOTHING;
