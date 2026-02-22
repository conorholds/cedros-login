//! Transaction support for critical multi-entity operations
//!
//! This module provides ACID transaction support for the most critical
//! multi-entity operations where data consistency is paramount.
//!
//! # Design
//!
//! Rather than refactoring all 27 repositories, we provide transaction-based
//! implementations for the critical operations:
//! - Invite acceptance (invite + membership)
//! - User registration with org membership (user + membership)
//!
//! These operations use raw SQL within a transaction to ensure atomicity.

use sqlx::PgPool;
use uuid::Uuid;

use serde_json::Value as JsonValue;

use crate::errors::AppError;
use crate::models::AuthMethod;
use crate::repositories::{CreateWalletMaterial, MembershipEntity, OrgRole, UserEntity};

/// Transaction-based operations for critical multi-entity workflows
pub struct TransactionalOps;

impl TransactionalOps {
    /// Atomically accept an invite and create a membership
    ///
    /// # Arguments
    /// - `pool` - PostgreSQL connection pool
    /// - `invite_id` - The invite to accept
    /// - `user_id` - The user accepting the invite
    /// - `org_id` - The organization
    /// - `role` - The role to assign
    ///
    /// # Returns
    /// The created membership on success
    ///
    /// # Errors
    /// - `AppError::NotFound` if invite doesn't exist or is invalid
    /// - `AppError::Validation` if invite expired or already accepted
    /// - `AppError::Database` if transaction fails
    pub async fn accept_invite_atomic(
        pool: &PgPool,
        invite_id: Uuid,
        user_id: Uuid,
        org_id: Uuid,
        role: OrgRole,
    ) -> Result<MembershipEntity, AppError> {
        let mut tx = pool
            .begin()
            .await
            .map_err(|e| AppError::Database(format!("Failed to begin transaction: {}", e)))?;

        // Step 1: Mark invite as accepted atomically (only if valid)
        let accepted_at = sqlx::query_scalar::<_, Option<chrono::DateTime<chrono::Utc>>>(
            r#"
            UPDATE invites
            SET accepted_at = NOW()
            WHERE id = $1
              AND accepted_at IS NULL
              AND expires_at > NOW()
            RETURNING accepted_at
            "#,
        )
        .bind(invite_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::Database(format!("Failed to accept invite: {}", e)))?;

        if accepted_at.is_none() {
            if let Err(e) = tx.rollback().await {
                tracing::error!(
                    error = %e,
                    invite_id = %invite_id,
                    operation = "accept_invite_atomic",
                    step = "invite_validation_failed",
                    "Failed to rollback transaction after invite validation failure"
                );
            }
            return Err(AppError::Validation(
                "Invite not found, already accepted, or expired".into(),
            ));
        }

        // Step 2: Create membership within same transaction
        let membership_id = Uuid::new_v4();

        let row_result = sqlx::query_as::<_, MembershipRow>(
            r#"
            INSERT INTO memberships (id, user_id, org_id, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, org_id) DO NOTHING
            RETURNING id, user_id, org_id, role, joined_at
            "#,
        )
        .bind(membership_id)
        .bind(user_id)
        .bind(org_id)
        .bind(role.as_str())
        .fetch_optional(&mut *tx)
        .await;

        match row_result {
            Ok(Some(row)) => {
                // Commit the transaction
                tx.commit()
                    .await
                    .map_err(|e| AppError::Database(format!("Failed to commit: {}", e)))?;

                Ok(MembershipEntity {
                    id: row.id,
                    user_id: row.user_id,
                    org_id: row.org_id,
                    role,
                    joined_at: row.joined_at,
                })
            }
            Ok(None) => {
                // Membership already exists (conflict) - rollback
                if let Err(e) = tx.rollback().await {
                    tracing::error!(
                        error = %e,
                        invite_id = %invite_id,
                        user_id = %user_id,
                        org_id = %org_id,
                        operation = "accept_invite_atomic",
                        step = "membership_conflict",
                        "Failed to rollback transaction after membership conflict"
                    );
                }
                Err(AppError::Validation(
                    "User is already a member of this organization".into(),
                ))
            }
            Err(e) => {
                // Membership creation failed - invite is already marked accepted
                // This creates an inconsistency that cleanup jobs will handle
                if let Err(rollback_err) = tx.rollback().await {
                    tracing::error!(
                        error = %rollback_err,
                        invite_id = %invite_id,
                        user_id = %user_id,
                        org_id = %org_id,
                        operation = "accept_invite_atomic",
                        step = "membership_creation_failed",
                        "Failed to rollback transaction after membership creation failure"
                    );
                }
                tracing::error!(
                    invite_id = %invite_id,
                    user_id = %user_id,
                    error = %e,
                    "CRITICAL: Membership creation failed after invite acceptance"
                );
                Err(AppError::Database(format!(
                    "Failed to create membership: {}",
                    e
                )))
            }
        }
    }

