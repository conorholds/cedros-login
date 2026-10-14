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
    pending_invite_response,
};
use crate::models::{AuthMethod, AuthResponse};
#[cfg(feature = "postgres")]
use crate::repositories::TransactionalOps;
use crate::repositories::{
    generate_api_key, normalize_email, ApiKeyEntity, AuditEventType, CredentialEntity,
    CredentialRepository, CredentialType, MembershipEntity, SessionEntity, UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    attach_auth_cookies, build_json_response_with_cookies, compute_authenticated_post_login,
    email_blocks_signup, enforce_signup_access_code, extract_client_ip_with_fallback,
    find_user_by_verified_email, get_default_org_context, hash_refresh_token,
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
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    pub access_code: Option<String>,
    /// Optional referral code to attribute new user signups
    pub referral: Option<String>,
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

/// Ensure SSO credential exists for user
///
/// Creates credential entry if not already present. Errors are logged but not
/// propagated since credential tracking is observability, not core auth flow.
async fn ensure_sso_credential(
    credential_repo: &dyn CredentialRepository,
    user_id: Uuid,
    provider_id: Uuid,
    subject: &str,
    provider_name: &str,
) -> Result<(), AppError> {
    if let Some(existing) = credential_repo
        .find_sso_identity(provider_id, subject)
        .await?
    {
        if existing.user_id != user_id {
            return Err(AppError::AccountLinkRequired {
                provider: "sso".into(),
            });
        }
    } else {
        let mut credential = CredentialEntity::new(
            user_id,
            CredentialType::SsoOidc,
            Some(format!("SSO: {provider_name}")),
        );
        credential.metadata = Some(serde_json::json!({
            "providerId": provider_id,
            "subject": subject,
        }));
        if let Err(error) = credential_repo.create(credential).await {
            if !credential_repo
                .find_sso_identity(provider_id, subject)
                .await?
                .is_some_and(|existing| existing.user_id == user_id)
            {
                return Err(error);
            }
        }
    }

    // Pre-binding releases stored a generic SSO bookkeeping row without the
    // immutable provider/subject key. Once an exact binding exists, remove
    // those unusable rows so unlinking the final SSO identity cannot leave the
    // generic `sso` marker behind and silently permit re-bootstrap by email.
    for legacy in credential_repo
        .find_by_user_and_type(user_id, CredentialType::SsoOidc)
        .await?
        .into_iter()
        .filter(|credential| !has_sso_identity_metadata(credential))
    {
        credential_repo.delete(legacy.id).await?;
    }
    Ok(())
}

fn has_sso_identity_metadata(credential: &CredentialEntity) -> bool {
    credential.metadata.as_ref().is_some_and(|metadata| {
        metadata
            .get("providerId")
            .and_then(serde_json::Value::as_str)
            .is_some_and(|value| Uuid::parse_str(value).is_ok())
            && metadata
                .get("subject")
                .and_then(serde_json::Value::as_str)
                .is_some_and(|value| !value.is_empty())
    })
}

fn sso_user_id(provider_id: Uuid, subject: &str) -> Uuid {
    use sha2::{Digest, Sha256};
    let mut digest = Sha256::new();
    digest.update(provider_id.as_bytes());
    digest.update([0]);
    digest.update(subject.as_bytes());
    let digest = digest.finalize();
    let mut bytes = [0_u8; 16];
    bytes.copy_from_slice(&digest[..16]);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    Uuid::from_bytes(bytes)
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
            request.access_code,
            request.referral,
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
            "SSO authentication failed: {error} - {description}"
        )));
    }

    // Look up the auth state to find the provider (and capture referral before consuming)
    let auth_state = state
        .storage
        .sso_repository()
        .get_auth_state(query.state)
        .await?
        .ok_or_else(|| AppError::Validation("Invalid or expired SSO state".into()))?;
    let referral_code = auth_state.referral.clone();
    let access_code = auth_state.access_code.clone();

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
    let subject = claims.sub.clone();
    let bound_user = match state
        .credential_repo
        .find_sso_identity(provider.id, &subject)
        .await?
    {
        Some(identity) => state.user_repo.find_by_id(identity.user_id).await?,
        None => None,
    };
    // Recover safely from a prior partial registration: the deterministic ID
    // is derived from the already-verified provider and immutable subject, so
    // only the same external identity can reach this fallback.
    let deterministic_user = if bound_user.is_none() {
        state
            .user_repo
            .find_by_id(sso_user_id(provider.id, &subject))
            .await?
    } else {
        None
    };
    // Email may only bootstrap a one-time legacy SSO binding when the IdP
    // explicitly attests mailbox ownership. Missing/false is profile data only.
    let email_user = if bound_user.is_none()
        && deterministic_user.is_none()
        && claims.email_verified == Some(true)
    {
        find_user_by_verified_email(&state, &normalized_email).await?
    } else {
        None
    };
    let (user, is_new_user, api_key) = match bound_user.or(deterministic_user).or(email_user) {
        Some(mut user) => {
            let membership = state
                .membership_repo
                .find_by_user_and_org(user.id, provider.org_id)
                .await?;
            if !is_member_of_provider_org(&membership) {
                tracing::warn!(
                    user_id = %user.id,
                    provider_id = %provider.id,
                    provider_org_id = %provider.org_id,
                    "Rejected SSO login for non-member user"
                );
                return Err(AppError::Forbidden(
                    "SSO account is not authorized for this organization".into(),
                ));
            }

            let has_exact_binding = state
                .credential_repo
                .find_sso_identity(provider.id, &subject)
                .await?
                .is_some_and(|identity| identity.user_id == user.id);
            if !has_exact_binding && !user.auth_methods.contains(&AuthMethod::Sso) {
                return Err(AppError::AccountLinkRequired {
                    provider: "sso".into(),
                });
            }

            // Update auth_methods if SSO not already listed
            if !user.auth_methods.contains(&AuthMethod::Sso) {
                let user_revision = user.updated_at;
                user.auth_methods.push(AuthMethod::Sso);
                user.updated_at = Utc::now();
                user = state
                    .user_repo
                    .update_if_current(user, user_revision)
                    .await?;
            }
            (user, false, None)
        }
        None => {
            if email_blocks_signup(&state, &normalized_email).await? {
                return Err(AppError::AccountLinkRequired {
                    provider: "sso".into(),
                });
            }
            if !provider.allow_registration {
                return Err(AppError::Forbidden(
                    "Self-registration is disabled for this SSO provider".into(),
                ));
            }

            enforce_signup_access_code(&state, access_code.as_deref()).await?;
            let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
            signup_limit_permit.ensure_available().await?;

            // Create new user (SSO users have no password)
            let now = Utc::now();
            let mut new_user = UserEntity {
                id: sso_user_id(provider.id, &subject),
                email: Some(normalized_email.clone()),
                email_verified: claims.email_verified.unwrap_or(false),
                password_hash: None,
                name: claims.name.or(claims.given_name),
                username: None,
                picture: claims.picture.clone(),
                wallet_address: None,
                google_id: None,
                apple_id: None,
                auth_methods: vec![AuthMethod::Sso],
                is_system_admin: false,
                created_at: now,
                updated_at: now,
                last_login_at: Some(now),
                welcome_completed_at: None,
                referral_code: crate::repositories::generate_referral_code(),
                referred_by: None,
            };

            if let Some(code) = referral_code
                .as_deref()
                .map(str::trim)
                .filter(|code| !code.is_empty())
            {
                match state.user_repo.find_by_referral_code(code).await {
                    Ok(Some(referrer)) => new_user.referred_by = Some(referrer.id),
                    Ok(None) => {}
                    Err(error) => {
                        tracing::warn!(error = %error, "Failed to resolve SSO referral code, ignoring")
                    }
                }
            }
            let membership = MembershipEntity::new(
                new_user.id,
                provider.org_id,
                crate::repositories::OrgRole::Member,
            );
            if state.invite_code_service.gate_enabled().await? {
                let created = state.user_repo.create(new_user).await?;
                signup_limit_permit.record_created();
                state.membership_repo.create(membership).await?;
                ensure_sso_credential(
                    state.storage.credential_repository(),
                    created.id,
                    provider.id,
                    &subject,
                    &provider.name,
                )
                .await?;
                if let Some(response) =
                    pending_invite_response(&state, &created, AuthMethod::Sso, &headers).await?
                {
                    return Ok(response);
                }
                unreachable!(
                    "pending_invite_response returns Some when the invite gate is enabled"
                );
            }

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
                signup_limit_permit.record_created();
                state.membership_repo.create(membership).await?;
                state.api_key_repo.create(api_key_entity).await?;
                created
            };

            #[cfg(not(feature = "postgres"))]
            let user = {
                let created = state.user_repo.create(new_user).await?;
                signup_limit_permit.record_created();
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
        provider.id,
        &subject,
        &provider.name,
    )
    .await?;

    if let Some(response) =
        super::auth::pending_invite_login_response(&state, &user, AuthMethod::Sso).await?
    {
        return Ok(response);
    }
    if let Some(response) =
        super::auth::pending_mfa_response(&state, &user, AuthMethod::Sso, &headers).await?
    {
        return Ok(response);
    }

    // Get memberships for token context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

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
    super::auth::maybe_queue_new_device_alert(
        &state,
        &user,
        ip_address.as_deref(),
        user_agent.as_deref(),
        false,
    )
    .await;
    state
        .storage
        .credential_lifecycle_repo
        .create_session_if_current(&user, session)
        .await?;
    if !is_new_user {
        // New users get last_login_at at creation; stamp returning logins.
        super::auth::touch_last_login(&state.user_repo, user.id).await;
    }

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Sso,
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: referral_code,
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

    let post_login_action = compute_authenticated_post_login(
        &user,
        &token_pair.access_token,
        &state.settings_service,
        &*state.totp_repo,
        &*state.credential_repo,
        &state.subscription_selection_service,
    )
    .await?;

    // Check if we should redirect or return JSON
    if let Some(redirect_uri) = auth_state.redirect_uri {
        let redirect_url = match post_login_action.as_ref() {
            Some(action) if action.action == "choose_subscription" => action
                .redirect_url
                .clone()
                .unwrap_or_else(|| "/subscribe".to_string()),
            _ => build_redirect_url(
                &redirect_uri,
                &token_pair.access_token,
                &token_pair.refresh_token,
                state.config.cookie.enabled,
            )?,
        };
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
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(AuthMethod::Sso),
        post_login: post_login_action,
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

    // Do not place tokens into URLs (even fragments). Fragments can leak via
    // browser history, extensions, crash reports, screenshots, and copy/paste.
    Err(AppError::Validation(
        "SSO redirect requires cookie-based auth; refusing to place tokens in URL".into(),
    ))
}

fn is_member_of_provider_org(membership: &Option<crate::repositories::MembershipEntity>) -> bool {
    membership.is_some()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::InMemoryCredentialRepository;
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

    #[test]
    fn test_is_member_of_provider_org_true_when_membership_exists() {
        let membership = Some(MembershipEntity::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            crate::repositories::OrgRole::Member,
        ));
        assert!(is_member_of_provider_org(&membership));
    }

    #[test]
    fn test_is_member_of_provider_org_false_when_membership_missing() {
        let membership: Option<MembershipEntity> = None;
        assert!(!is_member_of_provider_org(&membership));
    }

    #[tokio::test]
    async fn test_ensure_sso_credential_idempotent() {
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();
        let provider_id = Uuid::new_v4();

        repo.create(CredentialEntity::new(
            user_id,
            CredentialType::SsoOidc,
            Some("Legacy SSO".into()),
        ))
        .await
        .unwrap();

        ensure_sso_credential(&repo, user_id, provider_id, "subject-1", "TestProvider")
            .await
            .unwrap();
        ensure_sso_credential(&repo, user_id, provider_id, "subject-1", "TestProvider")
            .await
            .unwrap();

        let creds = repo.find_by_user(user_id).await.unwrap();
        assert_eq!(creds.len(), 1);
        assert_eq!(creds[0].credential_type, CredentialType::SsoOidc);
        assert_eq!(creds[0].metadata.as_ref().unwrap()["subject"], "subject-1");
    }

    #[test]
    fn sso_user_key_is_stable_per_provider_subject() {
        let provider = Uuid::new_v4();
        assert_eq!(
            sso_user_id(provider, "subject-1"),
            sso_user_id(provider, "subject-1")
        );
        assert_ne!(
            sso_user_id(provider, "subject-1"),
            sso_user_id(provider, "subject-2")
        );
    }
}
