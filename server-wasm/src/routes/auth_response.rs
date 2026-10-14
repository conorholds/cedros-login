use serde::Serialize;

use super::cookies::CookieSettings;
use super::{refresh_ttl_secs, RouteError};
use crate::data::user_emails;
use crate::data::users::UserEntry;
use crate::domain::settings_registry::{setting_spec, validate_setting_value, SettingsRuntime};
use crate::exports::cedros::extension::routes::RouteResponse;
use crate::host::{settings, to_json};
use crate::routes::invite_gate_handoff::InviteGateHandoffStatus;
use crate::services::jwt::TokenPair;

const POST_LOGIN_REDIRECT_URL_KEY: &str = "postlogin_redirect_url";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AuthUserView {
    id: String,
    email: Option<String>,
    emails: Vec<AuthUserEmailView>,
    name: Option<String>,
    username: Option<String>,
    picture: Option<String>,
    avatar_content_type: Option<String>,
    wallet_address: Option<String>,
    auth_methods: Vec<String>,
    email_verified: bool,
    created_at: String,
    updated_at: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthUserEmailView {
    email: String,
    verified: bool,
    primary: bool,
}

/// Subscription discount granted by a redeemed invite code, embedded in the
/// redeem response so the client can reveal the reward immediately. Additive
/// + optional on the `cedros-login:auth-response` contract.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct InviteDiscountView {
    /// Percent off the subscription price (1-100; 100 = free).
    pub(crate) percent_off: i32,
    pub(crate) duration_months: Option<i32>,
    /// The invite code that granted the discount.
    pub(crate) code: String,
}

/// A server-managed post-login step the client must run before proceeding (the
/// React client already consumes `postLogin.action`).
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PostLoginAction {
    pub(crate) action: &'static str,
    /// App-relative route the client should send the user to (e.g. the
    /// subscription chooser). camelCase `redirectUrl`; omitted when absent.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) redirect_url: Option<String>,
}

/// Enforce `security_require_mfa`: a password account with no TOTP enrolled must
/// set up MFA before proceeding. Returns `None` for non-password accounts
/// (social/wallet/passkey) and when the policy is off (default). Best-effort on
/// the totp read — a seam error must not block the login it gates.
fn compute_post_login(user: &UserEntry) -> Option<PostLoginAction> {
    if user.password_hash.is_some()
        && crate::host::settings::bool("security_require_mfa", false)
        && !crate::data::totp::has_mfa(&user.id).unwrap_or(false)
    {
        return Some(PostLoginAction {
            action: "setup_mfa",
            redirect_url: None,
        });
    }
    None
}

/// Server-driven post-login action for a flow that completed a LOGIN: MFA setup
/// (highest priority) → required subscription-selection gate → configured final
/// redirect. Mirrors the standalone ordering. Runs for EVERY login completion —
/// including MFA/recovery completions, whose `method` is unknown (`None`) but
/// which are still logins. Refresh is the only session-issuing flow that must NOT
/// re-evaluate these gates; it uses [`respond_rotated`] instead.
fn compute_authenticated_post_login(
    user: &UserEntry,
    access_token: &str,
) -> Option<PostLoginAction> {
    if let Some(action) = compute_post_login(user) {
        return Some(action);
    }
    if let Some(action) =
        crate::routes::subscription_selection::post_login_action(&user.id, access_token)
    {
        return Some(action);
    }
    configured_redirect_action()
}

fn configured_redirect_action() -> Option<PostLoginAction> {
    let value = settings::get(POST_LOGIN_REDIRECT_URL_KEY).ok().flatten();
    redirect_action(value.as_deref())
}

