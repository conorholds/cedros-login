//! Wallet-related DTOs for server-side signing Solana wallet feature
//!
//! v2 Architecture (scheme_version=2):
//! - Share A: Encrypted ciphertext stored on server, decrypted server-side
//! - Share B: Plaintext stored on server (SSS math protects it)
//! - Server combines shares JIT for signing, wipes immediately after
//! - User provides credential (password/PIN/passkey PRF) to unlock Share A

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;

/// KDF parameters for Argon2id
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KdfParamsDto {
    /// Memory cost in KiB
    pub m_cost: u32,
    /// Time cost (iterations)
    pub t_cost: u32,
    /// Parallelism
    pub p_cost: u32,
}

/// Auth method for Share A encryption
///
/// Priority order (when user has multiple): passkey > password > pin
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShareAAuthMethod {
    /// Email users reuse login password (Argon2id KDF)
    Password,
    /// OAuth users create wallet PIN (Argon2id KDF)
    Pin,
    /// Users with passkey login use PRF extension (HKDF)
    Passkey,
}

impl fmt::Display for ShareAAuthMethod {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ShareAAuthMethod::Password => write!(f, "password"),
            ShareAAuthMethod::Pin => write!(f, "pin"),
            ShareAAuthMethod::Passkey => write!(f, "passkey"),
        }
    }
}

impl std::str::FromStr for ShareAAuthMethod {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "password" => Ok(ShareAAuthMethod::Password),
            "pin" => Ok(ShareAAuthMethod::Pin),
            "passkey" => Ok(ShareAAuthMethod::Passkey),
            _ => Err(format!("Invalid auth method: {}", s)),
        }
    }
}

/// Request to enroll (create) wallet material (v2 - server-side signing)
///
/// The client:
/// 1. Generates 32-byte seed
/// 2. Splits seed into 3 Shamir shares (threshold 2)
/// 3. Encrypts Share A with password/PIN/passkey-derived key
/// 4. Sends Share B as plaintext (SSS protects it)
/// 5. Shows Share C as BIP-39 mnemonic to user (never sent to server)
///
/// ## TYPE-07: Conditional Field Requirements
///
/// Fields are required based on `share_a_auth_method`:
///
/// | Auth Method | Required Fields |
/// |-------------|-----------------|
/// | `password`  | `share_a_kdf_salt`, `share_a_kdf_params` |
/// | `pin`       | `share_a_kdf_salt`, `share_a_kdf_params`, `pin` |
/// | `passkey`   | `prf_salt` |
///
/// Runtime validation is performed in the handler (see wallet.rs handler).
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletEnrollRequest {
    /// Base58-encoded Solana public key
    pub solana_pubkey: String,

    /// Auth method for Share A: password, pin, or passkey
    pub share_a_auth_method: ShareAAuthMethod,

    // Share A (encrypted with user credential)
    /// AES-GCM ciphertext (base64)
    pub share_a_ciphertext: String,
    /// AES-GCM nonce (base64, 12 bytes)
    pub share_a_nonce: String,
    /// Argon2id salt (base64, 16+ bytes) - required for password/pin methods
    #[serde(default)]
    pub share_a_kdf_salt: Option<String>,
    /// KDF parameters - required for password/pin methods
    #[serde(default)]
    pub share_a_kdf_params: Option<KdfParamsDto>,
    /// PRF salt (base64, 32 bytes) - required for passkey method
    #[serde(default)]
    pub prf_salt: Option<String>,

    /// PIN (plaintext, 6+ digits) - required for PIN method during enrollment
    /// Server will hash this with Argon2id
    #[serde(default)]
    pub pin: Option<String>,

    // Share B (plaintext - SSS math protects it)
    /// Plaintext Share B (base64)
    pub share_b: String,

    /// Recovery data (base64) - optional, used when recovery mode is enabled
    /// Contains Share C (for share_c_only mode) or full seed (for full_seed mode)
    /// as a BIP-39 mnemonic encoded in base64
    #[serde(default)]
    pub recovery_data: Option<String>,
}

