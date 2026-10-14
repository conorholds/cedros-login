use async_trait::async_trait;
use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use super::{SessionEntity, SessionRepository};
use crate::errors::AppError;

/// In-memory session repository for development/testing
#[derive(Clone)]
pub struct InMemorySessionRepository {
    pub(crate) sessions: Arc<RwLock<HashMap<Uuid, SessionEntity>>>,
    /// Secondary index: refresh_token_hash -> session_id for O(1) lookup
    pub(crate) token_index: Arc<RwLock<HashMap<String, Uuid>>>,
}

impl InMemorySessionRepository {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            token_index: Arc::new(RwLock::new(HashMap::new())),
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
        // Filter out expired sessions (consistent with Postgres impl)
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
        user_sessions.sort_by_key(|b| std::cmp::Reverse(b.created_at));
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

        user_sessions.sort_by_key(|b| std::cmp::Reverse(b.created_at));
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

        user_sessions.sort_by_key(|b| std::cmp::Reverse(b.created_at));
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
        user_sessions.sort_by_key(|b| std::cmp::Reverse(b.created_at));
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

    async fn rotate(
        &self,
        source: &SessionEntity,
        mut replacement: SessionEntity,
        reason: &str,
    ) -> Result<bool, AppError> {
        let mut sessions = self.sessions.write().await;
        let mut token_index = self.token_index.write().await;
        if replacement.user_id != source.user_id
            || replacement.id == source.id
            || sessions.contains_key(&replacement.id)
            || token_index.contains_key(&replacement.refresh_token_hash)
            || !replacement.is_valid()
        {
            return Err(AppError::InvalidToken);
        }
        let Some(current) = sessions.get_mut(&source.id) else {
            return Ok(false);
        };
        if !current.is_valid()
            || current.user_id != source.user_id
            || current.refresh_token_hash != source.refresh_token_hash
        {
            return Ok(false);
        }
        replacement.family_id = current.family_id;
        replacement.expires_at = replacement.expires_at.min(current.expires_at);
        current.revoked_at = Some(Utc::now());
        current.revoked_reason = Some(reason.into());
        token_index.insert(replacement.refresh_token_hash.clone(), replacement.id);
        sessions.insert(replacement.id, replacement);
        Ok(true)
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
        self.revoke_with_reason(id, "unspecified").await
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
        let Some(source) = sessions.get(&id) else {
            return Ok(());
        };
        let (family, user) = (source.family_id, source.user_id);
        let now = Utc::now();
        for session in sessions.values_mut() {
            if session.family_id == family && session.user_id == user {
                session.revoked_at = Some(now);
                session.revoked_reason = Some(reason.into());
            }
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
        let keep_family = sessions
            .get(&keep_session_id)
            .filter(|s| s.user_id == user_id)
            .map(|s| s.family_id);
        let now = Utc::now();
        let mut revoked = 0u64;
        for session in sessions.values_mut() {
            if session.user_id == user_id
                && Some(session.family_id) != keep_family
                && session.is_valid()
            {
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

        active_sessions.sort_by_key(|b| std::cmp::Reverse(b.1)); // Newest first

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
        // Return error if session not found
        let mut sessions = self.sessions.write().await;
        if let Some(session) = sessions.get_mut(&id) {
            session.last_strong_auth_at = Some(Utc::now());
            Ok(())
        } else {
            Err(AppError::NotFound("Session not found".into()))
        }
    }
}
