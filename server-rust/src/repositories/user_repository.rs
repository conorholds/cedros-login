//! User repository trait and implementations
//!
//! # Lock Ordering (R-12/PERF-01)
//!
//! The `InMemoryUserRepository` uses separate `RwLock`s for performance:
//! - `users`: Primary storage for user entities by ID
//! - `email_index`: Secondary index for O(1) email lookups
//! - `wallet_index`: Secondary index for O(1) wallet lookups (PERF-01)
//! - `google_id_index`: Secondary index for O(1) Google ID lookups (PERF-01)
//! - `apple_id_index`: Secondary index for O(1) Apple ID lookups (PERF-01)
//! - `stripe_customer_id_index`: Secondary index for O(1) Stripe customer lookups (PERF-01)
//!
//! ## Deadlock Prevention
//!
//! To prevent deadlocks, locks MUST be acquired in a consistent order:
//!
//! 1. **Canonical order**: `users` → `email_index` → other indexes
//!
//! 2. **Methods acquiring multiple locks** (write operations):
//!    - `create()`: Acquires `users` write, then index writes sequentially
//!    - `update()`: Acquires `users` write, then index writes sequentially
//!
//! 3. **Methods acquiring single lock** (read operations):
//!    - `find_by_id()`: Only `users` read
//!    - `find_by_email()`: Acquires `email_index` read, drops it, then `users` read
//!    - `find_by_wallet()`: Acquires `wallet_index` read, drops it, then `users` read
//!    - `find_by_google_id()`: Acquires `google_id_index` read, drops it, then `users` read
//!    - `find_by_apple_id()`: Acquires `apple_id_index` read, drops it, then `users` read
//!    - `set_email_verified()`, `update_password()`, `set_system_admin()`: Only `users` write
//!
//! ## Adding New Methods
//!
//! When adding methods that need both locks:
//! - Always acquire `users` first, then indexes
//! - Or acquire locks sequentially (release first before acquiring second)
//! - Document the lock pattern in the method

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use unicode_normalization::UnicodeNormalization;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::AuthMethod;

/// Normalize an email address for consistent lookups.
///
/// # SEC-09: Email Normalization
///
/// Applies Unicode NFKC normalization followed by ASCII lowercasing to ensure
/// that visually similar email addresses are treated as equivalent.
///
/// ## Why NFKC?
///
/// Unicode allows multiple representations of the same character:
/// - U+0041 (LATIN CAPITAL LETTER A) vs U+FF21 (FULLWIDTH LATIN CAPITAL LETTER A)
/// - U+00E9 (LATIN SMALL LETTER E WITH ACUTE) vs U+0065 U+0301 (e + combining acute)
///
/// Without normalization, `user@example.com` and `user＠example.com` (fullwidth @)
/// could create separate accounts for the same logical email address.
///
/// NFKC (Compatibility Decomposition, followed by Canonical Composition) is preferred
/// because it also normalizes compatibility characters like fullwidth forms.
///
/// ## Plus-addressing Note
///
/// This function intentionally does NOT strip plus-addressing (e.g., `user+tag@gmail.com`).
/// While some providers (Gmail) deliver `user+tag@gmail.com` to `user@gmail.com`, this
/// behavior is provider-specific and not universally supported. Stripping plus-addresses
/// would incorrectly merge accounts for providers that treat them as distinct.
///
/// If you want to prevent plus-address abuse, consider rate-limiting registrations
/// per base email at the application level rather than normalizing in storage.
pub fn normalize_email(email: &str) -> String {
    email.nfkc().collect::<String>().to_lowercase()
}

/// User entity for storage
#[derive(Debug, Clone)]
pub struct UserEntity {
    pub id: Uuid,
    pub email: Option<String>,
    pub email_verified: bool,
    pub password_hash: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
    pub wallet_address: Option<String>,
    pub google_id: Option<String>,
    pub apple_id: Option<String>,
    pub stripe_customer_id: Option<String>,
    pub auth_methods: Vec<AuthMethod>,
    pub is_system_admin: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl UserEntity {
    /// Create a new user with email/password
    pub fn new_email_user(email: String, password_hash: String, name: Option<String>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            email: Some(normalize_email(&email)),
            email_verified: false,
            password_hash: Some(password_hash),
            name,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![AuthMethod::Email],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
        }
    }
}

