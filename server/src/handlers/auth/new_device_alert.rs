//! Best-effort new-device alert orchestration.

use std::sync::Arc;

use chrono::Utc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::repositories::UserEntity;
use crate::services::EmailService;
use crate::utils::{is_new_device, DeviceInfo};
use crate::AppState;

const SETTING_KEY: &str = "auth_new_device_alert_enabled";
const RECENT_SESSIONS: u32 = 10;

pub(crate) async fn maybe_queue_new_device_alert<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    ip_address: Option<&str>,
    user_agent: Option<&str>,
    require_verified_email: bool,
) {
    maybe_queue(
        state,
        user,
        ip_address,
        user_agent,
        require_verified_email,
        None,
    )
    .await;
}

/// Excludes the atomically-created session from the history used for comparison.
pub(crate) async fn maybe_queue_new_device_alert_after_session<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    ip_address: Option<&str>,
    user_agent: Option<&str>,
    session_id: Uuid,
) {
    maybe_queue(state, user, ip_address, user_agent, false, Some(session_id)).await;
}

async fn maybe_queue<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    ip_address: Option<&str>,
    user_agent: Option<&str>,
    require_verified_email: bool,
    exclude_session_id: Option<Uuid>,
) {
    if require_verified_email && !user.email_verified || !alert_enabled(state).await {
        return;
    }
    let Some(email_addr) = user.email.as_deref() else {
        return;
    };
    let Some(current_user_agent) = user_agent.map(str::trim).filter(|ua| !ua.is_empty()) else {
        return;
    };
    let Some(previous) = previous_user_agents(state, user.id, exclude_session_id).await else {
        return;
    };
    let device = DeviceInfo::from_user_agent(Some(current_user_agent));
    if is_new_device(&device.fingerprint, &previous) {
        queue_email(state, user, email_addr, ip_address, &device).await;
    }
}

async fn previous_user_agents<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user_id: Uuid,
    exclude_session_id: Option<Uuid>,
) -> Option<Vec<Option<String>>> {
    let mut sessions = match state
        .session_repo
        .find_recent_by_user_id(user_id, RECENT_SESSIONS)
        .await
    {
        Ok(sessions) => sessions,
        Err(error) => {
            tracing::warn!(%user_id, %error, "Failed to load session history for new-device alert");
            return None;
        }
    };
    if let Some(session_id) = exclude_session_id {
        sessions.retain(|session| session.id != session_id);
    }
    (!sessions.is_empty()).then(|| {
        sessions
            .into_iter()
            .map(|session| session.user_agent)
            .collect()
    })
}

async fn queue_email<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    user: &UserEntity,
    email: &str,
    ip_address: Option<&str>,
    device: &DeviceInfo,
) {
    let login_time = Utc::now().format("%B %d, %Y at %H:%M UTC").to_string();
    if let Err(error) = state
        .comms_service
        .queue_security_alert_email(
            email,
            user.name.as_deref(),
            user.id,
            &login_time,
            ip_address,
            Some(&device.device_type),
            Some(&device.browser),
        )
        .await
    {
        tracing::warn!(user_id = %user.id, %error, "Failed to queue new-device alert email");
    }
}

async fn alert_enabled<C: AuthCallback, E: EmailService>(state: &Arc<AppState<C, E>>) -> bool {
    match state.settings_service.get_bool(SETTING_KEY).await {
        Ok(Some(enabled)) => enabled,
        Ok(None) => true,
        Err(error) => {
            tracing::warn!(setting_key = SETTING_KEY, %error, "Failed to read new-device alert setting; using default enabled");
            true
        }
    }
}
