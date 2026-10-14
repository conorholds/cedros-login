-- Add revoke reason tracking for refresh token reuse detection
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS revoked_reason TEXT;
