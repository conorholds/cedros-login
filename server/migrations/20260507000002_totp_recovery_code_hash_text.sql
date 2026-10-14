-- TOTP recovery codes are stored as Argon2id PHC strings, which exceed 64 chars.
ALTER TABLE totp_recovery_codes
ALTER COLUMN code_hash TYPE TEXT;
