CREATE TABLE user_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    verified_at TIMESTAMPTZ,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_emails_email_unique ON user_emails (email);
CREATE UNIQUE INDEX idx_user_emails_one_primary
    ON user_emails (user_id)
    WHERE is_primary;
CREATE INDEX idx_user_emails_user_id ON user_emails (user_id);
CREATE INDEX idx_user_emails_pending_cleanup
    ON user_emails (created_at)
    WHERE verified_at IS NULL;

INSERT INTO user_emails (user_id, email, verified_at, is_primary, created_at)
SELECT
    id,
    lower(email),
    CASE WHEN email_verified THEN updated_at ELSE NULL END,
    true,
    created_at
FROM users
WHERE email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

ALTER TABLE verification_tokens
ADD COLUMN IF NOT EXISTS subject_id UUID;

CREATE INDEX IF NOT EXISTS idx_verify_subject
    ON verification_tokens(subject_id)
    WHERE subject_id IS NOT NULL;