/// Response containing wallet status and auth method (v2)
///
/// Does NOT return shares - shares are never sent to client in v2.
/// Client only needs to know: pubkey, auth method, and what to send for signing.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletMaterialResponse {
    /// Base58-encoded Solana public key
    pub solana_pubkey: String,

    /// Scheme version (2 for server-side signing)
    pub scheme_version: i16,

    /// Auth method for Share A: password, pin, or passkey
    pub share_a_auth_method: ShareAAuthMethod,

    /// PRF salt (base64) - only present for passkey auth method
    /// Client needs this to request PRF output from authenticator
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prf_salt: Option<String>,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request to unlock wallet for session-based signing
///
/// Once unlocked, subsequent sign requests don't require credential until TTL expires.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletUnlockRequest {
    /// Unlock credential (password/PIN/PRF)
    #[serde(flatten)]
    pub credential: UnlockCredential,
}

/// Response from wallet unlock
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletUnlockResponse {
    /// Whether wallet is now unlocked
    pub unlocked: bool,
    /// TTL in seconds until auto-lock
    pub ttl_seconds: u64,
}

/// Response from wallet status check
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletStatusResponse {
    /// Whether SSS embedded wallet is enrolled
    pub enrolled: bool,
    /// Whether wallet is currently unlocked for signing
    pub unlocked: bool,
    /// Solana public key (from SSS wallet if enrolled, or external wallet if connected)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub solana_pubkey: Option<String>,
    /// Auth method for SSS wallet (if enrolled)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth_method: Option<ShareAAuthMethod>,
    /// Whether user signed in with external Solana wallet (not SSS)
    /// If true, user should use their connected wallet adapter for signing
    #[serde(default)]
    pub has_external_wallet: bool,
}

/// Request to sign a transaction (v2 - server-side signing)
///
/// If wallet is unlocked for session, credential is optional.
/// If wallet is locked, credential must be provided.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignTransactionRequest {
    /// Transaction message bytes to sign (base64)
    pub transaction: String,

    /// Unlock credential - optional if wallet already unlocked for session
    #[serde(flatten)]
    pub credential: Option<UnlockCredential>,
}

/// Unlock credential for signing (one of password, pin, or passkey PRF)
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum UnlockCredential {
    /// Password for password auth method
    Password(String),
    /// PIN for PIN auth method
    Pin(String),
    /// PRF output for passkey auth method (base64, 32 bytes)
    PrfOutput(String),
}

/// Response from transaction signing
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignTransactionResponse {
    /// Ed25519 signature (base64, 64 bytes)
    pub signature: String,
    /// Solana public key that signed (for verification)
    pub pubkey: String,
}

// Note: RotateDeviceShareRequest removed in v2 - Share B is plaintext, no rotation needed

/// Request to rotate user secret (re-encrypt Share A)
/// Used when user changes password/PIN, or switches auth method
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RotateUserSecretRequest {
    /// Current unlock credential for verification
    #[serde(flatten)]
    pub current_credential: UnlockCredential,

    /// New auth method (can change methods, e.g., password -> passkey)
    pub new_auth_method: ShareAAuthMethod,

    /// New AES-GCM ciphertext (base64)
    pub share_a_ciphertext: String,
    /// New AES-GCM nonce (base64, 12 bytes)
    pub share_a_nonce: String,
    /// New Argon2id salt (base64, 16+ bytes) - required for password/pin methods
    #[serde(default)]
    pub share_a_kdf_salt: Option<String>,
    /// New KDF parameters - required for password/pin methods
    #[serde(default)]
    pub share_a_kdf_params: Option<KdfParamsDto>,
    /// New PRF salt (base64, 32 bytes) - required for passkey method
    #[serde(default)]
    pub prf_salt: Option<String>,
    /// New PIN (plaintext) - required when switching to PIN method
    #[serde(default)]
    pub new_pin: Option<String>,
}

