//! PostgreSQL email verification as one token + canonical-ledger transaction.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::canonical_email_repository::integrity_error;
use crate::repositories::{
    EmailVerificationOutcome, EmailVerificationRepository, TokenType, UserEmailEntity, UserEntity,
};

use super::user_repository::UserRow;

pub struct PostgresEmailVerificationRepository {
    pool: PgPool,
}

impl PostgresEmailVerificationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct TokenRow {
    id: Uuid,
    user_id: Uuid,
    token_type: String,
    subject_id: Option<Uuid>,
}

#[derive(Clone, sqlx::FromRow)]
struct EmailRow {
    id: Uuid,
    user_id: Uuid,
    email: String,
    verified_at: Option<DateTime<Utc>>,
    is_primary: bool,
    created_at: DateTime<Utc>,
}

#[async_trait]
impl EmailVerificationRepository for PostgresEmailVerificationRepository {
    async fn claim_unverified_primary(
        &self,
        expected: &UserEntity,
        email_id: Uuid,
        password_hash: Option<&str>,
    ) -> Result<UserEntity, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let mut user = lock_user(&mut tx, expected.id).await?;
        let rows = lock_email_rows(&mut tx, user.id).await?;
        if user.updated_at != expected.updated_at
            || user.email_verified
            || checked_primary(&user, &rows)?.id != email_id
        {
            return Err(invalid_subject());
        }
        user.reset_unverified_credentials();
        user.password_hash = password_hash.map(ToString::to_string);
        mark_email_verified(&mut tx, email_id).await?;
        mark_user_verified(&mut tx, &user, true).await?;
        sqlx::query("DELETE FROM verification_tokens WHERE user_id=$1")
            .bind(user.id)
            .execute(&mut *tx)
            .await
            .map_err(db)?;
        user.email_verified = true;
        user.updated_at = sqlx::query_scalar("SELECT updated_at FROM users WHERE id=$1")
            .bind(user.id)
            .fetch_one(&mut *tx)
            .await
            .map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(user)
    }

    async fn verify_email_token(
        &self,
        token_hash: &str,
        expected_types: &[TokenType],
    ) -> Result<Option<EmailVerificationOutcome>, AppError> {
        if expected_types.is_empty() {
            return Ok(None);
        }
        let mut tx = self.pool.begin().await.map_err(db)?;
        let Some(token) = lock_token(&mut tx, token_hash, expected_types, false).await? else {
            return Ok(None);
        };
        let mut user = lock_user(&mut tx, token.user_id).await?;
        let rows = lock_email_rows(&mut tx, token.user_id).await?;
        let Some(token) = lock_token(&mut tx, token_hash, expected_types, true).await? else {
            return Ok(None);
        };
        let primary = checked_primary(&user, &rows)?;
        let target_id = token_target(&token, primary.id)?;
        let target = rows
            .iter()
            .find(|row| row.id == target_id && row.user_id == token.user_id)
            .cloned()
            .ok_or_else(invalid_subject)?;
        let verified = mark_email_verified(&mut tx, target.id).await?;
        let credentials_reset = verified.is_primary && user.reset_unverified_credentials();
        if verified.is_primary {
            mark_user_verified(&mut tx, &user, credentials_reset).await?;
        }
        if credentials_reset {
            sqlx::query("DELETE FROM verification_tokens WHERE user_id=$1 AND id <> $2")
                .bind(user.id)
                .bind(token.id)
                .execute(&mut *tx)
                .await
                .map_err(db)?;
        }
        consume_locked_token(&mut tx, token.id, expected_types).await?;
        tx.commit().await.map_err(db)?;
        Ok(Some(EmailVerificationOutcome {
            email: verified.into(),
            credentials_reset,
        }))
    }
}

async fn lock_token(
    tx: &mut Transaction<'_, Postgres>,
    token_hash: &str,
    expected_types: &[TokenType],
    lock: bool,
) -> Result<Option<TokenRow>, AppError> {
    let expected = token_type_names(expected_types);
    let mut query = String::from(
        r#"SELECT id, user_id, token_type, subject_id
           FROM verification_tokens
           WHERE token_hash = $1 AND token_type = ANY($2::text[])
             AND used_at IS NULL AND expires_at > NOW()
           "#,
    );
    if lock {
        query.push_str(" FOR UPDATE");
    }
    sqlx::query_as(&query)
        .bind(token_hash)
        .bind(expected)
        .fetch_optional(&mut **tx)
        .await
        .map_err(db)
}

fn token_type_names(expected: &[TokenType]) -> Vec<String> {
    expected
        .iter()
        .map(|kind| kind.as_str().to_string())
        .collect()
}

async fn lock_user(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
) -> Result<UserEntity, AppError> {
    let row: UserRow = sqlx::query_as(
        r#"SELECT id, email, email_verified, password_hash, name, username, picture,
                  wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                  created_at, updated_at, last_login_at, welcome_completed_at,
                  referral_code, referred_by
           FROM users WHERE id = $1 FOR UPDATE"#,
    )
    .bind(user_id)
    .fetch_optional(&mut **tx)
    .await
    .map_err(db)?
    .ok_or_else(invalid_subject)?;
    Ok(row.into())
}

