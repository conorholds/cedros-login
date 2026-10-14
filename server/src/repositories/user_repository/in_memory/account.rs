//! Account state, lifecycle, and aggregate operations.

use chrono::{DateTime, Utc};
use std::collections::HashMap;
use uuid::Uuid;

use super::InMemoryUserRepository;
use crate::errors::AppError;
use crate::models::AuthMethod;
use crate::repositories::user_repository::{normalize_email, UserEntity};

struct RemovedIdentity {
    email: Option<String>,
    wallet: Option<String>,
    google_id: Option<String>,
    apple_id: Option<String>,
    referral_code: String,
}

impl InMemoryUserRepository {
    pub(super) async fn set_email_verified_impl(
        &self,
        id: Uuid,
        verified: bool,
    ) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.email_verified = verified;
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    pub(super) async fn update_password_impl(
        &self,
        id: Uuid,
        password_hash: &str,
    ) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.password_hash = Some(password_hash.to_string());
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    pub(super) async fn list_all_impl(
        &self,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError> {
        const MAX_PAGE_SIZE: u32 = 100;
        let capped_limit = limit.min(MAX_PAGE_SIZE);

        let users = self.users.read().await;
        let mut all_users: Vec<_> = users.values().cloned().collect();
        all_users.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(all_users
            .into_iter()
            .skip(offset as usize)
            .take(capped_limit as usize)
            .collect())
    }

    pub(super) async fn count_impl(&self) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users.len() as u64)
    }

    pub(super) async fn set_system_admin_impl(
        &self,
        id: Uuid,
        is_admin: bool,
    ) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if !is_admin {
            super::guard_admin_removal(&users, id)?;
        }
        if let Some(user) = users.get_mut(&id) {
            user.is_system_admin = is_admin;
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    pub(super) async fn count_system_admins_impl(&self) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users.values().filter(|user| user.is_system_admin).count() as u64)
    }

    pub(super) async fn anonymize_for_deletion_impl(
        &self,
        id: Uuid,
        replacement_referral_code: &str,
    ) -> Result<UserEntity, AppError> {
        let mut users = self.users.write().await;
        super::guard_admin_removal(&users, id)?;
        let user = users
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        self.anonymize_locked_user(user, replacement_referral_code)
            .await;
        Ok(user.clone())
    }

    /// Caller holds the users write lock, including while releasing indexes.
    pub(crate) async fn anonymize_locked_user(
        &self,
        user: &mut UserEntity,
        replacement_referral_code: &str,
    ) {
        let removed = Self::anonymize_user(user, replacement_referral_code);
        self.remove_anonymized_indexes(user.id, replacement_referral_code, removed)
            .await;
    }

    fn anonymize_user(user: &mut UserEntity, replacement_referral_code: &str) -> RemovedIdentity {
        let removed = RemovedIdentity {
            email: user.email.take(),
            wallet: user.wallet_address.take(),
            google_id: user.google_id.take(),
            apple_id: user.apple_id.take(),
            referral_code: user.referral_code.clone(),
        };
        user.email_verified = false;
        user.password_hash = None;
        user.name = Some("Deleted Account".to_string());
        user.username = None;
        user.picture = None;
        user.auth_methods.clear();
        user.is_system_admin = false;
        user.updated_at = Utc::now();
        user.last_login_at = None;
        user.welcome_completed_at = None;
        user.referral_code = replacement_referral_code.to_string();
        user.referred_by = None;
        removed
    }

    async fn remove_anonymized_indexes(
        &self,
        id: Uuid,
        replacement_referral_code: &str,
        removed: RemovedIdentity,
    ) {
        if let Some(email) = removed.email {
            self.email_index
                .write()
                .await
                .remove(&normalize_email(&email));
        }
        if let Some(wallet) = removed.wallet {
            self.wallet_index.write().await.remove(&wallet);
        }
        if let Some(google_id) = removed.google_id {
            self.google_id_index.write().await.remove(&google_id);
        }
        if let Some(apple_id) = removed.apple_id {
            self.apple_id_index.write().await.remove(&apple_id);
        }
        let mut referral_index = self.referral_code_index.write().await;
        referral_index.remove(&removed.referral_code);
        referral_index.insert(replacement_referral_code.to_string(), id);
    }

    pub(super) async fn count_by_auth_methods_impl(
        &self,
    ) -> Result<HashMap<String, u64>, AppError> {
        let users = self.users.read().await;
        let mut counts = HashMap::new();

        for user in users.values() {
            for method in &user.auth_methods {
                let method_name = match method {
                    AuthMethod::Email => "email",
                    AuthMethod::Google => "google",
                    AuthMethod::Apple => "apple",
                    AuthMethod::Solana => "solana",
                    AuthMethod::WebAuthn => "webauthn",
                    AuthMethod::Sso => "sso",
                };
                *counts.entry(method_name.to_string()).or_insert(0) += 1;
            }
        }
        Ok(counts)
    }

    pub(super) async fn update_last_login_impl(&self, id: Uuid) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            let now = Utc::now();
            user.last_login_at = Some(now);
            user.updated_at = now;
        }
        Ok(())
    }

    pub(super) async fn set_welcome_completed_impl(&self, id: Uuid) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.welcome_completed_at = Some(Utc::now());
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    pub(super) async fn username_exists_impl(&self, username: &str) -> Result<bool, AppError> {
        let lower = username.to_lowercase();
        let users = self.users.read().await;
        Ok(users
            .values()
            .any(|user| user.username.as_deref().map(str::to_lowercase) == Some(lower.clone())))
    }

    pub(super) async fn set_username_impl(&self, id: Uuid, username: &str) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.username = Some(username.to_string());
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    pub(super) async fn count_non_admin_created_since_impl(
        &self,
        since: DateTime<Utc>,
    ) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users
            .values()
            .filter(|user| !user.is_system_admin && user.created_at >= since)
            .count() as u64)
    }
}
