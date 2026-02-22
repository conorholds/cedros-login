//! Solana wallet authentication handlers

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
use crate::models::{AuthMethod, AuthResponse, SolanaAuthRequest, SolanaChallengeRequest};
use crate::repositories::{
    generate_api_key, ApiKeyEntity, AuditEventType, MembershipEntity, NonceEntity, SessionEntity,
    UserEntity,
};
use crate::services::{EmailService, SolanaService};
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

/// POST /auth/solana/challenge - Generate a challenge for Solana wallet sign-in
pub async fn solana_challenge<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    Json(req): Json<SolanaChallengeRequest>,
) -> Result<impl IntoResponse, AppError> {
    if !state.config.solana.enabled {
        return Err(AppError::NotFound("Solana auth disabled".into()));
    }

    // Validate public key by attempting to decode it
    // A valid Solana public key is exactly 32 bytes when decoded from base58
    let public_key_bytes = bs58::decode(&req.public_key)
        .into_vec()
        .map_err(|_| AppError::Validation("Invalid public key format".into()))?;

    if public_key_bytes.len() != 32 {
        return Err(AppError::Validation("Invalid public key length".into()));
    }

    // Generate challenge
    let challenge = state.solana_service.generate_challenge(&req.public_key)?;

    // Store nonce for replay protection
    let nonce_entity = NonceEntity::new(
        challenge.nonce.clone(),
        req.public_key.clone(),
        challenge.message.clone(),
        challenge.expires_at,
    );
    state.nonce_repo.create(nonce_entity).await?;

    Ok(Json(challenge))
}

/// POST /auth/solana - Verify signature and authenticate
pub async fn solana_auth<C: AuthCallback, E: EmailService>(
    State(state): State<Arc<AppState<C, E>>>,
    headers: HeaderMap,
    PeerIp(peer_ip): PeerIp,
    Json(req): Json<SolanaAuthRequest>,
) -> Result<impl IntoResponse, AppError> {
    if !state.config.solana.enabled {
        return Err(AppError::NotFound("Solana auth disabled".into()));
    }

    // Extract nonce from message
    let nonce = SolanaService::extract_nonce(&req.message)
        .ok_or(AppError::Validation("Invalid message format".into()))?;

    // S-10: Atomically consume nonce to prevent TOCTOU race conditions.
    // This combines find + validity check + mark_used into a single atomic operation.
    let nonce_entity = state
        .nonce_repo
        .consume_if_valid(&nonce)
        .await?
        .ok_or(AppError::ChallengeExpired)?;

    // Verify the public key matches the challenge
    if nonce_entity.public_key != req.public_key {
        return Err(AppError::InvalidSignature);
    }

    // Verify the message matches
    if nonce_entity.message != req.message {
        return Err(AppError::InvalidSignature);
    }

    // Verify signature
    if !state
        .solana_service
        .verify_signature(&req.public_key, &req.signature, &req.message)?
    {
        return Err(AppError::InvalidSignature);
    }

    // Check if user exists by wallet address
    let existing_user = state.user_repo.find_by_wallet(&req.public_key).await?;

    let (user, is_new_user, api_key) = if let Some(user) = existing_user {
        (user, false, None)
    } else {
        // Check if wallet already exists (shouldn't happen, but safety check)
        if state.user_repo.wallet_exists(&req.public_key).await? {
            return Err(AppError::WalletExists);
        }

        // Create new user
        let now = Utc::now();
        let user = UserEntity {
            id: uuid::Uuid::new_v4(),
            email: None,
            email_verified: false,
            password_hash: None,
            name: None,
            picture: None,
            wallet_address: Some(req.public_key.clone()),
            google_id: None,
            apple_id: None,
            stripe_customer_id: None,
            auth_methods: vec![AuthMethod::Solana],
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
        method: AuthMethod::Solana,
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

    // Log audit event (fire-and-forget, don't fail auth on audit error)
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
