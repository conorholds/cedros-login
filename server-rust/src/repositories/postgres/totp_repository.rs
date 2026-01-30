//! PostgreSQL TOTP repository implementation
//!
//! ## S-22: Encryption at Rest
//!
//! TOTP secrets are encrypted before storage using AES-256-GCM via `EncryptionService`.
//! The format is `v{version}:{base64(nonce + ciphertext)}` which allows key rotation.
//!
//! For backward compatibility, plaintext secrets (not starting with `v`) are read as-is
//! but will be re-encrypted on the next update.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{RecoveryCode, TotpRepository, TotpSecret};
use crate::services::{EncryptionService, TotpService};

/// PostgreSQL TOTP repository
pub struct PostgresTotpRepository {
    pool: PgPool,
    /// S-22: Optional encryption service for secrets at rest
    encryption: Option<Arc<EncryptionService>>,
}

impl PostgresTotpRepository {
    /// Create a new Postgres TOTP repository without encryption
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            encryption: None,
        }
    }

    /// S-22: Create a new Postgres TOTP repository with encryption at rest
    pub fn with_encryption(pool: PgPool, encryption: Arc<EncryptionService>) -> Self {
        Self {
            pool,
            encryption: Some(encryption),
        }
    }

    /// Encrypt a secret if encryption is enabled
    fn encrypt_secret(&self, plaintext: &str) -> Result<String, AppError> {
        match &self.encryption {
            Some(enc) => enc.encrypt(plaintext),
            None => Ok(plaintext.to_string()),
        }
    }

    /// Decrypt a secret if it appears to be encrypted
    /// S-22: Backward compatible - plaintext secrets are returned as-is
    fn decrypt_secret(&self, stored: &str) -> Result<String, AppError> {
        // Check if this looks like an encrypted value (versioned format)
        if stored.starts_with("v") && stored.contains(':') {
            match &self.encryption {
                Some(enc) => enc.decrypt(stored),
                None => {
                    // Encrypted data but no decryption key - this is a config error
                    Err(AppError::Config(
                        "Encrypted TOTP secret found but no encryption key configured".into(),
                    ))
                }
            }
        } else {
            // Legacy plaintext secret
            Ok(stored.to_string())
        }
    }
}

#[derive(sqlx::FromRow)]
struct TotpSecretRow {
    id: Uuid,
    user_id: Uuid,
    secret: String,
    enabled: bool,
    created_at: DateTime<Utc>,
    enabled_at: Option<DateTime<Utc>>,
    last_used_time_step: Option<i64>,
}

impl From<TotpSecretRow> for TotpSecret {
    fn from(row: TotpSecretRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            secret: row.secret,
            enabled: row.enabled,
            created_at: row.created_at,
            enabled_at: row.enabled_at,
            last_used_time_step: row.last_used_time_step,
        }
    }
}

#[derive(sqlx::FromRow)]
struct RecoveryCodeRow {
    id: Uuid,
    user_id: Uuid,
    code_hash: String,
    used: bool,
    created_at: DateTime<Utc>,
    used_at: Option<DateTime<Utc>>,
}

impl From<RecoveryCodeRow> for RecoveryCode {
    fn from(row: RecoveryCodeRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            code_hash: row.code_hash,
            used: row.used,
            created_at: row.created_at,
            used_at: row.used_at,
        }
    }
}

#[async_trait]
impl TotpRepository for PostgresTotpRepository {
    async fn upsert_secret(&self, user_id: Uuid, secret: &str) -> Result<TotpSecret, AppError> {
        // S-22: Encrypt the secret before storing
        let stored_secret = self.encrypt_secret(secret)?;

        let row: TotpSecretRow = sqlx::query_as(
            r#"
            INSERT INTO totp_secrets (id, user_id, secret, enabled, created_at, enabled_at, last_used_time_step)
            VALUES ($1, $2, $3, FALSE, NOW(), NULL, NULL)
            ON CONFLICT (user_id)
            DO UPDATE SET
                secret = EXCLUDED.secret,
                enabled = FALSE,
                created_at = NOW(),
                enabled_at = NULL,
                last_used_time_step = NULL
            RETURNING id, user_id, secret, enabled, created_at, enabled_at, last_used_time_step
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&stored_secret)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Return with the original plaintext secret (not the encrypted version)
        Ok(TotpSecret {
            id: row.id,
            user_id: row.user_id,
            secret: secret.to_string(),
            enabled: row.enabled,
            created_at: row.created_at,
            enabled_at: row.enabled_at,
            last_used_time_step: row.last_used_time_step,
        })
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Option<TotpSecret>, AppError> {
        let row: Option<TotpSecretRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, secret, enabled, created_at, enabled_at, last_used_time_step
            FROM totp_secrets
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // S-22: Decrypt the secret if present
        match row {
            Some(r) => {
                let decrypted_secret = self.decrypt_secret(&r.secret)?;
                Ok(Some(TotpSecret {
                    id: r.id,
                    user_id: r.user_id,
                    secret: decrypted_secret,
                    enabled: r.enabled,
                    created_at: r.created_at,
                    enabled_at: r.enabled_at,
                    last_used_time_step: r.last_used_time_step,
                }))
            }
            None => Ok(None),
        }
    }

    async fn enable_mfa(&self, user_id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            r#"
            UPDATE totp_secrets
            SET enabled = TRUE,
                enabled_at = NOW()
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("TOTP secret not found".into()));
        }

