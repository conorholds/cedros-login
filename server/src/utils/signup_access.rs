use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::services::EmailService;
use crate::AppState;

/// Enforce runtime-configured signup access-code requirement.
///
/// When `signup_access_code_enabled` is true, new-user signup paths must
/// include an `access_code` value that matches the configured signup access code.
pub async fn enforce_signup_access_code<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    access_code: Option<&str>,
) -> Result<(), AppError> {
    let gate_enabled = state
        .settings_service
        .get_bool("signup_access_code_enabled")
        .await?
        .unwrap_or(false);

    if !gate_enabled {
        return Ok(());
    }

    let expected_code = state
        .settings_service
        .get("signup_access_code")
        .await?
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "Signup access code enforcement enabled without configured signup_access_code"
            ))
        })?;

    let provided_code = access_code
        .map(str::trim)
        .filter(|code| !code.is_empty())
        .ok_or_else(|| AppError::Forbidden("Signup access code is required".to_string()))?;

    if provided_code == expected_code {
        Ok(())
    } else {
        Err(AppError::Forbidden(
            "Invalid signup access code".to_string(),
        ))
    }
}
