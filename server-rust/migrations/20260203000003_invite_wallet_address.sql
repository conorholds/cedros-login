-- Add wallet address support to invites
-- Allows inviting users by Solana wallet address instead of email

-- Add wallet_address column
ALTER TABLE invites ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(44);

-- Make email nullable (can now invite by wallet instead)
ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;

-- Add constraint: must have either email or wallet_address (but not both empty)
DO $$ BEGIN
    ALTER TABLE invites ADD CONSTRAINT invites_email_or_wallet_check
        CHECK (email IS NOT NULL OR wallet_address IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add unique constraint for org + wallet_address (prevents duplicate wallet invites)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_org_wallet_unique
    ON invites (org_id, wallet_address)
    WHERE wallet_address IS NOT NULL AND accepted_at IS NULL;

-- Add index for pending invites by wallet address
CREATE INDEX IF NOT EXISTS idx_invites_pending_by_wallet
    ON invites (LOWER(wallet_address), expires_at DESC, created_at DESC)
    WHERE wallet_address IS NOT NULL AND accepted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN invites.wallet_address IS 'Solana wallet address (base58). Either email or wallet_address must be provided.';
