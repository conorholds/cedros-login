use uuid::Uuid;

use super::row::{auth_methods_to_strings, UserRow};
use super::PostgresUserRepository;
use crate::errors::AppError;
use crate::repositories::{normalize_email, UserEntity};

impl PostgresUserRepository {
    pub(super) async fn find_by_id_query(&self, id: Uuid) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    pub(super) async fn find_by_email_query(
        &self,
        email: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        // Normalize email with NFKC + lowercase before querying
        // Use direct equality (not LOWER()) since normalize_email() already lowercases
        // and emails are stored normalized. This allows index usage on the email column.
        let email_normalized = normalize_email(email);

        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE email = $1
            "#,
        )
        .bind(&email_normalized)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    pub(super) async fn find_by_wallet_query(
        &self,
        wallet: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE wallet_address = $1
            "#,
        )
        .bind(wallet)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    pub(super) async fn find_by_google_id_query(
        &self,
        google_id: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE google_id = $1
            "#,
        )
        .bind(google_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    pub(super) async fn find_by_apple_id_query(
        &self,
        apple_id: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            FROM users WHERE apple_id = $1
            "#,
        )
        .bind(apple_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    pub(super) async fn create_query(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        let auth_methods = auth_methods_to_strings(&user.auth_methods);

        let row: UserRow = sqlx::query_as(
            r#"
            INSERT INTO users (id, email, email_verified, password_hash, name, username, picture,
                              wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                              created_at, updated_at, last_login_at, welcome_completed_at,
                              referral_code, referred_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING id, email, email_verified, password_hash, name, username, picture,
                      wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                      created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            "#,
        )
        .bind(user.id)
        .bind(&user.email)
        .bind(user.email_verified)
        .bind(&user.password_hash)
        .bind(&user.name)
        .bind(&user.username)
        .bind(&user.picture)
        .bind(&user.wallet_address)
        .bind(&user.google_id)
        .bind(&user.apple_id)
        .bind(&auth_methods)
        .bind(user.is_system_admin)
        .bind(user.created_at)
        .bind(user.updated_at)
        .bind(user.last_login_at)
        .bind(user.welcome_completed_at)
        .bind(&user.referral_code)
        .bind(user.referred_by)
        .fetch_one(&self.pool)
        .await
        .map_err(crate::errors::map_user_insert_error)?;

        Ok(row.into())
    }

    pub(super) async fn update_query(
        &self,
        user: UserEntity,
        expected: Option<chrono::DateTime<chrono::Utc>>,
    ) -> Result<UserEntity, AppError> {
        let auth_methods = auth_methods_to_strings(&user.auth_methods);

        // Bump `updated_at` on every mutation so the audit trail reflects the change.
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            UPDATE users SET
                email = $2,
                email_verified = $3,
                password_hash = $4,
                name = $5,
                username = $6,
                picture = $7,
                wallet_address = $8,
                google_id = $9,
                apple_id = $10,
                auth_methods = $11,
                updated_at = NOW()
            WHERE id = $1 AND ($12::timestamptz IS NULL OR updated_at = $12)
              AND NOT (cardinality(auth_methods) = 0 AND email IS NULL
                       AND password_hash IS NULL AND wallet_address IS NULL
                       AND google_id IS NULL AND apple_id IS NULL
                       AND name IS NOT DISTINCT FROM 'Deleted Account')
            RETURNING id, email, email_verified, password_hash, name, username, picture,
                      wallet_address, google_id, apple_id, auth_methods, is_system_admin,
                      created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by
            "#,
        )
        .bind(user.id)
        .bind(&user.email)
        .bind(user.email_verified)
        .bind(&user.password_hash)
        .bind(&user.name)
        .bind(&user.username)
        .bind(&user.picture)
        .bind(&user.wallet_address)
        .bind(&user.google_id)
        .bind(&user.apple_id)
        .bind(&auth_methods)
        .bind(expected)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        row.map(Into::into).ok_or(AppError::InvalidToken)
    }
}
