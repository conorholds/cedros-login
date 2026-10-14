//! Identity lookup and secondary-index maintenance.

use uuid::Uuid;

use super::InMemoryUserRepository;
use crate::errors::AppError;
use crate::repositories::user_repository::{normalize_email, UserEntity};

impl InMemoryUserRepository {
    pub(super) async fn find_by_id_impl(&self, id: Uuid) -> Result<Option<UserEntity>, AppError> {
        let users = self.users.read().await;
        Ok(users.get(&id).cloned())
    }

    pub(super) async fn find_by_email_impl(
        &self,
        email: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let email_normalized = normalize_email(email);
        let email_index = self.email_index.read().await;
        let user_id = match email_index.get(&email_normalized) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(email_index);

        let users = self.users.read().await;
        Ok(users
            .get(&user_id)
            .filter(|user| {
                user.email.as_deref().map(normalize_email).as_deref()
                    == Some(email_normalized.as_str())
            })
            .cloned())
    }

    pub(super) async fn find_by_wallet_impl(
        &self,
        wallet: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let wallet_index = self.wallet_index.read().await;
        let user_id = match wallet_index.get(wallet) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(wallet_index);

        let users = self.users.read().await;
        Ok(users
            .get(&user_id)
            .filter(|user| user.wallet_address.as_deref() == Some(wallet))
            .cloned())
    }

    pub(super) async fn find_by_google_id_impl(
        &self,
        google_id: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let google_id_index = self.google_id_index.read().await;
        let user_id = match google_id_index.get(google_id) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(google_id_index);

        let users = self.users.read().await;
        Ok(users
            .get(&user_id)
            .filter(|user| user.google_id.as_deref() == Some(google_id))
            .cloned())
    }

    pub(super) async fn find_by_apple_id_impl(
        &self,
        apple_id: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        let apple_id_index = self.apple_id_index.read().await;
        let user_id = match apple_id_index.get(apple_id) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(apple_id_index);

        let users = self.users.read().await;
        Ok(users
            .get(&user_id)
            .filter(|user| user.apple_id.as_deref() == Some(apple_id))
            .cloned())
    }

    /// Caller holds the primary user lock during an atomic mailbox claim.
    pub(crate) async fn clear_credential_indexes(&self, user_id: Uuid) {
        self.wallet_index
            .write()
            .await
            .retain(|_, owner| *owner != user_id);
        self.google_id_index
            .write()
            .await
            .retain(|_, owner| *owner != user_id);
        self.apple_id_index
            .write()
            .await
            .retain(|_, owner| *owner != user_id);
    }

    pub(super) async fn create_impl(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        let mut users = self.users.write().await;
        if users.contains_key(&user.id) {
            return Err(AppError::Validation("User already exists".into()));
        }
        ensure_unique_identity(&users, &user)?;

        if let Some(ref email) = user.email {
            let mut email_index = self.email_index.write().await;
            email_index.insert(normalize_email(email), user.id);
        }
        if let Some(ref wallet) = user.wallet_address {
            let mut wallet_index = self.wallet_index.write().await;
            wallet_index.insert(wallet.clone(), user.id);
        }
        if let Some(ref google_id) = user.google_id {
            let mut google_id_index = self.google_id_index.write().await;
            google_id_index.insert(google_id.clone(), user.id);
        }
        if let Some(ref apple_id) = user.apple_id {
            let mut apple_id_index = self.apple_id_index.write().await;
            apple_id_index.insert(apple_id.clone(), user.id);
        }
        {
            let mut referral_index = self.referral_code_index.write().await;
            referral_index.insert(user.referral_code.clone(), user.id);
        }

        users.insert(user.id, user.clone());
        Ok(user)
    }

