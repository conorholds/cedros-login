-- Account deletion preserves the user ID for historical foreign keys. Permit
-- only the exact credential-free tombstone recognized by UserEntity::is_deleted;
-- keep rejecting active users without an authentication identifier.
ALTER TABLE users DROP CONSTRAINT chk_user_has_auth_identifier;
ALTER TABLE users ADD CONSTRAINT chk_user_has_auth_identifier CHECK (
    email IS NOT NULL
    OR wallet_address IS NOT NULL
    OR google_id IS NOT NULL
    OR apple_id IS NOT NULL
    OR 'webauthn' = ANY(auth_methods)
    OR (
        cardinality(auth_methods) = 0
        AND email IS NULL
        AND password_hash IS NULL
        AND wallet_address IS NULL
        AND google_id IS NULL
        AND apple_id IS NULL
        AND name IS NOT DISTINCT FROM 'Deleted Account'
    )
);
