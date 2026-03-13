-- H-03: Prevent withdrawn_amount from exceeding deposit_amount.
-- Only enforced when both columns are NOT NULL (nullable on pending sessions).

ALTER TABLE deposit_sessions
    ADD CONSTRAINT chk_withdrawn_lte_deposit
    CHECK (
        withdrawn_amount_lamports IS NULL
        OR deposit_amount_lamports IS NULL
        OR withdrawn_amount_lamports <= deposit_amount_lamports
    );
