use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use zeroize::{Zeroize, ZeroizeOnDrop};

/// Authentication method
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AuthMethod {
    Email,
    Google,
    Apple,
    Solana,
    WebAuthn,
    Sso,
}

impl AuthMethod {
    /// Get the string representation of the auth method
    pub fn as_str(&self) -> &'static str {
        match self {
            AuthMethod::Email => "email",
            AuthMethod::Google => "google",
            AuthMethod::Apple => "apple",
            AuthMethod::Solana => "solana",
            AuthMethod::WebAuthn => "webauthn",
            AuthMethod::Sso => "sso",
        }
    }

    /// Parse the stable wire representation used in purpose-bound login tokens.
    pub fn from_wire(value: &str) -> Option<Self> {
        match value {
            "email" => Some(Self::Email),
            "google" => Some(Self::Google),
            "apple" => Some(Self::Apple),
            "solana" => Some(Self::Solana),
            "webauthn" => Some(Self::WebAuthn),
            "sso" => Some(Self::Sso),
            _ => None,
        }
    }
}

impl std::fmt::Display for AuthMethod {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Authenticated user
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthUser {
    pub id: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    pub emails: Vec<AuthUserEmail>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub picture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
    pub auth_methods: Vec<AuthMethod>,
    pub email_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    /// When the user completed the one-time welcome flow (if enabled)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub welcome_completed_at: Option<DateTime<Utc>>,
    /// User's unique referral code
    #[serde(skip_serializing_if = "Option::is_none")]
    pub referral_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthUserEmail {
    pub email: String,
    pub verified: bool,
    pub primary: bool,
}

/// Token pair
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: u64,
}

/// Post-login action to perform after successful authentication
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PostLoginAction {
    /// Action type such as "choose_subscription", "welcome", "complete_profile", or "redirect"
    pub action: String,
    /// URL/route for redirect or welcome page
    #[serde(skip_serializing_if = "Option::is_none")]
    pub redirect_url: Option<String>,
}

/// Authentication response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthResponse {
    pub user: AuthUser,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<TokenPair>,
    pub is_new_user: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub callback_data: Option<serde_json::Value>,
    /// API key for programmatic access (only returned for new users)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    /// Whether verification email was successfully queued (only set when require_verification is on)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_queued: Option<bool>,
    /// Post-login action (welcome page, profile completion, or redirect)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub post_login: Option<PostLoginAction>,
    /// True when registration pre-created the account but requires invite-code activation.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub invite_code_required: Option<bool>,
    /// Opaque token used to redeem an invite code for a pending account.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pending_invite_token: Option<String>,
    /// The auth method used for THIS login. `None` on responses that do not
    /// complete a login (e.g. token refresh). Additive field on the published
    /// auth-response contract (`cedros-login:auth-response`).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub method: Option<AuthMethod>,
}

/// Response when MFA is required to complete login
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MfaRequiredResponse {
    /// Indicates MFA verification is required
    pub mfa_required: bool,
    /// Temporary token to use for MFA verification (short-lived)
    pub mfa_token: String,
    /// User ID (for client reference)
    pub user_id: Uuid,
}

/// Request to complete MFA during login
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MfaLoginRequest {
    /// The mfa_token from the initial login response
    pub mfa_token: String,
    /// TOTP code from an authenticator app or a single-use recovery code
    pub code: String,
}

/// Register request
///
/// # Security Note
///
/// Password is zeroized on drop via the Zeroize trait. However, Rust's String
/// type does not guarantee that the allocator won't have copied the data or that
/// the memory region is truly cleared. This is a best-effort defense-in-depth
/// measure, not a cryptographic guarantee.
///
/// For truly sensitive key material, consider Zeroizing<String> from the zeroize
/// crate, but note this would be a breaking API change. In practice, the password
/// is hashed immediately and the short-lived request struct lifetime limits exposure.
#[derive(Debug, Clone, Deserialize, Zeroize, ZeroizeOnDrop)]
pub struct RegisterRequest {
    #[zeroize(skip)] // Skip zeroizing email (not sensitive)
    pub email: String,
    /// Best-effort zeroize - see struct docs for limitations
    pub password: String,
    #[zeroize(skip)] // Skip zeroizing name (not sensitive)
    pub name: Option<String>,
    /// Optional referral code or metadata from the host application.
    /// Passed through to the AuthCallback for host-side processing.
    #[zeroize(skip)]
    pub referral: Option<String>,
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    #[zeroize(skip)]
    pub access_code: Option<String>,
    /// Optional invite code used when invite-code registration is enabled.
    #[zeroize(skip)]
    pub invite_code: Option<String>,
}

/// Login request
///
/// # Security Note
///
/// See RegisterRequest for password zeroization limitations.
#[derive(Debug, Clone, Deserialize, Zeroize, ZeroizeOnDrop)]
pub struct LoginRequest {
    #[zeroize(skip)] // Skip zeroizing email (not sensitive)
    pub email: String,
    /// Best-effort zeroize - see RegisterRequest docs for limitations
    pub password: String,
}

