-- H-04: Prevent held_balance from exceeding total balance.
-- Both columns are NOT NULL with defaults so no NULL handling needed.

ALTER TABLE credit_balances
    ADD CONSTRAINT chk_held_lte_balance
    CHECK (held_balance <= balance);
