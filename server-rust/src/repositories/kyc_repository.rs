//! KYC session repository trait and in-memory implementation

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// A KYC verification session record
#[derive(Debug, Clone)]
pub struct KycSessionEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: String,
    pub provider_session_id: String,
    /// "pending", "verified", "failed", or "canceled"
    pub status: String,
    pub redirect_url: Option<String>,
    pub error_code: Option<String>,
    pub error_reason: Option<String>,
    pub provider_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

/// Repository for KYC session lifecycle management
#[async_trait]
pub trait KycRepository: Send + Sync {
    /// Persist a new KYC session record. Returns the stored entity.
    async fn create_session(
        &self,
        session: KycSessionEntity,
    ) -> Result<KycSessionEntity, AppError>;

    /// Look up a session by its internal ID. Returns `None` if not found.
    async fn find_session_by_id(&self, id: Uuid) -> Result<Option<KycSessionEntity>, AppError>;

    /// Look up a session by the provider name and the provider's own session ID.
    /// Returns `None` if not found.
    async fn find_by_provider_session_id(
        &self,
        provider: &str,
        session_id: &str,
    ) -> Result<Option<KycSessionEntity>, AppError>;

    /// Update the status (and optional error/provider-data fields) for a session.
    ///
    /// Sets `updated_at` to now. Sets `completed_at` to now when `status` is
    /// `"verified"`, `"failed"`, or `"canceled"`.
    async fn update_session_status(
        &self,
        id: Uuid,
        status: &str,
        error_code: Option<&str>,
        error_reason: Option<&str>,
        provider_data: serde_json::Value,
    ) -> Result<(), AppError>;

    /// List sessions for a user, ordered by `created_at` descending.
    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<KycSessionEntity>, AppError>;

    /// Count total sessions for a user.
    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory implementation for development and testing
pub struct InMemoryKycRepository {
    sessions: RwLock<HashMap<Uuid, KycSessionEntity>>,
}

impl InMemoryKycRepository {
    pub fn new() -> Self {
        Self {
            sessions: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryKycRepository {
    fn default() -> Self {
        Self::new()
    }
}

fn is_terminal_status(status: &str) -> bool {
    matches!(status, "verified" | "failed" | "canceled")
}

#[async_trait]
impl KycRepository for InMemoryKycRepository {
    async fn create_session(
        &self,
        session: KycSessionEntity,
    ) -> Result<KycSessionEntity, AppError> {
        let mut sessions = self.sessions.write().await;
        sessions.insert(session.id, session.clone());
        Ok(session)
    }

    async fn find_session_by_id(&self, id: Uuid) -> Result<Option<KycSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions.get(&id).cloned())
    }

    async fn find_by_provider_session_id(
        &self,
        provider: &str,
        session_id: &str,
    ) -> Result<Option<KycSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions
            .values()
            .find(|s| s.provider == provider && s.provider_session_id == session_id)
            .cloned())
    }

    async fn update_session_status(
        &self,
        id: Uuid,
        status: &str,
        error_code: Option<&str>,
        error_reason: Option<&str>,
        provider_data: serde_json::Value,
    ) -> Result<(), AppError> {
        let mut sessions = self.sessions.write().await;
        if let Some(s) = sessions.get_mut(&id) {
            let now = Utc::now();
            s.status = status.to_string();
            s.error_code = error_code.map(str::to_string);
            s.error_reason = error_reason.map(str::to_string);
            s.provider_data = provider_data;
            s.updated_at = now;
            if is_terminal_status(status) {
                s.completed_at = Some(now);
            }
        }
        Ok(())
    }