/// Google auth request — accepts either an ID token (from One Tap) or an
/// access token (from the OAuth popup flow via `initTokenClient`).
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleAuthRequest {
    pub id_token: Option<String>,
    pub access_token: Option<String>,
    /// Optional referral code for new user signup attribution.
    /// Only processed when this is a new account creation.
    pub referral: Option<String>,
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    pub access_code: Option<String>,
}

/// Apple Sign-In auth request
///
/// Note: Apple only provides name on first sign-in. The client should
/// capture and forward the name from the authorization response.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppleAuthRequest {
    /// Apple ID token (JWT)
    pub id_token: String,
    /// Short-lived Apple authorization code used to exchange for a refresh token.
    pub authorization_code: Option<String>,
    /// User's name (only provided on first sign-in, optional thereafter)
    pub name: Option<String>,
    /// Client-generated nonce (unhashed). Server computes SHA-256 and
    /// compares with the `nonce` claim in the ID token for replay protection.
    pub nonce: String,
    /// Optional referral code for new user signup attribution.
    /// Only processed when this is a new account creation.
    pub referral: Option<String>,
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    pub access_code: Option<String>,
}

/// Link OAuth account request
///
/// Used when a user wants to link a Google or Apple OAuth account.
///
/// `password` proves ownership for the legacy unauthenticated path. When it is
/// omitted, the request must carry an authenticated session with recent step-up.
///
/// # Security Note
///
/// Password is zeroized on drop. See RegisterRequest for limitations.
#[derive(Debug, Clone, Deserialize, Zeroize, ZeroizeOnDrop)]
#[serde(rename_all = "camelCase")]
pub struct LinkOAuthRequest {
    #[zeroize(skip)]
    pub id_token: Option<String>,
    #[zeroize(skip)]
    pub access_token: Option<String>,
    #[zeroize(skip)]
    pub provider: String,
    pub authorization_code: Option<String>,
    #[zeroize(skip)]
    pub nonce: Option<String>,
    pub password: Option<String>,
}

/// Solana challenge request
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolanaChallengeRequest {
    pub public_key: String,
}

/// Solana challenge response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChallengeResponse {
    pub nonce: String,
    pub message: String,
    pub expires_at: DateTime<Utc>,
}

/// Solana auth request
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolanaAuthRequest {
    pub public_key: String,
    pub signature: String,
    pub message: String,
    /// Optional referral code for new user signup attribution.
    /// Only processed when this is a new account creation.
    pub referral: Option<String>,
    /// Optional signup access code. Required when `signup_access_code_enabled` is true.
    pub access_code: Option<String>,
}

/// Solana wallet-link request (`POST /solana/link`): the same signed-challenge
/// proof as sign-in, without the signup-only fields.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SolanaLinkRequest {
    pub public_key: String,
    pub signature: String,
    pub message: String,
}

/// Refresh request
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshRequest {
    pub refresh_token: Option<String>,
}

/// Refresh response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens: Option<TokenPair>,
}

/// User response (for GET /auth/user)
#[derive(Debug, Clone, Serialize)]
pub struct UserResponse {
    pub user: AuthUser,
}

/// Simple message response
#[derive(Debug, Clone, Serialize)]
pub struct MessageResponse {
    pub message: String,
}

/// Health check response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    /// Credential-free outbound email capability diagnostic.
    pub email_delivery: String,
    /// Database connectivity status (only present when postgres feature enabled)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub database: Option<String>,
    /// Active rate limit backend when rate limiting is enabled.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rate_limit_backend: Option<String>,
    /// Readiness of the configured rate limit backend.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rate_limit_status: Option<String>,
}

/// Authorization check request (supports both RBAC and ABAC)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthorizeRequest {
    pub org_id: Uuid,
    pub permission: String,
    /// Optional resource attributes for ABAC evaluation
    #[serde(default)]
    pub resource: Option<std::collections::HashMap<String, serde_json::Value>>,
    /// Optional environment attributes for ABAC evaluation
    #[serde(default)]
    pub environment: Option<std::collections::HashMap<String, serde_json::Value>>,
}

/// Authorization check response (includes ABAC policy info)
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthorizeResponse {
    pub allowed: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub permissions: Option<Vec<String>>,
    /// ID of the ABAC policy that matched (if any)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub matched_policy_id: Option<Uuid>,
    /// Name of the ABAC policy that matched (if any)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub matched_policy_name: Option<String>,
    /// Whether RBAC fallback was used
    #[serde(skip_serializing_if = "Option::is_none")]
    pub used_rbac_fallback: Option<bool>,
}

/// Get permissions request
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetPermissionsRequest {
    pub org_id: Uuid,
}

/// Get permissions response
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetPermissionsResponse {
    pub permissions: Vec<String>,
    pub role: Option<String>,
    /// The authenticated caller's user id within this org. Consumers (e.g.
    /// cedros-data's vault audit log) need this to attribute actions back to a
    /// person; without it they can only log the role.
    pub user_id: Uuid,
}
