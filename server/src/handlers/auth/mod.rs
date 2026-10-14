//! Authentication handlers for email/password flow

mod login;
mod login_session;
mod mfa_login;
mod new_device_alert;
mod refresh;
mod register;
mod session;

pub use login::login;
pub use mfa_login::complete_mfa_login;
pub(crate) use new_device_alert::{
    maybe_queue_new_device_alert, maybe_queue_new_device_alert_after_session,
};
pub use refresh::refresh;
pub use register::register;
pub use session::{get_user, logout, logout_all, update_profile, welcome_completed};

use std::sync::Arc;
use std::time::Duration as StdDuration;

use axum::{
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};

use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse};
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, AuditEventType,
    TokenType, UserEntity,
};
use crate::services::EmailService;
use crate::AppState;
use tokio::time::timeout;
use uuid::Uuid;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::extension_events::{publish_server_event, registration_created_event, user_login_event};
use crate::repositories::UserRepository;

const CALLBACK_TIMEOUT_SECS: u64 = 2;

/// Stamp `last_login_at` on the user row after a successful login (Postgres
/// also bumps `updated_at` via the users table trigger). Non-fatal: a failed
/// timestamp update must never fail an otherwise-valid authentication.
pub(crate) async fn touch_last_login(user_repo: &Arc<dyn UserRepository>, user_id: Uuid) {
    if let Err(error) = user_repo.update_last_login(user_id).await {
        tracing::warn!(
            user_id = %user_id,
            error = %error,
            "Failed to update last_login_at after login"
        );
    }
}

pub(crate) async fn pending_invite_response<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    method: AuthMethod,
    headers: &HeaderMap,
) -> Result<Option<Response>, AppError> {
    if !state.invite_code_service.gate_enabled().await? {
        return Ok(None);
    }

    state.invite_code_service.mark_pending(user.id).await?;
    let token = issue_pending_invite_token(state, user.id).await?;

    let response = AuthResponse {
        user: crate::utils::user_entity_to_auth_user(user),
        tokens: None,
        is_new_user: true,
        callback_data: None,
        api_key: None,
        email_queued: None,
        post_login: None,
        invite_code_required: Some(true),
        pending_invite_token: Some(token),
        method: Some(method),
    };

    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserRegister, user.id, Some(headers))
        .await;

    Ok(Some((StatusCode::CREATED, Json(response)).into_response()))
}

/// Re-apply the registration gate before any existing-user login can issue an
/// MFA challenge or session. Pending state is durable across authentication
/// methods; disabling the gate explicitly releases it.
pub(crate) async fn pending_invite_login_response<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    method: AuthMethod,
) -> Result<Option<Response>, AppError> {
    if !state.invite_code_service.is_user_pending(user.id).await? {
        return Ok(None);
    }
    if !state.invite_code_service.gate_enabled().await? {
        state.invite_code_service.activate_user(user.id).await?;
        return Ok(None);
    }

    let token = issue_pending_invite_token(state, user.id).await?;
    let response = AuthResponse {
        user: crate::utils::user_entity_to_auth_user(user),
        tokens: None,
        is_new_user: false,
        callback_data: None,
        api_key: None,
        email_queued: None,
        post_login: None,
        invite_code_required: Some(true),
        pending_invite_token: Some(token),
        method: Some(method),
    };
    Ok(Some((StatusCode::OK, Json(response)).into_response()))
}

async fn issue_pending_invite_token<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
) -> Result<String, AppError> {
    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);
    state
        .verification_repo
        .create(
            user_id,
            &token_hash,
            TokenType::InviteCodePending,
            default_expiry(TokenType::InviteCodePending),
        )
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {e}")))?;
    Ok(token)
}

/// Stop every primary-authentication route at the same account-level MFA gate.
/// The method prefix is covered by the stored token hash, so it cannot be
/// changed without invalidating the challenge and the eventual callback/audit
/// records retain the actual primary method.
pub(crate) async fn pending_mfa_response<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    method: AuthMethod,
    headers: &HeaderMap,
) -> Result<Option<Response>, AppError> {
    if !state.totp_repo.has_mfa_enabled(user.id).await? {
        return Ok(None);
    }

    let mfa_token = format!("{}.{}", method.as_str(), generate_verification_token());
    let token_hash = hash_verification_token(&mfa_token);
    state
        .storage
        .credential_lifecycle_repo
        .create_mfa_challenge_if_current(user, &token_hash, default_expiry(TokenType::MfaPending))
        .await?;

    if let Err(error) = state
        .audit_service
        .log_user_event(AuditEventType::MfaChallengeIssued, user.id, Some(headers))
        .await
    {
        tracing::warn!(%error, user_id = %user.id, "Failed to log MFA challenge audit event");
        metrics::counter!("security.audit_log.failure").increment(1);
    }

    Ok(Some(
        Json(serde_json::json!({
            "mfaRequired": true,
            "mfaToken": mfa_token,
            "userId": user.id,
        }))
        .into_response(),
    ))
}

pub(crate) async fn call_authenticated_callback_with_timeout<C: AuthCallback>(
    callback: &Arc<C>,
    payload: &AuthCallbackPayload,
) -> Option<serde_json::Value> {
    publish_server_event(&user_login_event(payload));

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
    publish_server_event(&registration_created_event(payload));

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
            tokio::time::sleep(StdDuration::from_secs(CALLBACK_TIMEOUT_SECS + 1)).await;
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
                emails: Vec::new(),
                name: Some("Test User".to_string()),
                username: None,
                picture: None,
                wallet_address: None,
                auth_methods: vec![crate::models::AuthMethod::Email],
                email_verified: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                welcome_completed_at: None,
                referral_code: None,
            },
            method: crate::models::AuthMethod::Email,
            is_new_user: false,
            session_id: "test-session-id".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("TestAgent/1.0".to_string()),
            referral: None,
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
        let started = tokio::time::Instant::now();
        let result = timeout(
            StdDuration::from_secs(CALLBACK_TIMEOUT_SECS + 1),
            call_logout_callback_with_timeout(&callback, "user-123"),
        )
        .await;
        assert!(result.is_ok());
        assert!(started.elapsed() >= StdDuration::from_secs(CALLBACK_TIMEOUT_SECS));
    }
}
