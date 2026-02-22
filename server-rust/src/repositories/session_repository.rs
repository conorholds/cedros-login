//! Session repository trait and implementations
//!
//! ## REPO-07: Lock Ordering (In-Memory Implementation)
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
//! ## PERF-02: Collect-then-truncate Pattern
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
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Session entity for storage
#[derive(Debug, Clone)]
pub struct SessionEntity {
    pub id: Uuid,
    pub user_id: Uuid,
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
                elapsed.num_seconds() <= max_age_secs
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

    /// H-05: Revoke oldest active sessions, keeping only the N most recent.
    /// Returns the number of sessions revoked.
    async fn revoke_oldest_active_sessions(
        &self,
        user_id: Uuid,
        keep_count: u32,
    ) -> Result<u64, AppError>;

    /// Update the last strong authentication timestamp for a session
    async fn update_strong_auth_at(&self, id: Uuid) -> Result<(), AppError>;
}

/// In-memory session repository for development/testing
pub struct InMemorySessionRepository {
    sessions: RwLock<HashMap<Uuid, SessionEntity>>,
    /// Secondary index: refresh_token_hash -> session_id for O(1) lookup
    token_index: RwLock<HashMap<String, Uuid>>,
}

impl InMemorySessionRepository {
    pub fn new() -> Self {
        Self {
            sessions: RwLock::new(HashMap::new()),
            token_index: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemorySessionRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SessionRepository for InMemorySessionRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<SessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions.get(&id).cloned())
    }

    async fn find_by_refresh_token(&self, hash: &str) -> Result<Option<SessionEntity>, AppError> {
        // Use token_index for O(1) lookup instead of O(n) scan
        let token_index = self.token_index.read().await;
        let session_id = match token_index.get(hash) {
            Some(id) => *id,
            None => return Ok(None),
        };
        drop(token_index);

        let sessions = self.sessions.read().await;
        // S-07: Filter out expired sessions (consistent with Postgres impl)
        Ok(sessions
            .get(&session_id)
            .filter(|s| s.expires_at > chrono::Utc::now())
            .cloned())
    }

    async fn find_by_user_id(&self, user_id: Uuid) -> Result<Vec<SessionEntity>, AppError> {
        // Limit to 100 sessions per user to prevent memory exhaustion
        const MAX_SESSIONS_PER_USER: usize = 100;

        let sessions = self.sessions.read().await;

        let mut user_sessions: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id)
            .cloned()
            .collect();

        // Sort by created_at DESC and take first 100
        user_sessions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        user_sessions.truncate(MAX_SESSIONS_PER_USER);

