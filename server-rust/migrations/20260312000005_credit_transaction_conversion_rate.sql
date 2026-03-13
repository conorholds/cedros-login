-- H-06: Persist the SOL/USD conversion rate used when crediting.
-- Allows retroactive auditing of credits at the rate applied.

ALTER TABLE credit_transactions
    ADD COLUMN IF NOT EXISTS conversion_rate DOUBLE PRECISION;

COMMENT ON COLUMN credit_transactions.conversion_rate IS
    'SOL/USD price at time of crediting (NULL for non-deposit transactions)';
