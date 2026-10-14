-- Optional subscription discount attached to an invite code (percent off,
-- 1-100; 100 = a free subscription). Granted to the redeeming user and read
-- by billing (Cedros Pay) through the account invite-discount lookup.
ALTER TABLE invite_codes
    ADD COLUMN discount_percent INTEGER
    CHECK (discount_percent IS NULL OR (discount_percent >= 1 AND discount_percent <= 100));
