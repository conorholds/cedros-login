-- Keep exactly one outstanding token per user, purpose, and optional subject.
-- Repository writes already replace the previous token in one statement; this
-- database invariant closes the concurrent delete/insert race between workers.
WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, token_type,
                            COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid)
               ORDER BY created_at DESC, id DESC
           ) AS position
    FROM verification_tokens
    WHERE used_at IS NULL
)
DELETE FROM verification_tokens AS token
USING ranked
WHERE token.id = ranked.id
  AND ranked.position > 1;

CREATE UNIQUE INDEX IF NOT EXISTS verification_tokens_one_live_purpose_subject
ON verification_tokens (
    user_id,
    token_type,
    COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
WHERE used_at IS NULL;
