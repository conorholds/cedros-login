//! Privacy Cash integration configuration
//!
//! Runtime-tunable settings (privacy_period, withdrawal worker settings)
//! are stored in the database and managed via the admin UI.
//! See system_settings table and SettingsService.

use serde::Deserialize;

/// Default sidecar URL for local development
pub fn default_sidecar_url() -> String {
    "http://localhost:3100".to_string()
}

/// Default sidecar timeout (30 seconds)
pub fn default_sidecar_timeout_ms() -> u64 {
    30_000
}

/// Default deposit session TTL (24 hours)
pub fn default_session_ttl_secs() -> u64 {
    86_400
}

/// Default minimum deposit (0 = no minimum)
pub fn default_min_deposit_lamports() -> u64 {
    0
}

/// Default maximum deposit per transaction (100 SOL in lamports)
/// Set to 0 to disable the limit
pub fn default_max_deposit_lamports() -> u64 {
    100_000_000_000 // 100 SOL
}

/// Default maximum spend per transaction (10 SOL in lamports)
/// Set to 0 to disable the limit
pub fn default_max_spend_per_transaction_lamports() -> u64 {
    10_000_000_000 // 10 SOL
}

/// Default company preferred currency (SOL = no swap on withdrawal)
pub fn default_company_currency() -> String {
    "SOL".to_string()
}

fn default_key_id() -> String {
    "v1".to_string()
}

/// Well-known stablecoin mint addresses
pub const USDC_MINT: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
pub const USDT_MINT: &str = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

/// Default SPL token whitelist (USDC and USDT)
fn default_spl_token_whitelist() -> Vec<String> {
    vec![USDC_MINT.to_string(), USDT_MINT.to_string()]
}

/// Privacy Cash integration configuration
///
/// Note: Runtime-tunable settings like privacy_period_secs and withdrawal
/// worker settings are stored in the database (system_settings table).
/// This config only holds infrastructure settings that require restart.
#[derive(Debug, Clone, Deserialize)]
pub struct PrivacyConfig {
    /// Whether Privacy Cash integration is enabled
    #[serde(default)]
    pub enabled: bool,

    /// URL of the Privacy Cash sidecar service
    #[serde(default = "default_sidecar_url")]
    pub sidecar_url: String,

    /// Timeout for sidecar requests in milliseconds
    #[serde(default = "default_sidecar_timeout_ms")]
    pub sidecar_timeout_ms: u64,

    /// API key for authenticating with the sidecar
    pub sidecar_api_key: Option<String>,

    /// Encryption key for notes (32 bytes, base64 encoded)
    /// Required when enabled
    pub note_encryption_key: Option<String>,

    /// Key ID for encryption key versioning
    #[serde(default = "default_key_id")]
    pub note_encryption_key_id: String,

    /// Minimum deposit amount in lamports (0 = no minimum)
    #[serde(default = "default_min_deposit_lamports")]
    pub min_deposit_lamports: u64,

    /// Maximum deposit amount per transaction in lamports (0 = no limit)
    #[serde(default = "default_max_deposit_lamports")]
    pub max_deposit_lamports: u64,

    /// Maximum spend per transaction in lamports (0 = no limit)
    #[serde(default = "default_max_spend_per_transaction_lamports")]
    pub max_spend_per_transaction_lamports: u64,

    /// Deposit session TTL in seconds
    #[serde(default = "default_session_ttl_secs")]
    pub session_ttl_secs: u64,

    /// Company wallet address for withdrawals
    pub company_wallet_address: Option<String>,

    /// Company preferred withdrawal currency
    /// - "SOL": Withdraw as SOL (default, no swap needed)
    /// - "USDC": Swap SOL -> USDC via Jupiter on withdrawal
    /// - "USDT": Swap SOL -> USDT via Jupiter on withdrawal
    #[serde(default = "default_company_currency")]
    pub company_currency: String,

    /// Secret for verifying incoming deposit webhooks (from Helius/Quicknode)
    /// Required for SPL token deposit detection
    pub deposit_webhook_secret: Option<String>,

    /// Whitelist of allowed SPL token mint addresses
    /// Defaults to USDC and USDT. Set to empty array to disable SPL deposits.
    #[serde(default = "default_spl_token_whitelist")]
    pub spl_token_whitelist: Vec<String>,
}

impl Default for PrivacyConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            sidecar_url: default_sidecar_url(),
            sidecar_timeout_ms: default_sidecar_timeout_ms(),
            sidecar_api_key: None,
            note_encryption_key: None,
            note_encryption_key_id: default_key_id(),
            min_deposit_lamports: default_min_deposit_lamports(),
            max_deposit_lamports: default_max_deposit_lamports(),
            max_spend_per_transaction_lamports: default_max_spend_per_transaction_lamports(),
            session_ttl_secs: default_session_ttl_secs(),
            company_wallet_address: None,
            company_currency: default_company_currency(),
            deposit_webhook_secret: None,
            spl_token_whitelist: default_spl_token_whitelist(),
        }
    }
}

impl PrivacyConfig {
    /// Check if an SPL token mint is allowed for deposits.
    /// Returns the token decimals if whitelisted, None otherwise.
    pub fn get_token_decimals(&self, mint: &str) -> Option<u8> {
        if !self.spl_token_whitelist.contains(&mint.to_string()) {
            return None;
        }
        // Return decimals for known tokens
        match mint {
            USDC_MINT => Some(6),
            USDT_MINT => Some(6),
            // For other whitelisted tokens, default to 6 decimals
            // In the future, this could be extended with a token registry
            _ => Some(6),
        }
    }

    /// Check if an SPL token mint is whitelisted
    pub fn is_token_whitelisted(&self, mint: &str) -> bool {
        self.spl_token_whitelist.contains(&mint.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_sidecar_url_matches_sidecar_service_port() {
        assert_eq!(default_sidecar_url(), "http://localhost:3100");
    }
}
