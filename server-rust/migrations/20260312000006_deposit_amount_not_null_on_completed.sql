-- M-06: Ensure deposit_amount_lamports is populated for completed/withdrawn sessions.
-- Cannot add a hard NOT NULL constraint because the column is rightfully NULL
-- for sessions still in early states (pending, detected). Instead, use a CHECK
-- that enforces NOT NULL only when status indicates completion.

ALTER TABLE deposit_sessions
    ADD CONSTRAINT chk_completed_has_amount
    CHECK (
        status NOT IN ('withdrawn', 'completed')
        OR deposit_amount_lamports IS NOT NULL
    );
