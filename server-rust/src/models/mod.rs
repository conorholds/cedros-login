//! Data models for authentication

// SEC-06: Import zeroize for sensitive data structs
use zeroize::{Zeroize, ZeroizeOnDrop};

mod admin;
mod api_key;
mod audit;
mod credit;
mod deposit;
mod invite;
mod org;
mod session;
pub mod sso;
mod wallet;

pub use admin::{
    AdjustCreditsRequest, AdjustCreditsResponse, AdminCreditRefundRequestResponse,
    AdminOrgResponse, AdminUpdateUserRequest, AdminUserResponse, ListAdminOrgsResponse,
    ListCreditRefundRequestsQueryParams, ListCreditRefundRequestsResponse, ListOrgsQueryParams,
    ListUsersQueryParams, ListUsersResponse, ProcessCreditRefundRequestInput,
    ProcessCreditRefundRequestResponse, RejectCreditRefundRequestInput,
    RejectCreditRefundRequestResponse, SetSystemAdminRequest,
};
pub use api_key::{
    ApiKeyListResponse, ApiKeyResponse, CreateApiKeyRequest, CreateApiKeyResponse,
    RegenerateApiKeyResponse, ValidateApiKeyRequest, ValidateApiKeyResponse,
};
pub use audit::{AuditLogQueryParams, AuditLogResponse, ListAuditLogsResponse};
pub use credit::{
    BalancesResponse, CaptureHoldResponse, CreateHoldRequest, CreateHoldResponse,
    CreditBalanceResponse, CreditHistoryResponse, CreditTransactionResponse, CreditUsageResponse,
    PendingHoldResponse, PendingHoldsResponse, RefundRequestInput, RefundRequestResponse,
    ReleaseHoldResponse, SpendCreditsRequest, SpendCreditsResponse,
};
pub use deposit::{
    ConfirmSplDepositRequest, ConfirmSplDepositResponse, CustomTokenDefinition,
    DepositConfigResponse, DepositItemResponse, DepositListResponse, DepositQuoteResponse,
    DepositStatusResponse, PendingSplDepositItemResponse, PendingSplDepositListResponse,
};
pub use invite::{
    AcceptInviteRequest, AcceptInviteResponse, CreateInviteRequest, InviteResponse,
    InviteWithTokenResponse, ListInvitesResponse,
};
pub use org::{
    CreateOrgRequest, ListMembersResponse, ListOrgsResponse, MemberResponse, OrgResponse,
    UpdateMemberRoleRequest, UpdateOrgRequest,
};
pub use session::{ListSessionsResponse, RevokeAllSessionsResponse, SessionResponse};
pub use wallet::{
    AcknowledgeRecoveryRequest, KdfParamsDto, PendingWalletRecoveryResponse,
    RotateUserSecretRequest, ShareAAuthMethod, ShareCRecoveryRequest, ShareCRecoveryResponse,
    SignTransactionRequest, SignTransactionResponse, UnlockCredential, WalletEnrollRequest,
    WalletListResponse, WalletMaterialResponse, WalletRecoverRequest, WalletRotateRequest,
    WalletStatusResponse, WalletSummary, WalletUnlockRequest, WalletUnlockResponse,
};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub picture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet_address: Option<String>,
    pub auth_methods: Vec<AuthMethod>,
    pub email_verified: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Token pair
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: u64,
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
    /// S-05: Whether verification email was successfully queued (only set when require_verification is on)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_queued: Option<bool>,
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
    /// TOTP code from authenticator app
    pub code: String,
}

/// Register request
///
/// # Security Note (SEC-06, TYPE-06)
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
    /// TYPE-06: Best-effort zeroize - see struct docs for limitations
    pub password: String,
    #[zeroize(skip)] // Skip zeroizing name (not sensitive)
    pub name: Option<String>,
}

/// Login request
///
/// # Security Note (SEC-06, TYPE-06)
///
/// See RegisterRequest for password zeroization limitations.
#[derive(Debug, Clone, Deserialize, Zeroize, ZeroizeOnDrop)]
pub struct LoginRequest {
    #[zeroize(skip)] // Skip zeroizing email (not sensitive)
    pub email: String,
    /// TYPE-06: Best-effort zeroize - see RegisterRequest docs for limitations
    pub password: String,
}

