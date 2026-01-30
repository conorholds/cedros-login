//! Callback trait for integrating with host applications

mod webhook;

pub use webhook::{
    verify_signature, AuthWebhookData, LogoutWebhookData, WebhookCallback, WebhookConfig,
    WebhookData, WebhookEvent, WebhookPayload,
};

use crate::errors::AppError;
use crate::models::{AuthMethod, AuthUser};
use async_trait::async_trait;
use serde::Serialize;
use serde_json::Value;

/// Payload passed to callbacks
#[derive(Debug, Clone, Serialize)]
pub struct AuthCallbackPayload {
    pub user: AuthUser,
    pub method: AuthMethod,
    pub is_new_user: bool,
    pub session_id: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

/// Trait for handling authenticated user events.
/// Implement this to integrate with your application.
#[async_trait]
pub trait AuthCallback: Send + Sync {
    /// Called when a user successfully authenticates.
    /// Return custom data to include in the response.
    async fn on_authenticated(&self, payload: &AuthCallbackPayload) -> Result<Value, AppError>;

    /// Called when a new user registers.
    /// Use this to create application-specific user data.
    async fn on_registered(&self, payload: &AuthCallbackPayload) -> Result<Value, AppError>;

    /// Called when a user logs out.
    async fn on_logout(&self, user_id: &str) -> Result<(), AppError>;
}

/// Default callback that does nothing extra
pub struct NoopCallback;

#[async_trait]
impl AuthCallback for NoopCallback {
    async fn on_authenticated(&self, _payload: &AuthCallbackPayload) -> Result<Value, AppError> {
        Ok(Value::Object(serde_json::Map::new()))
    }

    async fn on_registered(&self, _payload: &AuthCallbackPayload) -> Result<Value, AppError> {
        Ok(Value::Object(serde_json::Map::new()))
    }

    async fn on_logout(&self, _user_id: &str) -> Result<(), AppError> {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    fn test_payload() -> AuthCallbackPayload {
        AuthCallbackPayload {
            user: AuthUser {
                id: Uuid::new_v4(),
                email: Some("test@example.com".to_string()),
                name: Some("Test User".to_string()),
                picture: None,
                wallet_address: None,
                auth_methods: vec![AuthMethod::Email],
                email_verified: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            method: AuthMethod::Email,
            is_new_user: false,
            session_id: "test-session-id".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("TestAgent/1.0".to_string()),
        }
    }

    #[tokio::test]
    async fn test_noop_callback_on_authenticated() {
        let callback = NoopCallback;
        let payload = test_payload();

        let result = callback.on_authenticated(&payload).await;
        assert!(result.is_ok());

        let value = result.unwrap();
        assert!(value.is_object());
        assert!(value.as_object().unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_noop_callback_on_registered() {
        let callback = NoopCallback;
        let mut payload = test_payload();
        payload.is_new_user = true;

        let result = callback.on_registered(&payload).await;
        assert!(result.is_ok());

        let value = result.unwrap();
        assert!(value.is_object());
        assert!(value.as_object().unwrap().is_empty());
    }

    #[tokio::test]
    async fn test_noop_callback_on_logout() {
        let callback = NoopCallback;

        let result = callback.on_logout("user-123").await;
        assert!(result.is_ok());
    }

    #[test]
    fn test_auth_callback_payload_serialization() {
        let payload = test_payload();

        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("test@example.com"));
        assert!(json.contains("Test User"));
        assert!(json.contains("email"));
        assert!(json.contains("test-session-id"));
        assert!(json.contains("127.0.0.1"));
    }

    #[test]
    fn test_auth_callback_payload_with_solana() {
        let payload = AuthCallbackPayload {
            user: AuthUser {
                id: Uuid::new_v4(),
                email: None,
                name: None,
                picture: None,
                wallet_address: Some("SoLaNaWaLlEtAdDrEsS".to_string()),
                auth_methods: vec![AuthMethod::Solana],
                email_verified: false,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            method: AuthMethod::Solana,
            is_new_user: true,
            session_id: "solana-session".to_string(),
            ip_address: None,
            user_agent: None,
        };

        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("SoLaNaWaLlEtAdDrEsS"));
        assert!(json.contains("solana"));
        assert!(json.contains("\"isNewUser\":true") || json.contains("\"is_new_user\":true"));
    }

    #[test]
    fn test_auth_callback_payload_with_google() {
        let payload = AuthCallbackPayload {
            user: AuthUser {
                id: Uuid::new_v4(),
                email: Some("google@gmail.com".to_string()),
                name: Some("Google User".to_string()),
                picture: Some("https://example.com/pic.jpg".to_string()),
                wallet_address: None,
                auth_methods: vec![AuthMethod::Google],
                email_verified: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
            },
            method: AuthMethod::Google,
            is_new_user: false,
            session_id: "google-session".to_string(),
            ip_address: Some("10.0.0.1".to_string()),
            user_agent: Some("Chrome/120.0".to_string()),
        };

        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("google@gmail.com"));
        assert!(json.contains("Google User"));
        assert!(json.contains("https://example.com/pic.jpg"));
        assert!(json.contains("google"));
    }
}
