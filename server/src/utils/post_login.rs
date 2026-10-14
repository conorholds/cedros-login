//! Post-login action computation
//!
//! Determines what action (if any) the client should take after successful authentication.
//! Required MFA and subscription selection remain first, redirect remains last,
//! and the admin-configured flow order controls optional onboarding prompts.

use crate::errors::AppError;
use crate::models::PostLoginAction;
use crate::repositories::{CredentialRepository, CredentialType, TotpRepository, UserEntity};
use crate::services::{SettingsService, SubscriptionSelectionService};

const FLOW_ORDER_KEY: &str = "postlogin_flow_order";
const DEFAULT_FLOW_ORDER_VALUE: &str = "subscription,username,welcome,profile";
const FLOW_STEP_COUNT: usize = 4;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum PostLoginFlowStep {
    Subscription,
    Username,
    Welcome,
    Profile,
}

impl PostLoginFlowStep {
    fn parse(id: &str) -> Option<Self> {
        match id {
            "subscription" => Some(Self::Subscription),
            "username" => Some(Self::Username),
            "welcome" => Some(Self::Welcome),
            "profile" => Some(Self::Profile),
            _ => None,
        }
    }

    fn id(self) -> &'static str {
        match self {
            Self::Subscription => "subscription",
            Self::Username => "username",
            Self::Welcome => "welcome",
            Self::Profile => "profile",
        }
    }
}

/// Validate the stored post-login flow order setting.
///
/// The value is a comma-separated permutation of `subscription`, `username`,
/// `welcome`, and `profile`. Required MFA and final redirect are intentionally
/// excluded because they are fixed security/fallback steps.
pub fn validate_post_login_flow_order_value(value: &str) -> Result<(), AppError> {
    parse_post_login_flow_order(value)
        .map(|_| ())
        .map_err(AppError::Validation)
}

fn parse_post_login_flow_order(value: &str) -> Result<Vec<PostLoginFlowStep>, String> {
    let ids: Vec<&str> = value.split(',').map(str::trim).collect();
    if ids.len() != FLOW_STEP_COUNT || ids.iter().any(|id| id.is_empty()) {
        return Err(format!(
            "{FLOW_ORDER_KEY} must include subscription, username, welcome, and profile exactly once"
        ));
    }

    let mut steps = Vec::with_capacity(FLOW_STEP_COUNT);
    for id in ids {
        let step = PostLoginFlowStep::parse(id)
            .ok_or_else(|| format!("Invalid {FLOW_ORDER_KEY} step: {id}"))?;
        if steps.contains(&step) {
            return Err(format!("Duplicate {FLOW_ORDER_KEY} step: {}", step.id()));
        }
        steps.push(step);
    }

    Ok(steps)
}

fn default_post_login_flow_order() -> Vec<PostLoginFlowStep> {
    parse_post_login_flow_order(DEFAULT_FLOW_ORDER_VALUE).expect("valid default flow order")
}

async fn configured_post_login_flow_order(
    settings: &SettingsService,
) -> Result<Vec<PostLoginFlowStep>, AppError> {
    let Some(value) = settings.get_for_domain_validation(FLOW_ORDER_KEY).await? else {
        return Ok(default_post_login_flow_order());
    };
    parse_post_login_flow_order(&value).map_err(AppError::Config)
}

/// Compute the post-login action for a user based on admin settings.
///
/// Returns `None` if no action is needed (all features disabled or not applicable).
///
/// Priority:
/// 1. MFA setup — if `security_require_mfa` is enabled and the user has a password but no TOTP
/// 2. Reorderable non-authenticated onboarding steps from `postlogin_flow_order`
/// 3. Redirect URL — if a redirect URL is configured
///
/// MFA requirement only applies to users with password credentials. OAuth, passkey,
/// and wallet users already have strong auth via their providers.
pub async fn compute_post_login(
    user: &UserEntity,
    settings: &SettingsService,
    totp_repo: &dyn TotpRepository,
    credential_repo: &dyn CredentialRepository,
) -> Result<Option<PostLoginAction>, AppError> {
    // 1. MFA requirement check (highest priority — security enforcement)
    if let Some(action) =
        compute_required_mfa_post_login(user, settings, totp_repo, credential_repo).await?
    {
        return Ok(Some(action));
    }

    for step in configured_post_login_flow_order(settings).await? {
        if step == PostLoginFlowStep::Subscription {
            continue;
        }
        if let Some(action) = compute_flow_step_post_login(step, user, settings).await? {
            return Ok(Some(action));
        }
    }

    compute_redirect_post_login(settings).await
}

