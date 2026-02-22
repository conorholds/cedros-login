-- F-30: Add non-negative CHECK constraints on credit_balances
--
-- balance and held_balance should never go negative. A bug in the debit
-- logic could silently create negative balances without a DB-level guard.

ALTER TABLE credit_balances
  ADD CONSTRAINT credit_balances_balance_non_negative
    CHECK (balance >= 0);

ALTER TABLE credit_balances
  ADD CONSTRAINT credit_balances_held_non_negative
    CHECK (held_balance >= 0);

-- Also enforce credit_holds.amount is always positive (F-30 related)
ALTER TABLE credit_holds
  ADD CONSTRAINT credit_holds_amount_positive
    CHECK (amount > 0);