/// User repository trait
#[async_trait]
pub trait UserRepository: Send + Sync {
    /// Find user by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<UserEntity>, AppError>;

    /// Find user by email
    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, AppError>;

    /// Find user by wallet address
    async fn find_by_wallet(&self, wallet: &str) -> Result<Option<UserEntity>, AppError>;

    /// Find user by Google ID
    async fn find_by_google_id(&self, google_id: &str) -> Result<Option<UserEntity>, AppError>;

    /// Find user by Apple ID
    async fn find_by_apple_id(&self, apple_id: &str) -> Result<Option<UserEntity>, AppError>;

    /// Find user by Stripe customer ID
    async fn find_by_stripe_customer_id(
        &self,
        stripe_customer_id: &str,
    ) -> Result<Option<UserEntity>, AppError>;

    /// Create a new user
    async fn create(&self, user: UserEntity) -> Result<UserEntity, AppError>;

    /// Update an existing user
    async fn update(&self, user: UserEntity) -> Result<UserEntity, AppError>;

    /// Check if email exists
    async fn email_exists(&self, email: &str) -> Result<bool, AppError>;

    /// Check if wallet exists
    async fn wallet_exists(&self, wallet: &str) -> Result<bool, AppError>;

    /// Set email verified status
    async fn set_email_verified(&self, id: Uuid, verified: bool) -> Result<(), AppError>;

    /// Update user password
    async fn update_password(&self, id: Uuid, password_hash: &str) -> Result<(), AppError>;

    /// List all users (for system admin)
    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<UserEntity>, AppError>;

    /// Count total users
    async fn count(&self) -> Result<u64, AppError>;

    /// Set system admin status
    async fn set_system_admin(&self, id: Uuid, is_admin: bool) -> Result<(), AppError>;

    /// Set Stripe customer ID on a user
    ///
    /// Must be unique when present.
    async fn set_stripe_customer_id(
        &self,
        id: Uuid,
        stripe_customer_id: &str,
    ) -> Result<(), AppError>;

    /// Count system admins (for bootstrap check)
    async fn count_system_admins(&self) -> Result<u64, AppError>;

    /// Delete a user by ID
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}

/// In-memory user repository for development/testing
///
/// See module-level documentation for lock ordering requirements.
pub struct InMemoryUserRepository {
    /// Primary storage - acquire FIRST when needing both locks
    users: RwLock<HashMap<Uuid, UserEntity>>,
    /// Email index - acquire SECOND when needing both locks
    email_index: RwLock<HashMap<String, Uuid>>,
    /// PERF-01: Secondary indexes for O(1) OAuth/wallet lookups
    wallet_index: RwLock<HashMap<String, Uuid>>,
    google_id_index: RwLock<HashMap<String, Uuid>>,
    apple_id_index: RwLock<HashMap<String, Uuid>>,
    stripe_customer_id_index: RwLock<HashMap<String, Uuid>>,
}

