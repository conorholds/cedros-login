-- Seed auth.instantlink category settings for the Instant Link admin tab.
-- The feature flag (feature_instant_link) exists in 'features' but the tab
-- expects settings in the 'auth.instantlink' category.

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('auth_instantlink_enabled', 'false', 'auth.instantlink', 'Enable instant link (magic link) login', FALSE),
    ('auth_instantlink_expiry', '900', 'auth.instantlink', 'How long the magic link remains valid (seconds)', FALSE),
    ('auth_instantlink_rate_limit', '5', 'auth.instantlink', 'Maximum instant link requests per email per hour', FALSE)
ON CONFLICT (key) DO NOTHING;
