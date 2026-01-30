//! Deposit fee calculation service
//!
//! Handles configurable fee deduction based on admin settings.
//! Fee policies determine whether the company or user pays deposit fees.

use std::convert::Infallible;
use std::str::FromStr;
use std::sync::Arc;

use crate::errors::AppError;
use crate::services::SettingsService;

/// Fee policy options - who pays the deposit fees
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum FeePolicy {
    /// Company absorbs all fees, user gets full credit value
    #[default]
    CompanyPaysAll,
    /// User pays swap fee, company pays privacy fee
    UserPaysSwap,
    /// User pays privacy fee, company pays swap fee
    UserPaysPrivacy,
    /// User pays all fees
    UserPaysAll,
}

impl FromStr for FeePolicy {
    type Err = Infallible;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s.to_lowercase().as_str() {
            "company_pays_all" => Self::CompanyPaysAll,
            "user_pays_swap" => Self::UserPaysSwap,
            "user_pays_privacy" => Self::UserPaysPrivacy,
            "user_pays_all" => Self::UserPaysAll,
            _ => Self::CompanyPaysAll,
        })
    }
}

/// Fee configuration loaded from settings
#[derive(Debug, Clone)]
pub struct FeeConfig {
    pub policy: FeePolicy,
    /// Privacy Cash fixed fee in lamports (default: 6_000_000 = 0.006 SOL)
    pub privacy_fixed_lamports: u64,
    /// Privacy Cash percentage fee in basis points (default: 35 = 0.35%)
    pub privacy_percent_bps: u32,
    /// Jupiter swap fixed fee in lamports (default: 1_000_000 = 0.001 SOL)
    pub swap_fixed_lamports: u64,
    /// Jupiter swap percentage fee in basis points (default: 10 = 0.1%)
    pub swap_percent_bps: u32,
    /// Company processing fixed fee in lamports (default: 0)
    pub company_fixed_lamports: u64,
    /// Company processing percentage fee in basis points (default: 0)
    pub company_percent_bps: u32,
}

impl Default for FeeConfig {
    fn default() -> Self {
        Self {
            policy: FeePolicy::default(),
            privacy_fixed_lamports: 6_000_000,
            privacy_percent_bps: 35,
            swap_fixed_lamports: 1_000_000,
            swap_percent_bps: 10,
            company_fixed_lamports: 0,
            company_percent_bps: 0,
        }
    }
}

/// Calculated fees for a deposit
#[derive(Debug, Clone)]
pub struct CalculatedFees {
    /// Privacy Cash fee in lamports
    pub privacy_fee_lamports: i64,
    /// Jupiter swap fee in lamports
    pub swap_fee_lamports: i64,
    /// Company processing fee in lamports (always charged to user)
    pub company_fee_lamports: i64,
    /// Total fees in lamports (privacy + swap + company)
    pub total_lamports: i64,
}

/// Service for calculating deposit fees
pub struct DepositFeeService {
    settings_service: Arc<SettingsService>,
}

impl DepositFeeService {
    /// Create a new fee service
    pub fn new(settings_service: Arc<SettingsService>) -> Self {
        Self { settings_service }
    }

    /// Load fee configuration from settings
    pub async fn get_config(&self) -> Result<FeeConfig, AppError> {
        let policy_str = self
            .settings_service
            .get("deposit_fee_policy")
            .await?
            .unwrap_or_else(|| "company_pays_all".to_string());

        let privacy_fixed = self
            .settings_service
            .get_u64("privacy_fee_fixed_lamports")
            .await?
            .unwrap_or(6_000_000);

        let privacy_bps = self
            .settings_service
            .get_u32("privacy_fee_percent_bps")
            .await?
            .unwrap_or(35);

        let swap_fixed = self
            .settings_service
            .get_u64("swap_fee_fixed_lamports")
            .await?
            .unwrap_or(1_000_000);

        let swap_bps = self
            .settings_service
            .get_u32("swap_fee_percent_bps")
            .await?
            .unwrap_or(10);

        let company_fixed = self
            .settings_service
            .get_u64("company_fee_fixed_lamports")
            .await?
            .unwrap_or(0);

        let company_bps = self
            .settings_service
            .get_u32("company_fee_percent_bps")
            .await?
            .unwrap_or(0);

        Ok(FeeConfig {
            policy: policy_str.parse::<FeePolicy>().unwrap(),
            privacy_fixed_lamports: privacy_fixed,
            privacy_percent_bps: privacy_bps,
            swap_fixed_lamports: swap_fixed,
            swap_percent_bps: swap_bps,
            company_fixed_lamports: company_fixed,
            company_percent_bps: company_bps,
        })
    }

