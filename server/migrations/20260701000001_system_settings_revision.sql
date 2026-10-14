-- Revision counter for optimistic concurrency on system settings autosave.

CREATE TABLE IF NOT EXISTS system_settings_revision (
    resource_id TEXT PRIMARY KEY,
    revision BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_settings_revision (resource_id, revision)
VALUES ('global', 1)
ON CONFLICT (resource_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS autosave_idempotency_keys (
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
    response_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (
        tenant_id,
        user_id,
        resource_type,
        resource_id,
        operation,
        idempotency_key
    )
);

CREATE INDEX IF NOT EXISTS idx_autosave_idempotency_keys_expires_at
    ON autosave_idempotency_keys (expires_at);
