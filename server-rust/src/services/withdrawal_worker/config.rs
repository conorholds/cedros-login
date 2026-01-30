//! Configuration for the withdrawal worker
//!
//! Most settings are now stored in the database (system_settings table)
//! and read dynamically via SettingsService. This config only holds
//! values that should remain in environment variables.

/// Configuration for the withdrawal worker (env-only settings)
///
/// Runtime-tunable settings (poll_interval, batch_size, timeout, retries,
/// percentage, partial_withdrawal_*) are stored in the database and
/// read dynamically via SettingsService.
#[derive(Debug, Clone)]
pub struct WithdrawalWorkerConfig {
    /// Company's preferred withdrawal currency (SOL, USDC, USDT)
    /// If not SOL, funds will be swapped via Jupiter after withdrawal
    pub company_currency: String,
}

impl Default for WithdrawalWorkerConfig {
    fn default() -> Self {
        Self {
            company_currency: "SOL".to_string(),
        }
    }
}