/// Google auth request
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GoogleAuthRequest {
    pub id_token: String,
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
    /// User's name (only provided on first sign-in, optional thereafter)
    pub name: Option<String>,
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
    /// Database connectivity status (only present when postgres feature enabled)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub database: Option<String>,
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_method_as_str() {
        assert_eq!(AuthMethod::Email.as_str(), "email");
        assert_eq!(AuthMethod::Google.as_str(), "google");
        assert_eq!(AuthMethod::Solana.as_str(), "solana");
    }

    #[test]
    fn test_auth_method_display() {
        assert_eq!(format!("{}", AuthMethod::Email), "email");
        assert_eq!(format!("{}", AuthMethod::Google), "google");
        assert_eq!(format!("{}", AuthMethod::Solana), "solana");
    }

    #[test]
    fn test_auth_method_to_string() {
        assert_eq!(AuthMethod::Email.to_string(), "email");
        assert_eq!(AuthMethod::Google.to_string(), "google");
        assert_eq!(AuthMethod::Solana.to_string(), "solana");
    }

    #[test]
    fn test_auth_method_serialize() {
        let email = serde_json::to_string(&AuthMethod::Email).unwrap();
        assert_eq!(email, "\"email\"");

        let google = serde_json::to_string(&AuthMethod::Google).unwrap();
        assert_eq!(google, "\"google\"");

        let solana = serde_json::to_string(&AuthMethod::Solana).unwrap();
        assert_eq!(solana, "\"solana\"");
    }

    #[test]
    fn test_auth_method_deserialize() {
        let email: AuthMethod = serde_json::from_str("\"email\"").unwrap();
        assert_eq!(email, AuthMethod::Email);

        let google: AuthMethod = serde_json::from_str("\"google\"").unwrap();
        assert_eq!(google, AuthMethod::Google);

        let solana: AuthMethod = serde_json::from_str("\"solana\"").unwrap();
        assert_eq!(solana, AuthMethod::Solana);
    }

    #[test]
    fn test_auth_user_serialization() {
        let user = AuthUser {
            id: Uuid::nil(),
            email: Some("test@example.com".to_string()),
            name: Some("Test User".to_string()),
            picture: None,
            wallet_address: None,
            auth_methods: vec![AuthMethod::Email],
            email_verified: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let json = serde_json::to_string(&user).unwrap();
        assert!(json.contains("\"email\":\"test@example.com\""));
        assert!(json.contains("\"authMethods\":[\"email\"]"));
        assert!(json.contains("\"emailVerified\":true"));
        // Optional None fields should not be serialized
        assert!(!json.contains("picture"));
        assert!(!json.contains("walletAddress"));
    }

    #[test]
    fn test_token_pair_serialization() {
        let tokens = TokenPair {
            access_token: "access123".to_string(),
            refresh_token: "refresh456".to_string(),
            expires_in: 900,
        };

        let json = serde_json::to_string(&tokens).unwrap();
        assert!(json.contains("\"accessToken\":\"access123\""));
        assert!(json.contains("\"refreshToken\":\"refresh456\""));
        assert!(json.contains("\"expiresIn\":900"));
    }

    #[test]
    fn test_register_request_deserialization() {
        let json = r#"{"email":"test@example.com","password":"SecurePass1!","name":"Test"}"#;
        let request: RegisterRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.email, "test@example.com");
        assert_eq!(request.password, "SecurePass1!");
        assert_eq!(request.name, Some("Test".to_string()));
    }

    #[test]
    fn test_login_request_deserialization() {
        let json = r#"{"email":"test@example.com","password":"SecurePass1!"}"#;
        let request: LoginRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.email, "test@example.com");
        assert_eq!(request.password, "SecurePass1!");
    }

    #[test]
    fn test_google_auth_request_deserialization() {
        let json = r#"{"idToken":"google-id-token-123"}"#;
        let request: GoogleAuthRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.id_token, "google-id-token-123");
    }

    #[test]
    fn test_solana_challenge_request_deserialization() {
        let json = r#"{"publicKey":"SoLaNaPubKeY123"}"#;
        let request: SolanaChallengeRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.public_key, "SoLaNaPubKeY123");
    }

    #[test]
    fn test_solana_auth_request_deserialization() {
        let json = r#"{"publicKey":"SoLaNaPubKeY123","signature":"sig456","message":"msg789"}"#;
        let request: SolanaAuthRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.public_key, "SoLaNaPubKeY123");
        assert_eq!(request.signature, "sig456");
        assert_eq!(request.message, "msg789");
    }

    #[test]
    fn test_refresh_request_deserialization() {
        let json = r#"{"refreshToken":"refresh-token-abc"}"#;
        let request: RefreshRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.refresh_token.as_deref(), Some("refresh-token-abc"));
    }

    #[test]
    fn test_challenge_response_serialization() {
        let response = ChallengeResponse {
            nonce: "nonce123".to_string(),
            message: "Sign this message".to_string(),
            expires_at: Utc::now(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"nonce\":\"nonce123\""));
        assert!(json.contains("\"message\":\"Sign this message\""));
        assert!(json.contains("\"expiresAt\""));
    }

    #[test]
    fn test_refresh_response_serialization() {
        let response = RefreshResponse {
            tokens: Some(TokenPair {
                access_token: "new-access".to_string(),
                refresh_token: "new-refresh".to_string(),
                expires_in: 900,
            }),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"accessToken\":\"new-access\""));
        assert!(json.contains("\"refreshToken\":\"new-refresh\""));
    }

    #[test]
    fn test_message_response_serialization() {
        let response = MessageResponse {
            message: "Success".to_string(),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert_eq!(json, r#"{"message":"Success"}"#);
    }

    #[test]
    fn test_health_response_serialization() {
        // Test without database field (in-memory mode)
        let response = HealthResponse {
            status: "healthy".to_string(),
            version: "1.0.0".to_string(),
            database: None,
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"status\":\"healthy\""));
        assert!(json.contains("\"version\":\"1.0.0\""));
        // Database field should be omitted when None
        assert!(!json.contains("database"));

        // Test with database field (postgres mode)
        let response = HealthResponse {
            status: "healthy".to_string(),
            version: "1.0.0".to_string(),
            database: Some("connected".to_string()),
        };
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"database\":\"connected\""));
    }

    #[test]
    fn test_auth_user_with_wallet() {
        let user = AuthUser {
            id: Uuid::nil(),
            email: None,
            name: None,
            picture: None,
            wallet_address: Some("SoLaNaWaLlEt123".to_string()),
            auth_methods: vec![AuthMethod::Solana],
            email_verified: false,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        let json = serde_json::to_string(&user).unwrap();
        assert!(json.contains("\"walletAddress\":\"SoLaNaWaLlEt123\""));
        assert!(json.contains("\"authMethods\":[\"solana\"]"));
        // Optional None fields should not be serialized
        assert!(!json.contains("\"email\":"));
        assert!(!json.contains("\"name\":"));
    }
}
