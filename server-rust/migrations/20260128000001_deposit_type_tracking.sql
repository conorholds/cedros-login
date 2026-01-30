-- Add tiered deposit support
--
-- Deposit types:
-- - private: Full Privacy Cash flow via sidecar (>=0.25 SOL, ~1% fees)
-- - public: Jupiter swap direct to company wallet (>=$10, ~0.3% fees)
-- - sol_micro: Direct SOL transfer (<$10, just tx fees)

-- Add deposit_type column to track which deposit path was used
ALTER TABLE deposit_sessions
    ADD COLUMN IF NOT EXISTS deposit_type TEXT NOT NULL DEFAULT 'private';

-- Add constraint to validate deposit_type values
DO $$ BEGIN
    ALTER TABLE deposit_sessions
        ADD CONSTRAINT deposit_type_check
        CHECK (deposit_type IN ('private', 'public', 'sol_micro'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Index for filtering by deposit type (admin queries, stats)
CREATE INDEX IF NOT EXISTS idx_deposit_sessions_type ON deposit_sessions(deposit_type);

-- Add configurable private minimum to system_settings
-- Default: 0.25 SOL (250,000,000 lamports)
-- Admins can adjust this to require higher/lower amounts for private deposits
INSERT INTO system_settings (key, value, category, description) VALUES
    ('private_deposit_min_lamports', '250000000', 'deposit',
     'Minimum deposit for private (Privacy Cash) path in lamports. Default: 0.25 SOL. Below this, deposits use public or sol_micro path.')
ON CONFLICT (key) DO NOTHING;

-- Comment on deposit_type column
COMMENT ON COLUMN deposit_sessions.deposit_type IS
    'Deposit path: private = Privacy Cash via sidecar (>=0.25 SOL), public = Jupiter swap to company ($10+), sol_micro = direct SOL transfer (<$10)';
