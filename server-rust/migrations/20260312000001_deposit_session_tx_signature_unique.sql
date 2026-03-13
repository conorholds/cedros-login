-- C-01/C-02: Prevent double-crediting by enforcing unique tx_signature per deposit type.
--
-- deposit_sessions.detected_tx_signature is the Solana transaction signature that
-- funded the deposit. A single on-chain tx should never create two deposit sessions
-- of the same type. The partial index excludes NULL (pending sessions without a tx yet)
-- and scopes uniqueness per deposit_type since the same tx could theoretically appear
-- across different deposit types (e.g., privacy vs. public).

CREATE UNIQUE INDEX IF NOT EXISTS idx_deposit_sessions_tx_sig_type_unique
    ON deposit_sessions (detected_tx_signature, deposit_type)
    WHERE detected_tx_signature IS NOT NULL;
