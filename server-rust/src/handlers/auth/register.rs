//! User registration handler
//!
//! # Security Considerations: Email Enumeration
//!
//! Mitigations in place:
//! 1. Password validation happens before email existence check
//! 2. Password hashing (slow argon2) happens BEFORE email check (S-07 fix)
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
#[cfg(feature = "postgres")]
use sqlx::PgPool;
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthResponse, RegisterRequest};
use crate::repositories::{
    default_expiry, generate_api_key, generate_verification_token, hash_verification_token,
    normalize_email, validate_email_ascii_local, ApiKeyEntity, AuditEventType, MembershipEntity,
    SessionEntity, TokenType, UserEntity,
};
use crate::services::{EmailService, TokenContext};
use crate::utils::{
    attach_auth_cookies, compute_post_login, extract_client_ip_with_fallback, hash_refresh_token,
    is_disposable_email, is_valid_email, resolve_org_assignment, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

#[cfg(feature = "postgres")]
fn auth_methods_to_strings(methods: &[AuthMethod]) -> Vec<String> {
    methods
        .iter()
        .map(|m| match m {
            AuthMethod::Email => "email".to_string(),
            AuthMethod::Google => "google".to_string(),
            AuthMethod::Apple => "apple".to_string(),
            AuthMethod::Solana => "solana".to_string(),
            AuthMethod::WebAuthn => "webauthn".to_string(),
            AuthMethod::Sso => "sso".to_string(),
        })
        .collect()
}

#[cfg(feature = "postgres")]
async fn register_with_transaction(
    pool: &PgPool,
    user: &UserEntity,
    membership: &MembershipEntity,
    api_key: Option<&ApiKeyEntity>,
    session: &SessionEntity,
) -> Result<(), AppError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    let auth_methods = auth_methods_to_strings(&user.auth_methods);

    sqlx::query(
        r#"
        INSERT INTO users (id, email, email_verified, password_hash, name, picture,
                           wallet_address, google_id, auth_methods, is_system_admin,
                           created_at, updated_at, referral_code, referred_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        "#,
    )
    .bind(user.id)
    .bind(&user.email)
    .bind(user.email_verified)
    .bind(&user.password_hash)
    .bind(&user.name)
    .bind(&user.picture)
    .bind(&user.wallet_address)
    .bind(&user.google_id)
    .bind(&auth_methods)
    .bind(user.is_system_admin)
    .bind(user.created_at)
    .bind(user.updated_at)
    .bind(&user.referral_code)
    .bind(user.referred_by)
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    sqlx::query(
        r#"
        INSERT INTO memberships (id, user_id, org_id, role)
        VALUES ($1, $2, $3, $4)
        "#,
    )
    .bind(membership.id)
    .bind(membership.user_id)
    .bind(membership.org_id)
    .bind(membership.role.as_str())
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    if let Some(api_key) = api_key {
        sqlx::query(
            r#"
            INSERT INTO api_keys (id, user_id, key_hash, key_prefix, created_at, last_used_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(api_key.id)
        .bind(api_key.user_id)
        .bind(&api_key.key_hash)
        .bind(&api_key.key_prefix)
        .bind(api_key.created_at)
        .bind(api_key.last_used_at)
        .execute(&mut *tx)
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
    }

    sqlx::query(
        r#"
        INSERT INTO sessions (id, user_id, refresh_token_hash, ip_address, user_agent,
                             created_at, expires_at, revoked_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
    )
    .bind(session.id)
    .bind(session.user_id)
    .bind(&session.refresh_token_hash)
    .bind(&session.ip_address)
    .bind(&session.user_agent)
    .bind(session.created_at)
    .bind(session.expires_at)
    .bind(session.revoked_at)
    .execute(&mut *tx)
    .await
    .map_err(|e| AppError::Internal(e.into()))?;

    tx.commit()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
    Ok(())
}

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

    // GeoIP country screening (fail-open: skipped when header not configured or absent)
    state.sanctions_service.check_country_from_request(&headers).await?;

    // Validate email format
    if !is_valid_email(&req.email) {
        return Err(AppError::Validation("Invalid email format".to_string()));
    }

    // SEC-29: Block disposable email addresses if configured (runtime toggle with config fallback)
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
        if let Ok(Some(db_domains)) = state.settings_service.get("custom_blocked_domains").await {
            if let Ok(domains) = serde_json::from_str::<Vec<String>>(&db_domains) {
                custom_domains.extend(domains.into_iter().map(|d| d.to_lowercase()));
            }
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

    // SRV-10: Reject non-ASCII local parts to prevent homograph attacks
    validate_email_ascii_local(&req.email)?;

    let normalized_email = normalize_email(&req.email);

    // Validate password strength BEFORE checking email to prevent timing attacks
    // that could enumerate valid emails based on response time differences
    state.password_service.validate(&req.password)?;

    // S-07: Hash password BEFORE email check to normalize response timing.
    // Argon2 hashing is slow (~100ms), so doing it regardless of email existence
    // prevents attackers from detecting existing emails via response times.
    let password_hash = state.password_service.hash(req.password.clone()).await?;

    // Check if email already exists
    if state.user_repo.email_exists(&normalized_email).await? {
        return Err(AppError::EmailExists);
    }

    // Signup gating: enforce access codes and/or rate limits
    let gate_result = state
        .signup_gating_service
        .check_signup(req.access_code.as_deref())
        .await?;

    // Create user
    let mut user =
        UserEntity::new_email_user(normalized_email.clone(), password_hash, req.name.clone());

    // Resolve referral: if feature enabled and referral code provided, link referrer
    let referrals_enabled = state
        .settings_service
        .get_bool("feature_referrals_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);
    if referrals_enabled {
        if let Some(ref code) = req.referral {
            match state.user_repo.find_by_referral_code(code).await {
                Ok(Some(referrer)) => {
                    user.referred_by = Some(referrer.id);
                }
                Ok(None) => {
                    // Soft validation: don't block registration for invalid referral codes
                    tracing::debug!(referral_code = %code, "Referral code not found, ignoring");
                }
                Err(e) => {
                    tracing::warn!(error = %e, "Failed to look up referral code, ignoring");
                }
            }
        }
    }

    // SRV-11: When verification is not required, mark email as verified at registration.
    // This prevents a race where config flips from false→true after registration,
    // leaving users in an unverifiable state.
    if !state.config.email.require_verification {
        user.email_verified = true;
    }

    // Create API key for user
    let (raw_api_key, api_key_entity) = if state.config.email.require_verification {
        (None, None)
    } else {
        let raw = generate_api_key();
        (
            Some(raw.clone()),
            Some(ApiKeyEntity::new(user.id, &raw, "default")),
        )
    };

    let ip_address =
        extract_client_ip_with_fallback(&headers, state.config.server.trust_proxy, peer_ip);
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    // Persist user FIRST — org resolution may auto-create a "Default" org
    // whose owner_id FK references users.id, so the user row must exist.
    user = state.user_repo.create(user).await?;

    // NOW resolve org assignment — user exists in DB, FK satisfied
    let org_assignment = resolve_org_assignment(&state, user.id).await?;
    let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);

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

    // Create membership, API key, session
    state.membership_repo.create(membership).await?;
    if let Some(api_key_entity) = api_key_entity {
        state.api_key_repo.create(api_key_entity).await?;
    }
    state.session_repo.create(session).await?;

    // Mark access code as used (non-fatal — don't break registration)
    if let Some(code_id) = gate_result.access_code_id {
        if let Err(e) = state.signup_gating_service.mark_code_used(code_id).await {
            tracing::warn!(
                user_id = %user.id,
                code_id = %code_id,
                error = %e,
                "Failed to mark access code as used"
            );
        }
    }

    // Auto-enroll wallet (non-fatal — don't break registration)
    if let Err(e) = crate::utils::auto_enroll_wallet(&state, user.id, &req.password, &headers).await
    {
        tracing::warn!(user_id = %user.id, error = %e, "Auto wallet enrollment failed");
    }

    // Issue referral signup reward (non-fatal — don't break registration)
    if let Some(referrer_id) = user.referred_by {
        if let Err(e) = crate::services::referral_reward_service::issue_signup_reward(
            &*state.user_repo,
            &*state.credit_repo,
            &*state.referral_payout_repo,
            &state.settings_service,
            &*state.callback,
            user.id,
            referrer_id,
            &state.config.privacy.company_currency,
        )
        .await
        {
            tracing::warn!(
                user_id = %user.id,
                referrer_id = %referrer_id,
                error = %e,
                "Failed to issue referral signup reward"
            );
        }
    }

    // S-05: Track email queue result to include in response
    let mut email_queued: Option<bool> = None;
    if state.config.email.require_verification {
        let token = generate_verification_token();
        let token_hash = hash_verification_token(&token);

        state
            .verification_repo
            .create(
                user.id,
                &token_hash,
                TokenType::EmailVerify,
                default_expiry(TokenType::EmailVerify),
            )
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create token: {}", e)))?;

        let queued = state
            .comms_service
            .queue_verification_email(&req.email, user.name.as_deref(), &token, Some(user.id))
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
        email_queued = Some(queued);
    }

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
    let response_tokens = if state.config.email.require_verification || state.config.cookie.enabled
    {
        None
    } else {
        Some(token_pair.clone())
    };

    let response = AuthResponse {
        user: auth_user,
        tokens: response_tokens,
        is_new_user: true,
        callback_data,
        api_key: raw_api_key,
        email_queued,
        post_login: compute_post_login(&user, &state.settings_service, &*state.totp_repo, &*state.credential_repo, &*state.wallet_material_repo, &*state.storage.pending_wallet_recovery_repo).await,
    };

    // Build response with optional cookies
    let resp = (StatusCode::CREATED, Json(response)).into_response();
    if state.config.email.require_verification {
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
