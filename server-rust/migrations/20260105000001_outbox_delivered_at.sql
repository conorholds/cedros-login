-- Add delivered_at column for idempotency protection
-- This allows the worker to skip re-sending if delivery succeeded but mark_done failed
ALTER TABLE outbox_events ADD COLUMN delivered_at TIMESTAMPTZ;

-- Index for finding events that were delivered but not completed (for monitoring)
CREATE INDEX idx_outbox_delivered_not_done ON outbox_events(delivered_at)
    WHERE delivered_at IS NOT NULL AND status != 'done';
