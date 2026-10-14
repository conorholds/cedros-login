//! PostgreSQL canonical-email transitions using one real transaction.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::canonical_email_repository::integrity_error;
use crate::repositories::{AdminCanonicalEmailUpdate, CanonicalEmailRepository, UserEntity};

use super::user_repository::UserRow;

pub struct PostgresCanonicalEmailRepository {
    pool: PgPool,
}

impl PostgresCanonicalEmailRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(Clone, sqlx::FromRow)]
struct EmailRow {
    id: Uuid,
    email: String,
    verified_at: Option<DateTime<Utc>>,
    is_primary: bool,
}

#[async_trait]
impl CanonicalEmailRepository for PostgresCanonicalEmailRepository {
    async fn admin_update(
        &self,
        update: AdminCanonicalEmailUpdate,
    ) -> Result<UserEntity, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let user = lock_user(&mut tx, update.user_id).await?;
        if update.email.is_none() && update.email_verified.is_none() {
            let updated = update_name(&mut tx, user, update.name).await?;
            tx.commit().await.map_err(db)?;
            return Ok(updated);
        }

        let rows = lock_email_rows(&mut tx, update.user_id).await?;
        checked_primary(&user, &rows)?;
        let target = update
            .email
            .as_deref()
            .or(user.email.as_deref())
            .ok_or_else(|| AppError::Validation("User has no canonical email".into()))?;
        lock_target(&mut tx, target).await?;
        ensure_available(&mut tx, user.id, target).await?;
        let existing = rows.iter().find(|row| row.email == target);
        let verified = update
            .email_verified
            .unwrap_or_else(|| existing.is_some_and(|row| row.verified_at.is_some()));
        upsert_primary(&mut tx, user.id, existing, target, verified).await?;
        let updated = update_user(&mut tx, user.id, target, verified, update.name).await?;
        tx.commit().await.map_err(db)?;
        Ok(updated)
    }

    async fn promote(&self, user_id: Uuid, email_id: Uuid) -> Result<UserEntity, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let user = lock_user(&mut tx, user_id).await?;
        let rows = lock_email_rows(&mut tx, user_id).await?;
        checked_primary(&user, &rows)?;
        let target = rows
            .iter()
            .find(|row| row.id == email_id)
            .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        if target.verified_at.is_none() {
            return Err(AppError::Validation(
                "Primary email must be verified".into(),
            ));
        }
        set_primary(&mut tx, user_id, email_id).await?;
        let updated = update_user(&mut tx, user_id, &target.email, true, None).await?;
        tx.commit().await.map_err(db)?;
        Ok(updated)
    }
}

async fn lock_user(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
) -> Result<UserEntity, AppError> {
    let row: Option<UserRow> = sqlx::query_as(
        r#"SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE id = $1 FOR UPDATE"#,
    )
    .bind(user_id)
    .fetch_optional(&mut **tx)
    .await
    .map_err(db)?;
    row.map(Into::into)
        .ok_or_else(|| AppError::NotFound("User not found".into()))
}

async fn lock_email_rows(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
) -> Result<Vec<EmailRow>, AppError> {
    sqlx::query_as(
        r#"SELECT id, email, verified_at, is_primary
           FROM user_emails WHERE user_id = $1 ORDER BY created_at FOR UPDATE"#,
    )
    .bind(user_id)
    .fetch_all(&mut **tx)
    .await
    .map_err(db)
}

fn checked_primary(user: &UserEntity, rows: &[EmailRow]) -> Result<(), AppError> {
    let primary: Vec<_> = rows.iter().filter(|row| row.is_primary).collect();
    match (user.email.as_deref(), primary.as_slice()) {
        (None, []) => Ok(()),
        (Some(email), [row])
            if row.email == email && row.verified_at.is_some() == user.email_verified =>
        {
            Ok(())
        }
        (Some(_), []) => Err(integrity_error(user.id, "missing primary email row")),
        (_, [row]) if user.email.as_deref() != Some(row.email.as_str()) => Err(integrity_error(
            user.id,
            "primary email does not match user",
        )),
        (Some(_), [_, ..]) if primary.len() > 1 => {
            Err(integrity_error(user.id, "multiple primary email rows"))
        }
        (Some(_), [_]) => Err(integrity_error(
            user.id,
            "primary verification does not match user",
        )),
        (None, [_]) | (None, [_, ..]) => Err(integrity_error(
            user.id,
            "primary exists without user email",
        )),
        _ => Err(integrity_error(user.id, "ambiguous canonical email state")),
    }
}