async fn lock_email_rows(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
) -> Result<Vec<EmailRow>, AppError> {
    sqlx::query_as(
        r#"SELECT id, user_id, email, verified_at, is_primary, created_at
           FROM user_emails WHERE user_id = $1 ORDER BY created_at FOR UPDATE"#,
    )
    .bind(user_id)
    .fetch_all(&mut **tx)
    .await
    .map_err(db)
}

fn checked_primary<'a>(user: &UserEntity, rows: &'a [EmailRow]) -> Result<&'a EmailRow, AppError> {
    let primary: Vec<_> = rows.iter().filter(|row| row.is_primary).collect();
    match (user.email.as_deref(), primary.as_slice()) {
        (Some(email), [row])
            if row.email == email && row.verified_at.is_some() == user.email_verified =>
        {
            Ok(row)
        }
        _ => Err(integrity_error(
            user.id,
            "invalid primary during email verification",
        )),
    }
}

fn token_target(token: &TokenRow, primary_id: Uuid) -> Result<Uuid, AppError> {
    match TokenType::from_str(&token.token_type) {
        Some(TokenType::EmailVerify) if token.subject_id == Some(primary_id) => Ok(primary_id),
        Some(TokenType::AccountEmailVerify) => token.subject_id.ok_or_else(invalid_subject),
        _ => Err(invalid_subject()),
    }
}

async fn mark_email_verified(
    tx: &mut Transaction<'_, Postgres>,
    id: Uuid,
) -> Result<EmailRow, AppError> {
    sqlx::query_as(
        r#"UPDATE user_emails SET verified_at = COALESCE(verified_at, NOW())
           WHERE id = $1
           RETURNING id, user_id, email, verified_at, is_primary, created_at"#,
    )
    .bind(id)
    .fetch_one(&mut **tx)
    .await
    .map_err(db)
}

async fn mark_user_verified(
    tx: &mut Transaction<'_, Postgres>,
    user: &UserEntity,
    credentials_reset: bool,
) -> Result<(), AppError> {
    let auth_methods: Vec<String> = user.auth_methods.iter().map(ToString::to_string).collect();
    sqlx::query(
        r#"UPDATE users
           SET email_verified = true,
               password_hash = $2,
               wallet_address = $3,
               google_id = $4,
               apple_id = $5,
               auth_methods = $6,
               updated_at = NOW()
           WHERE id = $1"#,
    )
    .bind(user.id)
    .bind(&user.password_hash)
    .bind(&user.wallet_address)
    .bind(&user.google_id)
    .bind(&user.apple_id)
    .bind(auth_methods)
    .execute(&mut **tx)
    .await
    .map_err(db)?;
    if credentials_reset {
        sqlx::query("DELETE FROM api_keys WHERE user_id = $1")
            .bind(user.id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
        sqlx::query("DELETE FROM user_emails WHERE user_id = $1 AND is_primary = false")
            .bind(user.id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
        sqlx::query("DELETE FROM webauthn_credentials WHERE user_id = $1")
            .bind(user.id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
        sqlx::query("DELETE FROM user_credentials WHERE user_id = $1")
            .bind(user.id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
        sqlx::query("DELETE FROM totp_recovery_codes WHERE user_id = $1")
            .bind(user.id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
        sqlx::query("DELETE FROM totp_secrets WHERE user_id = $1")
            .bind(user.id)
            .execute(&mut **tx)
            .await
            .map_err(db)?;
        sqlx::query(
            "UPDATE sessions SET revoked_at = NOW(), revoked_reason = 'email_ownership_claim' WHERE user_id = $1 AND revoked_at IS NULL",
        )
        .bind(user.id)
        .execute(&mut **tx)
        .await
        .map_err(db)?;
    }
    Ok(())
}

async fn consume_locked_token(
    tx: &mut Transaction<'_, Postgres>,
    token_id: Uuid,
    expected_types: &[TokenType],
) -> Result<(), AppError> {
    let expected = token_type_names(expected_types);
    let result = sqlx::query(
        r#"UPDATE verification_tokens SET used_at = NOW()
           WHERE id = $1 AND token_type = ANY($2::text[])
             AND used_at IS NULL AND expires_at > NOW()"#,
    )
    .bind(token_id)
    .bind(expected)
    .execute(&mut **tx)
    .await
    .map_err(db)?;
    if result.rows_affected() == 1 {
        Ok(())
    } else {
        Err(AppError::Validation("Invalid or expired token".into()))
    }
}

impl From<EmailRow> for UserEmailEntity {
    fn from(row: EmailRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            email: row.email,
            verified_at: row.verified_at,
            is_primary: row.is_primary,
            created_at: row.created_at,
        }
    }
}

fn invalid_subject() -> AppError {
    AppError::Validation("Invalid token subject".into())
}

fn db(error: sqlx::Error) -> AppError {
    AppError::Database(error.to_string())
}
