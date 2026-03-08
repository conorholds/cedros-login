-- Add unique username column to users table
ALTER TABLE users ADD COLUMN username VARCHAR(30) UNIQUE;

-- Seed postlogin_username_enabled setting (default false)
INSERT INTO system_settings (key, value, category, created_at, updated_at)
VALUES ('postlogin_username_enabled', 'false', 'postlogin.username', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
