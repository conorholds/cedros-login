//! User repository trait and implementations
//!
//! # Lock Ordering
//!
//! The `InMemoryUserRepository` uses separate `RwLock`s for performance:
//! - `users`: Primary storage for user entities by ID
//! - `email_index`: Secondary index for O(1) email lookups
//! - `wallet_index`: Secondary index for O(1) wallet lookups
//! - `google_id_index`: Secondary index for O(1) Google ID lookups
//! - `apple_id_index`: Secondary index for O(1) Apple ID lookups
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
use unicode_normalization::UnicodeNormalization;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::AuthMethod;

/// Normalize an email address for consistent lookups.
///
/// # Email Normalization
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

/// Reject emails with non-ASCII characters in the local part.
/// Prevents homograph attacks (e.g., Cyrillic 'а' vs Latin 'a').
/// Domain parts are handled by DNS/IDNA and are safe.
pub fn validate_email_ascii_local(email: &str) -> Result<(), crate::errors::AppError> {
    if let Some(at_pos) = email.rfind('@') {
        let local = &email[..at_pos];
        if !local.is_ascii() {
            return Err(crate::errors::AppError::Validation(
                "Email local part must contain only ASCII characters".into(),
            ));
        }
    }
    Ok(())
}

/// Generate an account referral code for login-owned signup attribution.
///
/// The code is an opaque 10-character base58 token suitable for user-account
/// references. Reward settlement behavior belongs to downstream extensions.
pub fn generate_referral_code() -> String {
    const ALPHABET: &[u8] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    use rand::{rngs::OsRng, RngCore};

    let mut bytes = [0u8; 10];
    OsRng.fill_bytes(&mut bytes);
    bytes
        .iter()
        .map(|byte| ALPHABET[*byte as usize % ALPHABET.len()] as char)
        .collect()
}