    /// Calculate fees for a deposit amount
    ///
    /// # Arguments
    /// * `amount_lamports` - Deposit amount in lamports
    /// * `has_swap` - Whether a Jupiter swap is involved
    /// * `has_privacy` - Whether Privacy Cash is used
    /// * `config` - Fee configuration
    pub fn calculate_fees(
        &self,
        amount_lamports: u64,
        has_swap: bool,
        has_privacy: bool,
        config: &FeeConfig,
    ) -> CalculatedFees {
        let mut privacy_fee: i64 = 0;
        let mut swap_fee: i64 = 0;

        if has_privacy {
            // Privacy Cash fee = fixed + (amount * percent_bps / 10000)
            let percent_fee = (amount_lamports as i64 * config.privacy_percent_bps as i64) / 10_000;
            privacy_fee = config.privacy_fixed_lamports as i64 + percent_fee;
        }

        if has_swap {
            // Swap fee = fixed + (amount * percent_bps / 10000)
            let percent_fee = (amount_lamports as i64 * config.swap_percent_bps as i64) / 10_000;
            swap_fee = config.swap_fixed_lamports as i64 + percent_fee;
        }

        // Company fee is always calculated (but may be 0 if not configured)
        let company_percent_fee =
            (amount_lamports as i64 * config.company_percent_bps as i64) / 10_000;
        let company_fee = config.company_fixed_lamports as i64 + company_percent_fee;

        CalculatedFees {
            privacy_fee_lamports: privacy_fee,
            swap_fee_lamports: swap_fee,
            company_fee_lamports: company_fee,
            total_lamports: privacy_fee + swap_fee + company_fee,
        }
    }