impl InMemoryUserRepository {
    pub fn new() -> Self {
        Self {
            users: RwLock::new(HashMap::new()),
            email_index: RwLock::new(HashMap::new()),
            wallet_index: RwLock::new(HashMap::new()),
            google_id_index: RwLock::new(HashMap::new()),
            apple_id_index: RwLock::new(HashMap::new()),
            stripe_customer_id_index: RwLock::new(HashMap::new()),
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
        let users = self.users.read().await;
        Ok(users.get(&id).cloned())
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<UserEntity>, AppError> {
        // SEC-09: Use NFKC normalization + lowercase
        let email_normalized = normalize_email(email);

        // Use email index for O(1) lookup
        let email_index = self.email_index.read().await;

        let user_id = match email_index.get(&email_normalized) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(email_index); // Release lock before acquiring users lock

        let users = self.users.read().await;
        Ok(users.get(&user_id).cloned())
    }

    async fn find_by_wallet(&self, wallet: &str) -> Result<Option<UserEntity>, AppError> {
        // PERF-01: Use wallet_index for O(1) lookup
        let wallet_index = self.wallet_index.read().await;
        let user_id = match wallet_index.get(wallet) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(wallet_index);

        let users = self.users.read().await;
        Ok(users.get(&user_id).cloned())
    }

    async fn find_by_google_id(&self, google_id: &str) -> Result<Option<UserEntity>, AppError> {
        // PERF-01: Use google_id_index for O(1) lookup
        let google_id_index = self.google_id_index.read().await;
        let user_id = match google_id_index.get(google_id) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(google_id_index);

        let users = self.users.read().await;
        Ok(users.get(&user_id).cloned())
    }

    async fn find_by_apple_id(&self, apple_id: &str) -> Result<Option<UserEntity>, AppError> {
        // PERF-01: Use apple_id_index for O(1) lookup
        let apple_id_index = self.apple_id_index.read().await;
        let user_id = match apple_id_index.get(apple_id) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(apple_id_index);

        let users = self.users.read().await;
        Ok(users.get(&user_id).cloned())
    }

    async fn find_by_stripe_customer_id(
        &self,
        stripe_customer_id: &str,
    ) -> Result<Option<UserEntity>, AppError> {
        // PERF-01: Use stripe_customer_id_index for O(1) lookup
        let stripe_index = self.stripe_customer_id_index.read().await;
        let user_id = match stripe_index.get(stripe_customer_id) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(stripe_index);

        let users = self.users.read().await;
        Ok(users.get(&user_id).cloned())
    }

    async fn create(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        let mut users = self.users.write().await;

        // Update email index if user has an email
        // SEC-09: Use NFKC normalization + lowercase
        if let Some(ref email) = user.email {
            let mut email_index = self.email_index.write().await;
            email_index.insert(normalize_email(email), user.id);
        }

        // PERF-01: Maintain secondary indexes
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

        if let Some(ref stripe_customer_id) = user.stripe_customer_id {
            let mut stripe_index = self.stripe_customer_id_index.write().await;
            stripe_index.insert(stripe_customer_id.clone(), user.id);
        }

        users.insert(user.id, user.clone());
        Ok(user)
    }

    async fn update(&self, user: UserEntity) -> Result<UserEntity, AppError> {
        let mut users = self.users.write().await;

        // Update email index if email changed
        // SEC-09: Use NFKC normalization + lowercase
        let mut email_index = self.email_index.write().await;

        // Remove old email from index if it exists and differs
        if let Some(old_user) = users.get(&user.id) {
            if let Some(ref old_email) = old_user.email {
                let old_normalized = normalize_email(old_email);
                let new_normalized = user.email.as_ref().map(|e| normalize_email(e));
                if new_normalized.as_ref() != Some(&old_normalized) {
                    email_index.remove(&old_normalized);
                }
            }
        }

        // Add new email to index
        if let Some(ref email) = user.email {
            email_index.insert(normalize_email(email), user.id);
        }

        // PERF-01: Update secondary indexes if values changed
        if let Some(old_user) = users.get(&user.id) {
            // Wallet index
            if old_user.wallet_address != user.wallet_address {
                let mut wallet_index = self.wallet_index.write().await;
                if let Some(ref old_wallet) = old_user.wallet_address {
                    wallet_index.remove(old_wallet);
                }
                if let Some(ref new_wallet) = user.wallet_address {
                    wallet_index.insert(new_wallet.clone(), user.id);
                }
            }
            // Google ID index
            if old_user.google_id != user.google_id {
                let mut google_id_index = self.google_id_index.write().await;
                if let Some(ref old_google_id) = old_user.google_id {
                    google_id_index.remove(old_google_id);
                }
                if let Some(ref new_google_id) = user.google_id {
                    google_id_index.insert(new_google_id.clone(), user.id);
                }
            }
            // Apple ID index
            if old_user.apple_id != user.apple_id {
                let mut apple_id_index = self.apple_id_index.write().await;
                if let Some(ref old_apple_id) = old_user.apple_id {
                    apple_id_index.remove(old_apple_id);
                }
                if let Some(ref new_apple_id) = user.apple_id {
                    apple_id_index.insert(new_apple_id.clone(), user.id);
                }
            }

            // Stripe customer ID index
            if old_user.stripe_customer_id != user.stripe_customer_id {
                let mut stripe_index = self.stripe_customer_id_index.write().await;
                if let Some(ref old_scid) = old_user.stripe_customer_id {
                    stripe_index.remove(old_scid);
                }
                if let Some(ref new_scid) = user.stripe_customer_id {
                    stripe_index.insert(new_scid.clone(), user.id);
                }
            }
        }

        users.insert(user.id, user.clone());
        Ok(user)
    }

    async fn email_exists(&self, email: &str) -> Result<bool, AppError> {
        Ok(self.find_by_email(email).await?.is_some())
    }

    async fn wallet_exists(&self, wallet: &str) -> Result<bool, AppError> {
        Ok(self.find_by_wallet(wallet).await?.is_some())
    }

    async fn set_email_verified(&self, id: Uuid, verified: bool) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.email_verified = verified;
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    async fn update_password(&self, id: Uuid, password_hash: &str) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.password_hash = Some(password_hash.to_string());
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    async fn list_all(&self, limit: u32, offset: u32) -> Result<Vec<UserEntity>, AppError> {
        // Cap page size to prevent DoS via large limit values
        const MAX_PAGE_SIZE: u32 = 100;
        let capped_limit = limit.min(MAX_PAGE_SIZE);

        let users = self.users.read().await;
        let mut all_users: Vec<_> = users.values().cloned().collect();
        all_users.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(all_users
            .into_iter()
            .skip(offset as usize)
            .take(capped_limit as usize)
            .collect())
    }

    async fn count(&self) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users.len() as u64)
    }