/// User entity for storage
#[derive(Debug, Clone)]
pub struct UserEntity {
    pub id: Uuid,
    pub email: Option<String>,
    pub email_verified: bool,
    pub password_hash: Option<String>,
    pub name: Option<String>,
    pub username: Option<String>,
    pub picture: Option<String>,
    pub wallet_address: Option<String>,
    pub google_id: Option<String>,
    pub apple_id: Option<String>,
    pub auth_methods: Vec<AuthMethod>,
    pub is_system_admin: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    /// Last successful login timestamp
    pub last_login_at: Option<DateTime<Utc>>,
    /// When the user completed the one-time welcome flow
    pub welcome_completed_at: Option<DateTime<Utc>>,
    /// Unique referral code for this user
    pub referral_code: String,
    /// ID of the user who referred this user
    pub referred_by: Option<Uuid>,
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
            username: None,
            picture: None,
            wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec![AuthMethod::Email],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
            last_login_at: None,
            welcome_completed_at: None,
            referral_code: generate_referral_code(),
            referred_by: None,
        }
    }

    /// Returns true when the account has been anonymized and cannot log in anymore.
    pub fn is_deleted(&self) -> bool {
        self.auth_methods.is_empty()
            && self.email.is_none()
            && self.password_hash.is_none()
            && self.wallet_address.is_none()
            && self.google_id.is_none()
            && self.apple_id.is_none()
            && self.name.as_deref() == Some("Deleted Account")
    }

    /// Claim an unverified pre-registration for the mailbox owner. Credentials
    /// selected before mailbox proof cannot be trusted to belong to that owner.
    pub fn reset_unverified_credentials(&mut self) -> bool {
        if self.email_verified {
            return false;
        }
        self.password_hash = None;
        self.wallet_address = None;
        self.google_id = None;
        self.apple_id = None;
        self.auth_methods.clear();
        self.auth_methods.push(AuthMethod::Email);
        true
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

    /// Create a new user
    async fn create(&self, user: UserEntity) -> Result<UserEntity, AppError>;

    /// Update an existing user
    async fn update(&self, user: UserEntity) -> Result<UserEntity, AppError>;

    /// Replace a snapshot only if no account mutation has committed since it
    /// was read. Interactive handlers must use this instead of blind replacement.
    async fn update_if_current(
        &self,
        user: UserEntity,
        expected_updated_at: DateTime<Utc>,
    ) -> Result<UserEntity, AppError> {
        let _ = (user, expected_updated_at);
        Err(AppError::Config(
            "Conditional user update is not implemented".into(),
        ))
    }

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

    /// Count system admins (for bootstrap check)
    async fn count_system_admins(&self) -> Result<u64, AppError>;

    /// Delete a user by ID
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Anonymize a user while preserving account-level audit and referral records.
    async fn anonymize_for_deletion(
        &self,
        id: Uuid,
        replacement_referral_code: &str,
    ) -> Result<UserEntity, AppError>;

    /// Count users by auth method
    ///
    /// Returns a map of auth method string to count.
    /// Each user is counted once per auth method they have.
    async fn count_by_auth_methods(
        &self,
    ) -> Result<std::collections::HashMap<String, u64>, AppError>;

    /// Update last login timestamp for a user
    async fn update_last_login(&self, id: Uuid) -> Result<(), AppError>;

    /// Set welcome_completed_at timestamp for a user
    async fn set_welcome_completed(&self, id: Uuid) -> Result<(), AppError>;

    /// Check if a username is already taken (case-insensitive)
    async fn username_exists(&self, username: &str) -> Result<bool, AppError>;

    /// Set a user's username
    async fn set_username(&self, id: Uuid, username: &str) -> Result<(), AppError>;

    /// Find a user by referral code
    async fn find_by_referral_code(&self, code: &str) -> Result<Option<UserEntity>, AppError>;

    /// Count how many users were referred by the given user
    async fn count_referrals(&self, user_id: Uuid) -> Result<u64, AppError>;

    /// Regenerate a user's referral code, returning the new code
    async fn regenerate_referral_code(&self, id: Uuid) -> Result<String, AppError>;

    /// Set a custom vanity referral code for a user.
    ///
    /// Inputs: `id` — user UUID, `code` — 4–16 uppercase alphanumeric characters.
    ///
    /// # Errors
    /// - `AppError::NotFound` if the user does not exist.
    /// - `AppError::Validation` if `code` is already held by a different user.
    /// - `AppError::Internal` on storage failures.
    async fn set_referral_code(&self, id: Uuid, code: &str) -> Result<(), AppError>;

    /// Count total users who were referred (i.e. `referred_by IS NOT NULL`).
    async fn count_referred(&self) -> Result<u64, AppError>;

    /// Count users referred on or after the given timestamp.
    async fn count_referred_since(&self, since: DateTime<Utc>) -> Result<u64, AppError>;

    /// Return top `limit` users ordered by how many users they have referred.
    ///
    /// Each entry contains the referrer's id, email, name, referral_code, and referral_count.
    async fn top_referrers(&self, limit: u32) -> Result<Vec<TopReferrerRow>, AppError>;

    /// List users directly referred by `referrer_id`, with pagination.
    ///
    /// Results are ordered by `created_at DESC` (most recently joined first).
    async fn find_referred_by(
        &self,
        referrer_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<UserEntity>, AppError>;

    /// Count the total number of users directly referred by `referrer_id`.
    async fn count_referred_by(&self, referrer_id: Uuid) -> Result<u64, AppError>;

    /// Count non-system-admin users created on or after `since`.
    async fn count_non_admin_created_since(&self, since: DateTime<Utc>) -> Result<u64, AppError>;

    /// Return the durable signup usage for a UTC period, initializing its
    /// ledger from existing non-admin accounts when the period is first read.
    async fn initialize_signup_limit_usage(
        &self,
        period: &str,
        period_start: DateTime<Utc>,
        period_end: DateTime<Utc>,
    ) -> Result<u64, AppError>;
}

/// A row returned by [`UserRepository::top_referrers`].
#[derive(Debug, Clone)]
pub struct TopReferrerRow {
    pub user_id: Uuid,
    pub email: Option<String>,
    pub name: Option<String>,
    pub referral_code: String,
    pub referral_count: u64,
}

mod in_memory;

pub use in_memory::InMemoryUserRepository;

#[cfg(test)]
mod tests;

pub(crate) use in_memory::guard_admin_removal;
