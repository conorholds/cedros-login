//! In-memory [`UserRepository`] implementation.
//!
//! The operation modules keep identity indexes, account state, and referral
//! behavior separate while this module owns the public repository shape and
//! trait delegation.

mod account;
mod identity;
mod referrals;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::{TopReferrerRow, UserEntity, UserRepository};
use crate::errors::AppError;

/// In-memory user repository for development/testing.
///
/// See the parent module documentation for lock ordering requirements.
pub struct InMemoryUserRepository {
    /// Primary storage - acquire FIRST when needing both locks.
    pub(crate) users: RwLock<HashMap<Uuid, UserEntity>>,
    /// Email index - acquire SECOND when needing both locks.
    pub(crate) email_index: RwLock<HashMap<String, Uuid>>,
    /// Secondary indexes for O(1) OAuth/wallet lookups.
    wallet_index: RwLock<HashMap<String, Uuid>>,
    google_id_index: RwLock<HashMap<String, Uuid>>,
    apple_id_index: RwLock<HashMap<String, Uuid>>,
    /// Referral code index for O(1) lookup.
    referral_code_index: RwLock<HashMap<String, Uuid>>,
}

impl InMemoryUserRepository {
    pub fn new() -> Self {
        Self {
            users: RwLock::new(HashMap::new()),
            email_index: RwLock::new(HashMap::new()),
            wallet_index: RwLock::new(HashMap::new()),
            google_id_index: RwLock::new(HashMap::new()),
            apple_id_index: RwLock::new(HashMap::new()),
            referral_code_index: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryUserRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl UserRepository for InMemoryUserRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEntity>, AppError> {
        self.find_by_id_impl(id).await
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_email_impl(email).await
    }

    async fn find_by_wallet(&self, wallet: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_wallet_impl(wallet).await
    }

    async fn find_by_google_id(&self, google_id: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_google_id_impl(google_id).await
    }

    async fn find_by_apple_id(&self, apple_id: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_apple_id_impl(apple_id).await
    }

    async fn create(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        self.create_impl(user).await
    }

    async fn update(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        self.update_impl(user, None).await
    }

    async fn update_if_current(
        &self,
        user: UserEntity,
        expected_updated_at: DateTime<Utc>,
    ) -> Result<UserEntity, AppError> {
        self.update_impl(user, Some(expected_updated_at)).await
    }

    async fn email_exists(&self, email: &str) -> Result<bool, AppError> {
        Ok(self.find_by_email_impl(email).await?.is_some())
    }

    async fn wallet_exists(&self, wallet: &str) -> Result<bool, AppError> {
        Ok(self.find_by_wallet_impl(wallet).await?.is_some())
    }

    async fn set_email_verified(&self, id: Uuid, verified: bool) -> Result<(), AppError> {
        self.set_email_verified_impl(id, verified).await
    }

    async fn update_password(&self, id: Uuid, password_hash: &str) -> Result<(), AppError> {
        self.update_password_impl(id, password_hash).await
    }

    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<UserEntity>, AppError> {
        self.list_all_impl(limit, offset).await
    }

    async fn count(&self) -> Result<u64, AppError> {
        self.count_impl().await
    }

    async fn set_system_admin(&self, id: Uuid, is_admin: bool) -> Result<(), AppError> {
        self.set_system_admin_impl(id, is_admin).await
    }

    async fn count_system_admins(&self) -> Result<u64, AppError> {
        self.count_system_admins_impl().await
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        self.delete_impl(id).await
    }

    async fn anonymize_for_deletion(
        &self,
        id: Uuid,
        replacement_referral_code: &str,
    ) -> Result<UserEntity, AppError> {
        self.anonymize_for_deletion_impl(id, replacement_referral_code)
            .await
    }

    async fn count_by_auth_methods(&self) -> Result<HashMap<String, u64>, AppError> {
        self.count_by_auth_methods_impl().await
    }

    async fn update_last_login(&self, id: Uuid) -> Result<(), AppError> {
        self.update_last_login_impl(id).await
    }

    async fn set_welcome_completed(&self, id: Uuid) -> Result<(), AppError> {
        self.set_welcome_completed_impl(id).await
    }

    async fn username_exists(&self, username: &str) -> Result<bool, AppError> {
        self.username_exists_impl(username).await
    }

    async fn set_username(&self, id: Uuid, username: &str) -> Result<(), AppError> {
        self.set_username_impl(id, username).await
    }

    async fn find_by_referral_code(&self, code: &str) -> Result<Option<UserEntity>, AppError> {
        self.find_by_referral_code_impl(code).await
    }

    async fn count_referrals(&self, user_id: Uuid) -> Result<u64, AppError> {
        self.count_referrals_impl(user_id).await
    }

    async fn regenerate_referral_code(&self, id: Uuid) -> Result<String, AppError> {
        self.regenerate_referral_code_impl(id).await
    }

    async fn set_referral_code(&self, id: Uuid, code: &str) -> Result<(), AppError> {
        self.set_referral_code_impl(id, code).await
    }

    async fn count_referred(&self) -> Result<u64, AppError> {
        self.count_referred_impl().await
    }

    async fn count_referred_since(&self, since: DateTime<Utc>) -> Result<u64, AppError> {
        self.count_referred_since_impl(since).await
    }

    async fn top_referrers(&self, limit: u32) -> Result<Vec<TopReferrerRow>, AppError> {
        self.top_referrers_impl(limit).await
    }

    async fn find_referred_by(
        &self,
        referrer_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        self.find_referred_by_impl(referrer_id, limit, offset).await
    }

    async fn count_referred_by(&self, referrer_id: Uuid) -> Result<u64, AppError> {
        self.count_referred_by_impl(referrer_id).await
    }

    async fn count_non_admin_created_since(&self, since: DateTime<Utc>) -> Result<u64, AppError> {
        self.count_non_admin_created_since_impl(since).await
    }

    async fn initialize_signup_limit_usage(
        &self,
        _period: &str,
        period_start: DateTime<Utc>,
        _period_end: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        self.count_non_admin_created_since_impl(period_start).await
    }
}

pub(crate) fn guard_admin_removal(
    users: &std::collections::HashMap<Uuid, UserEntity>,
    id: Uuid,
) -> Result<(), AppError> {
    if users.get(&id).is_some_and(|user| user.is_system_admin)
        && users.values().filter(|user| user.is_system_admin).count() <= 1
    {
        return Err(AppError::Validation(
            "Cannot remove the last system administrator".into(),
        ));
    }
    Ok(())
}
