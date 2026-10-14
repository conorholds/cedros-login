//! Session repository trait and implementations
//!
//! ## Lock Ordering (In-Memory Implementation)
//!
//! The in-memory implementation uses two RwLocks:
//! - `sessions`: Primary session storage
//! - `token_index`: Secondary index for O(1) token lookup
//!
//! **Lock ordering invariant**: When acquiring both locks, always acquire
//! `sessions` first, then `token_index`. This prevents deadlocks.
//!
//! Methods that acquire both locks:
//! - `create`, `update`, `delete_expired`: `sessions.write()` → `token_index.write()`
//!
//! Methods that acquire only one lock:
//! - `find_by_refresh_token`: Acquires `token_index.read()`, drops it, then `sessions.read()`
//!   (safe because it never holds both locks simultaneously)
//!
//! This ordering is intentional. The Postgres implementation doesn't have this
//! concern as it relies on database-level locking.
//!
//! ## Collect-then-truncate Pattern
//!
//! Methods like `find_by_user_id` and `find_active_by_user_id` collect all
//! matching sessions before sorting and truncating. This is necessary for
//! in-memory implementations (can't take(N) before filter/sort).
//!
//! This is bounded in practice because:
//! - Session limits are enforced at creation (MAX_SESSIONS_PER_USER = 100)
//! - Old sessions are revoked during refresh
//! - Memory usage is O(user session count) which is capped
//!
//! The Postgres implementation uses SQL LIMIT for true early termination.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::errors::AppError;

/// Session entity for storage
#[derive(Debug, Clone)]
pub struct SessionEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    /// Stable authority across refresh and organization-switch rotations.
    pub family_id: Uuid,
    pub refresh_token_hash: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
    pub revoked_reason: Option<String>,
    /// Timestamp of last strong authentication (passkey, TOTP, etc.)
    pub last_strong_auth_at: Option<DateTime<Utc>>,
}

impl SessionEntity {
    /// Create a new session with a specific ID
    pub fn new_with_id(
        id: Uuid,
        user_id: Uuid,
        refresh_token_hash: String,
        expires_at: DateTime<Utc>,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Self {
        Self {
            id,
            user_id,
            family_id: id,
            refresh_token_hash,
            ip_address,
            user_agent,
            created_at: Utc::now(),
            expires_at,
            revoked_at: None,
            revoked_reason: None,
            last_strong_auth_at: None,
        }
    }

    /// Check if strong authentication was performed recently
    pub fn has_recent_strong_auth(&self, max_age_secs: i64) -> bool {
        match self.last_strong_auth_at {
            Some(ts) => {
                let elapsed = Utc::now().signed_duration_since(ts);
                elapsed >= chrono::Duration::zero() && elapsed.num_seconds() <= max_age_secs
            }
            None => false,
        }
    }

    /// Create a new session with auto-generated ID
    pub fn new(
        user_id: Uuid,
        refresh_token_hash: String,
        expires_at: DateTime<Utc>,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> Self {
        Self::new_with_id(
            Uuid::new_v4(),
            user_id,
            refresh_token_hash,
            expires_at,
            ip_address,
            user_agent,
        )
    }

    /// Check if session is valid (not revoked and not expired)
    pub fn is_valid(&self) -> bool {
        self.revoked_at.is_none() && self.expires_at > Utc::now()
    }

    /// Check if session has been revoked
    pub fn is_revoked(&self) -> bool {
        self.revoked_at.is_some()
    }
}

/// Session repository trait
#[async_trait]
pub trait SessionRepository: Send + Sync {
    /// Find session by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<SessionEntity>, AppError>;

    /// Find session by refresh token hash
    async fn find_by_refresh_token(&self, hash: &str) -> Result<Option<SessionEntity>, AppError>;

    /// Find all sessions for a user
    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<SessionEntity>, AppError>;

    /// Find active sessions for a user (not revoked, not expired)
    async fn find_active_by_user_id(&self, user_id: Uuid) -> Result<Vec<SessionEntity>, AppError>;

    /// Find active sessions for a user (paged)
    async fn find_active_by_user_id_paged(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SessionEntity>, AppError>;

    /// Count active sessions for a user
    async fn count_active_by_user_id(&self, user_id: Uuid) -> Result<u64, AppError>;

    /// Find recent sessions for a user (most recent first)
    async fn find_recent_by_user_id(
        &self,
        user_id: Uuid,
        limit: u32,
    ) -> Result<Vec<SessionEntity>, AppError>;

    /// Create a new session
    async fn create(&self, session: SessionEntity) -> Result<SessionEntity, AppError>;

    /// Atomically consume a valid source and insert its replacement in the same
    /// family, bounded by the original expiry. Serialized with revocation;
    /// never publish tokens before success.
    async fn rotate(
        &self,
        source: &SessionEntity,
        replacement: SessionEntity,
        reason: &str,
    ) -> Result<bool, AppError> {
        let _ = (source, replacement, reason);
        Err(AppError::Config(
            "Atomic session rotation is not implemented".into(),
        ))
    }

    /// Update session (e.g., rotate refresh token)
    async fn update(&self, session: SessionEntity) -> Result<SessionEntity, AppError>;

    /// Revoke a session
    async fn revoke(&self, id: Uuid) -> Result<(), AppError>;

    /// Atomically revoke a session only if it's currently valid (not already revoked).
    /// Returns `true` if the session was successfully revoked, `false` if it was already revoked.
    /// This prevents race conditions in token reuse detection.
    async fn revoke_if_valid(&self, id: Uuid) -> Result<bool, AppError>;

    /// Revoke a session with a reason recorded for audit/analysis.
    async fn revoke_with_reason(&self, id: Uuid, reason: &str) -> Result<(), AppError> {
        let _ = reason;
        self.revoke(id).await
    }

    /// Atomically revoke a session with a reason recorded.
    async fn revoke_if_valid_with_reason(&self, id: Uuid, reason: &str) -> Result<bool, AppError> {
        let _ = reason;
        self.revoke_if_valid(id).await
    }

    /// Revoke all sessions for a user except the current one
    async fn revoke_all_except(
        &self,
        user_id: Uuid,
        keep_session_id: Uuid,
    ) -> Result<u64, AppError>;

    /// Revoke all sessions for a user
    async fn revoke_all_for_user(&self, user_id: Uuid) -> Result<(), AppError>;

    /// Revoke all sessions for a user with a reason recorded.
    async fn revoke_all_for_user_with_reason(
        &self,
        user_id: Uuid,
        reason: &str,
    ) -> Result<(), AppError> {
        let _ = reason;
        self.revoke_all_for_user(user_id).await
    }

    /// Check if session is revoked
    async fn is_revoked(&self, id: Uuid) -> Result<bool, AppError>;

    /// Delete expired sessions (cleanup)
    async fn delete_expired(&self) -> Result<u64, AppError>;

    /// Revoke oldest active sessions, keeping only the N most recent.
    /// Returns the number of sessions revoked.
    async fn revoke_oldest_active_sessions(
        &self,
        user_id: Uuid,
        keep_count: u32,
    ) -> Result<u64, AppError>;

    /// Update the last strong authentication timestamp for a session
    async fn update_strong_auth_at(&self, id: Uuid) -> Result<(), AppError>;
}

mod in_memory;

pub use in_memory::InMemorySessionRepository;