/// Request to get Share B for Share C recovery mode
///
/// Share C recovery flow:
/// 1. User enters Share C (as 24-word mnemonic) on client
/// 2. Client sends Share C to server
/// 3. Server combines Share B + Share C to reconstruct seed
/// 4. Server derives pubkey and verifies it matches user's wallet
/// 5. Server returns Share B so client can complete recovery
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareCRecoveryRequest {
    /// Share C data (base64, 32 bytes decoded from mnemonic)
    pub share_c: String,
}

/// Response from Share C recovery endpoint
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareCRecoveryResponse {
    /// Share B (base64) - combined with Share C to reconstruct seed
    pub share_b: String,
    /// Solana pubkey (for verification)
    pub solana_pubkey: String,
}

/// Request to recover wallet (replace wallet material with matching pubkey)
///
/// Recovery flow:
/// 1. User enters recovery phrase (24 words) on client
/// 2. Client decodes to seed, re-derives pubkey
/// 3. Client re-splits seed, re-encrypts with new credential
/// 4. Server verifies pubkey matches existing wallet, then replaces material
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletRecoverRequest {
    /// Base58-encoded Solana public key (must match existing wallet)
    pub solana_pubkey: String,

    /// New auth method for Share A: password, pin, or passkey
    pub share_a_auth_method: ShareAAuthMethod,

    // Share A (encrypted with new credential)
    /// AES-GCM ciphertext (base64)
    pub share_a_ciphertext: String,
    /// AES-GCM nonce (base64, 12 bytes)
    pub share_a_nonce: String,
    /// Argon2id salt (base64, 16+ bytes) - required for password/pin methods
    #[serde(default)]
    pub share_a_kdf_salt: Option<String>,
    /// KDF parameters - required for password/pin methods
    #[serde(default)]
    pub share_a_kdf_params: Option<KdfParamsDto>,
    /// PRF salt (base64, 32 bytes) - required for passkey method
    #[serde(default)]
    pub prf_salt: Option<String>,

    /// PIN (plaintext, 6+ digits) - required for PIN method
    #[serde(default)]
    pub pin: Option<String>,

    // Share B (plaintext - SSS math protects it)
    /// Plaintext Share B (base64)
    pub share_b: String,
}

/// Response from pending wallet recovery check
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PendingWalletRecoveryResponse {
    /// Whether there is pending recovery data to acknowledge
    pub has_pending_recovery: bool,
    /// Type of recovery data: "share_c" or "full_seed"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recovery_type: Option<String>,
    /// Recovery phrase (BIP-39 mnemonic) - only returned once, then deleted
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recovery_phrase: Option<String>,
    /// When the recovery data expires (if not acknowledged)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<DateTime<Utc>>,
}

