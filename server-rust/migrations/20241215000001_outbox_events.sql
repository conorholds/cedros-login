-- Outbox events table for reliable async message delivery
-- NOTE: ON DELETE SET NULL is intentional for org_id and user_id:
-- Events are retained for debugging/monitoring even after entity deletion.
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 10,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_error TEXT,
    correlation_id VARCHAR(255),
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for polling pending events (worker query)
CREATE INDEX idx_outbox_pending ON outbox_events(next_attempt_at)
    WHERE status = 'pending' AND locked_at IS NULL;

-- Index for finding events by status
CREATE INDEX idx_outbox_status ON outbox_events(status);

-- Index for finding events by org
CREATE INDEX idx_outbox_org ON outbox_events(org_id) WHERE org_id IS NOT NULL;

-- Index for finding events by user
CREATE INDEX idx_outbox_user ON outbox_events(user_id) WHERE user_id IS NOT NULL;

-- Index for correlation ID lookups
CREATE INDEX idx_outbox_correlation ON outbox_events(correlation_id) WHERE correlation_id IS NOT NULL;

-- Index for cleanup of old completed events
CREATE INDEX idx_outbox_cleanup ON outbox_events(created_at) WHERE status = 'done';

-- Index for reclaiming stale processing events
CREATE INDEX idx_outbox_processing_locked_at ON outbox_events(locked_at)
    WHERE status = 'processing';
