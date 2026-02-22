//! Apple Sign-In authentication handler

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
#[cfg(feature = "postgres")]
use sqlx::PgPool;
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::handlers::auth::{
    call_authenticated_callback_with_timeout, call_registered_callback_with_timeout,
};
use crate::models::{AppleAuthRequest, AuthMethod, AuthResponse};
use crate::repositories::{
    generate_api_key, normalize_email, ApiKeyEntity, AuditEventType, MembershipEntity,
    SessionEntity, UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user, PeerIp,
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
async fn create_user_with_membership_and_api_key_tx(
    pool: &PgPool,
    user: &UserEntity,
    membership: &MembershipEntity,
    api_key: &ApiKeyEntity,
) -> Result<(), AppError> {
    let mut tx = pool
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;

    let auth_methods = auth_methods_to_strings(&user.auth_methods);

    sqlx::query(
        r#"
        INSERT INTO users (id, email, email_verified, password_hash, name, picture,
                           wallet_address, google_id, apple_id, stripe_customer_id, auth_methods, is_system_admin,
                           created_at, updated_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
    .bind(&user.apple_id)
    .bind(&user.stripe_customer_id)
    .bind(&auth_methods)
    .bind(user.is_system_admin)
    .bind(user.created_at)
    .bind(user.updated_at)
    .bind(user.last_login_at)
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

    tx.commit()
        .await
        .map_err(|e| AppError::Internal(e.into()))?;
    Ok(())
}

/// POST /auth/apple - Authenticate with Apple ID token
pub async fn apple_auth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<AppleAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    if !state.config.apple.enabled {
        return Err(AppError::NotFound("Apple auth disabled".into()));
    }

    // Verify the Apple ID token
    let claims = state.apple_service.verify_id_token(&req.id_token).await?;

    // Check if user exists by Apple ID
    let existing_user = state.user_repo.find_by_apple_id(&claims.sub).await?;

    let (user, is_new_user, api_key) = if let Some(user) = existing_user {
        (user, false, None)
    } else {
        // SEC-30: Validate real_user_status to prevent bot registrations.
        // Apple's anti-fraud system indicates if the user is likely a real person.
        // We only block new user registrations with status=1 (unknown/potential bot).
        // Existing users and status=0 (unsupported device) or status=2 (real) are allowed.
        if !claims.is_likely_real() {
            tracing::warn!(
                apple_id = %claims.sub,
                real_user_status = ?claims.real_user_status,
                "Rejected Apple Sign-In registration: potential bot detected"
            );
            return Err(AppError::Validation(
                "Unable to verify account authenticity. Please try again later.".to_string(),
            ));
        }

        // H-06: Security check - prevent account takeover via Apple OAuth.
        // If email already exists with another auth method (email/password),
        // reject the login. Automatic account linking is intentionally NOT
        // implemented. Users should use their original auth method.
        //
        // NEW-03: Note on hidden emails - When users choose "Hide My Email",
        // Apple provides a unique relay address (e.g., xyz@privaterelay.appleid.com).
        // The email field is only None in rare cases (very old Apple accounts or
        // specific API configurations). The collision check handles relay emails
        // correctly since they are unique per user per app.
        let normalized_email = claims.email.as_deref().map(normalize_email);
        if let Some(ref email) = normalized_email {
            if state.user_repo.email_exists(email).await? {
                return Err(AppError::EmailExists);
            }
        }

        // Create new user
        // Note: Apple may not provide email in rare edge cases (legacy accounts).
        // Users created without email can only authenticate via Apple ID.
        // This is acceptable as the apple_id field uniquely identifies them.
        let now = Utc::now();
        let user = UserEntity {
            id: uuid::Uuid::new_v4(),
            email: normalized_email.clone(),
            email_verified: claims.is_email_verified(),
            password_hash: None,
            // Use name from request (Apple only provides on first sign-in)
            name: req.name,
            picture: None, // Apple doesn't provide profile pictures
            wallet_address: None,
            google_id: None,
            apple_id: Some(claims.sub),
            stripe_customer_id: None,
            auth_methods: vec![AuthMethod::Apple],
            is_system_admin: false,
            created_at: now,
            updated_at: now,
            last_login_at: Some(now),
        };
        let org_assignment = resolve_org_assignment(&state, user.id).await?;
        let membership = MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
        let raw_api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");

        #[cfg(feature = "postgres")]
        let user = if let Some(pool) = state.postgres_pool.as_ref() {
            create_user_with_membership_and_api_key_tx(pool, &user, &membership, &api_key_entity)
                .await?;
            user
        } else {
            let created = state.user_repo.create(user).await?;
            state.membership_repo.create(membership).await?;
            state.api_key_repo.create(api_key_entity).await?;
            created
        };

        #[cfg(not(feature = "postgres"))]
        let user = {
            let created = state.user_repo.create(user).await?;
            state.membership_repo.create(membership).await?;
            state.api_key_repo.create(api_key_entity).await?;
            created
        };

        (user, true, Some(raw_api_key))
    };

    // Get user's memberships to find default org context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context = get_default_org_context(&memberships, user.is_system_admin);

    // Create session with org context
    let session_id = uuid::Uuid::new_v4();
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
        method: AuthMethod::Apple,
        is_new_user,
        session_id: session_id.to_string(),
        ip_address,
        user_agent,
    };

    let callback_data = if is_new_user {
        call_registered_callback_with_timeout(&state.callback, &payload).await
    } else {
        call_authenticated_callback_with_timeout(&state.callback, &payload).await
    };

    // Log audit event (fire-and-forget)
    let audit_event = if is_new_user {
        AuditEventType::UserRegister
    } else {
        AuditEventType::UserLogin
    };
    let _ = state
        .audit_service
        .log_user_event(audit_event, user.id, Some(&headers))
        .await;

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
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
