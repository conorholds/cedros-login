//! PostgreSQL user repository implementation

use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

use chrono::{DateTime, Utc};

use crate::errors::AppError;
use crate::models::AuthMethod;
use crate::repositories::{normalize_email, TopReferrerRow, UserEntity, UserRepository};

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
            username: None,
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
            last_login_at: None,
            welcome_completed_at: None,
            referral_code: "TESTCODE".to_string(),
            referred_by: None,
            payout_wallet_address: None,
            kyc_status: "none".to_string(),
            kyc_verified_at: None,
            kyc_expires_at: None,
            accreditation_status: "none".to_string(),
            accreditation_verified_at: None,
            accreditation_expires_at: None,
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
    username: Option<String>,
    picture: Option<String>,
    wallet_address: Option<String>,
    google_id: Option<String>,
    apple_id: Option<String>,
    stripe_customer_id: Option<String>,
    auth_methods: Vec<String>,
    is_system_admin: bool,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
    last_login_at: Option<chrono::DateTime<chrono::Utc>>,
    welcome_completed_at: Option<chrono::DateTime<chrono::Utc>>,
    referral_code: String,
    referred_by: Option<Uuid>,
    payout_wallet_address: Option<String>,
    kyc_status: String,
    kyc_verified_at: Option<chrono::DateTime<chrono::Utc>>,
    kyc_expires_at: Option<chrono::DateTime<chrono::Utc>>,
    accreditation_status: String,
    accreditation_verified_at: Option<chrono::DateTime<chrono::Utc>>,
    accreditation_expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

impl From<UserRow> for UserEntity {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            email_verified: row.email_verified,
            password_hash: row.password_hash,
            name: row.name,
            username: row.username,
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
            last_login_at: row.last_login_at,
            welcome_completed_at: row.welcome_completed_at,
            referral_code: row.referral_code,
            referred_by: row.referred_by,
            payout_wallet_address: row.payout_wallet_address,
            kyc_status: row.kyc_status,
            kyc_verified_at: row.kyc_verified_at,
            kyc_expires_at: row.kyc_expires_at,
            accreditation_status: row.accreditation_status,
            accreditation_verified_at: row.accreditation_verified_at,
            accreditation_expires_at: row.accreditation_expires_at,
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            INSERT INTO users (id, email, email_verified, password_hash, name, username, picture,
                              wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                              created_at, updated_at, last_login_at, welcome_completed_at,
                              referral_code, referred_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id, email, email_verified, password_hash, name, username, picture,
                      wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                      created_at, updated_at, last_login_at, welcome_completed_at,
                      referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
        .bind(&user.stripe_customer_id)
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
                username = $6,
                picture = $7,
                wallet_address = $8,
                google_id = $9,
                apple_id = $10,
                stripe_customer_id = $11,
                auth_methods = $12,
                is_system_admin = $13,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, email_verified, password_hash, name, username, picture,
                      wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                      created_at, updated_at, last_login_at, welcome_completed_at,
                      referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
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

    async fn count_by_auth_methods(
        &self,
    ) -> Result<std::collections::HashMap<String, u64>, AppError> {
        // Use UNNEST to expand the auth_methods array and count occurrences
        let rows: Vec<(String, i64)> = sqlx::query_as(
            r#"
            SELECT method, COUNT(*) as count
            FROM users, UNNEST(auth_methods) AS method
            GROUP BY method
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        let mut counts = std::collections::HashMap::new();
        for (method, count) in rows {
            counts.insert(method, count.max(0) as u64);
        }

        Ok(counts)
    }

    async fn update_last_login(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query("UPDATE users SET last_login_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn set_welcome_completed(&self, id: Uuid) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET welcome_completed_at = NOW(), updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn username_exists(&self, username: &str) -> Result<bool, AppError> {
        let exists: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = LOWER($1))",
        )
        .bind(username)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(exists)
    }

    async fn set_username(&self, id: Uuid, username: &str) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET username = $2, updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .bind(username)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn find_by_referral_code(&self, code: &str) -> Result<Option<UserEntity>, AppError> {
        // Check active codes first; fall back to retired codes in referral_code_history.
        let row: Option<UserRow> = sqlx::query_as(
            r#"
            SELECT u.id, u.email, u.email_verified, u.password_hash, u.name, u.username, u.picture,
                   u.wallet_address, u.google_id, u.apple_id, u.stripe_customer_id, u.auth_methods,
                   u.is_system_admin, u.created_at, u.updated_at, u.last_login_at,
                   u.welcome_completed_at, u.referral_code, u.referred_by, u.payout_wallet_address,
                   u.kyc_status, u.kyc_verified_at, u.kyc_expires_at,
                   u.accreditation_status, u.accreditation_verified_at, u.accreditation_expires_at
            FROM users u WHERE u.referral_code = $1
            UNION ALL
            SELECT u.id, u.email, u.email_verified, u.password_hash, u.name, u.username, u.picture,
                   u.wallet_address, u.google_id, u.apple_id, u.stripe_customer_id, u.auth_methods,
                   u.is_system_admin, u.created_at, u.updated_at, u.last_login_at,
                   u.welcome_completed_at, u.referral_code, u.referred_by, u.payout_wallet_address,
                   u.kyc_status, u.kyc_verified_at, u.kyc_expires_at,
                   u.accreditation_status, u.accreditation_verified_at, u.accreditation_expires_at
            FROM referral_code_history h
            JOIN users u ON u.id = h.user_id
            WHERE h.code = $1
            LIMIT 1
            "#,
        )
        .bind(code)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(row.map(Into::into))
    }

    async fn count_referrals(&self, user_id: Uuid) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE referred_by = $1")
                .bind(user_id)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        Ok(count.max(0) as u64)
    }

