//! System-admin authorization and bootstrap behavior.

use axum::http::HeaderMap;
use std::sync::{atomic::AtomicBool, atomic::Ordering, Arc};
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::{normalize_email, UserEntity};
use crate::services::EmailService;
use crate::utils::authenticate_session;
use crate::AppState;

/// Cache whether any system admins exist to avoid querying on every admin request.
/// Once true, it stays true forever because admins do not un-exist.
static ADMINS_EXIST: AtomicBool = AtomicBool::new(false);

/// Validate system-admin access, with bootstrap support.
///
/// If no system admins exist and `BOOTSTRAP_ADMIN_EMAIL` is configured, the first
/// matching verified user to access an admin endpoint is auto-promoted.
pub async fn validate_system_admin<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<Uuid, AppError> {
    let auth_user = authenticate_session(state, headers).await?;
    let user = state
        .user_repo
        .find_by_id(auth_user.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    if user.is_system_admin || bootstrap_admin_if_eligible(state, &user).await? {
        return Ok(auth_user.user_id);
    }

    Err(AppError::Forbidden(
        "Only system administrators can access this resource".into(),
    ))
}

async fn bootstrap_admin_if_eligible<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
) -> Result<bool, AppError> {
    let Some(bootstrap_email) = state.config.server.bootstrap_admin_email.as_deref() else {
        return Ok(false);
    };
    if ADMINS_EXIST.load(Ordering::Relaxed) {
        return Ok(false);
    }

    let admin_count = state.user_repo.count_system_admins().await?;
    if admin_count > 0 {
        ADMINS_EXIST.store(true, Ordering::Relaxed);
        return Ok(false);
    }

    let Some(user_email) = user.email.as_deref() else {
        return Ok(false);
    };
    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;
    let email_matches = normalize_email(user_email) == normalize_email(bootstrap_email);
    if !email_matches || !verification_required || !user.email_verified {
        return Ok(false);
    }

    state.user_repo.set_system_admin(user.id, true).await?;
    ADMINS_EXIST.store(true, Ordering::Relaxed);
    tracing::info!(
        user_id = %user.id,
        "Bootstrapped first system admin via BOOTSTRAP_ADMIN_EMAIL"
    );
    Ok(true)
}

#[cfg(test)]
mod tests;