/// Request to acknowledge receipt of recovery phrase
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AcknowledgeRecoveryRequest {
    /// Confirmation that user has saved the recovery phrase
    pub confirmed: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_share_a_auth_method_serialization() {
        assert_eq!(
            serde_json::to_string(&ShareAAuthMethod::Password).unwrap(),
            "\"password\""
        );
        assert_eq!(
            serde_json::to_string(&ShareAAuthMethod::Pin).unwrap(),
            "\"pin\""
        );
        assert_eq!(
            serde_json::to_string(&ShareAAuthMethod::Passkey).unwrap(),
            "\"passkey\""
        );
    }

    #[test]
    fn test_share_a_auth_method_deserialization() {
        let password: ShareAAuthMethod = serde_json::from_str("\"password\"").unwrap();
        assert_eq!(password, ShareAAuthMethod::Password);

        let pin: ShareAAuthMethod = serde_json::from_str("\"pin\"").unwrap();
        assert_eq!(pin, ShareAAuthMethod::Pin);

        let passkey: ShareAAuthMethod = serde_json::from_str("\"passkey\"").unwrap();
        assert_eq!(passkey, ShareAAuthMethod::Passkey);
    }

    #[test]
    fn test_wallet_enroll_request_password_method() {
        let json = r#"{
            "solanaPubkey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            "shareAAuthMethod": "password",
            "shareACiphertext": "YWJjZGVm",
            "shareANonce": "MTIzNDU2Nzg5MDEy",
            "shareAKdfSalt": "c2FsdHNhbHRzYWx0c2FsdA==",
            "shareAKdfParams": {"mCost": 19456, "tCost": 2, "pCost": 1},
            "shareB": "c2hhcmViZGF0YQ=="
        }"#;

        let request: WalletEnrollRequest = serde_json::from_str(json).unwrap();
        assert_eq!(
            request.solana_pubkey,
            "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
        );
        assert_eq!(request.share_a_auth_method, ShareAAuthMethod::Password);
        assert!(request.share_a_kdf_params.is_some());
        assert_eq!(request.share_a_kdf_params.as_ref().unwrap().m_cost, 19456);
    }

    #[test]
    fn test_wallet_enroll_request_pin_method() {
        let json = r#"{
            "solanaPubkey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            "shareAAuthMethod": "pin",
            "shareACiphertext": "YWJjZGVm",
            "shareANonce": "MTIzNDU2Nzg5MDEy",
            "shareAKdfSalt": "c2FsdHNhbHRzYWx0c2FsdA==",
            "shareAKdfParams": {"mCost": 19456, "tCost": 2, "pCost": 1},
            "pin": "123456",
            "shareB": "c2hhcmViZGF0YQ=="
        }"#;

        let request: WalletEnrollRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.share_a_auth_method, ShareAAuthMethod::Pin);
        assert_eq!(request.pin, Some("123456".to_string()));
    }

    #[test]
    fn test_wallet_enroll_request_passkey_method() {
        let json = r#"{
            "solanaPubkey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
            "shareAAuthMethod": "passkey",
            "shareACiphertext": "YWJjZGVm",
            "shareANonce": "MTIzNDU2Nzg5MDEy",
            "prfSalt": "cHJmc2FsdHByZnNhbHRwcmZzYWx0cHJmc2FsdA==",
            "shareB": "c2hhcmViZGF0YQ=="
        }"#;

        let request: WalletEnrollRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.share_a_auth_method, ShareAAuthMethod::Passkey);
        assert!(request.prf_salt.is_some());
        assert!(request.share_a_kdf_salt.is_none());
    }

    #[test]
    fn test_wallet_material_response_serialization() {
        let response = WalletMaterialResponse {
            solana_pubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU".to_string(),
            scheme_version: 2,
            share_a_auth_method: ShareAAuthMethod::Password,
            prf_salt: None,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"solanaPubkey\":\"7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU\""));
        assert!(json.contains("\"schemeVersion\":2"));
        assert!(json.contains("\"shareAAuthMethod\":\"password\""));
        // prf_salt should be omitted when None
        assert!(!json.contains("prfSalt"));
    }

    #[test]
    fn test_wallet_material_response_with_prf_salt() {
        let response = WalletMaterialResponse {
            solana_pubkey: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU".to_string(),
            scheme_version: 2,
            share_a_auth_method: ShareAAuthMethod::Passkey,
            prf_salt: Some("cHJmc2FsdA==".to_string()),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"shareAAuthMethod\":\"passkey\""));
        assert!(json.contains("\"prfSalt\":\"cHJmc2FsdA==\""));
    }

    #[test]
    fn test_sign_transaction_response_serialization() {
        let response = SignTransactionResponse {
            signature: "c2lnbmF0dXJlZGF0YQ==".to_string(),
            pubkey: "2ZjUShWy5eqJThLvnA6x3gPQFGwjHWPYdJnDhGMxCkKs".to_string(),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"signature\":\"c2lnbmF0dXJlZGF0YQ==\""));
        assert!(json.contains("\"pubkey\":\"2ZjUShWy5eqJThLvnA6x3gPQFGwjHWPYdJnDhGMxCkKs\""));
    }
}
