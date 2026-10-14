-- Add last_login_at column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create index for sorting by last login
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC NULLS LAST);