    /// Get the user's fee deduction based on policy
    ///
    /// Returns the amount to deduct from user's credit based on fee policy.
    /// Note: Company fee is ALWAYS charged to user regardless of policy.
    pub fn user_deduction(&self, fees: &CalculatedFees, policy: FeePolicy) -> i64 {
        // Company fee is always charged to user (that's the company's revenue)
        let base = fees.company_fee_lamports;

        match policy {
            FeePolicy::CompanyPaysAll => base,
            FeePolicy::UserPaysSwap => base + fees.swap_fee_lamports,
            FeePolicy::UserPaysPrivacy => base + fees.privacy_fee_lamports,
            FeePolicy::UserPaysAll => fees.total_lamports,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fee_policy_from_str() {
        assert_eq!(
            "company_pays_all".parse::<FeePolicy>().unwrap(),
            FeePolicy::CompanyPaysAll
        );
        assert_eq!(
            "user_pays_swap".parse::<FeePolicy>().unwrap(),
            FeePolicy::UserPaysSwap
        );
        assert_eq!(
            "user_pays_privacy".parse::<FeePolicy>().unwrap(),
            FeePolicy::UserPaysPrivacy
        );
        assert_eq!(
            "user_pays_all".parse::<FeePolicy>().unwrap(),
            FeePolicy::UserPaysAll
        );
        assert_eq!(
            "unknown".parse::<FeePolicy>().unwrap(),
            FeePolicy::CompanyPaysAll
        );
    }

    #[test]
    fn test_calculate_fees_privacy_only() {
        let config = FeeConfig::default();
        let service = DepositFeeService {
            settings_service: Arc::new(SettingsService::new(Arc::new(
                crate::repositories::InMemorySystemSettingsRepository::new(),
            ))),
        };

        // 1 SOL deposit with privacy (default company fee = 0)
        let fees = service.calculate_fees(1_000_000_000, false, true, &config);

        // Privacy: 6_000_000 + (1_000_000_000 * 35 / 10_000) = 6_000_000 + 3_500_000 = 9_500_000
        assert_eq!(fees.privacy_fee_lamports, 9_500_000);
        assert_eq!(fees.swap_fee_lamports, 0);
        assert_eq!(fees.company_fee_lamports, 0);
        assert_eq!(fees.total_lamports, 9_500_000);
    }

    #[test]
    fn test_calculate_fees_swap_only() {
        let config = FeeConfig::default();
        let service = DepositFeeService {
            settings_service: Arc::new(SettingsService::new(Arc::new(
                crate::repositories::InMemorySystemSettingsRepository::new(),
            ))),
        };

        // 1 SOL equivalent with swap only (default company fee = 0)
        let fees = service.calculate_fees(1_000_000_000, true, false, &config);

        // Swap: 1_000_000 + (1_000_000_000 * 10 / 10_000) = 1_000_000 + 1_000_000 = 2_000_000
        assert_eq!(fees.swap_fee_lamports, 2_000_000);
        assert_eq!(fees.privacy_fee_lamports, 0);
        assert_eq!(fees.company_fee_lamports, 0);
        assert_eq!(fees.total_lamports, 2_000_000);
    }

    #[test]
    fn test_calculate_fees_both() {
        let config = FeeConfig::default();
        let service = DepositFeeService {
            settings_service: Arc::new(SettingsService::new(Arc::new(
                crate::repositories::InMemorySystemSettingsRepository::new(),
            ))),
        };

        // 1 SOL with both swap and privacy (default company fee = 0)
        let fees = service.calculate_fees(1_000_000_000, true, true, &config);

        assert_eq!(fees.privacy_fee_lamports, 9_500_000);
        assert_eq!(fees.swap_fee_lamports, 2_000_000);
        assert_eq!(fees.company_fee_lamports, 0);
        assert_eq!(fees.total_lamports, 11_500_000);
    }

    #[test]
    fn test_calculate_fees_with_company_fee() {
        let config = FeeConfig {
            company_fixed_lamports: 1_000_000, // 0.001 SOL
            company_percent_bps: 5,            // 0.05%
            ..FeeConfig::default()
        };
        let service = DepositFeeService {
            settings_service: Arc::new(SettingsService::new(Arc::new(
                crate::repositories::InMemorySystemSettingsRepository::new(),
            ))),
        };

        // 1 SOL with both swap and privacy + company fee
        let fees = service.calculate_fees(1_000_000_000, true, true, &config);

        // Company: 1_000_000 + (1_000_000_000 * 5 / 10_000) = 1_000_000 + 500_000 = 1_500_000
        assert_eq!(fees.privacy_fee_lamports, 9_500_000);
        assert_eq!(fees.swap_fee_lamports, 2_000_000);
        assert_eq!(fees.company_fee_lamports, 1_500_000);
        assert_eq!(fees.total_lamports, 13_000_000);
    }

    #[test]
    fn test_user_deduction_policies() {
        // With company fee = 0 (default)
        let fees = CalculatedFees {
            privacy_fee_lamports: 9_500_000,
            swap_fee_lamports: 2_000_000,
            company_fee_lamports: 0,
            total_lamports: 11_500_000,
        };

        let service = DepositFeeService {
            settings_service: Arc::new(SettingsService::new(Arc::new(
                crate::repositories::InMemorySystemSettingsRepository::new(),
            ))),
        };

        // With no company fee, behavior unchanged from before
        assert_eq!(service.user_deduction(&fees, FeePolicy::CompanyPaysAll), 0);
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::UserPaysSwap),
            2_000_000
        );
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::UserPaysPrivacy),
            9_500_000
        );
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::UserPaysAll),
            11_500_000
        );
    }

    #[test]
    fn test_user_deduction_with_company_fee() {
        // With company fee configured
        let fees = CalculatedFees {
            privacy_fee_lamports: 9_500_000,
            swap_fee_lamports: 2_000_000,
            company_fee_lamports: 1_500_000, // 0.001 SOL + 0.05%
            total_lamports: 13_000_000,
        };

        let service = DepositFeeService {
            settings_service: Arc::new(SettingsService::new(Arc::new(
                crate::repositories::InMemorySystemSettingsRepository::new(),
            ))),
        };

        // Company fee is ALWAYS charged to user
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::CompanyPaysAll),
            1_500_000
        ); // Only company fee
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::UserPaysSwap),
            3_500_000
        ); // company + swap
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::UserPaysPrivacy),
            11_000_000
        ); // company + privacy
        assert_eq!(
            service.user_deduction(&fees, FeePolicy::UserPaysAll),
            13_000_000
        ); // all
    }
}
