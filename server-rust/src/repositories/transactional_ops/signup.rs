//! Signup transaction helpers for OAuth and passkey registration flows.
//!
//! Provides atomic multi-entity INSERT operations (user + membership + api_key
//! [+ webauthn credential]) used by google, apple, solana, and webauthn_signup
//! handlers.

use sqlx::PgPool;

use crate::errors::AppError;
use crate::repositories::{ApiKeyEntity, MembershipEntity, UserEntity, WebAuthnCredential};

use super::TransactionalOps;

impl TransactionalOps {
    /// Atomically create user + membership + api_key in a single transaction.
    ///
    /// Used by OAuth and Solana signup flows (google, apple, solana handlers).
    /// Callers must check for email/wallet collisions BEFORE calling this.
    pub async fn create_user_with_membership_and_api_key(
        pool: &PgPool,
        user: &UserEntity,
        membership: &MembershipEntity,
        api_key: &ApiKeyEntity,
    ) -> Result<(), AppError> {
        let mut tx = pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Self::insert_user(&mut tx, user).await?;
        Self::insert_membership(&mut tx, membership).await?;
        Self::insert_api_key(&mut tx, api_key).await?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    /// Atomically create user + membership + api_key + webauthn credential.
    ///
    /// Used by the passkey signup flow where the credential FK requires the
    /// user row to exist first.
    pub async fn create_user_with_membership_apikey_and_credential(
        pool: &PgPool,
        user: &UserEntity,
        membership: &MembershipEntity,
        api_key: &ApiKeyEntity,
        credential: &WebAuthnCredential,
    ) -> Result<(), AppError> {
        let mut tx = pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Self::insert_user(&mut tx, user).await?;
        Self::insert_membership(&mut tx, membership).await?;
        Self::insert_api_key(&mut tx, api_key).await?;
        Self::insert_webauthn_credential(&mut tx, credential).await?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    // --- Private helpers for INSERT statements within a transaction ---

    async fn insert_user(
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        user: &UserEntity,
    ) -> Result<(), AppError> {
        let auth_methods: Vec<String> = user.auth_methods.iter().map(|m| m.to_string()).collect();

        sqlx::query(
            r#"
            INSERT INTO users (id, email, email_verified, password_hash, name, picture,
                               wallet_address, google_id, apple_id, stripe_customer_id,
                               auth_methods, is_system_admin, created_at, updated_at, last_login_at,
                               referral_code, referred_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            "#,
        )
        .bind(user.id)
        .bind(&user.email)
        .bind(user.email_verified)
        .bind(&user.password_hash)
        .bind(&user.name)
        .bind(&user.picture)
        .bind(&user.wallet_address)
        .bind(&user.google_id)
        .bind(&user.apple_id)
        .bind(&user.stripe_customer_id)
        .bind(&auth_methods)
        .bind(user.is_system_admin)
        .bind(user.created_at)
        .bind(user.updated_at)
        .bind(user.last_login_at)
        .bind(&user.referral_code)
        .bind(user.referred_by)
        .execute(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn insert_membership(
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        membership: &MembershipEntity,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO memberships (id, user_id, org_id, role)
            VALUES ($1, $2, $3, $4)
            "#,
        )
        .bind(membership.id)
        .bind(membership.user_id)
        .bind(membership.org_id)
        .bind(membership.role.as_str())
        .execute(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn insert_api_key(
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        api_key: &ApiKeyEntity,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO api_keys (id, user_id, key_hash, key_prefix, created_at, last_used_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(api_key.id)
        .bind(api_key.user_id)
        .bind(&api_key.key_hash)
        .bind(&api_key.key_prefix)
        .bind(api_key.created_at)
        .bind(api_key.last_used_at)
        .execute(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn insert_webauthn_credential(
        tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
        credential: &WebAuthnCredential,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO webauthn_credentials (
                id, user_id, credential_id, public_key, sign_count, transports,
                aaguid, is_discoverable, backup_eligible, backup_state, label,
                created_at, last_used_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#,
        )
        .bind(credential.id)
        .bind(credential.user_id)
        .bind(&credential.credential_id)
        .bind(&credential.public_key)
        .bind(credential.sign_count as i32)
        .bind(&credential.transports)
        .bind(&credential.aaguid)
        .bind(credential.is_discoverable)
        .bind(credential.backup_eligible)
        .bind(credential.backup_state)
        .bind(&credential.label)
        .bind(credential.created_at)
        .bind(credential.last_used_at)
        .execute(&mut **tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }
}
