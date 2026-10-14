//! Account deletion handlers.

use axum::{
    extract::{Query, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{Html, IntoResponse},
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::config::ServerConfig;
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    AuditEventType, TokenType,
};
use crate::services::{delete_account, EmailService};
use crate::utils::{authenticate_session, build_logout_cookies};
use crate::AppState;

const DELETE_CONFIRM_TEXT: &str = "DELETE";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestAccountDeletionRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmAccountDeletionRequest {
    pub token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteCurrentAccountRequest {
    pub confirm_text: String,
}

#[derive(Debug, Deserialize)]
pub struct AccountDeletionPageQuery {
    pub token: Option<String>,
}

pub async fn account_deletion_page<C: AuthCallback, E: EmailService>(
    Query(query): Query<AccountDeletionPageQuery>,
) -> Html<String> {
    Html(render_account_deletion_page(query.token.as_deref()))
}

pub async fn request_account_deletion<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<RequestAccountDeletionRequest>,
) -> Result<(StatusCode, Json<MessageResponse>), AppError> {
    let response = generic_request_response();
    let email = normalize_email(&req.email);

    let Some(user) = state.user_repo.find_by_email(&email).await? else {
        return Ok(response);
    };
    if !email_deletion_allowed(&user) {
        return Ok(response);
    }

    queue_account_deletion_email(&state, &user).await?;
    state
        .audit_service
        .log_user_event_or_warn(
            AuditEventType::AccountDeletionRequested,
            user.id,
            Some(&headers),
        )
        .await;

    Ok(response)
}

pub async fn confirm_account_deletion<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ConfirmAccountDeletionRequest>,
) -> Result<(StatusCode, Json<MessageResponse>), AppError> {
    let token_hash = hash_verification_token(&req.token);
    let pending = state
        .verification_repo
        .find_valid(&token_hash, &[TokenType::AccountDeletion])
        .await?
        .ok_or_else(|| AppError::Validation("Invalid or expired deletion token".into()))?;
    let email_id = pending
        .subject_id
        .ok_or_else(|| AppError::Validation("Invalid or expired deletion token".into()))?;
    let email = state
        .user_email_repo
        .find_by_id(email_id)
        .await?
        .filter(|row| row.user_id == pending.user_id && row.is_primary && row.verified_at.is_some())
        .ok_or_else(|| AppError::Validation("Invalid or expired deletion token".into()))?;
    let user = state
        .user_repo
        .find_by_id(pending.user_id)
        .await?
        .filter(|user| user.email.as_deref() == Some(email.email.as_str()) && user.email_verified)
        .ok_or_else(|| AppError::Validation("Invalid or expired deletion token".into()))?;
    if !email_deletion_allowed(&user) {
        return Err(AppError::StepUpRequired);
    }
    if state.totp_repo.has_mfa_enabled(user.id).await? {
        return Err(AppError::StepUpRequired);
    }

    let token = state
        .verification_repo
        .consume_if_valid(&token_hash, &[TokenType::AccountDeletion])
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {e}")))?
        .ok_or_else(|| AppError::Validation("Invalid or expired deletion token".into()))?;

    delete_account(&state, token.user_id, Some(&headers)).await?;

    Ok((
        StatusCode::OK,
        Json(MessageResponse {
            message: "Account deleted successfully".to_string(),
        }),
    ))
}

pub async fn delete_current_account<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<DeleteCurrentAccountRequest>,
) -> Result<impl IntoResponse, AppError> {
    let auth = authenticate_session(&state, &headers).await?;
    let session_id = auth.session_id.ok_or(AppError::StepUpRequired)?;
    state.step_up_service.require_step_up(session_id).await?;
    if req.confirm_text.trim() != DELETE_CONFIRM_TEXT {
        return Err(AppError::Validation(format!(
            "Type {DELETE_CONFIRM_TEXT} to confirm account deletion"
        )));
    }

    delete_account(&state, auth.user_id, Some(&headers)).await?;

    let message = MessageResponse {
        message: "Account deleted successfully".to_string(),
    };

    if state.config.cookie.enabled {
        let mut response = Json(message).into_response();
        for cookie in build_logout_cookies(&state.config.cookie) {
            if let Ok(value) = HeaderValue::from_str(&cookie) {
                response.headers_mut().append(header::SET_COOKIE, value);
            }
        }
        Ok(response)
    } else {
        Ok(Json(message).into_response())
    }
}

async fn queue_account_deletion_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &crate::repositories::UserEntity,
) -> Result<(), AppError> {
    let email = user
        .email
        .as_deref()
        .ok_or_else(|| AppError::Validation("Account has no email address".into()))?;
    let email_row = state
        .user_email_repo
        .list_by_user(user.id)
        .await?
        .into_iter()
        .find(|row| row.is_primary && row.verified_at.is_some() && row.email == email)
        .ok_or_else(|| AppError::Validation("Account email is not verified".into()))?;

    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);
    let proof = crate::repositories::VerificationToken::new(
        user.id,
        Some(email_row.id),
        token_hash,
        TokenType::AccountDeletion,
        default_expiry(TokenType::AccountDeletion),
    );

    let confirmation_base_url = build_account_deletion_page_url(state);
    state
        .comms_service
        .queue_account_deletion_email(
            email,
            user.name.as_deref(),
            &token,
            &confirmation_base_url,
            user.id,
            &[proof],
        )
        .await?;

    Ok(())
}

