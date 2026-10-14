-- Persist the provider acceptance reference for delivery/bounce correlation.
-- This is intentionally not a uniqueness or exactly-once constraint: external
-- provider acceptance and this local acknowledgement are not one transaction.
ALTER TABLE outbox_events ADD COLUMN provider_message_id TEXT;

CREATE INDEX idx_outbox_provider_message_id
    ON outbox_events(provider_message_id)
    WHERE provider_message_id IS NOT NULL;
