-- F-42: Add updated_at column and trigger to treasury_config
--
-- treasury_config stores encrypted private keys but has no change
-- tracking. Key rotation has no row-level audit trail.

ALTER TABLE treasury_config
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER update_treasury_config_updated_at
  BEFORE UPDATE ON treasury_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