    async fn list_by_user(
        &self,
        user_id: Uuid,
        limit: u32,
        offset: u32,
    ) -> Result<Vec<KycSessionEntity>, AppError> {
        let sessions = self.sessions.read().await;
        let mut items: Vec<_> = sessions
            .values()
            .filter(|s| s.user_id == user_id)
            .cloned()
            .collect();
        items.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(items
            .into_iter()
            .skip(offset as usize)
            .take(limit as usize)
            .collect())
    }

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let sessions = self.sessions.read().await;
        Ok(sessions.values().filter(|s| s.user_id == user_id).count() as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn make_session(user_id: Uuid) -> KycSessionEntity {
        let now = Utc::now();
        KycSessionEntity {
            id: Uuid::new_v4(),
            user_id,
            provider: "stripe".to_string(),
            provider_session_id: Uuid::new_v4().to_string(),
            status: "pending".to_string(),
            redirect_url: Some("https://example.com/kyc".to_string()),
            error_code: None,
            error_reason: None,
            provider_data: json!({}),
            created_at: now,
            updated_at: now,
            completed_at: None,
        }
    }

    #[tokio::test]
    async fn test_create_and_find_by_id() {
        let repo = InMemoryKycRepository::new();
        let user_id = Uuid::new_v4();
        let session = make_session(user_id);
        let id = session.id;

        let created = repo.create_session(session).await.unwrap();
        assert_eq!(created.id, id);

        let found = repo.find_session_by_id(id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, id);
    }

    #[tokio::test]
    async fn test_find_session_by_id_not_found() {
        let repo = InMemoryKycRepository::new();
        let result = repo.find_session_by_id(Uuid::new_v4()).await.unwrap();
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_find_by_provider_session_id() {
        let repo = InMemoryKycRepository::new();
        let user_id = Uuid::new_v4();
        let mut session = make_session(user_id);
        session.provider = "persona".to_string();
        session.provider_session_id = "prov-abc".to_string();
        let id = session.id;
        repo.create_session(session).await.unwrap();

        let found = repo
            .find_by_provider_session_id("persona", "prov-abc")
            .await
            .unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().id, id);

        let not_found = repo
            .find_by_provider_session_id("persona", "prov-xyz")
            .await
            .unwrap();
        assert!(not_found.is_none());
    }

    #[tokio::test]
    async fn test_update_session_status_sets_completed_at_for_terminal() {
        let repo = InMemoryKycRepository::new();
        let user_id = Uuid::new_v4();
        let session = make_session(user_id);
        let id = session.id;
        repo.create_session(session).await.unwrap();

        repo.update_session_status(id, "verified", None, None, json!({"doc": "ok"}))
            .await
            .unwrap();

        let found = repo.find_session_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "verified");
        assert!(found.completed_at.is_some());
    }

    #[tokio::test]
    async fn test_update_session_status_no_completed_at_for_pending() {
        let repo = InMemoryKycRepository::new();
        let user_id = Uuid::new_v4();
        let session = make_session(user_id);
        let id = session.id;
        repo.create_session(session).await.unwrap();

        // Update to a non-terminal status (e.g. re-pended after review)
        repo.update_session_status(id, "pending", None, None, json!({}))
            .await
            .unwrap();

        let found = repo.find_session_by_id(id).await.unwrap().unwrap();
        assert_eq!(found.status, "pending");
        assert!(found.completed_at.is_none());
    }

    #[tokio::test]
    async fn test_list_by_user_and_count() {
        let repo = InMemoryKycRepository::new();
        let user_id = Uuid::new_v4();
        let other_id = Uuid::new_v4();

        repo.create_session(make_session(user_id)).await.unwrap();
        repo.create_session(make_session(user_id)).await.unwrap();
        repo.create_session(make_session(other_id)).await.unwrap();

        assert_eq!(repo.count_by_user(user_id).await.unwrap(), 2);
        assert_eq!(repo.count_by_user(other_id).await.unwrap(), 1);

        let page = repo.list_by_user(user_id, 1, 0).await.unwrap();
        assert_eq!(page.len(), 1);

        let all = repo.list_by_user(user_id, 10, 0).await.unwrap();
        assert_eq!(all.len(), 2);
    }
}
