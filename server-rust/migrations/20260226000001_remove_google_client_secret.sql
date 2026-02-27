-- Remove unused Google client secret setting.
-- Google Sign-In uses the GSI ID token flow (client-side), which does not
-- require a client secret. Only the client ID is needed.
DELETE FROM system_settings WHERE key = 'auth_google_client_secret';
