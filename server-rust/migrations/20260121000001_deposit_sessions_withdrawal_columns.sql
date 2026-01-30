-- Add withdrawal-related columns to deposit_sessions for Privacy Cash SSS flow
-- These columns support the server-side withdrawal to company wallet

-- Encrypted private key (AES-256-GCM encrypted user private key for later withdrawal)
-- Format: base64(nonce || ciphertext)
ALTER TABLE deposit_sessions ADD COLUMN stored_share_b TEXT;

-- When the privacy period ends and withdrawal becomes available
ALTER TABLE deposit_sessions ADD COLUMN withdrawal_available_at TIMESTAMPTZ;

-- Transaction signature for withdrawal to company wallet
ALTER TABLE deposit_sessions ADD COLUMN withdrawal_tx_signature TEXT;

-- Index for withdrawal worker to find ready deposits efficiently
CREATE INDEX idx_deposit_sessions_withdrawal_ready
    ON deposit_sessions(status, withdrawal_available_at)
    WHERE status = 'completed' AND stored_share_b IS NOT NULL;