fn generic_request_response() -> (StatusCode, Json<MessageResponse>) {
    (
        StatusCode::OK,
        Json(MessageResponse {
            message:
                "If an account exists for that email, a deletion confirmation link has been sent"
                    .to_string(),
        }),
    )
}

fn build_account_deletion_page_url<C: AuthCallback, E: EmailService>(
    state: &AppState<C, E>,
) -> String {
    build_account_deletion_page_url_from_config(&state.config.server)
}

fn build_account_deletion_page_url_from_config(server: &ServerConfig) -> String {
    let base_path = server.auth_base_path.trim_end_matches('/');
    let route = if base_path.is_empty() {
        "/account-deletion".to_string()
    } else {
        format!("{base_path}/account-deletion")
    };

    if let Some(frontend_url) = server
        .frontend_url
        .as_deref()
        .filter(|url| !url.trim().is_empty())
    {
        format!("{}{}", frontend_url.trim_end_matches('/'), route)
    } else {
        format!("http://{}:{}{route}", server.host, server.port)
    }
}

fn render_account_deletion_page(token: Option<&str>) -> String {
    let body = if let Some(token) = token {
        format!(
            r#"
<h1>Confirm Account Deletion</h1>
<p>Confirm permanent deletion of your account. Financial and audit records required by law may be retained.</p>
<button id="confirm-button" type="button">Delete Account</button>
<p id="status"></p>
<script>
    const button = document.getElementById('confirm-button');
    const status = document.getElementById('status');
    button.addEventListener('click', async () => {{
      button.disabled = true;
      status.textContent = 'Deleting account...';
      const response = await fetch('./account-deletion/confirm', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ token: '{token}' }})
      }});
    const data = await response.json().catch(() => ({{ error: {{ message: 'Request failed' }} }}));
    status.textContent = data.message || data.error?.message || 'Request failed';
    if (!response.ok) {{
      button.disabled = false;
    }}
  }});
</script>
"#,
            token = escape_html(token)
        )
    } else {
        r#"
<h1>Request Account Deletion</h1>
<p>Enter the email address on your account and we’ll send you a deletion confirmation link.</p>
<form id="request-form">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />
  <button type="submit">Send Deletion Link</button>
</form>
<p id="status"></p>
<script>
  const form = document.getElementById('request-form');
  const status = document.getElementById('status');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    status.textContent = 'Submitting request...';
    const response = await fetch('./account-deletion/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    status.textContent = data.message || data.error?.message || 'Request failed';
  });
</script>
"#
        .to_string()
    };

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Account Deletion</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }}
    main {{ max-width: 560px; margin: 64px auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); }}
    h1 {{ margin-top: 0; font-size: 28px; }}
    p {{ line-height: 1.6; }}
    form {{ display: grid; gap: 12px; }}
    input {{ font-size: 16px; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 12px; }}
    button {{ appearance: none; border: 0; border-radius: 12px; background: #b91c1c; color: white; padding: 12px 16px; font-size: 16px; font-weight: 600; cursor: pointer; }}
    button:disabled {{ opacity: 0.6; cursor: not-allowed; }}
    #status {{ min-height: 24px; color: #334155; }}
  </style>
</head>
<body>
  <main>{body}</main>
</body>
</html>"#
    )
}

fn email_deletion_allowed(user: &crate::repositories::UserEntity) -> bool {
    !user.is_deleted()
        && user.email.is_some()
        && user.email_verified
        && (user.password_hash.is_some()
            || user
                .auth_methods
                .contains(&crate::models::AuthMethod::Email))
}

fn escape_html(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

#[cfg(test)]
mod tests {
    use super::build_account_deletion_page_url_from_config;
    use crate::config::ServerConfig;

    #[test]
    fn builds_deletion_url_from_frontend_url_when_configured() {
        let config = ServerConfig {
            frontend_url: Some("https://app.example.com".to_string()),
            auth_base_path: "/auth".to_string(),
            ..ServerConfig::default()
        };

        let result = build_account_deletion_page_url_from_config(&config);

        assert_eq!(result, "https://app.example.com/auth/account-deletion");
    }

    #[test]
    fn builds_deletion_url_from_server_host_when_frontend_missing() {
        let config = ServerConfig {
            host: "auth.internal".to_string(),
            port: 8443,
            auth_base_path: "/auth".to_string(),
            frontend_url: None,
            ..ServerConfig::default()
        };

        let result = build_account_deletion_page_url_from_config(&config);

        assert_eq!(result, "http://auth.internal:8443/auth/account-deletion");
    }
}

#[cfg(test)]
mod lifecycle_tests {
    use super::*;
    #[test]
    fn email_deletion_requires_an_enrolled_email_credential() {
        let mut user: crate::repositories::UserEntity =
            crate::repositories::UserEntity::new_email_user(
                "owner@example.com".into(),
                "hash".into(),
                None,
            );
        user.email_verified = true;
        assert!(email_deletion_allowed(&user));
        user.email_verified = false;
        assert!(!email_deletion_allowed(&user));
        user.email_verified = true;
        user.password_hash = None;
        user.auth_methods.clear();
        user.google_id = Some("google".into());
        assert!(!email_deletion_allowed(&user));
    }
}
