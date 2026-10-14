-- Seed the security_require_mfa setting for admin-enforced MFA
INSERT INTO system_settings (key, value, category, description, is_secret)
VALUES (
    'security_require_mfa',
    'false',
    'security',
    'Require email/password users to set up two-factor authentication',
    FALSE
)
ON CONFLICT (key) DO NOTHING;
