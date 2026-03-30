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
use crate::errors::AppError;
use crate::models::MessageResponse;
use crate::repositories::{
    default_expiry, generate_verification_token, hash_verification_token, normalize_email,
    AuditEventType, TokenType,
};
use crate::services::{delete_account, EmailService};
use crate::utils::{authenticate, build_logout_cookies};
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
    if user.is_deleted() || user.email.is_none() {
        return Ok(response);
    }

    queue_account_deletion_email(&state, &headers, &user).await?;
    state
        .audit_service
        .log_user_event_or_warn(AuditEventType::AccountDeletionRequested, user.id, Some(&headers))
        .await;

    Ok(response)
}

pub async fn confirm_account_deletion<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    Json(req): Json<ConfirmAccountDeletionRequest>,
) -> Result<(StatusCode, Json<MessageResponse>), AppError> {
    let token_hash = hash_verification_token(&req.token);
    let token = state
        .verification_repo
        .consume_if_valid(&token_hash)
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to consume token: {}", e)))?
        .ok_or_else(|| AppError::Validation("Invalid or expired deletion token".into()))?;

    if token.token_type != TokenType::AccountDeletion {
        return Err(AppError::Validation("Invalid deletion token".into()));
    }

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
    let auth = authenticate(&state, &headers).await?;
    if auth.is_api_key_auth {
        return Err(AppError::Forbidden(
            "Account deletion requires an interactive session".into(),
        ));
    }
    if req.confirm_text.trim() != DELETE_CONFIRM_TEXT {
        return Err(AppError::Validation(format!(
            "Type {} to confirm account deletion",
            DELETE_CONFIRM_TEXT
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
    headers: &HeaderMap,
    user: &crate::repositories::UserEntity,
) -> Result<(), AppError> {
    let email = user
        .email
        .as_deref()
        .ok_or_else(|| AppError::Validation("Account has no email address".into()))?;

    state
        .verification_repo
        .delete_for_user(user.id, TokenType::AccountDeletion)
        .await?;

    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);
    state
        .verification_repo
        .create(
            user.id,
            &token_hash,
            TokenType::AccountDeletion,
            default_expiry(TokenType::AccountDeletion),
        )
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))?;

    let confirmation_base_url = build_account_deletion_page_url(state, headers);
    state
        .comms_service
        .queue_account_deletion_email(
            email,
            user.name.as_deref(),
            &token,
            &confirmation_base_url,
            user.id,
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
    headers: &HeaderMap,
) -> String {
    let default_scheme = state
        .config
        .server
        .frontend_url
        .as_deref()
        .map(|url| if url.starts_with("https://") { "https" } else { "http" })
        .unwrap_or("http");

    let scheme = if state.config.server.trust_proxy {
        headers
            .get("x-forwarded-proto")
            .and_then(|value| value.to_str().ok())
            .filter(|value| !value.is_empty())
            .unwrap_or(default_scheme)
    } else {
        default_scheme
    };

    let host = headers
        .get("x-forwarded-host")
        .or_else(|| headers.get(header::HOST))
        .and_then(|value| value.to_str().ok())
        .filter(|value| !value.is_empty())
        .map(str::to_string)
        .unwrap_or_else(|| format!("{}:{}", state.config.server.host, state.config.server.port));

    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    let route = if base_path.is_empty() {
        "/account-deletion".to_string()
    } else {
        format!("{base_path}/account-deletion")
    };

    format!("{scheme}://{host}{route}")
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
</html>"#,
        body = body
    )
}

fn escape_html(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}
