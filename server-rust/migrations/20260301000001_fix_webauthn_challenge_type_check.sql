-- Fix CHECK constraint on webauthn_challenges.challenge_type to include 'discoverable'
-- (used by username-less / discoverable passkey authentication).
-- The original constraint from 20260220000003 only allowed 'register' and 'authenticate'.

ALTER TABLE webauthn_challenges
  DROP CONSTRAINT webauthn_challenges_challenge_type_check;

ALTER TABLE webauthn_challenges
  ADD CONSTRAINT webauthn_challenges_challenge_type_check
    CHECK (challenge_type IN ('register', 'authenticate', 'discoverable'));
