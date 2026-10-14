-- Invite-code registration gate and user-issued invite codes.

CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
    uses_count INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    batch_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_owner
    ON invite_codes(owner_user_id, active, batch_key);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active_window
    ON invite_codes(active, starts_at, expires_at);

DROP TRIGGER IF EXISTS update_invite_codes_updated_at ON invite_codes;
CREATE TRIGGER update_invite_codes_updated_at
    BEFORE UPDATE ON invite_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS invite_code_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code_id UUID NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invite_code_redemptions_code
    ON invite_code_redemptions(invite_code_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_invite_code_redemptions_user
    ON invite_code_redemptions(user_id, redeemed_at DESC);

CREATE TABLE IF NOT EXISTS invite_code_accounts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_settings (key, value, category, description, is_secret) VALUES
  ('invite_codes_enabled', 'false', 'auth.invite_codes', 'Require a valid invite code before newly registered users can sign in.', FALSE),
  ('invite_codes_users_can_issue', 'false', 'auth.invite_codes', 'Allow active users to receive one-time invite codes for other people.', FALSE),
  ('invite_codes_per_user', '0', 'auth.invite_codes', 'How many one-time invite codes each user receives per reset window.', FALSE),
  ('invite_codes_reset_interval_days', '30', 'auth.invite_codes', 'How often user invite codes reset in days. Use 0 to never reset.', FALSE)
ON CONFLICT (key) DO NOTHING;
