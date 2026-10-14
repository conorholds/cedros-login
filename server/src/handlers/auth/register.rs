//! User registration handler
//!
//! # Security Considerations: Email Enumeration
//!
//! Mitigations in place:
//! 1. Password validation happens before email existence check
//! 2. Password hashing (slow argon2) happens BEFORE email check
//! 3. Rate limiting on auth endpoints prevents automated enumeration
//! 4. Account lockout after failed attempts
//!
//! This ensures consistent response times (~100ms argon2 hash) regardless
//! of whether the email exists, preventing timing-based enumeration.

use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse, RegisterRequest};
#[cfg(feature = "postgres")]
use crate::repositories::TransactionalOps;
use crate::repositories::{
    default_expiry, generate_api_key, generate_verification_token, hash_verification_token,
    normalize_email, validate_email_ascii_local, ApiKeyEntity, AuditEventType, MembershipEntity,
    SessionEntity, TokenType, UserEntity,
};
use crate::services::{EmailService, TokenContext};
use crate::utils::{
    attach_auth_cookies, compute_authenticated_post_login, compute_post_login, email_blocks_signup,
    enforce_signup_access_code, ensure_primary_email_row, extract_client_ip_with_fallback,
    hash_refresh_token, is_disposable_email, is_valid_email, parse_custom_blocked_domains,
    resolve_org_assignment, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

/// POST /auth/register - Register with email/password
pub async fn register<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<RegisterRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static config
    let email_enabled = state
        .settings_service
        .get_bool("auth_email_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.enabled);
    if !email_enabled {
        return Err(AppError::NotFound("Email auth disabled".into()));
    }
    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;

    // Validate email format
    if !is_valid_email(&req.email) {
        return Err(AppError::Validation("Invalid email format".to_string()));
    }

    // Block disposable email addresses if configured (runtime toggle with config fallback)
    let block_disposable = state
        .settings_service
        .get_bool("auth_email_block_disposable")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.email.block_disposable_emails);

    if block_disposable {
        // Build custom blocked domains set from config + DB setting
        let mut custom_domains: std::collections::HashSet<String> = state
            .config
            .email
            .custom_blocked_domains
            .iter()
            .cloned()
            .collect();
        if let Some(db_domains) = state.settings_service.get("custom_blocked_domains").await? {
            let domains = parse_custom_blocked_domains(&db_domains)?;
            custom_domains.extend(domains.into_iter().map(|d| d.to_lowercase()));
        }
        let custom_ref = if custom_domains.is_empty() {
            None
        } else {
            Some(&custom_domains)
        };
        if is_disposable_email(&req.email, custom_ref) {
            return Err(AppError::DisposableEmailBlocked);
        }
    }

    // Reject non-ASCII local parts to prevent homograph attacks
    validate_email_ascii_local(&req.email)?;

    let normalized_email = normalize_email(&req.email);

    // Validate password strength BEFORE checking email to prevent timing attacks
    // that could enumerate valid emails based on response time differences
    state.password_service.validate(&req.password)?;

    // Hash password BEFORE email check to normalize response timing.
    // Argon2 hashing is slow (~100ms), so doing it regardless of email existence
    // prevents attackers from detecting existing emails via response times.
    let password_hash = state.password_service.hash(req.password.clone()).await?;

    // Check if email already exists
    enforce_signup_access_code(&state, req.access_code.as_deref()).await?;
    if email_blocks_signup(&state, &normalized_email).await? {
        return Err(AppError::EmailExists);
    }
    let mut signup_limit_permit = state.signup_limit_service.acquire().await?;
    signup_limit_permit.ensure_available().await?;

    // Create user
    let mut user =
        UserEntity::new_email_user(normalized_email.clone(), password_hash, req.name.clone());

    if let Some(code) = req
        .referral
        .as_deref()
        .map(str::trim)
        .filter(|code| !code.is_empty())
    {
        match state.user_repo.find_by_referral_code(code).await {
            Ok(Some(referrer)) => user.referred_by = Some(referrer.id),
            Ok(None) => {}
            Err(error) => {
                tracing::warn!(error = %error, "Failed to resolve referral code, ignoring")
            }
        }
    }

    // Policy may permit an unverified account to sign in, but absence of proof
    // must never be persisted as a verified identity assertion.

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Resolve org assignment before persisting the user so pre-setup registration
    // fails closed without creating an orphaned account.
    let org_assignment = resolve_org_assignment(&state, user.id).await?;

    let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
    #[cfg(feature = "postgres")]
    {
        if let Some(pool) = state.postgres_pool.as_ref() {
            TransactionalOps::create_user_with_primary_email_and_membership(
                pool,
                &user,
                &membership,
            )
            .await?;
        } else {
            user = state.user_repo.create(user).await?;
            signup_limit_permit.record_created();
            ensure_primary_email_row(&state, &user).await?;
            state.membership_repo.create(membership).await?;
        }
    }
    #[cfg(not(feature = "postgres"))]
    {
        user = state.user_repo.create(user).await?;
        signup_limit_permit.record_created();
        ensure_primary_email_row(&state, &user).await?;
        state.membership_repo.create(membership).await?;
    }
    drop(signup_limit_permit);

    if state.invite_code_service.gate_enabled().await? {
        state.invite_code_service.mark_pending(user.id).await?;
        if let Some(code) = req
            .invite_code
            .as_deref()
            .map(str::trim)
            .filter(|code| !code.is_empty())
        {
            state
                .invite_code_service
                .redeem_for_user(code, user.id)
                .await?;
        } else {
            let email_queued =
                queue_registration_verification(&state, &req.email, &user, verification_required)
                    .await?;
            let pending_invite_token = create_pending_invite_token(&state, user.id).await?;
            let auth_user = user_entity_to_auth_user(&user);
            let response = AuthResponse {
                user: auth_user,
                tokens: None,
                is_new_user: true,
                callback_data: None,
                api_key: None,
                email_queued,
                invite_code_required: Some(true),
                pending_invite_token: Some(pending_invite_token),
                method: Some(AuthMethod::Email),
                post_login: None,
            };

            let _ = state
                .audit_service
                .log_user_event(AuditEventType::UserRegister, user.id, Some(&headers))
                .await;

            return Ok((StatusCode::CREATED, Json(response)).into_response());
        }
    }

    // Create API key for user
    let (raw_api_key, api_key_entity) = if verification_required {
        (None, None)
    } else {
        let raw = generate_api_key();
        (
            Some(raw.clone()),
            Some(ApiKeyEntity::new(user.id, &raw, "default")),
        )
    };

    // Create session with org context
    let session_id = uuid::Uuid::new_v4();
    let token_context = TokenContext {
        org_id: Some(org_assignment.org_id),
        role: Some(org_assignment.role.as_str().to_string()),
        is_system_admin: None,
        email_verified: Some(user.email_verified),
    };
    let token_pair =
        state
            .jwt_service
            .generate_token_pair_with_context(user.id, session_id, &token_context)?;
    let refresh_expiry =
        Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);

    let mut session = SessionEntity::new_with_id(
        session_id,
        user.id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        refresh_expiry,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());

    // Create authenticated artifacts only when policy permits immediate sign-in.
    // A verification-pending registration must not leave a live hidden session.
    if !verification_required {
        state
            .storage
            .credential_lifecycle_repo
            .create_session_if_current(&user, session)
            .await?;
    }

    if let Some(api_key_entity) = api_key_entity {
        state
            .storage
            .credential_lifecycle_repo
            .create_api_key_if_current(&user, session_id, api_key_entity)
            .await?;
    }

    // Track email queue result to include in response
    let email_queued =
        queue_registration_verification(&state, &req.email, &user, verification_required).await?;

    // Fire callback
    let auth_user = user_entity_to_auth_user(&user);
    let payload = AuthCallbackPayload {
        user: auth_user.clone(),
        method: AuthMethod::Email,
        is_new_user: true,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
        referral: req.referral.clone(),
    };
    let callback_data =
        super::call_registered_callback_with_timeout(&state.callback, &payload).await;

    // Log audit event (fire-and-forget, don't fail registration on audit error)
    let _ = state
        .audit_service
        .log_user_event(AuditEventType::UserRegister, user.id, Some(&headers))
        .await;

    // Return tokens in body only if: verification not required AND cookies disabled
    // (If cookies enabled, tokens are sent via Set-Cookie headers instead)
    let response_tokens = if verification_required || state.config.cookie.enabled {
        None
    } else {
        Some(token_pair.clone())
    };

    let post_login = if verification_required {
        compute_post_login(
            &user,
            &state.settings_service,
            &*state.totp_repo,
            &*state.credential_repo,
        )
        .await?
    } else {
        compute_authenticated_post_login(
            &user,
            &token_pair.access_token,
            &state.settings_service,
            &*state.totp_repo,
            &*state.credential_repo,
            &state.subscription_selection_service,
        )
        .await?
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user: true,
        callback_data,
        api_key: raw_api_key,
        email_queued,
        invite_code_required: None,
        pending_invite_token: None,
        method: Some(AuthMethod::Email),
        post_login,
    };

    // Build response with optional cookies
    let resp = (StatusCode::CREATED, Json(response)).into_response();
    if verification_required {
        Ok(resp)
    } else {
        Ok(attach_auth_cookies(
            &state.config.cookie,
            &token_pair,
            state.jwt_service.refresh_expiry_secs(),
            resp,
        ))
    }
}

async fn queue_registration_verification<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    email: &str,
    user: &UserEntity,
    verification_required: bool,
) -> Result<Option<bool>, AppError> {
    if !verification_required {
        return Ok(None);
    }

    let token = generate_verification_token();
    let token_hash = hash_verification_token(&token);
    let normalized_email = normalize_email(email);
    let email_row = state
        .user_email_repo
        .find_active_by_email(&normalized_email)
        .await?
        .filter(|row| row.user_id == user.id && row.is_primary && row.email == normalized_email)
        .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Primary email row not found")))?;

    let proof = crate::repositories::VerificationToken::new(
        user.id,
        Some(email_row.id),
        token_hash,
        TokenType::EmailVerify,
        default_expiry(TokenType::EmailVerify),
    );

    let queued = state
        .comms_service
        .queue_verification_email(email, user.name.as_deref(), &token, Some(user.id), &[proof])
        .await
        .map_err(|e| {
            tracing::warn!(
                error = %e,
                user_id = %user.id,
                "Failed to queue verification email"
            );
            e
        })
        .is_ok();

    Ok(Some(queued))
}

async fn create_pending_invite_token<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: uuid::Uuid,
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
