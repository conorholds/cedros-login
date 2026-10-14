//! MFA disable handler and confirmation rules.

use crate::repositories::TotpUpdate;
use axum::{extract::State, http::HeaderMap, Json};
use serde::Deserialize;
use std::sync::Arc;
use zeroize::{Zeroize, ZeroizeOnDrop};

use super::mfa::get_authenticated_session;
use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{AuditEventType, TotpSecret, UserEntity};
use crate::services::EmailService;
use crate::AppState;

/// Request to disable MFA.
///
/// Every account must provide exactly one currently enrolled factor: `code`
/// (current TOTP) or `recoveryCode` (unused recovery code). A password alone
/// is not sufficient to remove the second factor it is meant to complement.
///
/// Secrets are zeroized on drop.
#[derive(Debug, Deserialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
pub struct DisableMfaRequest {
    /// Deprecated and never accepted as the sole confirmation.
    pub password: Option<String>,
    /// Current TOTP code for passwordless accounts.
    pub code: Option<String>,
    /// Unused recovery code for passwordless accounts.
    pub recovery_code: Option<String>,
}

/// POST /auth/mfa/disable - Disable MFA.
pub async fn disable_mfa<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<DisableMfaRequest>,
) -> Result<Json<MessageResponse>, AppError> {
    let (user_id, session_id) = get_authenticated_session(&state, &headers).await?;

    let db_user = state
        .user_repo
        .find_by_id(user_id)
        .await?
        .ok_or(AppError::NotFound("User not found".into()))?;

    state
        .mfa_attempt_service
        .check_allowed(user_id)
        .await
        .map_err(|remaining| {
            AppError::TooManyRequests(format!(
                "Too many verification attempts. Try again in {} seconds",
                remaining.as_secs()
            ))
        })?;

    let enrollment_id = match verify_disable_confirmation(&state, user_id, &db_user, &req).await {
        Ok(id) => id,
        Err(error) => {
            if matches!(error, AppError::InvalidCredentials) {
                let _ = state.mfa_attempt_service.record_failed(user_id).await;
            }
            return Err(error);
        }
    };
    if !state
        .totp_repo
        .update_enrollment(user_id, enrollment_id, TotpUpdate::Disable)
        .await?
    {
        return Err(AppError::InvalidCredentials);
    }
    state
        .session_repo
        .revoke_all_except(user_id, session_id)
        .await?;
    state.mfa_attempt_service.record_success(user_id).await;

    // Log audit event with warning on failure (security-critical event)
    if let Err(e) = state
        .audit_service
        .log_user_event(AuditEventType::MfaDisabled, user_id, Some(&headers))
        .await
    {
        tracing::warn!(error = %e, user_id = %user_id, "Failed to log MFA disabled audit event");
    }

    Ok(Json(MessageResponse {
        message: "MFA disabled successfully".into(),
    }))
}

async fn verify_disable_confirmation<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
    user: &UserEntity,
    req: &DisableMfaRequest,
) -> Result<uuid::Uuid, AppError> {
    verify_disable_factor(state, user_id, user.email.as_deref(), req).await
}

async fn verify_disable_factor<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
    email: Option<&str>,
    req: &DisableMfaRequest,
) -> Result<uuid::Uuid, AppError> {
    let totp_secret = state
        .totp_repo
        .find_by_user(user_id)
        .await?
        .filter(|secret| secret.enabled)
        .ok_or(AppError::InvalidCredentials)?;

    match (
        non_empty(req.code.as_ref()),
        non_empty(req.recovery_code.as_ref()),
    ) {
        (Some(code), None) => verify_totp(state, user_id, email, &totp_secret, code).await,
        (None, Some(recovery_code)) => verify_recovery(state, user_id, recovery_code).await,
        _ => Err(AppError::InvalidCredentials),
    }?;
    Ok(totp_secret.id)
}

async fn verify_totp<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
    email: Option<&str>,
    totp_secret: &TotpSecret,
    code: &str,
) -> Result<(), AppError> {
    let email = email.ok_or(AppError::InvalidCredentials)?;
    let time_step = state
        .totp_service
        .verify_with_replay_check(
            &totp_secret.secret,
            code,
            email,
            totp_secret.last_used_time_step,
        )?
        .ok_or(AppError::InvalidCredentials)?;

    if !state
        .totp_repo
        .update_enrollment(user_id, totp_secret.id, TotpUpdate::RecordStep(time_step))
        .await?
    {
        return Err(AppError::InvalidCredentials);
    }
    Ok(())
}

async fn verify_recovery<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
    recovery_code: &str,
) -> Result<(), AppError> {
    if state
        .totp_repo
        .use_recovery_code(user_id, recovery_code)
        .await?
    {
        Ok(())
    } else {
        Err(AppError::InvalidCredentials)
    }
}

fn non_empty(value: Option<&String>) -> Option<&str> {
    value
        .map(String::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_disable_mfa_request_deserialize() {
        let json = r#"{"password": "mypassword", "code": "123456", "recoveryCode": "abcd"}"#;
        let req: DisableMfaRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.password.as_deref(), Some("mypassword"));
        assert_eq!(req.code.as_deref(), Some("123456"));
        assert_eq!(req.recovery_code.as_deref(), Some("abcd"));
    }
}
