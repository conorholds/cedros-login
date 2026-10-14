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
    -- Rate limit settings
    ('rate_limit_auth', '10', 'rate_limit', 'Maximum auth attempts per window (login, register, etc.)'),
    ('rate_limit_general', '60', 'rate_limit', 'Maximum general requests per window'),
    ('rate_limit_window', '60', 'rate_limit', 'Rate limit window size (seconds)')
ON CONFLICT (key) DO NOTHING;
