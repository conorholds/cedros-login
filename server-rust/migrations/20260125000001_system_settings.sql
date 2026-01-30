-- System settings table for runtime-configurable values
-- These settings can be modified via admin UI without restart

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(32) NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS system_settings_updated_at ON system_settings;
CREATE TRIGGER system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Seed default values
INSERT INTO system_settings (key, value, category, description) VALUES
    -- Privacy settings
    ('privacy_period_secs', '604800', 'privacy', 'Time before withdrawal to company wallet (seconds). Default: 7 days'),

    -- Withdrawal worker settings
    ('withdrawal_poll_interval_secs', '3600', 'withdrawal', 'How often to check for ready withdrawals (seconds). Default: 1 hour'),
    ('withdrawal_batch_size', '10', 'withdrawal', 'Maximum withdrawals to process per poll cycle'),
    ('withdrawal_timeout_secs', '120', 'withdrawal', 'Timeout for individual withdrawal transactions (seconds)'),
    ('withdrawal_max_retries', '3', 'withdrawal', 'Maximum retry attempts for failed withdrawals'),
    ('withdrawal_percentage', '100', 'withdrawal', 'Percentage of ready funds to withdraw per cycle (1-100). Lower values improve privacy'),
    ('partial_withdrawal_count', '0', 'withdrawal', 'Maximum partial withdrawals per batch (0 = disabled)'),
    ('partial_withdrawal_min_lamports', '500000000', 'withdrawal', 'Minimum balance for partial withdrawals (lamports). Default: 0.5 SOL'),

    -- Rate limit settings
    ('rate_limit_auth', '10', 'rate_limit', 'Maximum auth attempts per window (login, register, etc.)'),
    ('rate_limit_general', '60', 'rate_limit', 'Maximum general requests per window'),
    ('rate_limit_credit', '30', 'rate_limit', 'Maximum credit operations per window (spend, hold, capture)'),
    ('rate_limit_window', '60', 'rate_limit', 'Rate limit window size (seconds)')
ON CONFLICT (key) DO NOTHING;