async fn compute_flow_step_post_login(
    step: PostLoginFlowStep,
    user: &UserEntity,
    settings: &SettingsService,
) -> Result<Option<PostLoginAction>, AppError> {
    match step {
        PostLoginFlowStep::Subscription => Ok(None),
        PostLoginFlowStep::Username => compute_username_post_login(user, settings).await,
        PostLoginFlowStep::Welcome => compute_welcome_post_login(user, settings).await,
        PostLoginFlowStep::Profile => compute_profile_post_login(user, settings).await,
    }
}

async fn compute_username_post_login(
    user: &UserEntity,
    settings: &SettingsService,
) -> Result<Option<PostLoginAction>, AppError> {
    let username_enabled = settings.get_bool("postlogin_username_enabled").await?;
    if username_enabled == Some(true) && user.username.is_none() {
        return Ok(Some(PostLoginAction {
            action: "choose_username".to_string(),
            redirect_url: None,
        }));
    }
    Ok(None)
}

async fn compute_welcome_post_login(
    user: &UserEntity,
    settings: &SettingsService,
) -> Result<Option<PostLoginAction>, AppError> {
    let welcome_enabled = settings.get_bool("postlogin_welcome_enabled").await?;
    if welcome_enabled == Some(true) && user.welcome_completed_at.is_none() {
        let route = settings
            .get("postlogin_welcome_route")
            .await?
            .filter(|r| !r.is_empty())
            .unwrap_or_else(|| "/welcome".to_string());
        return Ok(Some(PostLoginAction {
            action: "welcome".to_string(),
            redirect_url: Some(route),
        }));
    }
    Ok(None)
}

async fn compute_profile_post_login(
    user: &UserEntity,
    settings: &SettingsService,
) -> Result<Option<PostLoginAction>, AppError> {
    // Only checks name because email cannot be updated via the profile API.
    let complete_enabled = settings.get_bool("postlogin_complete_enabled").await?;
    if complete_enabled == Some(true) && user.name.is_none() {
        return Ok(Some(PostLoginAction {
            action: "complete_profile".to_string(),
            redirect_url: None,
        }));
    }
    Ok(None)
}

async fn compute_redirect_post_login(
    settings: &SettingsService,
) -> Result<Option<PostLoginAction>, AppError> {
    let redirect_url = settings
        .get("postlogin_redirect_url")
        .await?
        .filter(|url| !url.is_empty());
    if let Some(url) = redirect_url {
        return Ok(Some(PostLoginAction {
            action: "redirect".to_string(),
            redirect_url: Some(url),
        }));
    }

    Ok(None)
}

async fn compute_required_mfa_post_login(
    user: &UserEntity,
    settings: &SettingsService,
    totp_repo: &dyn TotpRepository,
    credential_repo: &dyn CredentialRepository,
) -> Result<Option<PostLoginAction>, AppError> {
    let mfa_required = settings.get_bool("security_require_mfa").await?;
    if mfa_required != Some(true) {
        return Ok(None);
    }

    let has_mfa = totp_repo.has_mfa_enabled(user.id).await?;
    if has_mfa {
        return Ok(None);
    }

    let has_password = credential_repo
        .has_credential_type(user.id, CredentialType::Password)
        .await?;
    if !has_password {
        return Ok(None);
    }

    Ok(Some(PostLoginAction {
        action: "setup_mfa".to_string(),
        redirect_url: None,
    }))
}

/// Compute the final post-login action after a session token exists.
///
/// Mandatory MFA setup remains the highest-priority security enforcement.
/// Subscription selection is evaluated before optional onboarding prompts so a
/// required subscription gate cannot be deferred behind skippable UI steps.
pub async fn compute_authenticated_post_login(
    user: &UserEntity,
    access_token: &str,
    settings: &SettingsService,
    totp_repo: &dyn TotpRepository,
    credential_repo: &dyn CredentialRepository,
    subscription_selection: &SubscriptionSelectionService,
) -> Result<Option<PostLoginAction>, AppError> {
    if let Some(action) =
        compute_required_mfa_post_login(user, settings, totp_repo, credential_repo).await?
    {
        return Ok(Some(action));
    }

    if let Some(action) = subscription_selection
        .post_login_action(user.id, access_token)
        .await?
    {
        return Ok(Some(action));
    }

    for step in configured_post_login_flow_order(settings).await? {
        if step == PostLoginFlowStep::Subscription {
            continue;
        }
        if let Some(action) = compute_flow_step_post_login(step, user, settings).await? {
            return Ok(Some(action));
        }
    }

    compute_redirect_post_login(settings).await
}

#[cfg(test)]
#[path = "post_login_tests.rs"]
mod post_login_tests;
