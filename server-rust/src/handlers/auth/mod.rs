//! Authentication handlers for email/password flow

mod login;
mod refresh;
mod register;
mod session;

pub use login::{complete_mfa_login, login};
pub use refresh::refresh;
pub use register::register;
pub use session::{get_user, logout, logout_all, update_profile};

use std::sync::Arc;
use std::time::Duration as StdDuration;
use tokio::time::timeout;

use crate::callback::{AuthCallback, AuthCallbackPayload};

const CALLBACK_TIMEOUT_SECS: u64 = 2;

pub(crate) async fn call_authenticated_callback_with_timeout<C: AuthCallback>(
    callback: &Arc<C>,
    payload: &AuthCallbackPayload,
) -> Option<serde_json::Value> {
    match timeout(
        StdDuration::from_secs(CALLBACK_TIMEOUT_SECS),
        callback.on_authenticated(payload),
    )
    .await
    {
        Ok(Ok(value)) => Some(value),
        Ok(Err(error)) => {
            tracing::warn!(
                user_id = %payload.user.id,
                method = ?payload.method,
                error = %error,
                "Authentication callback failed"
            );
            None
        }
        Err(_elapsed) => {
            tracing::warn!(
                user_id = %payload.user.id,
                method = ?payload.method,
                timeout_secs = CALLBACK_TIMEOUT_SECS,
                "Authentication callback timed out"
            );
            None
        }
    }
}

pub(crate) async fn call_registered_callback_with_timeout<C: AuthCallback>(
    callback: &Arc<C>,
    payload: &AuthCallbackPayload,
) -> Option<serde_json::Value> {
    match timeout(
        StdDuration::from_secs(CALLBACK_TIMEOUT_SECS),
        callback.on_registered(payload),
    )
    .await
    {
        Ok(Ok(value)) => Some(value),
        Ok(Err(error)) => {
            tracing::warn!(
                user_id = %payload.user.id,
                method = ?payload.method,
                error = %error,
                "Registration callback failed"
            );
            None
        }
        Err(_elapsed) => {
            tracing::warn!(
                user_id = %payload.user.id,
                method = ?payload.method,
                timeout_secs = CALLBACK_TIMEOUT_SECS,
                "Registration callback timed out"
            );
            None
        }
    }
}

pub(crate) async fn call_logout_callback_with_timeout<C: AuthCallback>(
    callback: &Arc<C>,
    user_id: &str,
) {
    match timeout(
        StdDuration::from_secs(CALLBACK_TIMEOUT_SECS),
        callback.on_logout(user_id),
    )
    .await
    {
        Ok(Ok(())) => {}
        Ok(Err(error)) => {
            tracing::warn!(user_id = %user_id, error = %error, "Logout callback failed");
        }
        Err(_elapsed) => {
            tracing::warn!(
                user_id = %user_id,
                timeout_secs = CALLBACK_TIMEOUT_SECS,
                "Logout callback timed out"
            );
        }
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::errors::AppError;
    use async_trait::async_trait;
    use chrono::Utc;
    use serde_json::Value;
    use uuid::Uuid;

    struct SlowCallback;
    struct FailingCallback;

    #[async_trait]
    impl AuthCallback for SlowCallback {
        async fn on_authenticated(
            &self,
            _payload: &AuthCallbackPayload,
        ) -> Result<Value, AppError> {
            tokio::time::sleep(StdDuration::from_secs(CALLBACK_TIMEOUT_SECS + 1)).await;
            Ok(Value::Null)
        }

        async fn on_registered(&self, _payload: &AuthCallbackPayload) -> Result<Value, AppError> {
            tokio::time::sleep(StdDuration::from_secs(CALLBACK_TIMEOUT_SECS + 1)).await;
            Ok(Value::Null)
        }

        async fn on_logout(&self, _user_id: &str) -> Result<(), AppError> {
            Ok(())
        }
    }

    #[async_trait]
    impl AuthCallback for FailingCallback {
        async fn on_authenticated(
            &self,
            _payload: &AuthCallbackPayload,
        ) -> Result<Value, AppError> {
            Err(AppError::Internal(anyhow::anyhow!("callback failed")))
        }

        async fn on_registered(&self, _payload: &AuthCallbackPayload) -> Result<Value, AppError> {
            Err(AppError::Internal(anyhow::anyhow!("callback failed")))
        }

        async fn on_logout(&self, _user_id: &str) -> Result<(), AppError> {
            Err(AppError::Internal(anyhow::anyhow!("callback failed")))
        }
    }

    fn test_payload() -> AuthCallbackPayload {
        AuthCallbackPayload {
            user: crate::models::AuthUser {
                id: Uuid::new_v4(),
                email: Some("test@example.com".to_string()),
                name: Some("Test User".to_string()),
                picture: None,
                wallet_address: None,
                auth_methods: vec![crate::models::AuthMethod::Email],
                email_verified: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            method: crate::models::AuthMethod::Email,
            is_new_user: false,
            session_id: "test-session-id".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("TestAgent/1.0".to_string()),
        }
    }

    #[tokio::test]
    async fn test_authenticated_callback_timeout_returns_none() {
        let callback = Arc::new(SlowCallback);
        let result = call_authenticated_callback_with_timeout(&callback, &test_payload()).await;
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_registered_callback_timeout_returns_none() {
        let callback = Arc::new(SlowCallback);
        let result = call_registered_callback_with_timeout(&callback, &test_payload()).await;
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_authenticated_callback_error_returns_none() {
        let callback = Arc::new(FailingCallback);
        let result = call_authenticated_callback_with_timeout(&callback, &test_payload()).await;
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_logout_callback_timeout_completes() {
        let callback = Arc::new(SlowCallback);
        let result = timeout(
            StdDuration::from_secs(CALLBACK_TIMEOUT_SECS + 1),
            call_logout_callback_with_timeout(&callback, "user-123"),
        )
        .await;
        assert!(result.is_ok());
    }
}
