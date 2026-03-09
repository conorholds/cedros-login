//! Post-login action computation
//!
//! Determines what action (if any) the client should take after successful authentication.
//! Priority order: MFA Setup > Enroll Wallet > Acknowledge Recovery > Username > Welcome > Profile > Redirect.

use crate::models::PostLoginAction;
use crate::repositories::{
    CredentialRepository, CredentialType, PendingWalletRecoveryRepository, TotpRepository,
    UserEntity, WalletMaterialRepository,
};
use crate::services::SettingsService;

/// Compute the post-login action for a user based on admin settings.
///
/// Returns `None` if no action is needed (all features disabled or not applicable).
///
/// Priority:
/// 1. MFA setup — if `security_require_mfa` is enabled and the user has a password but no TOTP
/// 2. Enroll wallet — if embedded wallets enabled, auto-enroll enabled, and user has none
/// 3. Acknowledge recovery — if `postlogin_show_recovery_enabled` and user has pending recovery data
/// 4. Choose username — if enabled and user hasn't set a username
/// 5. Welcome (one-time onboarding) — if enabled and user hasn't completed it
/// 6. Complete profile — if enabled and user is missing a name
/// 7. Redirect URL — if a redirect URL is configured
///
/// MFA requirement only applies to users with password credentials. OAuth, passkey,
/// and wallet users already have strong auth via their providers.
pub async fn compute_post_login(
    user: &UserEntity,
    settings: &SettingsService,
    totp_repo: &dyn TotpRepository,
    credential_repo: &dyn CredentialRepository,
    wallet_material_repo: &dyn WalletMaterialRepository,
    pending_wallet_recovery_repo: &dyn PendingWalletRecoveryRepository,
) -> Option<PostLoginAction> {
    // 1. MFA requirement check (highest priority — security enforcement)
    let mfa_required = settings
        .get_bool("security_require_mfa")
        .await
        .unwrap_or(None);
    if mfa_required == Some(true) {
        let has_mfa = totp_repo.has_mfa_enabled(user.id).await.unwrap_or(false);
        if !has_mfa {
            let has_password = credential_repo
                .has_credential_type(user.id, CredentialType::Password)
                .await
                .unwrap_or(false);
            if has_password {
                return Some(PostLoginAction {
                    action: "setup_mfa".to_string(),
                    redirect_url: None,
                });
            }
        }
    }

    // 2. Embedded wallet enrollment
    let wallet_signing = settings
        .get_bool("feature_wallet_signing")
        .await
        .unwrap_or(None);
    let wallet_enroll = settings
        .get_bool("postlogin_wallet_enroll_enabled")
        .await
        .unwrap_or(None);
    if wallet_signing == Some(true) && wallet_enroll == Some(true) {
        let already_enrolled = wallet_material_repo
            .exists_for_user(user.id)
            .await
            .unwrap_or(true); // fail closed — don't prompt if we can't check
        if !already_enrolled {
            // Check Solana wallet policy: skip by default, enroll if setting is on
            let is_solana_user = user.wallet_address.is_some();
            let enroll_solana = settings
                .get_bool("wallet_enroll_solana_users")
                .await
                .unwrap_or(None)
                == Some(true);
            if !is_solana_user || enroll_solana {
                return Some(PostLoginAction {
                    action: "enroll_wallet".to_string(),
                    redirect_url: None,
                });
            }
        }
    }

    // 3. Acknowledge recovery: show recovery info after silent enrollment
    let show_recovery = settings
        .get_bool("postlogin_show_recovery_enabled")
        .await
        .unwrap_or(None);
    if show_recovery == Some(true) {
        let has_pending = pending_wallet_recovery_repo
            .find_by_user_id(user.id)
            .await
            .ok()
            .flatten()
            .is_some();
        if has_pending {
            return Some(PostLoginAction {
                action: "acknowledge_recovery".to_string(),
                redirect_url: None,
            });
        }
    }

    // 4. Choose username: prompt for unique handle
    let username_enabled = settings
        .get_bool("postlogin_username_enabled")
        .await
        .unwrap_or(None);
    if username_enabled == Some(true) && user.username.is_none() {
        return Some(PostLoginAction {
            action: "choose_username".to_string(),
            redirect_url: None,
        });
    }

    // 5. Welcome flow: one-time onboarding page
    let welcome_enabled = settings
        .get_bool("postlogin_welcome_enabled")
        .await
        .unwrap_or(None);
    if welcome_enabled == Some(true) && user.welcome_completed_at.is_none() {
        let route = settings
            .get("postlogin_welcome_route")
            .await
            .unwrap_or(None)
            .filter(|r| !r.is_empty())
            .unwrap_or_else(|| "/welcome".to_string());
        return Some(PostLoginAction {
            action: "welcome".to_string(),
            redirect_url: Some(route),
        });
    }

    // 6. Complete profile: prompt for missing name
    // Only checks name because email cannot be updated via the profile API.
    let complete_enabled = settings
        .get_bool("postlogin_complete_enabled")
        .await
        .unwrap_or(None);
    if complete_enabled == Some(true) && user.name.is_none() {
        return Some(PostLoginAction {
            action: "complete_profile".to_string(),
            redirect_url: None,
        });
    }

    // 7. Redirect URL
    let redirect_url = settings
        .get("postlogin_redirect_url")
        .await
        .unwrap_or(None)
        .filter(|url| !url.is_empty());
    if let Some(url) = redirect_url {
        return Some(PostLoginAction {
            action: "redirect".to_string(),
            redirect_url: Some(url),
        });
    }

    None
}
