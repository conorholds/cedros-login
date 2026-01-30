//! PostgreSQL user repository implementation

use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::AuthMethod;
use crate::repositories::{normalize_email, UserEntity, UserRepository};

/// PostgreSQL user repository
pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    /// Create a new Postgres user repository
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_auth_methods_roundtrip() {
        let row = UserRow {
            id: Uuid::new_v4(),
            email: Some("test@example.com".to_string()),
            email_verified: true,
            password_hash: Some("hash".to_string()),
            name: Some("Test".to_string()),
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![
                "email".to_string(),
                "webauthn".to_string(),
                "sso".to_string(),
            ],
            is_system_admin: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let entity: UserEntity = row.into();
        assert!(entity.auth_methods.contains(&AuthMethod::Email));
        assert!(entity.auth_methods.contains(&AuthMethod::WebAuthn));
        assert!(entity.auth_methods.contains(&AuthMethod::Sso));
    }
}

/// Row type for user queries
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
    auth_methods: Vec<String>,
    is_system_admin: bool,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
}

impl From<UserRow> for UserEntity {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            email_verified: row.email_verified,
            password_hash: row.password_hash,
            name: row.name,
            picture: row.picture,
            wallet_address: row.wallet_address,
            google_id: row.google_id,
            apple_id: row.apple_id,
            stripe_customer_id: row.stripe_customer_id,
            auth_methods: row
                .auth_methods
                .into_iter()
                .filter_map(|m| match m.as_str() {
                    "email" => Some(AuthMethod::Email),
                    "google" => Some(AuthMethod::Google),
                    "solana" => Some(AuthMethod::Solana),
                    "apple" => Some(AuthMethod::Apple),
                    "webauthn" => Some(AuthMethod::WebAuthn),
                    "sso" => Some(AuthMethod::Sso),
                    _ => None,
                })
                .collect(),
            is_system_admin: row.is_system_admin,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }
    }
}

fn auth_methods_to_strings(methods: &[AuthMethod]) -> Vec<String> {
    methods
        .iter()
        .map(|m| match m {
            AuthMethod::Email => "email".to_string(),
            AuthMethod::Google => "google".to_string(),
            AuthMethod::Apple => "apple".to_string(),
            AuthMethod::Solana => "solana".to_string(),
            AuthMethod::WebAuthn => "webauthn".to_string(),
            AuthMethod::Sso => "sso".to_string(),
        })
        .collect()
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, AppError> {
        // SEC-09: Normalize email with NFKC + lowercase before querying
        // M-06: Use direct equality (not LOWER()) since normalize_email() already lowercases
        // and emails are stored normalized. This allows index usage on the email column.
        let email_normalized = normalize_email(email);

        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users WHERE email = $1
            "#,
        )
        .bind(&email_normalized)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_wallet(&self, wallet: &str) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users WHERE wallet_address = $1
            "#,
        )
        .bind(wallet)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_google_id(&self, google_id: &str) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users WHERE google_id = $1
            "#,
        )
        .bind(google_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_apple_id(&self, apple_id: &str) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users WHERE apple_id = $1
            "#,
        )
        .bind(apple_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn find_by_stripe_customer_id(
        &self,
        stripe_customer_id: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users WHERE stripe_customer_id = $1
            "#,
        )
        .bind(stripe_customer_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn create(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        let auth_methods = auth_methods_to_strings(&user.auth_methods);

        let row: UserRow = sqlx::query_as(
            r#"
            INSERT INTO users (id, email, email_verified, password_hash, name, picture,
                              wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                              created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id, email, email_verified, password_hash, name, picture,
                      wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                      created_at, updated_at
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
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn update(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        let auth_methods = auth_methods_to_strings(&user.auth_methods);

        // BUG-003: Include updated_at = NOW() to fix audit trail
        let row: UserRow = sqlx::query_as(
            r#"
            UPDATE users SET
                email = $2,
                email_verified = $3,
                password_hash = $4,
                name = $5,
                picture = $6,
                wallet_address = $7,
                google_id = $8,
                apple_id = $9,
                stripe_customer_id = $10,
                auth_methods = $11,
                is_system_admin = $12,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, email_verified, password_hash, name, picture,
                      wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                      created_at, updated_at
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
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.into())
    }

    async fn email_exists(&self, email: &str) -> Result<bool, AppError> {
        // SEC-09: Normalize email with NFKC + lowercase before querying
        // PERF-01: Use direct equality (not LOWER()) since normalize_email() already lowercases
        // and emails are stored normalized. This allows index usage on the email column.
        let email_normalized = normalize_email(email);

        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
                .bind(&email_normalized)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    async fn wallet_exists(&self, wallet: &str) -> Result<bool, AppError> {
        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE wallet_address = $1)")
                .bind(wallet)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    async fn set_email_verified(&self, id: Uuid, verified: bool) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE users SET email_verified = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(verified)
                .execute(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn update_password(&self, id: Uuid, password_hash: &str) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(password_hash)
                .execute(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<UserEntity>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        // L-01: Cap offset to prevent wasted DB resources with absurd values
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count(&self) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
            .fetch_one(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn set_system_admin(&self, id: Uuid, is_admin: bool) -> Result<(), AppError> {
        let result =
            sqlx::query("UPDATE users SET is_system_admin = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(is_admin)
                .execute(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn set_stripe_customer_id(
        &self,
        id: Uuid,
        stripe_customer_id: &str,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET stripe_customer_id = $2, updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .bind(stripe_customer_id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn count_system_admins(&self) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE is_system_admin = true")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }
}