async fn lock_target(tx: &mut Transaction<'_, Postgres>, target: &str) -> Result<(), AppError> {
    sqlx::query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))")
        .bind(target)
        .execute(&mut **tx)
        .await
        .map_err(db)?;
    Ok(())
}

async fn ensure_available(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    target: &str,
) -> Result<(), AppError> {
    let owner: Option<Uuid> = sqlx::query_scalar(
        r#"SELECT user_id FROM user_emails WHERE email = $1
           UNION ALL SELECT id FROM users WHERE email = $1 LIMIT 1"#,
    )
    .bind(target)
    .fetch_optional(&mut **tx)
    .await
    .map_err(db)?;
    if owner.is_some_and(|owner| owner != user_id) {
        return Err(AppError::EmailExists);
    }
    Ok(())
}

async fn upsert_primary(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    existing: Option<&EmailRow>,
    email: &str,
    verified: bool,
) -> Result<(), AppError> {
    sqlx::query("UPDATE user_emails SET is_primary = false WHERE user_id = $1")
        .bind(user_id)
        .execute(&mut **tx)
        .await
        .map_err(db)?;
    match existing {
        Some(row) => update_primary_row(tx, row.id, verified).await,
        None => insert_primary_row(tx, user_id, email, verified).await,
    }
}

async fn update_primary_row(
    tx: &mut Transaction<'_, Postgres>,
    id: Uuid,
    verified: bool,
) -> Result<(), AppError> {
    sqlx::query(
        "UPDATE user_emails SET is_primary = true, verified_at = CASE WHEN $2 THEN COALESCE(verified_at, NOW()) ELSE NULL END WHERE id = $1",
    )
    .bind(id)
    .bind(verified)
    .execute(&mut **tx)
    .await
    .map_err(db)?;
    Ok(())
}

async fn insert_primary_row(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    email: &str,
    verified: bool,
) -> Result<(), AppError> {
    sqlx::query(
        r#"INSERT INTO user_emails (id, user_id, email, verified_at, is_primary, created_at)
           VALUES ($1, $2, $3, CASE WHEN $4 THEN NOW() ELSE NULL END, true, NOW())"#,
    )
    .bind(Uuid::new_v4())
    .bind(user_id)
    .bind(email)
    .bind(verified)
    .execute(&mut **tx)
    .await
    .map_err(map_write_error)?;
    Ok(())
}

async fn set_primary(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    email_id: Uuid,
) -> Result<(), AppError> {
    sqlx::query("UPDATE user_emails SET is_primary = (id = $2) WHERE user_id = $1")
        .bind(user_id)
        .bind(email_id)
        .execute(&mut **tx)
        .await
        .map_err(db)?;
    Ok(())
}

async fn update_user(
    tx: &mut Transaction<'_, Postgres>,
    user_id: Uuid,
    email: &str,
    verified: bool,
    name: Option<String>,
) -> Result<UserEntity, AppError> {
    let row: UserRow = sqlx::query_as(
        r#"UPDATE users SET email = $2, email_verified = $3,
                   name = COALESCE($4, name), updated_at = NOW()
           WHERE id = $1
           RETURNING id, email, email_verified, password_hash, name, username, picture,
                     wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                     created_at, updated_at, last_login_at, welcome_completed_at,
                     referral_code, referred_by"#,
    )
    .bind(user_id)
    .bind(email)
    .bind(verified)
    .bind(name)
    .fetch_one(&mut **tx)
    .await
    .map_err(map_write_error)?;
    Ok(row.into())
}

async fn update_name(
    tx: &mut Transaction<'_, Postgres>,
    user: UserEntity,
    name: Option<String>,
) -> Result<UserEntity, AppError> {
    let Some(name) = name else { return Ok(user) };
    let row: UserRow = sqlx::query_as(
        r#"UPDATE users SET name = $2, updated_at = NOW() WHERE id = $1
           RETURNING id, email, email_verified, password_hash, name, username, picture,
                     wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                     created_at, updated_at, last_login_at, welcome_completed_at,
                     referral_code, referred_by"#,
    )
    .bind(user.id)
    .bind(name)
    .fetch_one(&mut **tx)
    .await
    .map_err(db)?;
    Ok(row.into())
}

fn db(error: sqlx::Error) -> AppError {
    AppError::Database(error.to_string())
}

fn map_write_error(error: sqlx::Error) -> AppError {
    if error
        .as_database_error()
        .and_then(|db| db.code())
        .as_deref()
        == Some("23505")
    {
        AppError::EmailExists
    } else {
        db(error)
    }
}