    pub(super) async fn update_impl(
        &self,
        mut user: UserEntity,
        expected: Option<chrono::DateTime<chrono::Utc>>,
    ) -> Result<UserEntity, AppError> {
        let mut users = self.users.write().await;
        let current = users
            .get(&user.id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        if current.is_deleted() {
            return Err(AppError::InvalidToken);
        }
        // Privilege changes use set_system_admin; stale profile snapshots cannot restore them.
        user.is_system_admin = current.is_system_admin;
        ensure_unique_identity(&users, &user)?;
        if let Some(expected) = expected {
            if !users
                .get(&user.id)
                .is_some_and(|current| current.updated_at == expected)
            {
                return Err(AppError::InvalidToken);
            }
            user.updated_at = chrono::Utc::now();
        }
        let mut email_index = self.email_index.write().await;

        if let Some(old_user) = users.get(&user.id) {
            if let Some(ref old_email) = old_user.email {
                let old_normalized = normalize_email(old_email);
                let new_normalized = user.email.as_ref().map(|email| normalize_email(email));
                if new_normalized.as_ref() != Some(&old_normalized) {
                    email_index.remove(&old_normalized);
                }
            }
        }
        if let Some(ref email) = user.email {
            email_index.insert(normalize_email(email), user.id);
        }

        if let Some(old_user) = users.get(&user.id) {
            self.update_wallet_index(old_user, &user).await;
            self.update_google_id_index(old_user, &user).await;
            self.update_apple_id_index(old_user, &user).await;
        }

        users.insert(user.id, user.clone());
        Ok(user)
    }

    async fn update_wallet_index(&self, old_user: &UserEntity, user: &UserEntity) {
        if old_user.wallet_address == user.wallet_address {
            return;
        }
        let mut index = self.wallet_index.write().await;
        if let Some(ref old_wallet) = old_user.wallet_address {
            index.remove(old_wallet);
        }
        if let Some(ref new_wallet) = user.wallet_address {
            index.insert(new_wallet.clone(), user.id);
        }
    }

    async fn update_google_id_index(&self, old_user: &UserEntity, user: &UserEntity) {
        if old_user.google_id == user.google_id {
            return;
        }
        let mut index = self.google_id_index.write().await;
        if let Some(ref old_google_id) = old_user.google_id {
            index.remove(old_google_id);
        }
        if let Some(ref new_google_id) = user.google_id {
            index.insert(new_google_id.clone(), user.id);
        }
    }

    async fn update_apple_id_index(&self, old_user: &UserEntity, user: &UserEntity) {
        if old_user.apple_id == user.apple_id {
            return;
        }
        let mut index = self.apple_id_index.write().await;
        if let Some(ref old_apple_id) = old_user.apple_id {
            index.remove(old_apple_id);
        }
        if let Some(ref new_apple_id) = user.apple_id {
            index.insert(new_apple_id.clone(), user.id);
        }
    }

    pub(super) async fn delete_impl(&self, id: Uuid) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        super::guard_admin_removal(&users, id)?;
        let user = users
            .remove(&id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if let Some(ref email) = user.email {
            self.email_index
                .write()
                .await
                .remove(&normalize_email(email));
        }
        if let Some(ref wallet) = user.wallet_address {
            self.wallet_index.write().await.remove(wallet);
        }
        if let Some(ref google_id) = user.google_id {
            self.google_id_index.write().await.remove(google_id);
        }
        if let Some(ref apple_id) = user.apple_id {
            self.apple_id_index.write().await.remove(apple_id);
        }
        self.referral_code_index
            .write()
            .await
            .remove(&user.referral_code);

        Ok(())
    }
}

fn ensure_unique_identity(
    users: &std::collections::HashMap<Uuid, UserEntity>,
    user: &UserEntity,
) -> Result<(), AppError> {
    for other in users.values().filter(|other| other.id != user.id) {
        if user.email.as_deref().is_some_and(|email| {
            other
                .email
                .as_deref()
                .is_some_and(|value| normalize_email(email) == normalize_email(value))
        }) {
            return Err(AppError::EmailExists);
        }
        if user.wallet_address.is_some() && user.wallet_address == other.wallet_address {
            return Err(AppError::WalletExists);
        }
        if (user.google_id.is_some() && user.google_id == other.google_id)
            || (user.apple_id.is_some() && user.apple_id == other.apple_id)
        {
            return Err(AppError::OAuthAccountExists);
        }
    }
    Ok(())
}
