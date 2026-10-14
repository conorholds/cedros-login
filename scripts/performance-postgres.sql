-- DISPOSABLE MIGRATED DATABASE ONLY. Inserts 100k synthetic users inside a
-- rolled-back transaction; still consumes DB CPU, disk and locks while running.
-- psql -X -qAt "$TEST_DATABASE_URL" -f scripts/performance-postgres.sql
-- Output: JSON EXPLAIN plans for count, auth-method stats, first/deep page,
-- then first/deep page with a candidate created-at index. If the production
-- migration is already installed, both page pairs use an index.
\set ON_ERROR_STOP on
BEGIN;
SET LOCAL statement_timeout = '30s';
INSERT INTO users (email, auth_methods, referral_code, created_at)
SELECT 'perf-' || n || '@fixture.test', ARRAY['email', 'google'], 'PERF' || lpad(n::text, 10, '0'), now() - n * interval '1 second'
FROM generate_series(1, 100000) n;
ANALYZE users;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT COUNT(*) FROM users;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT method, COUNT(*) FROM users, UNNEST(auth_methods) AS method GROUP BY method;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id, email, email_verified, password_hash, name, username, picture, wallet_address, google_id, apple_id, auth_methods, is_system_admin, created_at, updated_at, last_login_at, welcome_completed_at, referral_code, referred_by FROM users ORDER BY created_at DESC LIMIT 50 OFFSET 0;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id, email, email_verified, password_hash, name, username, picture, wallet_address, google_id, apple_id, auth_methods, is_system_admin, created_at, updated_at, last_login_at, welcome_completed_at, referral_code, referred_by FROM users ORDER BY created_at DESC LIMIT 50 OFFSET 90000;
CREATE INDEX performance_users_created_at ON users(created_at DESC);
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id, email, email_verified, password_hash, name, username, picture, wallet_address, google_id, apple_id, auth_methods, is_system_admin, created_at, updated_at, last_login_at, welcome_completed_at, referral_code, referred_by FROM users ORDER BY created_at DESC LIMIT 50 OFFSET 0;
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT id, email, email_verified, password_hash, name, username, picture, wallet_address, google_id, apple_id, auth_methods, is_system_admin, created_at, updated_at, last_login_at, welcome_completed_at, referral_code, referred_by FROM users ORDER BY created_at DESC LIMIT 50 OFFSET 90000;
ROLLBACK;