    async fn set_payout_wallet_address(
        &self,
        id: Uuid,
        address: Option<&str>,
    ) -> Result<(), AppError> {
        sqlx::query(
            "UPDATE users SET payout_wallet_address = $2, updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .bind(address)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(())
    }

    async fn count_referred(&self) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL")
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    async fn count_referred_since(&self, since: DateTime<Utc>) -> Result<u64, AppError> {
        let count: i64 = sqlx::query_scalar(
            "SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL AND created_at >= $1",
        )
        .bind(since)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    async fn top_referrers(&self, limit: u32) -> Result<Vec<TopReferrerRow>, AppError> {
        #[derive(sqlx::FromRow)]
        struct TopReferrerSqlRow {
            id: Uuid,
            email: Option<String>,
            name: Option<String>,
            referral_code: String,
            referral_count: i64,
        }

        let rows: Vec<TopReferrerSqlRow> = sqlx::query_as(
            r#"
            SELECT u.id, u.email, u.name, u.referral_code, COUNT(r.id) AS referral_count
            FROM users u
            JOIN users r ON r.referred_by = u.id
            GROUP BY u.id, u.email, u.name, u.referral_code
            ORDER BY referral_count DESC
            LIMIT $1
            "#,
        )
        .bind(limit as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows
            .into_iter()
            .map(|r| TopReferrerRow {
                user_id: r.id,
                email: r.email,
                name: r.name,
                referral_code: r.referral_code,
                referral_count: r.referral_count.max(0) as u64,
            })
            .collect())
    }

    async fn regenerate_referral_code(&self, id: Uuid) -> Result<String, AppError> {
        // Fetch the current code so we can archive it.
        let current_code: Option<String> =
            sqlx::query_scalar("SELECT referral_code FROM users WHERE id = $1")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        let old_code = current_code.ok_or_else(|| AppError::NotFound("User not found".into()))?;

        // Retry loop for unique constraint violations on the new code.
        for _ in 0..5 {
            let new_code = crate::repositories::generate_referral_code();
            let result = sqlx::query(
                "UPDATE users SET referral_code = $2, updated_at = NOW() WHERE id = $1",
            )
            .bind(id)
            .bind(&new_code)
            .execute(&self.pool)
            .await;

            match result {
                Ok(r) => {
                    if r.rows_affected() == 0 {
                        return Err(AppError::NotFound("User not found".into()));
                    }
                    // Archive the old code — ignore conflicts (idempotent).
                    let _ = sqlx::query(
                        "INSERT INTO referral_code_history (code, user_id) VALUES ($1, $2) \
                         ON CONFLICT (code) DO NOTHING",
                    )
                    .bind(&old_code)
                    .bind(id)
                    .execute(&self.pool)
                    .await;
                    return Ok(new_code);
                }
                Err(e) => {
                    let err_str = e.to_string();
                    if err_str.contains("unique") || err_str.contains("duplicate") {
                        continue;
                    }
                    return Err(AppError::Internal(e.into()));
                }
            }
        }

        Err(AppError::Internal(anyhow::anyhow!(
            "Failed to generate unique referral code after retries"
        )))
    }

    async fn set_referral_code(&self, id: Uuid, code: &str) -> Result<(), AppError> {
        // Fetch the current code so we can archive it.
        let current_code: Option<String> =
            sqlx::query_scalar("SELECT referral_code FROM users WHERE id = $1")
                .bind(id)
                .fetch_optional(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;

        let old_code = current_code.ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if old_code == code {
            return Ok(());
        }

        // Attempt to set the new code. Unique constraint catches duplicates.
        let result =
            sqlx::query("UPDATE users SET referral_code = $2, updated_at = NOW() WHERE id = $1")
                .bind(id)
                .bind(code)
                .execute(&self.pool)
                .await;

        match result {
            Ok(r) => {
                if r.rows_affected() == 0 {
                    return Err(AppError::NotFound("User not found".into()));
                }
            }
            Err(e) => {
                let err_str = e.to_string();
                if err_str.contains("unique") || err_str.contains("duplicate") {
                    return Err(AppError::Validation("Referral code is already taken".into()));
                }
                return Err(AppError::Internal(e.into()));
            }
        }

        // Archive the old code — ignore conflicts (idempotent).
        let _ = sqlx::query(
            "INSERT INTO referral_code_history (code, user_id) VALUES ($1, $2) \
             ON CONFLICT (code) DO NOTHING",
        )
        .bind(&old_code)
        .bind(id)
        .execute(&self.pool)
        .await;

        Ok(())
    }

    async fn find_referred_by(
        &self,
        referrer_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        const MAX_PAGE_SIZE: u32 = 100;
        const MAX_OFFSET: u32 = 1_000_000;

        let capped_limit = limit.min(MAX_PAGE_SIZE);
        let capped_offset = offset.min(MAX_OFFSET);

        let rows: Vec<UserRow> = sqlx::query_as(
            r#"
            SELECT id, email, email_verified, password_hash, name, username, picture,
                   wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                   created_at, updated_at, last_login_at, welcome_completed_at,
                   referral_code, referred_by, payout_wallet_address,
                   kyc_status, kyc_verified_at, kyc_expires_at,
                   accreditation_status, accreditation_verified_at, accreditation_expires_at
            FROM users
            WHERE referred_by = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            "#,
        )
        .bind(referrer_id)
        .bind(capped_limit as i64)
        .bind(capped_offset as i64)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        Ok(rows.into_iter().map(Into::into).collect())
    }

    async fn count_referred_by(&self, referrer_id: Uuid) -> Result<u64, AppError> {
        let count: i64 =
            sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE referred_by = $1")
                .bind(referrer_id)
                .fetch_one(&self.pool)
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
        Ok(count.max(0) as u64)
    }

    async fn set_kyc_status(
        &self,
        id: Uuid,
        status: &str,
        verified_at: Option<DateTime<Utc>>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET kyc_status = $2, kyc_verified_at = $3, kyc_expires_at = $4, updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .bind(status)
        .bind(verified_at)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }

    async fn set_accreditation_status(
        &self,
        id: Uuid,
        status: &str,
        verified_at: Option<DateTime<Utc>>,
        expires_at: Option<DateTime<Utc>>,
    ) -> Result<(), AppError> {
        let result = sqlx::query(
            "UPDATE users SET accreditation_status = $2, accreditation_verified_at = $3, accreditation_expires_at = $4, updated_at = NOW() WHERE id = $1",
        )
        .bind(id)
        .bind(status)
        .bind(verified_at)
        .bind(expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

        if result.rows_affected() == 0 {
            return Err(AppError::NotFound("User not found".into()));
        }

        Ok(())
    }
}
