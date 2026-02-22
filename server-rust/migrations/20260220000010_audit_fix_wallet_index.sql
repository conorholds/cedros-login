-- F-33: Fix LOWER() on Solana wallet address in invites index
--
-- Solana base58 addresses are case-sensitive. Applying LOWER() changes
-- the address and may cause false collisions (e.g., '1A' != '1a').
-- The original index in 20260203000003 incorrectly uses LOWER().

DROP INDEX IF EXISTS idx_invites_pending_by_wallet;

CREATE INDEX idx_invites_pending_by_wallet
  ON invites(wallet_address, expires_at DESC, created_at DESC)
  WHERE wallet_address IS NOT NULL AND accepted_at IS NULL;
