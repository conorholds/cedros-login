//! Unified deposit credit calculation service
//!
//! Converts all deposits to company currency and applies fee deductions.
//! Ensures consistent credit amounts regardless of deposit token type.

use std::sync::Arc;

use crate::errors::AppError;
use crate::services::{DepositFeeService, FeeConfig, SolPriceService};

/// USD stablecoin minor units (USDC/USDT have 6 decimals)
const USD_MINOR_UNITS: f64 = 1_000_000.0;

/// Parameters for credit calculation
#[derive(Debug, Clone)]
pub struct CreditParams {
    /// Deposit amount in smallest unit (lamports for SOL, minor units for USD)
    pub deposit_amount: i64,
    /// Currency of the deposit: "SOL", "USD", etc.
    pub deposit_currency: String,
    /// Whether a Jupiter swap is involved
    pub has_swap: bool,
    /// Whether Privacy Cash is used
    pub has_privacy: bool,
}

/// Result of credit calculation
#[derive(Debug, Clone)]
pub struct CreditResult {
    /// Amount to credit user (in company currency's smallest unit)
    pub amount: i64,
    /// Company currency identifier (e.g., "USD", "SOL")
    pub currency: String,
    /// Fee deducted from user (0 if company pays)
    pub fee_deducted: i64,
    /// SOL price used for conversion (if applicable)
    pub conversion_rate: Option<f64>,
}

/// Service for calculating deposit credits
pub struct DepositCreditService {
    sol_price_service: Arc<SolPriceService>,
    fee_service: Arc<DepositFeeService>,
    /// Company's preferred currency (e.g., "USDC", "SOL")
    company_currency: String,
}

impl DepositCreditService {
    /// Create a new credit service
    pub fn new(
        sol_price_service: Arc<SolPriceService>,
        fee_service: Arc<DepositFeeService>,
        company_currency: String,
    ) -> Self {
        Self {
            sol_price_service,
            fee_service,
            company_currency,
        }
    }

    /// Get the credit currency identifier based on company currency
    fn credit_currency(&self) -> &'static str {
        match self.company_currency.to_uppercase().as_str() {
            "SOL" => "SOL",
            "USDC" | "USDT" => "USD",
            "EURC" => "EUR",
            _ => "USD", // Default to USD for unknown currencies
        }
    }

    /// Check if company currency is SOL
    fn is_sol_company(&self) -> bool {
        self.company_currency.to_uppercase() == "SOL"
    }

    /// Calculate credit for a deposit
    ///
    /// Converts the deposit amount to company currency and applies
    /// fee deductions based on the configured fee policy.
    pub async fn calculate(&self, params: CreditParams) -> Result<CreditResult, AppError> {
        let fee_config = self.fee_service.get_config().await?;

        // Step 1: Convert deposit to company currency
        let (amount_in_company_currency, conversion_rate) = self
            .convert_to_company_currency(params.deposit_amount, &params.deposit_currency)
            .await?;

        // Step 2: Calculate fees (in lamports, we'll convert later)
        // For fee calculation, we need the amount in lamports
        let amount_lamports = if params.deposit_currency == "SOL" {
            params.deposit_amount as u64
        } else {
            // Convert USD to lamports for fee calculation
            let usd = params.deposit_amount as f64 / USD_MINOR_UNITS;
            self.sol_price_service.usd_to_lamports(usd).await?
        };

        let fees = self.fee_service.calculate_fees(
            amount_lamports,
            params.has_swap,
            params.has_privacy,
            &fee_config,
        );

        // Step 3: Get user's fee deduction based on policy
        let fee_deduction_lamports = self.fee_service.user_deduction(&fees, fee_config.policy);

        // Step 4: Convert fee deduction to company currency
        let fee_deduction = self
            .convert_lamports_to_company_currency(fee_deduction_lamports)
            .await?;

        // Step 5: Calculate final credit amount
        let final_amount = amount_in_company_currency.saturating_sub(fee_deduction);

        Ok(CreditResult {
            amount: final_amount.max(0), // Ensure non-negative
            currency: self.credit_currency().to_string(),
            fee_deducted: fee_deduction,
            conversion_rate,
        })
    }

    /// Convert deposit amount to company currency
    ///
    /// Returns (amount_in_company_currency, conversion_rate)
    async fn convert_to_company_currency(
        &self,
        amount: i64,
        deposit_currency: &str,
    ) -> Result<(i64, Option<f64>), AppError> {
        match (
            deposit_currency.to_uppercase().as_str(),
            self.is_sol_company(),
        ) {
            // SOL → SOL (no conversion)
            ("SOL", true) => Ok((amount, None)),

            // SOL → USD (convert lamports to USD minor units)
            ("SOL", false) => {
                let usd = self
                    .sol_price_service
                    .lamports_to_usd(amount as u64)
                    .await?;
                let price = self.sol_price_service.get_sol_price_usd().await?;
                // Convert to minor units (6 decimals)
                Ok(((usd * USD_MINOR_UNITS) as i64, Some(price)))
            }

            // USD → SOL (convert USD to lamports)
            ("USD", true) => {
                let usd = amount as f64 / USD_MINOR_UNITS;
                let lamports = self.sol_price_service.usd_to_lamports(usd).await?;
                let price = self.sol_price_service.get_sol_price_usd().await?;
                Ok((lamports as i64, Some(price)))
            }

            // USD → USD (no conversion, already in minor units)
            ("USD", false) => Ok((amount, None)),

            // Other currencies: treat as USD for now
            (_, false) => Ok((amount, None)),
            (_, true) => {
                // Unknown to SOL: assume USD-like
                let usd = amount as f64 / USD_MINOR_UNITS;
                let lamports = self.sol_price_service.usd_to_lamports(usd).await?;
                let price = self.sol_price_service.get_sol_price_usd().await?;
                Ok((lamports as i64, Some(price)))
            }
        }
    }

    /// Convert lamports to company currency
    async fn convert_lamports_to_company_currency(&self, lamports: i64) -> Result<i64, AppError> {
        if self.is_sol_company() {
            Ok(lamports)
        } else {
            let usd = self
                .sol_price_service
                .lamports_to_usd(lamports as u64)
                .await?;
            Ok((usd * USD_MINOR_UNITS) as i64)
        }
    }

    /// Get current fee configuration (for display in config response)
    pub async fn get_fee_config(&self) -> Result<FeeConfig, AppError> {
        self.fee_service.get_config().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::InMemorySystemSettingsRepository;
    use crate::services::SettingsService;

    fn create_test_service(company_currency: &str) -> DepositCreditService {
        let settings_repo = Arc::new(InMemorySystemSettingsRepository::new());
        let settings_service = Arc::new(SettingsService::new(settings_repo));
        let sol_price_service = Arc::new(SolPriceService::new());
        let fee_service = Arc::new(DepositFeeService::new(settings_service));

        DepositCreditService::new(sol_price_service, fee_service, company_currency.to_string())
    }

    #[test]
    fn test_credit_currency() {
        let service = create_test_service("USDC");
        assert_eq!(service.credit_currency(), "USD");

        let service = create_test_service("USDT");
        assert_eq!(service.credit_currency(), "USD");

        let service = create_test_service("SOL");
        assert_eq!(service.credit_currency(), "SOL");

        let service = create_test_service("EURC");
        assert_eq!(service.credit_currency(), "EUR");
    }

    #[test]
    fn test_is_sol_company() {
        let service = create_test_service("SOL");
        assert!(service.is_sol_company());

        let service = create_test_service("USDC");
        assert!(!service.is_sol_company());
    }

    // Integration tests would require mocking the price service
    // since it makes real HTTP calls
}
