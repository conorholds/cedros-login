-- no-transaction
-- Match the admin user directory's ORDER BY created_at DESC without sorting
-- the whole users table. Concurrent creation keeps ordinary writes available.
CREATE INDEX CONCURRENTLY idx_users_created_at ON users (created_at DESC);