        Ok(user_sessions)
    }

    async fn find_active_by_user_id(&self, user_id: Uuid) -> Result<Vec<SessionEntity>, AppError> {
        // Limit to 100 sessions per user to prevent memory exhaustion
        const MAX_SESSIONS_PER_USER: usize = 100;

        let sessions = self.sessions.read().await;

        let mut user_sessions: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id && s.is_valid())
            .cloned()
            .collect();

        user_sessions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        user_sessions.truncate(MAX_SESSIONS_PER_USER);

        Ok(user_sessions)
    }

    async fn find_active_by_user_id_paged(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<SessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut user_sessions: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id && s.is_valid())
            .cloned()
            .collect();

        user_sessions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(user_sessions
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_active_by_user_id(&self, user_id: Uuid) -> Result<u64, AppError> {
        let sessions = self.sessions.read().await;
        let count = sessions
            .values()
            .filter(|s| s.user_id == user_id && s.is_valid())
            .count();
        Ok(count as u64)
    }

    async fn find_recent_by_user_id(
        &self,
        user_id: Uuid,
        limit: u32,
    ) -> Result<Vec<SessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut user_sessions: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id)
            .cloned()
            .collect();
        user_sessions.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(user_sessions.into_iter().take(limit as usize).collect())
    }

    async fn create(&self, session: SessionEntity) -> Result<SessionEntity, AppError> {
        let mut sessions = self.sessions.write().await;
        let mut token_index = self.token_index.write().await;

        // Add to token index
        token_index.insert(session.refresh_token_hash.clone(), session.id);
        sessions.insert(session.id, session.clone());

        Ok(session)
    }

    async fn update(&self, session: SessionEntity) -> Result<SessionEntity, AppError> {
        let mut sessions = self.sessions.write().await;
        let mut token_index = self.token_index.write().await;

        // If token changed (rotation), update the index
        if let Some(old_session) = sessions.get(&session.id) {
            if old_session.refresh_token_hash != session.refresh_token_hash {
                token_index.remove(&old_session.refresh_token_hash);
                token_index.insert(session.refresh_token_hash.clone(), session.id);
            }
        } else {
            // New session via update (shouldn't happen, but handle it)
            token_index.insert(session.refresh_token_hash.clone(), session.id);
        }

        sessions.insert(session.id, session.clone());
        Ok(session)
    }

    async fn revoke(&self, id: Uuid) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(&id) {
            session.revoked_at = Some(Utc::now());
            session
                .revoked_reason
                .get_or_insert_with(|| "unspecified".to_string());
        }
        Ok(())
    }

    async fn revoke_if_valid(&self, id: Uuid) -> Result<bool, AppError> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(&id) {
            // Only revoke if not already revoked (atomic check-and-set)
            if session.revoked_at.is_none() {
                session.revoked_at = Some(Utc::now());
                session
                    .revoked_reason
                    .get_or_insert_with(|| "unspecified".to_string());
                return Ok(true);
            }
        }
        Ok(false)
    }

    async fn revoke_with_reason(&self, id: Uuid, reason: &str) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(&id) {
            session.revoked_at = Some(Utc::now());
            session.revoked_reason = Some(reason.to_string());
        }
        Ok(())
    }

    async fn revoke_if_valid_with_reason(&self, id: Uuid, reason: &str) -> Result<bool, AppError> {
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(&id) {
            if session.revoked_at.is_none() {
                session.revoked_at = Some(Utc::now());
                session.revoked_reason = Some(reason.to_string());
                return Ok(true);
            }
        }
        Ok(false)
    }

    async fn revoke_all_except(
        &self,
        user_id: Uuid,
        keep_session_id: Uuid,
    ) -> Result<u64, AppError> {
        let mut sessions = self.sessions.write().await;
        let now = Utc::now();
        let mut revoked = 0u64;
        for session in sessions.values_mut() {
            if session.user_id == user_id && session.id != keep_session_id && session.is_valid() {
                session.revoked_at = Some(now);
                session.revoked_reason = Some("user_revoke_other_sessions".to_string());
                revoked += 1;
            }
        }
        Ok(revoked)
    }

    async fn revoke_all_for_user(&self, user_id: Uuid) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let now = Utc::now();
        for session in sessions.values_mut() {
            if session.user_id == user_id {
                session.revoked_at = Some(now);
                session
                    .revoked_reason
                    .get_or_insert_with(|| "unspecified".to_string());
            }
        }
        Ok(())
    }

    async fn revoke_all_for_user_with_reason(
        &self,
        user_id: Uuid,
        reason: &str,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        let now = Utc::now();
        for session in sessions.values_mut() {
            if session.user_id == user_id {
                session.revoked_at = Some(now);
                session.revoked_reason = Some(reason.to_string());
            }
        }
        Ok(())
    }

    async fn is_revoked(&self, id: Uuid) -> Result<bool, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .get(&id)
            .map(|s| s.revoked_at.is_some())
            .unwrap_or(true))
    }

    async fn delete_expired(&self) -> Result<u64, AppError> {
        let mut sessions = self.sessions.write().await;
        let mut token_index = self.token_index.write().await;
        let now = Utc::now();
        let before = sessions.len();

        // Collect tokens to remove from index
        let expired_tokens: Vec<String> = sessions
            .values()
            .filter(|s| s.expires_at <= now)
            .map(|s| s.refresh_token_hash.clone())
            .collect();

        // Remove from index
        for token in expired_tokens {
            token_index.remove(&token);
        }

        sessions.retain(|_, s| s.expires_at > now);
        Ok((before - sessions.len()) as u64)
    }

    async fn revoke_oldest_active_sessions(
        &self,
        user_id: Uuid,
        keep_count: u32,
    ) -> Result<u64, AppError> {
        let mut sessions = self.sessions.write().await;

        // Get all active sessions for this user, sorted by created_at DESC (newest first)
        let mut active_sessions: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id && s.is_valid())
            .map(|s| (s.id, s.created_at))
            .collect();

        active_sessions.sort_by(|a, b| b.1.cmp(&a.1)); // Newest first

        // Skip the first keep_count, revoke the rest
        let to_revoke: Vec<Uuid> = active_sessions
            .into_iter()
            .skip(keep_count as usize)
            .map(|(id, _)| id)
            .collect();

        let now = Utc::now();
        let mut revoked = 0u64;
        for id in to_revoke {
            if let Some(session) = sessions.get_mut(&id) {
                if session.revoked_at.is_none() {
                    session.revoked_at = Some(now);
                    session.revoked_reason = Some("session_limit".to_string());
                    revoked += 1;
                }
            }
        }

        Ok(revoked)
    }

    async fn update_strong_auth_at(&self, id: Uuid) -> Result<(), AppError> {
        // L-01: Return error if session not found
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(&id) {
            session.last_strong_auth_at = Some(Utc::now());
            Ok(())
        } else {
            Err(AppError::NotFound("Session not found".into()))
        }
    }
}
