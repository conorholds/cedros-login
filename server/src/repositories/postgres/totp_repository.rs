//! PostgreSQL TOTP repository implementation
//!
//! ## Encryption at Rest
//!
//! TOTP secrets are encrypted before storage using AES-256-GCM via `EncryptionService`.
//! The format is `v{version}:{base64(nonce + ciphertext)}` which allows key rotation.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;

use crate::domain::verify_recovery_code;
use crate::errors::AppError;
use crate::repositories::totp_repository::TotpUpdate;
use crate::repositories::{RecoveryCode, TotpRepository, TotpSecret};
use crate::services::EncryptionService;

/// PostgreSQL TOTP repository
pub struct PostgresTotpRepository {
    pool: PgPool,
    encryption: Arc<EncryptionService>,
}

impl PostgresTotpRepository {
    /// Create a new Postgres TOTP repository with encryption at rest.
    pub fn with_encryption(pool: PgPool, encryption: Arc<EncryptionService>) -> Self {
        Self { pool, encryption }
    }

    /// Encrypt a secret before storage.
    fn encrypt_secret(&self, plaintext: &str) -> Result<String, AppError> {
        self.encryption.encrypt(plaintext)
    }

    /// Decrypt a stored secret in canonical encrypted format.
    fn decrypt_secret(&self, stored: &str) -> Result<String, AppError> {
        self.encryption.decrypt(stored)
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
        // Encrypt the secret before storing
        let stored_secret = self.encrypt_secret(secret)?;

        let row: TotpSecretRow = sqlx::query_as(
            r#"
            INSERT INTO totp_secrets (id, user_id, secret, enabled, created_at, enabled_at, last_used_time_step)
            VALUES ($1, $2, $3, FALSE, NOW(), NULL, NULL)
            ON CONFLICT (user_id)
            DO UPDATE SET
                id = EXCLUDED.id,
                secret = EXCLUDED.secret,
                enabled = FALSE,
                created_at = NOW(),
                enabled_at = NULL,
                last_used_time_step = NULL
            WHERE totp_secrets.enabled = FALSE
            RETURNING id, user_id, secret, enabled, created_at, enabled_at, last_used_time_step
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(&stored_secret)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?
        .ok_or_else(|| AppError::Validation("MFA is already enabled".into()))?;

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

    async fn setup_factor(
        &self,
        user_id: Uuid,
        secret: &str,
        hashes: Vec<String>,
    ) -> Result<(), AppError> {
        let encrypted = self.encrypt_secret(secret)?;
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let row = sqlx::query("INSERT INTO totp_secrets (id, user_id, secret, enabled, created_at) VALUES ($1, $2, $3, FALSE, NOW()) ON CONFLICT (user_id) DO UPDATE SET id = EXCLUDED.id, secret = EXCLUDED.secret, enabled = FALSE, created_at = NOW(), enabled_at = NULL, last_used_time_step = NULL WHERE totp_secrets.enabled = FALSE")
            .bind(Uuid::new_v4()).bind(user_id).bind(encrypted).execute(&mut *tx).await.map_err(|e| AppError::Internal(e.into()))?;
        if row.rows_affected() != 1 {
            return Err(AppError::Validation("MFA is already enabled".into()));
        }
        sqlx::query("DELETE FROM totp_recovery_codes WHERE user_id = $1")
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        sqlx::query("INSERT INTO totp_recovery_codes (id, user_id, code_hash, used, created_at) SELECT gen_random_uuid(), $1, UNNEST($2::text[]), FALSE, NOW()")
            .bind(user_id).bind(hashes).execute(&mut *tx).await.map_err(|e| AppError::Internal(e.into()))?;
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn enable_enrollment(
        &self,
        user_id: Uuid,
        enrollment_id: Uuid,
        time_step: i64,
    ) -> Result<bool, AppError> {
        let result = sqlx::query("UPDATE totp_secrets SET enabled = TRUE, enabled_at = NOW(), last_used_time_step = $3 WHERE user_id = $1 AND id = $2 AND enabled = FALSE AND (last_used_time_step IS NULL OR last_used_time_step < $3)")
            .bind(user_id).bind(enrollment_id).bind(time_step).execute(&self.pool).await.map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected() == 1)
    }

    async fn update_enrollment(
        &self,
        user_id: Uuid,
        enrollment_id: Uuid,
        update: TotpUpdate,
    ) -> Result<bool, AppError> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        let step = match &update {
            TotpUpdate::RecordStep(step)
            | TotpUpdate::ReplaceRecoveryCodes {
                time_step: step, ..
            } => Some(*step),
            TotpUpdate::Disable => None,
        };
        let result = sqlx::query("UPDATE totp_secrets SET last_used_time_step = COALESCE($3, last_used_time_step) WHERE user_id = $1 AND id = $2 AND enabled = TRUE AND ($3::bigint IS NULL OR last_used_time_step IS NULL OR last_used_time_step < $3)")
            .bind(user_id).bind(enrollment_id).bind(step).execute(&mut *tx).await.map_err(|e| AppError::Internal(e.into()))?;
        if result.rows_affected() != 1 {
            return Ok(false);
        }
        match update {
            TotpUpdate::RecordStep(_) => {}
            TotpUpdate::ReplaceRecoveryCodes { hashes, .. } => {
                sqlx::query("DELETE FROM totp_recovery_codes WHERE user_id = $1")
                    .bind(user_id)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| AppError::Internal(e.into()))?;
                sqlx::query("INSERT INTO totp_recovery_codes (id, user_id, code_hash, used, created_at) SELECT gen_random_uuid(), $1, UNNEST($2::text[]), FALSE, NOW()")
                    .bind(user_id).bind(hashes).execute(&mut *tx).await.map_err(|e| AppError::Internal(e.into()))?;
            }
            TotpUpdate::Disable => {
                sqlx::query("DELETE FROM totp_recovery_codes WHERE user_id = $1")
                    .bind(user_id)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| AppError::Internal(e.into()))?;
                sqlx::query("DELETE FROM totp_secrets WHERE user_id = $1 AND id = $2")
                    .bind(user_id)
                    .bind(enrollment_id)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| AppError::Internal(e.into()))?;
            }
        }
        tx.commit()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(true)
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

        // Decrypt the secret if present
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
        // Release the connection before Argon2 work. The final conditional
        // UPDATE is the consumption linearization point across all workers.
        let rows: Vec<RecoveryCodeRow> = sqlx::query_as(
            "SELECT id, user_id, code_hash, used, created_at, used_at FROM totp_recovery_codes WHERE user_id = $1 AND used = FALSE",
        ).bind(user_id).fetch_all(&self.pool).await.map_err(|e| AppError::Internal(e.into()))?;
        let code = code.to_owned();
        let matched = crate::services::cpu_work::auth(move || {
            let mut matched = None;
            for row in rows {
                if verify_recovery_code(&code, &row.code_hash) {
                    matched = Some((row.id, row.code_hash));
                }
            }
            Ok(matched)
        })
        .await?;
        let Some((id, hash)) = matched else {
            return Ok(false);
        };
        let result = sqlx::query(
            "UPDATE totp_recovery_codes SET used = TRUE, used_at = NOW() WHERE id = $1 AND user_id = $2 AND code_hash = $3 AND used = FALSE",
        ).bind(id).bind(user_id).bind(hash).execute(&self.pool).await.map_err(|e| AppError::Internal(e.into()))?;
        Ok(result.rows_affected() == 1)
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