    /// Atomically create a user and add them to an organization
    ///
    /// Used for invite-based registration where the user must be created
    /// and added to the inviting organization atomically.
    pub async fn create_user_with_membership_atomic(
        pool: &PgPool,
        user: UserEntity,
        org_id: Uuid,
        role: OrgRole,
    ) -> Result<(UserEntity, MembershipEntity), AppError> {
        let mut tx = pool
            .begin()
            .await
            .map_err(|e| AppError::Database(format!("Failed to begin transaction: {}", e)))?;

        let now = chrono::Utc::now();
        let auth_methods: Vec<String> = user
            .auth_methods
            .iter()
            .map(|m| match m {
                AuthMethod::Email => "email".to_string(),
                AuthMethod::Google => "google".to_string(),
                AuthMethod::Apple => "apple".to_string(),
                AuthMethod::Solana => "solana".to_string(),
                AuthMethod::WebAuthn => "webauthn".to_string(),
                AuthMethod::Sso => "sso".to_string(),
            })
            .collect();

        // Step 1: Create user
        let user_result = sqlx::query_as::<_, UserRow>(
            r#"
            INSERT INTO users (id, email, email_verified, password_hash, name, picture,
                              wallet_address, google_id, apple_id, stripe_customer_id, 
                              auth_methods, is_system_admin, created_at, updated_at, last_login_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, $14)
            ON CONFLICT (email) DO NOTHING
            RETURNING id, email, email_verified, password_hash, name, picture,
                      wallet_address, google_id, apple_id, stripe_customer_id, 
                      auth_methods, is_system_admin, created_at, updated_at, last_login_at
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
        .bind(now)
        .bind(user.last_login_at)
        .fetch_optional(&mut *tx)
        .await;

        let user_row = match user_result {
            Ok(Some(row)) => row,
            Ok(None) => {
                if let Err(rollback_err) = tx.rollback().await {
                    tracing::error!(
                        error = %rollback_err,
                        user_id = %user.id,
                        email = ?user.email,
                        org_id = %org_id,
                        operation = "create_user_with_membership_atomic",
                        step = "email_conflict",
                        "Failed to rollback transaction after email conflict"
                    );
                }
                return Err(AppError::EmailExists);
            }
            Err(e) => {
                if let Err(rollback_err) = tx.rollback().await {
                    tracing::error!(
                        error = %rollback_err,
                        user_id = %user.id,
                        email = ?user.email,
                        org_id = %org_id,
                        operation = "create_user_with_membership_atomic",
                        step = "user_creation_failed",
                        "Failed to rollback transaction after user creation failure"
                    );
                }
                // R-01: Check for specific unique constraint violations instead of
                // returning generic Database error for all failures.
                if let sqlx::Error::Database(ref db_err) = e {
                    if db_err.is_unique_violation() {
                        let constraint = db_err.constraint().unwrap_or("");
                        if constraint.contains("wallet") {
                            return Err(AppError::WalletExists);
                        }
                        // Other unique violations (google_id, apple_id) — return EmailExists
                        // as the most likely user-facing scenario; callers handle both variants.
                        return Err(AppError::EmailExists);
                    }
                }
                return Err(AppError::Database(format!("Failed to create user: {}", e)));
            }
        };

        // Step 2: Create membership
        let membership_id = Uuid::new_v4();
        let membership_result = sqlx::query_as::<_, MembershipRow>(
            r#"
            INSERT INTO memberships (id, user_id, org_id, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, org_id, role, joined_at
            "#,
        )
        .bind(membership_id)
        .bind(user_row.id)
        .bind(org_id)
        .bind(role.as_str())
        .fetch_one(&mut *tx)
        .await;

        let membership_row = match membership_result {
            Ok(row) => row,
            Err(e) => {
                if let Err(rollback_err) = tx.rollback().await {
                    tracing::error!(
                        error = %rollback_err,
                        user_id = %user_row.id,
                        org_id = %org_id,
                        operation = "create_user_with_membership_atomic",
                        step = "membership_creation_failed",
                        "Failed to rollback transaction after membership creation failure"
                    );
                }
                return Err(AppError::Database(format!(
                    "Failed to create membership: {}",
                    e
                )));
            }
        };

        // Commit transaction
        tx.commit()
            .await
            .map_err(|e| AppError::Database(format!("Failed to commit: {}", e)))?;

        let created_user = UserEntity {
            id: user_row.id,
            email: user_row.email,
            email_verified: user_row.email_verified,
            password_hash: user_row.password_hash,
            name: user_row.name,
            picture: user_row.picture,
            wallet_address: user_row.wallet_address,
            google_id: user_row.google_id,
            apple_id: user_row.apple_id,
            stripe_customer_id: user_row.stripe_customer_id,
            auth_methods: user.auth_methods.clone(),
            is_system_admin: user_row.is_system_admin,
            created_at: user_row.created_at,
            updated_at: user_row.updated_at,
            last_login_at: user_row.last_login_at,
        };

        let membership = MembershipEntity {
            id: membership_row.id,
            user_id: membership_row.user_id,
            org_id: membership_row.org_id,
            role,
            joined_at: membership_row.joined_at,
        };

        Ok((created_user, membership))
    }

    /// F-12: Atomically replace wallet material during recovery.
    ///
    /// Deletes existing wallet material for the user and inserts new material
    /// within a single transaction, preventing data loss if the server crashes
    /// between the two operations.
    pub async fn recover_wallet_atomic(
        pool: &PgPool,
        material: CreateWalletMaterial,
    ) -> Result<(), AppError> {
        let kdf_params_json: Option<JsonValue> = material
            .share_a_kdf_params
            .as_ref()
            .map(serde_json::to_value)
            .transpose()
            .map_err(|e| AppError::Internal(e.into()))?;

        let auth_method_str = material.share_a_auth_method.to_string();
        let new_id = Uuid::new_v4();

        let mut tx = pool
            .begin()
            .await
            .map_err(|e| AppError::Database(format!("Failed to begin transaction: {}", e)))?;

        // Step 1: Delete existing wallet material
        sqlx::query("DELETE FROM solana_wallet_material WHERE user_id = $1 AND api_key_id IS NULL")
            .bind(material.user_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| {
                AppError::Database(format!("Failed to delete wallet material: {}", e))
            })?;

        // Step 2: Insert new wallet material
        sqlx::query(
            r#"
            INSERT INTO solana_wallet_material (
                id, user_id, solana_pubkey, scheme_version,
                share_a_auth_method, share_a_ciphertext, share_a_nonce,
                share_a_kdf_salt, share_a_kdf_params_json, prf_salt, share_a_pin_hash,
                share_b, api_key_id, shamir_t, shamir_n,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 2, 3, NOW(), NOW())
            "#,
        )
        .bind(new_id)
        .bind(material.user_id)
        .bind(&material.solana_pubkey)
        .bind(2i16)
        .bind(&auth_method_str)
        .bind(&material.share_a_ciphertext)
        .bind(&material.share_a_nonce)
        .bind(&material.share_a_kdf_salt)
        .bind(&kdf_params_json)
        .bind(&material.prf_salt)
        .bind(&material.share_a_pin_hash)
        .bind(&material.share_b)
        .bind(material.api_key_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Database(format!("Failed to create wallet material: {}", e)))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Database(format!("Failed to commit: {}", e)))?;

        Ok(())
    }
}

// Row types for SQL queries
#[derive(sqlx::FromRow)]
struct MembershipRow {
    id: Uuid,
    user_id: Uuid,
    org_id: Uuid,
    _role: String,
    joined_at: chrono::DateTime<chrono::Utc>,
}

#[derive(sqlx::FromRow)]
struct UserRow {
    id: Uuid,
    email: Option<String>,
    email_verified: bool,
    password_hash: Option<String>,
    name: Option<String>,
    picture: Option<String>,
    wallet_address: Option<String>,
    google_id: Option<String>,
    apple_id: Option<String>,
    stripe_customer_id: Option<String>,
    _auth_methods: Vec<String>,
    is_system_admin: bool,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
    last_login_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[cfg(test)]
mod tests {
    // Integration tests require database connection
    // See tests/transactional_ops_tests.rs
}
