//! Shared construction and non-fatal finalization of login sessions.

use std::sync::Arc;

use chrono::{Duration, Utc};

use super::{call_authenticated_callback_with_timeout, maybe_queue_new_device_alert};
use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;
use crate::models::{AuthMethod, AuthUser, TokenPair};
use crate::repositories::{SessionEntity, UserEntity};
use crate::services::EmailService;
use crate::utils::{get_default_org_context, hash_refresh_token, user_entity_to_auth_user};
use crate::AppState;

pub(super) struct PreparedLogin {
    pub token_pair: TokenPair,
    pub auth_user: AuthUser,
    pub session: SessionEntity,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

pub(super) async fn complete_login_flow<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    ip_address: Option<String>,
    user_agent: Option<String>,
    require_verified_email_for_alert: bool,
) -> Result<(TokenPair, AuthUser, Option<serde_json::Value>), AppError> {
    let prepared = prepare_login_session(state, user, ip_address, user_agent).await?;
    maybe_queue_new_device_alert(
        state,
        user,
        prepared.ip_address.as_deref(),
        prepared.user_agent.as_deref(),
        require_verified_email_for_alert,
    )
    .await;
    state
        .storage
        .credential_lifecycle_repo
        .create_session_if_current(user, prepared.session.clone())
        .await?;
    Ok(finalize_prepared_login(state, user, prepared, AuthMethod::Email).await)
}

pub(super) async fn prepare_login_session<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<PreparedLogin, AppError> {
    let memberships = state.membership_repo.find_by_user(user.id).await?;
    let context = get_default_org_context(&memberships, user.is_system_admin, user.email_verified);
    let session_id = uuid::Uuid::new_v4();
    let token_pair = state
        .jwt_service
        .generate_token_pair_with_context(user.id, session_id, &context)?;
    let expires_at = Utc::now() + Duration::seconds(state.jwt_service.refresh_expiry_secs() as i64);
    let mut session = SessionEntity::new_with_id(
        session_id,
        user.id,
        hash_refresh_token(&token_pair.refresh_token, &state.config.jwt.secret),
        expires_at,
        ip_address.clone(),
        user_agent.clone(),
    );
    session.last_strong_auth_at = Some(Utc::now());
    Ok(PreparedLogin {
        token_pair,
        auth_user: user_entity_to_auth_user(user),
        session,
        ip_address,
        user_agent,
    })
}

pub(super) async fn finalize_prepared_login<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    prepared: PreparedLogin,
    method: AuthMethod,
) -> (TokenPair, AuthUser, Option<serde_json::Value>) {
    super::touch_last_login(&state.user_repo, user.id).await;
    let payload = AuthCallbackPayload {
        user: prepared.auth_user.clone(),
        method,
        is_new_user: false,
        session_id: prepared.session.id.to_string(),
        ip_address: prepared.ip_address,
        user_agent: prepared.user_agent,
        referral: None,
    };
    let callback_data = call_authenticated_callback_with_timeout(&state.callback, &payload).await;
    (prepared.token_pair, prepared.auth_user, callback_data)
}
