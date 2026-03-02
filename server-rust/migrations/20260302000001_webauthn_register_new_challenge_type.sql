-- Extend CHECK constraint on webauthn_challenges.challenge_type to include 'register_new'
-- (used by standalone passkey signup — creating a new account via passkey without a session).

ALTER TABLE webauthn_challenges
  DROP CONSTRAINT webauthn_challenges_challenge_type_check;

ALTER TABLE webauthn_challenges
  ADD CONSTRAINT webauthn_challenges_challenge_type_check
    CHECK (challenge_type IN ('register', 'authenticate', 'discoverable', 'register_new'));
