//! Apple Sign-In authentication handler

use axum::{extract::State, http::HeaderMap, response::IntoResponse, Json};
use chrono::{Duration, Utc};
use std::sync::Arc;

use sha2::{Digest, Sha256};

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
use crate::services::{
    exchange_and_encrypt_refresh_token, sync_apple_credential,
    verify_apple_id_token_for_allowed_clients, EmailService,
};
use crate::utils::{
    build_json_response_with_cookies, compute_post_login, extract_client_ip_with_fallback,
    get_default_org_context, hash_refresh_token, resolve_org_assignment, user_entity_to_auth_user,
    PeerIp,
};
use crate::AppState;

/// POST /auth/apple - Authenticate with Apple ID token
pub async fn apple_auth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<AppleAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Enabled check: runtime setting > static config
    let enabled = state
        .settings_service
        .get_bool("auth_apple_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(state.config.apple.enabled);
    if !enabled {
        return Err(AppError::NotFound("Apple auth disabled".into()));
    }

    // GeoIP country screening (fail-open: skipped when header not configured or absent)
    state
        .sanctions_service
        .check_country_from_request(&headers)
        .await?;

    // Verify the Apple ID token
    let verified = verify_apple_id_token_for_allowed_clients(
        &state.apple_service,
        &state.settings_service,
        &state.config.apple,
        &req.id_token,
    )
    .await?;
    let claims = verified.claims;
    let matched_client_id = verified.client_id;

    // Verify nonce for replay protection. If the client sent a nonce,
    // Apple embeds SHA-256(nonce) in the token. We recompute and compare.
    if let Some(ref client_nonce) = req.nonce {
        let expected_hash = hex::encode(Sha256::digest(client_nonce.as_bytes()));
        match &claims.nonce {
            Some(token_nonce) if token_nonce == &expected_hash => { /* OK */ }
            Some(_) => {
                tracing::warn!(
                    "Apple nonce mismatch: token nonce does not match client nonce hash"
                );
                return Err(AppError::InvalidToken);
            }
            None => {
                tracing::warn!("Apple nonce missing from token despite client sending nonce");
                return Err(AppError::InvalidToken);
            }
        }
    }

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

        // Autolink: Apple has verified this email, so we can safely link the
        // Apple ID to the existing account without requiring a password proof.
        //
        // NEW-03: Note on hidden emails - When users choose "Hide My Email",
        // Apple provides a unique relay address (e.g., xyz@privaterelay.appleid.com).
        // These are unique per user per app, so collision is impossible.
        let normalized_email = claims.email.as_deref().map(normalize_email);
        let autolink_match = if let Some(ref email) = normalized_email {
            state.user_repo.find_by_email(email).await?
        } else {
            None
        };

        if let Some(mut existing) = autolink_match {
            let now = Utc::now();
            existing.apple_id = Some(claims.sub);
            existing.updated_at = now;
            existing.last_login_at = Some(now);
            if !existing.auth_methods.contains(&AuthMethod::Apple) {
                existing.auth_methods.push(AuthMethod::Apple);
            }
            // Backfill name from Apple if missing (Apple only provides on first sign-in)
            if existing.name.is_none() {
                existing.name = req.name;
            }
            let user = state.user_repo.update(existing).await?;
            (user, false, None)
        } else {
            // Signup gating: enforce access codes and/or rate limits for new users
            let gate_result = state
                .signup_gating_service
                .check_signup(req.access_code.as_deref())
                .await?;

            // Create new user
            // Note: Apple may not provide email in rare edge cases (legacy accounts).
            // Users created without email can only authenticate via Apple ID.
            // This is acceptable as the apple_id field uniquely identifies them.
            let now = Utc::now();
            let mut user = UserEntity {
                id: uuid::Uuid::new_v4(),
                email: normalized_email.clone(),
                email_verified: claims.is_email_verified(),
                password_hash: None,
                // Use name from request (Apple only provides on first sign-in)
                name: req.name,
                username: None,
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
                welcome_completed_at: None,
                referral_code: crate::repositories::generate_referral_code(),
                referred_by: None,
                payout_wallet_address: None,
                kyc_status: "none".to_string(),
                kyc_verified_at: None,
                kyc_expires_at: None,
                accreditation_status: "none".to_string(),
                accreditation_verified_at: None,
                accreditation_expires_at: None,
            };

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
                            tracing::debug!(referral_code = %code, "Referral code not found, ignoring");
                        }
                        Err(e) => {
                            tracing::warn!(error = %e, "Failed to look up referral code, ignoring");
                        }
                    }
                }
            }

            // Persist user FIRST — org resolution may auto-create a "Default" org
            // whose owner_id FK references users.id, so the user row must exist.
            let user = state.user_repo.create(user).await?;

            // NOW resolve org assignment — user exists in DB, FK satisfied
            let org_assignment = resolve_org_assignment(&state, user.id).await?;
            let membership =
                MembershipEntity::new(user.id, org_assignment.org_id, org_assignment.role);
            let raw_api_key = generate_api_key();
            let api_key_entity = ApiKeyEntity::new(user.id, &raw_api_key, "default");

            state.membership_repo.create(membership).await?;
            state.api_key_repo.create(api_key_entity).await?;

            // Mark access code as used (non-fatal)
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

            (user, true, Some(raw_api_key))
        }
    };

    let encrypted_refresh_token = exchange_and_encrypt_refresh_token(
        &state.settings_service,
        &state.config.apple,
        &state.config.jwt.secret,
        req.authorization_code.as_deref(),
        &matched_client_id,
    )
    .await?;
    sync_apple_credential(
        state.credential_repo.as_ref(),
        user.id,
        encrypted_refresh_token,
        &matched_client_id,
    )
    .await?;

    // Issue referral signup reward for new users (non-fatal)
    if is_new_user {
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
    }

    // Get user's memberships to find default org context
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let token_context =
        get_default_org_context(&memberships, user.is_system_admin, user.email_verified);

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
        referral: req.referral.clone(),
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
        post_login: compute_post_login(
            &user,
            &state.settings_service,
            &*state.totp_repo,
            &*state.credential_repo,
            &*state.wallet_material_repo,
            &*state.storage.pending_wallet_recovery_repo,
        )
        .await,
    };

    Ok(build_json_response_with_cookies(
        &state.config.cookie,
        &token_pair,
        state.jwt_service.refresh_expiry_secs(),
        response,
    ))
}
