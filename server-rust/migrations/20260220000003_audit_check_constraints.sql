-- F-27: Add CHECK constraints on status/type TEXT columns
--
-- Five tables have status or type columns with documented valid values
-- but no CHECK constraint. Invalid values (typos, bugs) are silently stored.

-- credit_holds.status: 'pending', 'captured', 'released', 'expired'
ALTER TABLE credit_holds
  ADD CONSTRAINT credit_holds_status_check
    CHECK (status IN ('pending', 'captured', 'released', 'expired'));

-- privacy_notes.status
ALTER TABLE privacy_notes
  ADD CONSTRAINT privacy_notes_status_check
    CHECK (status IN ('pending', 'active', 'withdrawal_pending', 'withdrawn', 'withdrawal_failed'));

-- pending_spl_deposits.status
ALTER TABLE pending_spl_deposits
  ADD CONSTRAINT pending_spl_deposits_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired'));

-- credit_transactions.tx_type: 'deposit', 'spend', 'adjustment'
ALTER TABLE credit_transactions
  ADD CONSTRAINT credit_transactions_tx_type_check
    CHECK (tx_type IN ('deposit', 'spend', 'adjustment'));

-- deposit_sessions.wallet_type: 'embedded', 'external'
ALTER TABLE deposit_sessions
  ADD CONSTRAINT deposit_sessions_wallet_type_check
    CHECK (wallet_type IN ('embedded', 'external'));

-- webauthn_challenges.challenge_type: 'register', 'authenticate'
ALTER TABLE webauthn_challenges
  ADD CONSTRAINT webauthn_challenges_challenge_type_check
    CHECK (challenge_type IN ('register', 'authenticate'));
