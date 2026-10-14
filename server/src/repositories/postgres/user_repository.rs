//! PostgreSQL user repository implementation.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use std::collections::HashMap;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{TopReferrerRow, UserEntity, UserRepository};

mod account;
mod identity;
mod referrals;
mod row;

pub(super) use row::UserRow;

/// PostgreSQL user repository.
pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    /// Create a new PostgreSQL user repository.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepository for PostgresUserRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEntity>, AppError> {
        self.find_by_id_query(id).await
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_email_query(email).await
    }

    async fn find_by_wallet(&self, wallet: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_wallet_query(wallet).await
    }

    async fn find_by_google_id(&self, google_id: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_google_id_query(google_id).await
    }

    async fn find_by_apple_id(&self, apple_id: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_apple_id_query(apple_id).await
    }

    async fn create(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        self.create_query(user).await
    }

    async fn update(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        self.update_query(user, None).await
    }

    async fn update_if_current(
        &self,
        user: UserEntity,
        expected_updated_at: chrono::DateTime<chrono::Utc>,
    ) -> Result<UserEntity, AppError> {
        self.update_query(user, Some(expected_updated_at)).await
    }

    async fn email_exists(&self, email: &str) -> Result<bool, AppError> {
        self.email_exists_query(email).await
    }

    async fn wallet_exists(&self, wallet: &str) -> Result<bool, AppError> {
        self.wallet_exists_query(wallet).await
    }

    async fn set_email_verified(&self, id: Uuid, verified: bool) -> Result<(), AppError> {
        self.set_email_verified_query(id, verified).await
    }

    async fn update_password(&self, id: Uuid, password_hash: &str) -> Result<(), AppError> {
        self.update_password_query(id, password_hash).await
    }

    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<UserEntity>, AppError> {
        self.list_all_query(limit, offset).await
    }

    async fn count(&self) -> Result<u64, AppError> {
        self.count_query().await
    }

    async fn set_system_admin(&self, id: Uuid, is_admin: bool) -> Result<(), AppError> {
        self.set_system_admin_query(id, is_admin).await
    }

    async fn count_system_admins(&self) -> Result<u64, AppError> {
        self.count_system_admins_query().await
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        self.delete_query(id).await
    }

    async fn anonymize_for_deletion(
        &self,
        id: Uuid,
        replacement_referral_code: &str,
    ) -> Result<UserEntity, AppError> {
        self.anonymize_for_deletion_query(id, replacement_referral_code)
            .await
    }

    async fn count_by_auth_methods(&self) -> Result<HashMap<String, u64>, AppError> {
        self.count_by_auth_methods_query().await
    }

    async fn update_last_login(&self, id: Uuid) -> Result<(), AppError> {
        self.update_last_login_query(id).await
    }

    async fn set_welcome_completed(&self, id: Uuid) -> Result<(), AppError> {
        self.set_welcome_completed_query(id).await
    }

    async fn username_exists(&self, username: &str) -> Result<bool, AppError> {
        self.username_exists_query(username).await
    }

    async fn set_username(&self, id: Uuid, username: &str) -> Result<(), AppError> {
        self.set_username_query(id, username).await
    }

    async fn find_by_referral_code(&self, code: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_referral_code_query(code).await
    }

    async fn count_referrals(&self, user_id: Uuid) -> Result<u64, AppError> {
        self.count_referrals_query(user_id).await
    }

    async fn count_referred(&self) -> Result<u64, AppError> {
        self.count_referred_query().await
    }

    async fn count_referred_since(&self, since: DateTime<Utc>) -> Result<u64, AppError> {
        self.count_referred_since_query(since).await
    }

    async fn top_referrers(&self, limit: u32) -> Result<Vec<TopReferrerRow>, AppError> {
        self.top_referrers_query(limit).await
    }

    async fn regenerate_referral_code(&self, id: Uuid) -> Result<String, AppError> {
        self.regenerate_referral_code_query(id).await
    }

    async fn set_referral_code(&self, id: Uuid, code: &str) -> Result<(), AppError> {
        self.set_referral_code_query(id, code).await
    }

    async fn find_referred_by(
        &self,
        referrer_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        self.find_referred_by_query(referrer_id, limit, offset)
            .await
    }

    async fn count_referred_by(&self, referrer_id: Uuid) -> Result<u64, AppError> {
        self.count_referred_by_query(referrer_id).await
    }

    async fn count_non_admin_created_since(&self, since: DateTime<Utc>) -> Result<u64, AppError> {
        self.count_non_admin_created_since_query(since).await
    }

    async fn initialize_signup_limit_usage(
        &self,
        period: &str,
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        self.initialize_signup_limit_usage_query(period, period_start, period_end)
            .await
    }
}

/// Serialize administrator removal across demotion and deletion transactions.
pub(super) async fn guard_admin_removal(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    user_id: Uuid,
) -> Result<(), AppError> {
    sqlx::query(
        "SELECT pg_advisory_xact_lock(hashtextextended('cedros-login:system-admin-removal', 0))",
    )
    .execute(&mut **tx)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;
    let last: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE id=$1 AND is_system_admin) AND (SELECT COUNT(*) FROM users WHERE is_system_admin) <= 1")
        .bind(user_id).fetch_one(&mut **tx).await.map_err(|e| AppError::Internal(e.into()))?;
    if last {
        return Err(AppError::Validation(
            "Cannot remove the last system administrator".into(),
        ));
    }
    Ok(())
}
