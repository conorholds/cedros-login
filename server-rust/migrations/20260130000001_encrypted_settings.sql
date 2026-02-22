-- Add encrypted secrets support to system_settings
-- Secrets are stored as: base64(nonce || ciphertext) with AES-256-GCM

-- Add columns for secret handling
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS is_secret BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS encryption_version TEXT;

-- Seed authentication provider settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    -- Email auth
    ('auth_email_enabled', 'true', 'auth.email', 'Enable email/password authentication', FALSE),
    ('auth_email_require_verification', 'true', 'auth.email', 'Require email verification before login', FALSE),
    ('auth_email_block_disposable', 'false', 'auth.email', 'Block disposable email domains', FALSE),

    -- Google OAuth
    ('auth_google_enabled', 'false', 'auth.google', 'Enable Google Sign-In', FALSE),
    ('auth_google_client_id', '', 'auth.google', 'Google OAuth client ID', FALSE),
    ('auth_google_client_secret', '', 'auth.google', 'Google OAuth client secret', TRUE),

    -- Apple OAuth
    ('auth_apple_enabled', 'false', 'auth.apple', 'Enable Sign in with Apple', FALSE),
    ('auth_apple_client_id', '', 'auth.apple', 'Apple Services ID (client ID)', FALSE),
    ('auth_apple_team_id', '', 'auth.apple', 'Apple Developer Team ID', FALSE),
    ('auth_apple_key_id', '', 'auth.apple', 'Apple Sign-In private key ID', FALSE),
    ('auth_apple_private_key', '', 'auth.apple', 'Apple Sign-In private key (PEM)', TRUE),

    -- Solana auth
    ('auth_solana_enabled', 'false', 'auth.solana', 'Enable Solana wallet authentication', FALSE),
    ('auth_solana_challenge_expiry', '300', 'auth.solana', 'Challenge expiration time (seconds)', FALSE),

    -- WebAuthn/Passkeys
    ('auth_webauthn_enabled', 'false', 'auth.webauthn', 'Enable WebAuthn/Passkey authentication', FALSE),
    ('auth_webauthn_rp_id', '', 'auth.webauthn', 'Relying Party ID (usually domain)', FALSE),
    ('auth_webauthn_rp_name', '', 'auth.webauthn', 'Relying Party display name', FALSE),
    ('auth_webauthn_rp_origin', '', 'auth.webauthn', 'Allowed origin(s) for WebAuthn', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Seed feature flags
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('feature_privacy_cash', 'false', 'features', 'Enable Privacy Cash deposits and withdrawals', FALSE),
    ('feature_wallet_signing', 'false', 'features', 'Enable embedded wallet signing', FALSE),
    ('feature_sso', 'false', 'features', 'Enable enterprise SSO (SAML/OIDC)', FALSE),
    ('feature_organizations', 'true', 'features', 'Enable multi-user organizations', FALSE),
    ('feature_mfa', 'true', 'features', 'Enable two-factor authentication', FALSE),
    ('feature_instant_link', 'true', 'features', 'Enable instant link (magic link) login', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Seed security settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('security_cors_origins', '', 'security', 'Allowed CORS origins (comma-separated)', FALSE),
    ('security_cookie_domain', '', 'security', 'Cookie domain (empty for request origin)', FALSE),
    ('security_cookie_secure', 'true', 'security', 'Require HTTPS for cookies', FALSE),
    ('security_cookie_same_site', 'lax', 'security', 'Cookie SameSite policy (strict, lax, none)', FALSE),
    ('security_session_timeout', '604800', 'security', 'Session timeout (seconds). Default: 7 days', FALSE),
    ('security_jwt_issuer', '', 'security', 'JWT issuer claim (empty for default)', FALSE),
    ('security_jwt_audience', '', 'security', 'JWT audience claim (empty for default)', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Seed email/SMTP settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('email_smtp_host', '', 'email', 'SMTP server hostname', FALSE),
    ('email_smtp_port', '587', 'email', 'SMTP server port', FALSE),
    ('email_smtp_user', '', 'email', 'SMTP username', FALSE),
    ('email_smtp_password', '', 'email', 'SMTP password', TRUE),
    ('email_smtp_tls', 'true', 'email', 'Use TLS for SMTP', FALSE),
    ('email_from_address', '', 'email', 'Default from email address', FALSE),
    ('email_from_name', '', 'email', 'Default from display name', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Seed webhook settings
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('webhook_enabled', 'false', 'webhook', 'Enable webhook notifications', FALSE),
    ('webhook_url', '', 'webhook', 'Webhook endpoint URL', FALSE),
    ('webhook_secret', '', 'webhook', 'Webhook signing secret', TRUE),
    ('webhook_timeout', '30', 'webhook', 'Webhook request timeout (seconds)', FALSE),
    ('webhook_retries', '3', 'webhook', 'Maximum webhook retry attempts', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Seed server/infrastructure settings (can be overridden via UI but env takes precedence)
INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
    ('server_frontend_url', '', 'server', 'Frontend URL for redirects and emails', FALSE),
    ('server_base_path', '/auth', 'server', 'Base path for auth endpoints', FALSE),
    ('server_trust_proxy', 'false', 'server', 'Trust X-Forwarded-For headers', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Add index for secret lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_is_secret ON system_settings(is_secret) WHERE is_secret = TRUE;