        Ok(())
    }

    async fn disable_mfa(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        sqlx::query(
            r#"
            DELETE FROM totp_recovery_codes
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        sqlx::query(
            r#"
            DELETE FROM totp_secrets
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn has_mfa_enabled(&self, user_id: Uuid) -> Result<bool, AppError> {
        let row: Option<(bool,)> = sqlx::query_as(
            r#"
            SELECT enabled
            FROM totp_secrets
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(|r| r.0).unwrap_or(false))
    }

    async fn record_used_time_step_if_newer(
        &self,
        user_id: Uuid,
        time_step: i64,
    ) -> Result<bool, AppError> {
        let updated: Option<(Uuid,)> = sqlx::query_as(
            r#"
            UPDATE totp_secrets
            SET last_used_time_step = $2
            WHERE user_id = $1
              AND (last_used_time_step IS NULL OR last_used_time_step < $2)
            RETURNING id
            "#,
        )
        .bind(user_id)
        .bind(time_step)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if updated.is_some() {
            return Ok(true);
        }

        let exists: Option<(Uuid,)> = sqlx::query_as(
            r#"
            SELECT id
            FROM totp_secrets
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if exists.is_none() {
            return Err(AppError::NotFound("TOTP secret not found".into()));
        }

        Ok(false)
    }

    async fn store_recovery_codes(
        &self,
        user_id: Uuid,
        code_hashes: Vec<String>,
    ) -> Result<(), AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Delete existing recovery codes
        sqlx::query("DELETE FROM totp_recovery_codes WHERE user_id = $1")
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Batch insert all recovery codes in a single query using UNNEST
        if !code_hashes.is_empty() {
            sqlx::query(
                r#"
                INSERT INTO totp_recovery_codes (id, user_id, code_hash, used, created_at)
                SELECT gen_random_uuid(), $1, UNNEST($2::text[]), FALSE, NOW()
                "#,
            )
            .bind(user_id)
            .bind(&code_hashes)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        }

        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }

    async fn get_recovery_codes(&self, user_id: Uuid) -> Result<Vec<RecoveryCode>, AppError> {
        let rows: Vec<RecoveryCodeRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, code_hash, used, created_at, used_at
            FROM totp_recovery_codes
            WHERE user_id = $1 AND used = FALSE
            ORDER BY created_at ASC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn use_recovery_code(&self, user_id: Uuid, code: &str) -> Result<bool, AppError> {
        // NEW-01 FIX: Use transaction with FOR UPDATE to prevent TOCTOU race condition.
        // Without this lock, concurrent requests could both verify the same code
        // and both succeed before either marks it as used.
        //
        // NEW-05: CPU Amplification Note
        // This function verifies up to 10 Argon2id hashes per call (one per unused recovery code).
        // Argon2id is intentionally expensive (~75ms per hash), so 10 codes = ~750ms CPU time.
        // Mitigation: The /mfa/recovery endpoint is rate-limited via auth_rate_limit (IpAndPath)
        // which restricts attempts per IP per time window. See router.rs:auth_sensitive_routes.
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        // Fetch all unused codes with row-level lock to prevent concurrent access
        let rows: Vec<RecoveryCodeRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, code_hash, used, created_at, used_at
            FROM totp_recovery_codes
            WHERE user_id = $1 AND used = FALSE
            FOR UPDATE
            "#,
        )
        .bind(user_id)
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        // Verify the plaintext code against each stored Argon2id hash.
        // We check all codes to avoid early-exit timing leaks (constant-time).
        let mut matched_id: Option<Uuid> = None;
        for row in &rows {
            if TotpService::verify_recovery_code(code, &row.code_hash) {
                matched_id = Some(row.id);
                // Don't break early - continue checking to maintain constant time
            }
        }

        // If we found a match, mark it as used within the same transaction
        if let Some(id) = matched_id {
            sqlx::query(
                r#"
                UPDATE totp_recovery_codes
                SET used = TRUE,
                    used_at = NOW()
                WHERE id = $1 AND used = FALSE
                "#,
            )
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

            tx.commit()
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
            return Ok(true);
        }

        // No match - rollback is implicit when tx is dropped
        Ok(false)
    }

    async fn delete_recovery_codes(&self, user_id: Uuid) -> Result<(), AppError> {
        sqlx::query(
            r#"
            DELETE FROM totp_recovery_codes
            WHERE user_id = $1
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(())
    }
}
