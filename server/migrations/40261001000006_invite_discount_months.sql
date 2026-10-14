-- NULL preserves lifetime discounts on existing invite codes.
SET LOCAL lock_timeout = '5s';

ALTER TABLE invite_codes
    ADD COLUMN IF NOT EXISTS discount_months INTEGER
    CHECK (discount_months IS NULL OR (discount_months > 0 AND discount_percent IS DISTINCT FROM NULL));