    async fn set_system_admin(&self, id: Uuid, is_admin: bool) -> Result<(), AppError> {
        let mut users = self.users.write().await;
        if let Some(user) = users.get_mut(&id) {
            user.is_system_admin = is_admin;
            user.updated_at = Utc::now();
        }
        Ok(())
    }

    async fn set_stripe_customer_id(
        &self,
        id: Uuid,
        stripe_customer_id: &str,
    ) -> Result<(), AppError> {
        // LOCK-ORDER: users -> stripe_customer_id_index
        let mut users = self.users.write().await;
        let user = users
            .get_mut(&id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if user
            .stripe_customer_id
            .as_deref()
            .map(|v| v == stripe_customer_id)
            .unwrap_or(false)
        {
            return Ok(());
        }

        let mut stripe_index = self.stripe_customer_id_index.write().await;

        if let Some(existing_user_id) = stripe_index.get(stripe_customer_id).copied() {
            if existing_user_id != id {
                return Err(AppError::Validation(
                    "Stripe customer ID is already linked to another user".into(),
                ));
            }
        }

        if let Some(ref old) = user.stripe_customer_id {
            stripe_index.remove(old);
        }

        stripe_index.insert(stripe_customer_id.to_string(), id);
        user.stripe_customer_id = Some(stripe_customer_id.to_string());
        user.updated_at = Utc::now();

        Ok(())
    }

    async fn count_system_admins(&self) -> Result<u64, AppError> {
        let users = self.users.read().await;
        Ok(users.values().filter(|u| u.is_system_admin).count() as u64)
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        // LOCK-ORDER: users -> indexes
        let mut users = self.users.write().await;

        let user = users
            .remove(&id)
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;

        if let Some(ref email) = user.email {
            let mut email_index = self.email_index.write().await;
            email_index.remove(&normalize_email(email));
        }

        if let Some(ref wallet) = user.wallet_address {
            let mut wallet_index = self.wallet_index.write().await;
            wallet_index.remove(wallet);
        }

        if let Some(ref google_id) = user.google_id {
            let mut google_id_index = self.google_id_index.write().await;
            google_id_index.remove(google_id);
        }

        if let Some(ref apple_id) = user.apple_id {
            let mut apple_id_index = self.apple_id_index.write().await;
            apple_id_index.remove(apple_id);
        }

        if let Some(ref stripe_customer_id) = user.stripe_customer_id {
            let mut stripe_index = self.stripe_customer_id_index.write().await;
            stripe_index.remove(stripe_customer_id);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find_user() {
        let repo = InMemoryUserRepository::new();
        let user = UserEntity::new_email_user(
            "test@example.com".to_string(),
            "hash123".to_string(),
            Some("Test User".to_string()),
        );
        let user_id = user.id;

        repo.create(user).await.unwrap();

        let found = repo.find_by_id(user_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().email, Some("test@example.com".to_string()));
    }

    #[test]
    fn test_new_email_user_normalizes_email() {
        let user =
            UserEntity::new_email_user("Test@Example.com".to_string(), "hash123".to_string(), None);
        assert_eq!(user.email.as_deref(), Some("test@example.com"));
    }

    #[tokio::test]
    async fn test_find_by_email_case_insensitive() {
        let repo = InMemoryUserRepository::new();
        let user =
            UserEntity::new_email_user("Test@Example.com".to_string(), "hash123".to_string(), None);

        repo.create(user).await.unwrap();

        let found = repo.find_by_email("test@example.com").await.unwrap();
        assert!(found.is_some());

        let found = repo.find_by_email("TEST@EXAMPLE.COM").await.unwrap();
        assert!(found.is_some());
    }

    /// SEC-09: Test Unicode NFKC normalization
    #[tokio::test]
    async fn test_find_by_email_unicode_normalized() {
        let repo = InMemoryUserRepository::new();
        // Create user with normal ASCII email
        let user =
            UserEntity::new_email_user("user@example.com".to_string(), "hash123".to_string(), None);

        repo.create(user).await.unwrap();

        // Should find with fullwidth characters (U+FF21..U+FF3A for A-Z, U+FF41..U+FF5A for a-z)
        // "ｕｓｅｒ" = fullwidth "user"
        let fullwidth_email = "\u{FF55}\u{FF53}\u{FF45}\u{FF52}@example.com";
        let found = repo.find_by_email(fullwidth_email).await.unwrap();
        assert!(
            found.is_some(),
            "Should find user with fullwidth local part"
        );

        // Should find with combining characters
        // U+00E9 (é) should equal U+0065 U+0301 (e + combining acute)
        // Note: We test that both forms normalize to the same result
    }

    #[test]
    fn test_normalize_email_function() {
        // Basic ASCII lowercase
        assert_eq!(normalize_email("Test@Example.COM"), "test@example.com");

        // Fullwidth ASCII should normalize (U+FF21 = A fullwidth)
        let fullwidth_a = "\u{FF21}"; // Fullwidth A
        assert_eq!(
            normalize_email(&format!("{}bc@test.com", fullwidth_a)),
            "abc@test.com"
        );

        // Mixed case fullwidth
        let fullwidth_user = "\u{FF55}\u{FF53}\u{FF45}\u{FF52}"; // fullwidth "user"
        assert_eq!(
            normalize_email(&format!("{}@test.com", fullwidth_user)),
            "user@test.com"
        );

        // Plus addressing is preserved (intentional - see docstring)
        assert_eq!(normalize_email("user+tag@gmail.com"), "user+tag@gmail.com");
    }

    #[tokio::test]
    async fn test_email_exists() {
        let repo = InMemoryUserRepository::new();
        let user = UserEntity::new_email_user(
            "exists@example.com".to_string(),
            "hash123".to_string(),
            None,
        );

        repo.create(user).await.unwrap();

        assert!(repo.email_exists("exists@example.com").await.unwrap());
        assert!(!repo.email_exists("notexists@example.com").await.unwrap());
    }

    #[tokio::test]
    async fn test_email_index_updated_on_email_change() {
        let repo = InMemoryUserRepository::new();
        let mut user =
            UserEntity::new_email_user("old@example.com".to_string(), "hash123".to_string(), None);
        let user_id = user.id;

        repo.create(user.clone()).await.unwrap();

        // Verify old email is findable
        assert!(repo
            .find_by_email("old@example.com")
            .await
            .unwrap()
            .is_some());

        // Update email
        user.email = Some("new@example.com".to_string());
        repo.update(user).await.unwrap();

        // Old email should no longer be findable
        assert!(repo
            .find_by_email("old@example.com")
            .await
            .unwrap()
            .is_none());

        // New email should be findable
        let found = repo.find_by_email("new@example.com").await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, user_id);
    }
}
