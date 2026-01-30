-- Add Stripe customer ID mapping to users
--
-- Used for server-to-server Stripe webhook processing and payments reconciliation.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Stripe customer IDs should be unique when present
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer_id
    ON users(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;