fn redirect_action(value: Option<&str>) -> Option<PostLoginAction> {
    let value = value?.trim();
    let redirect_url = if value.starts_with('"') {
        serde_json::from_str::<String>(value).ok()?
    } else {
        value.to_string()
    };
    let spec = setting_spec(POST_LOGIN_REDIRECT_URL_KEY, SettingsRuntime::Wasm)?;
    validate_setting_value(spec, &redirect_url).ok()?;
    if redirect_url.is_empty() {
        return None;
    }
    Some(PostLoginAction {
        action: "redirect",
        redirect_url: Some(redirect_url),
    })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AuthResponse {
    user: AuthUserView,
    #[serde(skip_serializing_if = "Option::is_none")]
    tokens: Option<TokenPair>,
    is_new_user: bool,
    /// Whether this response queued the email needed to complete verification.
    #[serde(skip_serializing_if = "Option::is_none")]
    email_queued: Option<bool>,
    /// The auth method used for THIS login (`password`, `solana`, `google`,
    /// `apple`, `webauthn`, `email`, `sso`). `None` on non-login responses
    /// (refresh) and MFA completions, where the originating method is unknown.
    /// Additive field on the published auth-response contract
    /// (`cedros-login:auth-response`).
    #[serde(skip_serializing_if = "Option::is_none")]
    method: Option<String>,
    /// A required post-login step (e.g. `setup_mfa`) the client must run. Additive
    /// + optional on the `cedros-login:auth-response` contract.
    #[serde(skip_serializing_if = "Option::is_none")]
    post_login: Option<PostLoginAction>,
    /// Set when the invite-code registration gate is on and this account has not
    /// redeemed a code yet: no session is issued and the client must POST the
    /// `pending_invite_token` + a code to `/invite-codes/redeem`.
    #[serde(skip_serializing_if = "Option::is_none")]
    invite_code_required: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pending_invite_token: Option<String>,
    /// Result of the trusted host handoff for a pending invite-gated account.
    #[serde(skip_serializing_if = "Option::is_none")]
    invite_gate_handoff_status: Option<InviteGateHandoffStatus>,
    /// Discount granted by the invite code just redeemed (redeem responses only).
    #[serde(skip_serializing_if = "Option::is_none")]
    invite_discount: Option<InviteDiscountView>,
}

/// Build the auth response for a LOGIN completion: tokens in the body when
/// cookies are disabled, else Set-Cookie headers (access + refresh). Evaluates
/// the post-login gates (MFA setup / subscription). `method` is the auth method
/// used for this login, when known (`None` for MFA/recovery completions, which
/// are still logins and still gated — see [`compute_authenticated_post_login`]).
pub(crate) fn respond(
    status: u16,
    user: &UserEntry,
    tokens: TokenPair,
    is_new_user: bool,
    method: Option<&str>,
    cfg: &CookieSettings,
) -> Result<RouteResponse, RouteError> {
    respond_redeemed(status, user, tokens, is_new_user, method, cfg, None)
}

/// [`respond`] plus the invite-code discount granted by the redemption that
/// completed this login (invite-code redeem responses only).
pub(crate) fn respond_redeemed(
    status: u16,
    user: &UserEntry,
    tokens: TokenPair,
    is_new_user: bool,
    method: Option<&str>,
    cfg: &CookieSettings,
    invite_discount: Option<InviteDiscountView>,
) -> Result<RouteResponse, RouteError> {
    // Compute the post-login action while the access token is still available
    // (the subscription gate queries Pay as the user); `tokens` is moved below.
    let post_login = compute_authenticated_post_login(user, &tokens.access_token);
    build_session_response(
        status,
        user,
        tokens,
        is_new_user,
        method,
        cfg,
        post_login,
        invite_discount,
    )
}

/// Build the auth response for a session ROTATION (`/refresh`). Identical to
/// [`respond`] except it does NOT re-evaluate the post-login gates: refresh is
/// not a login, so it must not re-prompt MFA setup or re-run the subscription
/// (Pay) check on every silent token rotation — matching the standalone.
pub(crate) fn respond_rotated(
    status: u16,
    user: &UserEntry,
    tokens: TokenPair,
    is_new_user: bool,
    method: Option<&str>,
    cfg: &CookieSettings,
) -> Result<RouteResponse, RouteError> {
    build_session_response(status, user, tokens, is_new_user, method, cfg, None, None)
}

#[allow(clippy::too_many_arguments)]
fn build_session_response(
    status: u16,
    user: &UserEntry,
    tokens: TokenPair,
    is_new_user: bool,
    method: Option<&str>,
    cfg: &CookieSettings,
    post_login: Option<PostLoginAction>,
    invite_discount: Option<InviteDiscountView>,
) -> Result<RouteResponse, RouteError> {
    let mut headers = vec![("content-type".to_string(), "application/json".to_string())];
    let body_tokens = if cfg.enabled {
        headers.extend(cfg.auth_cookies(&tokens, refresh_ttl_secs()));
        None
    } else {
        Some(tokens)
    };
    let body = to_json(&AuthResponse {
        user: user_view(user),
        tokens: body_tokens,
        is_new_user,
        email_queued: None,
        method: method.map(str::to_string),
        post_login,
        invite_code_required: None,
        pending_invite_token: None,
        invite_gate_handoff_status: None,
        invite_discount,
    })?;
    Ok(RouteResponse {
        status,
        headers,
        body,
    })
}

/// Build the auth response for flows that create or update a user but must not
/// hand out an authenticated session yet (for example password registration
/// while email verification is required).
pub(crate) fn respond_without_session(
    status: u16,
    user: &UserEntry,
    is_new_user: bool,
    method: Option<&str>,
    email_queued: Option<bool>,
) -> Result<RouteResponse, RouteError> {
    respond_without_session_redeemed(status, user, is_new_user, method, None, email_queued)
}

/// [`respond_without_session`] plus the invite-code discount granted by the
/// redemption (redeem responses where email verification is still pending).
pub(crate) fn respond_without_session_redeemed(
    status: u16,
    user: &UserEntry,
    is_new_user: bool,
    method: Option<&str>,
    invite_discount: Option<InviteDiscountView>,
    email_queued: Option<bool>,
) -> Result<RouteResponse, RouteError> {
    let body = to_json(&AuthResponse {
        user: user_view(user),
        tokens: None,
        is_new_user,
        email_queued,
        method: method.map(str::to_string),
        post_login: compute_post_login(user),
        invite_code_required: None,
        pending_invite_token: None,
        invite_gate_handoff_status: None,
        invite_discount,
    })?;
    Ok(RouteResponse {
        status,
        headers: vec![("content-type".to_string(), "application/json".to_string())],
        body,
    })
}

/// Build the invite-code-gate response: no session, just the flag + the pending
/// token the client redeems at `/invite-codes/redeem`. Mirrors the standalone
/// register/login `invite_code_required` AuthResponse.
pub(crate) fn respond_invite_code_required(
    status: u16,
    user: &UserEntry,
    is_new_user: bool,
    method: Option<&str>,
    pending_invite_token: &str,
    handoff_status: InviteGateHandoffStatus,
) -> Result<RouteResponse, RouteError> {
    let body = to_json(&AuthResponse {
        user: user_view(user),
        tokens: None,
        is_new_user,
        email_queued: None,
        method: method.map(str::to_string),
        post_login: None,
        invite_code_required: Some(true),
        pending_invite_token: Some(pending_invite_token.to_string()),
        invite_gate_handoff_status: Some(handoff_status),
        invite_discount: None,
    })?;
    Ok(RouteResponse {
        status,
        headers: vec![("content-type".to_string(), "application/json".to_string())],
        body,
    })
}

pub(crate) fn user_view(user: &UserEntry) -> AuthUserView {
    AuthUserView {
        id: user.id.clone(),
        email: user.email.clone(),
        emails: email_views(user),
        name: user.name.clone(),
        username: user.username.clone(),
        picture: user.picture.clone(),
        avatar_content_type: user.avatar_content_type.clone(),
        wallet_address: user.wallet_address.clone(),
        auth_methods: crate::data::users::public_auth_methods(user),
        email_verified: user.email_verified,
        created_at: user.created_at.clone(),
        updated_at: user.updated_at.clone(),
    }
}

fn email_views(user: &UserEntry) -> Vec<AuthUserEmailView> {
    match user_emails::list_by_user(&user.id) {
        Ok(rows) if !rows.is_empty() => rows
            .into_iter()
            .map(|row| AuthUserEmailView {
                email: row.email,
                verified: row.verified_at.is_some(),
                primary: row.is_primary,
            })
            .collect(),
        _ => user
            .email
            .as_ref()
            .map(|email| {
                vec![AuthUserEmailView {
                    email: email.clone(),
                    verified: user.email_verified,
                    primary: true,
                }]
            })
            .unwrap_or_default(),
    }
}

#[cfg(test)]
mod tests {
    use super::redirect_action;

    #[test]
    fn configured_redirect_is_the_final_post_login_action() {
        let action = redirect_action(Some("https://app.example.com/dashboard"))
            .expect("valid configured redirect");

        assert_eq!(action.action, "redirect");
        assert_eq!(
            action.redirect_url.as_deref(),
            Some("https://app.example.com/dashboard")
        );
        assert_eq!(
            redirect_action(Some(r#""/dashboard""#))
                .and_then(|action| action.redirect_url)
                .as_deref(),
            Some("/dashboard")
        );
    }

    #[test]
    fn empty_or_invalid_redirect_is_not_emitted() {
        assert!(redirect_action(None).is_none());
        assert!(redirect_action(Some("")).is_none());
        assert!(redirect_action(Some("//evil.example.com")).is_none());
        assert!(redirect_action(Some(r#""/unclosed"#)).is_none());
    }
}
