//! Apple Sign-In authentication handler

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use std::sync::Arc;

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::models::{AppleAuthRequest, AuthMethod, AuthResponse};
use crate::repositories::{
    generate_api_key, normalize_email, ApiKeyEntity, AuditEventType, MembershipEntity, OrgEntity,
    OrgRole, SessionEntity, UserEntity,
};
use crate::services::EmailService;
use crate::utils::{
    build_json_response_with_cookies, extract_client_ip_with_fallback, get_default_org_context,
    hash_refresh_token, user_entity_to_auth_user, PeerIp,
};
use crate::AppState;

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
        };
        let user = state.user_repo.create(user).await?;

        // Auto-create personal organization
        let personal_org = OrgEntity::new_personal(user.id, user.name.as_deref());
        let personal_org = state.org_repo.create(personal_org).await?;

        // Create owner membership for personal org
        let membership = MembershipEntity::new(user.id, personal_org.id, OrgRole::Owner);
        state.membership_repo.create(membership).await?;

        // Create API key for user
        let raw_api_key = generate_api_key();
        let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key);
        state.api_key_repo.create(api_key_entity).await?;

        (user, true, Some(raw_api_key))
    };

    // Get user's memberships and orgs to find default org context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let org_ids: Vec<_> = memberships.iter().map(|m| m.org_id).collect();
    let orgs = state.org_repo.find_by_ids(&org_ids).await?;
    let orgs_by_id: std::collections::HashMap<_, _> = orgs.into_iter().map(|o| (o.id, o)).collect();

    // Select default org using shared helper
    let token_context = get_default_org_context(&memberships, &orgs_by_id, user.is_system_admin);

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
        state.callback.on_registered(&payload).await.ok()
    } else {
        state.callback.on_authenticated(&payload).await.ok()
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
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
