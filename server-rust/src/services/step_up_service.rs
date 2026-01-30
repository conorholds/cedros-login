//! Step-Up Authentication Service
//!
//! Provides verification for sensitive actions requiring recent strong authentication.

use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::SessionRepository;

/// Default max age for step-up auth (5 minutes)
pub const DEFAULT_STEP_UP_MAX_AGE_SECS: i64 = 300;

/// Step-up authentication service
pub struct StepUpService {
    session_repo: Arc<dyn SessionRepository>,
    /// Maximum age of strong auth in seconds
    max_age_secs: i64,
}

impl StepUpService {
    /// Create a new step-up service
    pub fn new(session_repo: Arc<dyn SessionRepository>) -> Self {
        Self {
            session_repo,
            max_age_secs: DEFAULT_STEP_UP_MAX_AGE_SECS,
        }
    }

    /// Create with custom max age
    pub fn with_max_age(session_repo: Arc<dyn SessionRepository>, max_age_secs: i64) -> Self {
        Self {
            session_repo,
            max_age_secs,
        }
    }

    /// Check if the session has recent strong authentication
    pub async fn has_recent_strong_auth(&self, session_id: Uuid) -> Result<bool, AppError> {
        let session = self
            .session_repo
            .find_by_id(session_id)
            .await?
            .ok_or_else(|| AppError::NotFound("Session not found".into()))?;

        if !session.is_valid() {
            return Err(AppError::Unauthorized("Session is invalid".into()));
        }

        Ok(session.has_recent_strong_auth(self.max_age_secs))
    }

    /// Record that strong authentication was performed
    pub async fn record_strong_auth(&self, session_id: Uuid) -> Result<(), AppError> {
        self.session_repo.update_strong_auth_at(session_id).await
    }

    /// Check and require step-up authentication
    ///
    /// Returns Ok(()) if recent strong auth exists, otherwise returns an error
    /// that can be used to prompt the user for step-up verification.
    pub async fn require_step_up(&self, session_id: Uuid) -> Result<(), AppError> {
        if self.has_recent_strong_auth(session_id).await? {
            Ok(())
        } else {
            Err(AppError::StepUpRequired)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::InMemorySessionRepository;
    use crate::repositories::SessionEntity;
    use chrono::{Duration, Utc};

    fn create_test_session(user_id: Uuid) -> SessionEntity {
        SessionEntity::new(
            user_id,
            "test_hash".to_string(),
            Utc::now() + Duration::hours(1),
            None,
            None,
        )
    }

    #[tokio::test]
    async fn test_no_strong_auth_by_default() {
        let session_repo = Arc::new(InMemorySessionRepository::new());
        let service = StepUpService::new(session_repo.clone());

        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);
        let session = session_repo.create(session).await.unwrap();

        assert!(!service.has_recent_strong_auth(session.id).await.unwrap());
    }

    #[tokio::test]
    async fn test_strong_auth_recorded() {
        let session_repo = Arc::new(InMemorySessionRepository::new());
        let service = StepUpService::new(session_repo.clone());

        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);
        let session = session_repo.create(session).await.unwrap();

        service.record_strong_auth(session.id).await.unwrap();

        assert!(service.has_recent_strong_auth(session.id).await.unwrap());
    }

    #[tokio::test]
    async fn test_require_step_up_fails_without_strong_auth() {
        let session_repo = Arc::new(InMemorySessionRepository::new());
        let service = StepUpService::new(session_repo.clone());

        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);
        let session = session_repo.create(session).await.unwrap();

        let result = service.require_step_up(session.id).await;
        assert!(matches!(result, Err(AppError::StepUpRequired)));
    }

    #[tokio::test]
    async fn test_require_step_up_succeeds_with_strong_auth() {
        let session_repo = Arc::new(InMemorySessionRepository::new());
        let service = StepUpService::new(session_repo.clone());

        let user_id = Uuid::new_v4();
        let session = create_test_session(user_id);
        let session = session_repo.create(session).await.unwrap();

        service.record_strong_auth(session.id).await.unwrap();

        let result = service.require_step_up(session.id).await;
        assert!(result.is_ok());
    }
}
