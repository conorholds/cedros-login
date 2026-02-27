-- Remove unused Apple key_id and private_key settings.
-- Apple Sign-In uses the ID token flow (client-side popup), which verifies
-- tokens against Apple's public JWKS. No signing key is needed server-side.
DELETE FROM system_settings WHERE key IN ('auth_apple_key_id', 'auth_apple_private_key');
