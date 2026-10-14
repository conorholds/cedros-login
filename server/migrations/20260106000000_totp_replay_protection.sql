-- S-14: Add TOTP replay protection
-- Tracks the last used time step to prevent code reuse within the validity window

ALTER TABLE totp_secrets
ADD COLUMN IF NOT EXISTS last_used_time_step BIGINT DEFAULT NULL;

COMMENT ON COLUMN totp_secrets.last_used_time_step IS 'S-14: Unix time step (seconds/30) of last verified TOTP code for replay protection';
