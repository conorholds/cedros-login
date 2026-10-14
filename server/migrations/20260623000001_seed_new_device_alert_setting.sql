-- Seed the opt-out setting for new-device sign-in alert emails.
INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES (
    'auth_new_device_alert_enabled',
    'true',
    'security',
    'Email users when a sign-in uses a browser and operating system not seen in recent sessions',
    FALSE
)
ON CONFLICT (key) DO NOTHING;
