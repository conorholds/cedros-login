use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::{normalize_email, UserEmailEntity, UserEntity};
use crate::services::EmailService;
use crate::AppState;

pub async fn find_user_by_verified_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    email: &str,
) -> Result<Option<UserEntity>, AppError> {
    if let Some(row) = state.user_email_repo.find_verified_by_email(email).await? {
        return state.user_repo.find_by_id(row.user_id).await;
    }
    let Some(user) = state.user_repo.find_by_email(email).await? else {
        return Ok(None);
    };
    if user.email_verified {
        ensure_primary_email_row(state, &user).await?;
        Ok(Some(user))
    } else {
        Ok(None)
    }
}

pub async fn find_user_by_password_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    email: &str,
    require_verification: bool,
) -> Result<Option<UserEntity>, AppError> {
    if require_verification {
        return find_user_by_verified_email(state, email).await;
    }
    if let Some(row) = state.user_email_repo.find_verified_by_email(email).await? {
        return state.user_repo.find_by_id(row.user_id).await;
    }
    state.user_repo.find_by_email(email).await
}

pub async fn find_user_by_active_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    email: &str,
) -> Result<Option<UserEntity>, AppError> {
    if let Some(row) = state.user_email_repo.find_active_by_email(email).await? {
        return state.user_repo.find_by_id(row.user_id).await;
    }
    state.user_repo.find_by_email(email).await
}

pub async fn is_verified_email_for_user<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    email: &str,
) -> Result<bool, AppError> {
    let email = normalize_email(email);
    if user.email_verified
        && user.email.as_deref().map(normalize_email).as_deref() == Some(email.as_str())
    {
        return Ok(true);
    }
    Ok(state
        .user_email_repo
        .find_verified_by_email(&email)
        .await?
        .is_some_and(|row| row.user_id == user.id))
}

pub async fn email_blocks_signup<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    email: &str,
) -> Result<bool, AppError> {
    if state.user_email_repo.email_blocks_signup(email).await? {
        return Ok(true);
    }
    state.user_repo.email_exists(email).await
}

pub async fn ensure_primary_email_row<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
) -> Result<(), AppError> {
    let Some(email) = user.email.clone() else {
        return Ok(());
    };
    if state
        .user_email_repo
        .list_by_user(user.id)
        .await?
        .iter()
        .any(|row| row.email == email)
    {
        return Ok(());
    }
    let row = UserEmailEntity::new(user.id, email, user.email_verified, true);
    match state.user_email_repo.create(row).await {
        Ok(_) | Err(AppError::EmailExists) => Ok(()),
        Err(err) => Err(err),
    }
}

pub async fn mark_primary_email_verified<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
) -> Result<(), AppError> {
    ensure_primary_email_row(state, user).await?;
    let Some(email) = user.email.as_deref() else {
        return Ok(());
    };
    if let Some(row) = state.user_email_repo.find_active_by_email(email).await? {
        state.user_email_repo.mark_verified(row.id).await?;
    }
    Ok(())
}
