use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::user_email_repository::{
    UserEmailEntity, UserEmailRepository, PENDING_EMAIL_EXPIRY_HOURS,
};

pub struct PostgresUserEmailRepository {
    pool: PgPool,
}

impl PostgresUserEmailRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(sqlx::FromRow)]
struct UserEmailRow {
    id: Uuid,
    user_id: Uuid,
    email: String,
    verified_at: Option<DateTime<Utc>>,
    is_primary: bool,
    created_at: DateTime<Utc>,
}

impl From<UserEmailRow> for UserEmailEntity {
    fn from(row: UserEmailRow) -> Self {
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

#[async_trait]
impl UserEmailRepository for PostgresUserEmailRepository {
    async fn create(&self, email: UserEmailEntity) -> Result<UserEmailEntity, AppError> {
        self.delete_expired_unverified().await?;
        let mut tx = self.pool.begin().await.map_err(db)?;
        if email.is_primary {
            sqlx::query("UPDATE user_emails SET is_primary = false WHERE user_id = $1")
                .bind(email.user_id)
                .execute(&mut *tx)
                .await
                .map_err(db)?;
        }
        let row: UserEmailRow = sqlx::query_as(
            r#"
            INSERT INTO user_emails
                (id, user_id, email, verified_at, is_primary, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, email, verified_at, is_primary, created_at
            "#,
        )
        .bind(email.id)
        .bind(email.user_id)
        .bind(&email.email)
        .bind(email.verified_at)
        .bind(email.is_primary)
        .bind(email.created_at)
        .fetch_one(&mut *tx)
        .await
        .map_err(|err| {
            if is_unique_violation(&err) {
                AppError::EmailExists
            } else {
                db(err)
            }
        })?;
        tx.commit().await.map_err(db)?;
        Ok(row.into())
    }

    async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<UserEmailEntity>, AppError> {
        self.delete_expired_unverified().await?;
        let rows: Vec<UserEmailRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, email, verified_at, is_primary, created_at
            FROM user_emails
            WHERE user_id = $1
            ORDER BY is_primary DESC, created_at ASC
            "#,
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(db)?;
        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEmailEntity>, AppError> {
        self.delete_expired_unverified().await?;
        let row: Option<UserEmailRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, email, verified_at, is_primary, created_at
            FROM user_emails
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(db)?;
        Ok(row.map(Into::into))
    }

    async fn find_active_by_email(&self, email: &str) -> Result<Option<UserEmailEntity>, AppError> {
        self.delete_expired_unverified().await?;
        let row: Option<UserEmailRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, email, verified_at, is_primary, created_at
            FROM user_emails
            WHERE email = $1
            "#,
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(db)?;
        Ok(row.map(Into::into))
    }

    async fn find_verified_by_email(
        &self,
        email: &str,
    ) -> Result<Option<UserEmailEntity>, AppError> {
        let row: Option<UserEmailRow> = sqlx::query_as(
            r#"
            SELECT id, user_id, email, verified_at, is_primary, created_at
            FROM user_emails
            WHERE email = $1 AND verified_at IS NOT NULL
            "#,
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(db)?;
        Ok(row.map(Into::into))
    }

    async fn email_blocks_signup(&self, email: &str) -> Result<bool, AppError> {
        Ok(self.find_active_by_email(email).await?.is_some())
    }

    async fn mark_verified(&self, id: Uuid) -> Result<UserEmailEntity, AppError> {
        let row: UserEmailRow = sqlx::query_as(
            r#"
            UPDATE user_emails
            SET verified_at = COALESCE(verified_at, NOW())
            WHERE id = $1
            RETURNING id, user_id, email, verified_at, is_primary, created_at
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(db)?
        .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        Ok(row.into())
    }

    async fn set_primary(&self, user_id: Uuid, id: Uuid) -> Result<UserEmailEntity, AppError> {
        let mut tx = self.pool.begin().await.map_err(db)?;
        let target: UserEmailRow = sqlx::query_as(
            r#"
            SELECT id, user_id, email, verified_at, is_primary, created_at
            FROM user_emails
            WHERE id = $1 AND user_id = $2
            "#,
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(db)?
        .ok_or_else(|| AppError::NotFound("Email not found".into()))?;
        if target.verified_at.is_none() {
            return Err(AppError::Validation(
                "Primary email must be verified".into(),
            ));
        }
        sqlx::query("UPDATE user_emails SET is_primary = false WHERE user_id = $1")
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(db)?;
        let row: UserEmailRow = sqlx::query_as(
            r#"
            UPDATE user_emails
            SET is_primary = true
            WHERE id = $1
            RETURNING id, user_id, email, verified_at, is_primary, created_at
            "#,
        )
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db)?;
        tx.commit().await.map_err(db)?;
        Ok(row.into())
    }

    async fn delete(&self, id: Uuid) -> Result<UserEmailEntity, AppError> {
        let row: UserEmailRow = sqlx::query_as(
            r#"
            DELETE FROM user_emails
            WHERE id = $1 AND is_primary = false
            RETURNING id, user_id, email, verified_at, is_primary, created_at
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(db)?
        .ok_or_else(|| AppError::Validation("Primary email cannot be removed".into()))?;
        Ok(row.into())
    }

    async fn delete_secondary_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let result =
            sqlx::query("DELETE FROM user_emails WHERE user_id = $1 AND is_primary = false")
                .bind(user_id)
                .execute(&self.pool)
                .await
                .map_err(db)?;
        Ok(result.rows_affected())
    }

    async fn delete_expired_unverified(&self) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            DELETE FROM user_emails
            WHERE verified_at IS NULL
              AND is_primary = false
              AND created_at < NOW() - make_interval(hours => $1)
            "#,
        )
        .bind(PENDING_EMAIL_EXPIRY_HOURS as i32)
        .execute(&self.pool)
        .await
        .map_err(db)?;
        Ok(result.rows_affected())
    }
}

fn db(err: sqlx::Error) -> AppError {
    AppError::Database(err.to_string())
}

fn is_unique_violation(err: &sqlx::Error) -> bool {
    err.as_database_error().and_then(|db| db.code()).as_deref() == Some("23505")
}
