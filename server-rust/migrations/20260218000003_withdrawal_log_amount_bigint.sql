-- M-07: Change user_withdrawal_log.amount from TEXT to BIGINT for consistency
-- with other financial tables and to enable DB-level aggregation and constraints.
ALTER TABLE user_withdrawal_log
    ALTER COLUMN amount TYPE BIGINT USING amount::BIGINT;

ALTER TABLE user_withdrawal_log
    ADD CONSTRAINT user_withdrawal_log_amount_positive CHECK (amount > 0);
