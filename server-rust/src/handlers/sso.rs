//! SSO handlers for Enterprise OIDC authentication
//!
//! Endpoints:
//! - POST /auth/sso/start - Start SSO authentication flow
//! - GET /auth/sso/callback - Handle SSO callback from identity provider

use axum::{
    extract::{Query, State},
    http::HeaderMap,
    response::{IntoResponse, Redirect},
    Json,
};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{
    call_authenticated_callback_with_timeout, call_registered_callback_with_timeout,
};
use crate::models::{AuthMethod, AuthResponse};
use crate::repositories::{
    generate_api_key, normalize_email, ApiKeyEntity, AuditEventType, CredentialEntity,
    CredentialRepository, CredentialType, MembershipEntity, SessionEntity, TransactionalOps,
    UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    attach_auth_cookies, build_json_response_with_cookies, compute_post_login,
    extract_client_ip_with_fallback, get_default_org_context, hash_refresh_token,
    user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

/// Request to start SSO authentication
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartSsoRequest {
    /// Organization ID to authenticate with
    pub org_id: Uuid,
    /// Optional redirect URI after authentication
    pub redirect_uri: Option<String>,
}

/// Response with SSO authorization URL
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartSsoResponse {
    /// URL to redirect user to for authentication
    pub auth_url: String,
    /// State ID for tracking the flow
    pub state_id: Uuid,
}

/// Query parameters for SSO callback
#[derive(Debug, Deserialize)]
pub struct SsoCallbackQuery {
    /// Authorization code from identity provider
    pub code: String,
    /// State ID for looking up auth state
    pub state: Uuid,
    /// Optional error from provider
    pub error: Option<String>,
    /// Optional error description
    pub error_description: Option<String>,
}

/// HANDLER-13: Ensure SSO credential exists for user
///
/// Creates credential entry if not already present. Errors are logged but not
/// propagated since credential tracking is observability, not core auth flow.
async fn ensure_sso_credential(
    credential_repo: &dyn CredentialRepository,
    user_id: Uuid,
    provider_name: &str,
) -> Result<(), AppError> {
    if !credential_repo
        .has_credential_type(user_id, CredentialType::SsoOidc)
        .await?
    {
        let credential = CredentialEntity::new(
            user_id,
            CredentialType::SsoOidc,
            Some(format!("SSO: {}", provider_name)),
        );
        // HANDLER-13: Log credential creation failures for audit trail completeness
        if let Err(e) = credential_repo.create(credential).await {
            tracing::warn!(
                user_id = %user_id,
                provider = %provider_name,
                error = %e,
                "Failed to create SSO credential entry"
            );
        }
    }
    Ok(())
}

/// POST /auth/sso/start
///
/// Start SSO authentication flow for an organization.
/// Returns the authorization URL to redirect the user to.
pub async fn start_sso<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(request): Json<StartSsoRequest>,
) -> Result<Json<StartSsoResponse>, AppError> {
    // Enabled check: runtime setting > static config
    let enabled = state
        .settings_service
        .get_bool("feature_sso")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.sso.enabled);
    if !enabled {
        return Err(AppError::NotFound("SSO authentication disabled".into()));
    }

    let redirect_uri = request
        .redirect_uri
        .as_deref()
        .map(|uri| validate_redirect_uri(uri, &state.config.cors.allowed_origins))
        .transpose()?;

    // Find SSO provider for the organization
    let provider = state
        .storage
        .sso_repository()
        .find_enabled_provider_for_org(request.org_id)
        .await?
        .ok_or_else(|| {
            AppError::NotFound("No SSO provider configured for this organization".into())
        })?;

    // Decrypt client secret
    let client_secret = state
        .encryption_service
        .decrypt(&provider.client_secret_encrypted)?;

    // Start the auth flow
    let result = state
        .oidc_service
        .start_auth(
            &provider,
            &client_secret,
            redirect_uri,
            &state.storage.sso_repo,
        )
        .await?;

    Ok(Json(StartSsoResponse {
        auth_url: result.auth_url,
        state_id: result.state_id,
    }))
}

