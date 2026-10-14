-- Add Apple ID support for Sign in with Apple authentication

-- Add apple_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) UNIQUE;

-- Add is_system_admin column if not exists (may have been added earlier)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id) WHERE apple_id IS NOT NULL;