/// GET /auth/sso/callback
///
/// Handle SSO callback from identity provider.
/// Exchanges code for tokens and creates a session.
pub async fn sso_callback<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Query(query): Query<SsoCallbackQuery>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static config
    let enabled = state
        .settings_service
        .get_bool("feature_sso")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.sso.enabled);
    if !enabled {
        return Err(AppError::NotFound("SSO authentication disabled".into()));
    }

    // Check for errors from provider
    if let Some(error) = query.error {
        let description = query.error_description.unwrap_or_default();
        return Err(AppError::Validation(format!(
            "SSO authentication failed: {} - {}",
            error, description
        )));
    }

    // Look up the auth state to find the provider
    let auth_state = state
        .storage
        .sso_repository()
        .get_auth_state(query.state)
        .await?
        .ok_or_else(|| AppError::Validation("Invalid or expired SSO state".into()))?;

    // Find the provider
    let provider = state
        .storage
        .sso_repository()
        .find_provider_by_id(auth_state.provider_id)
        .await?
        .ok_or_else(|| AppError::NotFound("SSO provider not found".into()))?;

    // Decrypt client secret
    let client_secret = state
        .encryption_service
        .decrypt(&provider.client_secret_encrypted)?;

    // Complete the auth flow
    let claims = state
        .oidc_service
        .complete_auth(
            &query.code,
            query.state,
            &provider,
            &client_secret,
            &state.storage.sso_repo,
        )
        .await?;

    // Find or create user
    let email = claims
        .email
        .ok_or_else(|| AppError::Validation("Email not provided by identity provider".into()))?;
    let normalized_email = normalize_email(&email);

    let (user, is_new_user, api_key) = match state
        .user_repo
        .find_by_email(&normalized_email)
        .await?
    {
        Some(mut user) => {
            // Update auth_methods if SSO not already listed
            if !user.auth_methods.contains(&AuthMethod::Sso) {
                user.auth_methods.push(AuthMethod::Sso);
                user.updated_at = Utc::now();
                user = state.user_repo.update(user).await?;
            }
            (user, false, None)
        }
        None => {
            if !provider.allow_registration {
                return Err(AppError::Forbidden(
                    "Self-registration is disabled for this SSO provider".into(),
                ));
            }

            // Create new user (SSO users have no password)
            let now = Utc::now();
            let new_user = UserEntity {
                id: Uuid::new_v4(),
                email: Some(normalized_email.clone()),
                email_verified: claims.email_verified.unwrap_or(false),
                password_hash: None,
                name: claims.name.or(claims.given_name),
                username: None,
                picture: claims.picture.clone(),
                wallet_address: None,
                google_id: None,
                apple_id: None,
                stripe_customer_id: None,
                auth_methods: vec![AuthMethod::Sso],
                is_system_admin: false,
                created_at: now,
                updated_at: now,
                last_login_at: Some(now),
                welcome_completed_at: None,
            };
            let membership =
                MembershipEntity::new(new_user.id, provider.org_id, crate::repositories::OrgRole::Member);
            let raw_api_key = generate_api_key();
            let api_key_entity = ApiKeyEntity::new(new_user.id, &raw_api_key, "default");

            #[cfg(feature = "postgres")]
            let user = if let Some(pool) = state.postgres_pool.as_ref() {
                TransactionalOps::create_user_with_membership_and_api_key(
                    pool,
                    &new_user,
                    &membership,
                    &api_key_entity,
                )
                .await?;
                new_user
            } else {
                let created = state.user_repo.create(new_user).await?;
                state.membership_repo.create(membership).await?;
                state.api_key_repo.create(api_key_entity).await?;
                created
            };

            #[cfg(not(feature = "postgres"))]
            let user = {
                let created = state.user_repo.create(new_user).await?;
                state.membership_repo.create(membership).await?;
                state.api_key_repo.create(api_key_entity).await?;
                created
            };

            (user, true, Some(raw_api_key))
        }
    };

    // Create SSO credential entry
    ensure_sso_credential(
        state.storage.credential_repository(),
        user.id,
        &provider.name,
    )
    .await?;

    // Get memberships for token context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context = get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

    // Create session
    let session_id = Uuid::new_v4();
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(axum::http::header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let mut session = SessionEntity::new_with_id(
        session_id,
        user.id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());
    state.session_repo.create(session).await?;

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Sso,
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: None,
    };
    let callback_data = if is_new_user {
        call_registered_callback_with_timeout(&state.callback, &payload).await
    } else {
        call_authenticated_callback_with_timeout(&state.callback, &payload).await
    };

    // Log audit event
    let event_type = if is_new_user {
        AuditEventType::UserRegister
    } else {
        AuditEventType::UserLogin
    };
    let _ = state
        .audit_service
        .log_user_event(event_type, user.id, Some(&headers))
        .await;

    // Check if we should redirect or return JSON
    if let Some(redirect_uri) = auth_state.redirect_uri {
        let redirect_url = build_redirect_url(
            &redirect_uri,
            &token_pair.access_token,
            &token_pair.refresh_token,
            state.config.cookie.enabled,
        )?;
        let response = Redirect::temporary(&redirect_url).into_response();
        let response = attach_auth_cookies(
            &state.config.cookie,
            &token_pair,
            state.jwt_service.refresh_expiry_secs(),
            response,
        );
        return Ok(response);
    }

    // Return JSON response with tokens
    let response_tokens = if state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user,
        callback_data,
        api_key,
        email_queued: None,
        post_login: compute_post_login(&user, &state.settings_service, &*state.totp_repo, &*state.credential_repo, &*state.wallet_material_repo, &*state.storage.pending_wallet_recovery_repo).await,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    )
    .into_response())
}

fn validate_redirect_uri(
    redirect_uri: &str,
    allowed_origins: &[String],
) -> Result<String, AppError> {
    if allowed_origins.is_empty() {
        return Err(AppError::Forbidden(
            "Redirect URI not allowed without explicit allowed origins".into(),
        ));
    }

    let parsed = url::Url::parse(redirect_uri)
        .map_err(|_| AppError::Validation("Invalid redirect URI".into()))?;
    let host = parsed
        .host_str()
        .ok_or_else(|| AppError::Validation("Redirect URI must include host".into()))?;

    let origin = match (parsed.port(), parsed.port_or_known_default()) {
        (Some(port), Some(default_port)) if port == default_port => {
            format!("{}://{}", parsed.scheme(), host)
        }
        (Some(port), _) => format!("{}://{}:{}", parsed.scheme(), host, port),
        (None, _) => format!("{}://{}", parsed.scheme(), host),
    };

    if !allowed_origins.iter().any(|allowed| allowed == &origin) {
        return Err(AppError::Forbidden("Redirect URI not allowed".into()));
    }

    Ok(redirect_uri.to_string())
}

fn build_redirect_url(
    redirect_uri: &str,
    _access_token: &str,
    _refresh_token: &str,
    cookies_enabled: bool,
) -> Result<String, AppError> {
    if cookies_enabled {
        return Ok(redirect_uri.to_string());
    }

    // SEC-02: Do not place tokens into URLs (even fragments). Fragments can leak via
    // browser history, extensions, crash reports, screenshots, and copy/paste.
    Err(AppError::Validation(
        "SSO redirect requires cookie-based auth; refusing to place tokens in URL".into(),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::errors::AppError;
    use crate::repositories::InMemoryCredentialRepository;
    use async_trait::async_trait;
    use chrono::Utc;
    use serde_json::Value;
    use std::sync::Arc;
    use std::time::Duration as StdDuration;
    use uuid::Uuid;

    #[test]
    fn test_validate_redirect_uri_allows_matching_origin() {
        let allowed = vec!["https://app.example.com".to_string()];
        let uri = "https://app.example.com/sso/callback";
        let result = validate_redirect_uri(uri, &allowed).unwrap();
        assert_eq!(result, uri);
    }

    #[test]
    fn test_validate_redirect_uri_allows_default_port() {
        let allowed = vec!["https://app.example.com".to_string()];
        let uri = "https://app.example.com:443/sso/callback";
        let result = validate_redirect_uri(uri, &allowed).unwrap();
        assert_eq!(result, uri);
    }

    #[test]
    fn test_validate_redirect_uri_rejects_unlisted_origin() {
        let allowed = vec!["https://app.example.com".to_string()];
        let uri = "https://evil.example.com/steal";
        let result = validate_redirect_uri(uri, &allowed);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_redirect_uri_rejects_when_no_allowed_origins() {
        let allowed: Vec<String> = vec![];
        let uri = "https://app.example.com/sso/callback";
        let result = validate_redirect_uri(uri, &allowed);
        assert!(result.is_err());
    }

    #[test]
    fn test_build_redirect_url_rejects_tokens_when_cookies_disabled() {
        let uri = "https://app.example.com/sso/callback";
        let result = build_redirect_url(uri, "access123", "refresh456", false);
        assert!(result.is_err());
    }

    #[test]
    fn test_build_redirect_url_omits_tokens_when_cookies_enabled() {
        let uri = "https://app.example.com/sso/callback";
        let result = build_redirect_url(uri, "access123", "refresh456", true).unwrap();
        assert_eq!(result, uri);
    }

    struct SlowCallback;

    #[async_trait]
    impl AuthCallback for SlowCallback {
        async fn on_authenticated(
            &self,
            _payload: &AuthCallbackPayload,
        ) -> Result<Value, AppError> {
            tokio::time::sleep(StdDuration::from_secs(3)).await;
            Ok(Value::Null)
        }

        async fn on_registered(&self, _payload: &AuthCallbackPayload) -> Result<Value, AppError> {
            Ok(Value::Null)
        }

        async fn on_logout(&self, _user_id: &str) -> Result<(), AppError> {
            Ok(())
        }
    }

    fn test_payload() -> AuthCallbackPayload {
        AuthCallbackPayload {
            user: crate::models::AuthUser {
                id: Uuid::new_v4(),
                email: Some("test@example.com".to_string()),
                name: Some("Test User".to_string()),
                username: None,
                picture: None,
                wallet_address: None,
                auth_methods: vec![AuthMethod::Email],
                email_verified: true,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                welcome_completed_at: None,
            },
            method: AuthMethod::Sso,
            is_new_user: false,
            session_id: "test-session-id".to_string(),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("TestAgent/1.0".to_string()),
            referral: None,
        }
    }

    #[tokio::test]
    async fn test_sso_callback_timeout_helper_returns_none() {
        let callback = Arc::new(SlowCallback);
        let result = call_authenticated_callback_with_timeout(&callback, &test_payload()).await;
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_ensure_sso_credential_idempotent() {
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();

        ensure_sso_credential(&repo, user_id, "TestProvider")
            .await
            .unwrap();
        ensure_sso_credential(&repo, user_id, "TestProvider")
            .await
            .unwrap();

        let creds = repo.find_by_user(user_id).await.unwrap();
        assert_eq!(creds.len(), 1);
        assert_eq!(creds[0].credential_type, CredentialType::SsoOidc);
    }

}
