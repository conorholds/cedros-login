//! Privacy Cash Sidecar HTTP client
//!
//! Communicates with the Node.js sidecar that wraps the Privacy Cash SDK.
//! Only supports SSS embedded wallets (no external wallet flow).
//!
//! # Retry Policy
//!
//! Critical operations (deposit, withdraw, swap) use exponential backoff:
//! - Max 3 retries
//! - Initial delay: 500ms, doubles each retry (500ms, 1s, 2s)
//! - Only retries on network/timeout errors, not on sidecar business errors

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

use crate::errors::AppError;

// Re-export types for external consumers
pub use super::sidecar_types::{
    BalanceRequest, BalanceResponse, BatchSwapRequest, BatchSwapResponse, DepositRequest,
    DepositResponse, HealthResponse, SidecarClientConfig, SwapAndDepositRequest,
    SwapAndDepositResponse, VerifySolTransferRequest, VerifySolTransferResponse, WithdrawRequest,
    WithdrawResponse,
};

use super::sidecar_types::{ensure_sidecar_success, ErrorResponse, SidecarSuccess};

/// Default retry configuration for sidecar operations
const DEFAULT_MAX_RETRIES: u32 = 3;
const DEFAULT_INITIAL_DELAY_MS: u64 = 500;
const DEFAULT_MAX_DELAY_MS: u64 = 4000;

/// Privacy Cash sidecar client
pub struct PrivacySidecarClient {
    client: Client,
    base_url: String,
    api_key: String,
}

impl PrivacySidecarClient {
    /// Create a new sidecar client
    pub fn new(config: SidecarClientConfig) -> Result<Self, AppError> {
        let client = Client::builder()
            .timeout(Duration::from_millis(config.timeout_ms))
            .build()
            .map_err(|e| AppError::Internal(e.into()))?;

        Ok(Self {
            client,
            base_url: config.base_url.trim_end_matches('/').to_string(),
            api_key: config.api_key,
        })
    }

    /// Execute a POST request with retry and exponential backoff.
    /// Only retries on network/timeout errors, not on sidecar business errors.
    async fn post_with_retry<Req: Serialize>(
        &self,
        url: &str,
        body: &Req,
    ) -> Result<reqwest::Response, AppError> {
        let mut last_error = None;
        let mut delay_ms = DEFAULT_INITIAL_DELAY_MS;

        for attempt in 0..=DEFAULT_MAX_RETRIES {
            match self
                .client
                .post(url)
                .header("Authorization", format!("Bearer {}", self.api_key))
                .json(body)
                .send()
                .await
            {
                Ok(response) => return Ok(response),
                Err(e) => {
                    // Only retry on network/timeout errors
                    if e.is_timeout() || e.is_connect() || e.is_request() {
                        tracing::warn!(
                            attempt = attempt + 1,
                            max_retries = DEFAULT_MAX_RETRIES,
                            error = %e,
                            url = %url,
                            "Sidecar request failed, will retry"
                        );
                        last_error = Some(e);

                        if attempt < DEFAULT_MAX_RETRIES {
                            tokio::time::sleep(Duration::from_millis(delay_ms)).await;
                            delay_ms = (delay_ms * 2).min(DEFAULT_MAX_DELAY_MS);
                        }
                    } else {
                        // Non-retryable error (e.g., body serialization)
                        return Err(AppError::Internal(e.into()));
                    }
                }
            }
        }

        tracing::error!(
            url = %url,
            max_retries = DEFAULT_MAX_RETRIES,
            "Sidecar request failed after all retries"
        );
        Err(AppError::Internal(
            last_error
                .map(|e| e.into())
                .unwrap_or_else(|| anyhow::anyhow!("Sidecar request failed after retries")),
        ))
    }

    /// Check if the sidecar is healthy
    pub async fn health(&self) -> Result<HealthResponse, AppError> {
        let url = format!("{}/health", self.base_url);
        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        if !response.status().is_success() {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Sidecar health check failed: {}",
                response.status()
            )));
        }

        response
            .json()
            .await
            .map_err(|e| AppError::Internal(e.into()))
    }

    /// Execute a deposit to the user's Privacy Cash account
    ///
    /// The user's keypair (from SSS shares) is used as the Privacy Cash owner.
    /// This provides privacy because the withdrawal is unlinkable on-chain.
    pub async fn deposit(
        &self,
        user_private_key: &str,
        amount_lamports: u64,
    ) -> Result<DepositResponse, AppError> {
        let url = format!("{}/deposit", self.base_url);
        let body = DepositRequest {
            user_private_key: user_private_key.to_string(),
            amount_lamports,
        };

        let response = self.post_with_retry(&url, &body).await?;
        self.handle_success_response(response).await
    }

    /// Withdraw from a user's Privacy Cash account to the company wallet
    ///
    /// Called after the "privacy period" has elapsed.
    /// Requires the user's private key (reconstructed from stored shares).
    ///
    /// If `target_currency` is specified (USDC, USDT), the SOL will be swapped
    /// to the target currency via Jupiter after withdrawal.
    pub async fn withdraw(
        &self,
        user_private_key: &str,
        amount_lamports: u64,
        target_currency: Option<&str>,
    ) -> Result<WithdrawResponse, AppError> {
        let url = format!("{}/withdraw", self.base_url);
        let body = WithdrawRequest {
            user_private_key: user_private_key.to_string(),
            amount_lamports,
            target_currency: target_currency.map(String::from),
        };

        let response = self.post_with_retry(&url, &body).await?;
        self.handle_success_response(response).await
    }

    /// Swap SPL token to SOL (gasless) and deposit to Privacy Cash
    ///
    /// Uses Jupiter Ultra API for gasless swaps. Requirements:
    /// - User wallet must have < 0.01 SOL (embedded wallets qualify)
    /// - Trade size must be > ~$10 USD
    ///
    /// The swap and deposit happen atomically from the caller's perspective.
    pub async fn swap_and_deposit(
        &self,
        user_private_key: &str,
        input_mint: &str,
        amount: &str,
    ) -> Result<SwapAndDepositResponse, AppError> {
        let url = format!("{}/deposit/swap-and-deposit", self.base_url);
        let body = SwapAndDepositRequest {
            user_private_key: user_private_key.to_string(),
            input_mint: input_mint.to_string(),
            amount: amount.to_string(),
        };

        let response = self.post_with_retry(&url, &body).await?;
        self.handle_success_response(response).await
    }

    /// Get a user's private balance in Privacy Cash
    pub async fn get_balance(&self, user_private_key: &str) -> Result<BalanceResponse, AppError> {
        let url = format!("{}/withdraw/balance", self.base_url);
        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&BalanceRequest {
                user_private_key: user_private_key.to_string(),
            })
            .send()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        self.handle_response(response).await
    }

    /// Execute a batch swap from SOL to stablecoin via Jupiter
    ///
    /// Used by the MicroBatchWorker to convert accumulated SOL micro deposits
    /// into the company's preferred currency (USDC/USDT).
    pub async fn batch_swap(
        &self,
        treasury_private_key: &str,
        amount_lamports: u64,
        output_currency: &str,
    ) -> Result<BatchSwapResponse, AppError> {
        let url = format!("{}/batch/swap", self.base_url);
        let body = BatchSwapRequest {
            private_key: treasury_private_key.to_string(),
            amount_lamports,
            output_currency: output_currency.to_string(),
        };

        let response = self.post_with_retry(&url, &body).await?;
        self.handle_success_response(response).await
    }

    /// Verify a finalized SOL transfer (SystemProgram transfer) on-chain.
    ///
    /// Used to validate SOL micro deposits where the client submits a tx signature.
    pub async fn verify_sol_transfer(
        &self,
        signature: &str,
        expected_source: &str,
        expected_destination: &str,
        min_lamports: Option<u64>,
    ) -> Result<VerifySolTransferResponse, AppError> {
        let url = format!("{}/verify/sol-transfer", self.base_url);
        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&VerifySolTransferRequest {
                signature: signature.to_string(),
                expected_source: expected_source.to_string(),
                expected_destination: expected_destination.to_string(),
                min_lamports,
            })
            .send()
            .await
            .map_err(|e| AppError::Internal(e.into()))?;

        let verified: VerifySolTransferResponse = self.handle_response(response).await?;
        if !verified.ok {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Sidecar verification failed"
            )));
        }
        Ok(verified)
    }

    /// Handle response and parse JSON or error
    async fn handle_response<T: for<'de> Deserialize<'de>>(
        &self,
        response: reqwest::Response,
    ) -> Result<T, AppError> {
        let status = response.status();

        if status.is_success() {
            response
                .json()
                .await
                .map_err(|e| AppError::Internal(e.into()))
        } else {
            // Try to parse error response
            let error_text = response.text().await.unwrap_or_default();
            if let Ok(error_response) = serde_json::from_str::<ErrorResponse>(&error_text) {
                let message = if let Some(details) = error_response.details {
                    format!("{}: {}", error_response.error, details)
                } else {
                    error_response.error
                };
                Err(AppError::Internal(anyhow::anyhow!("{}", message)))
            } else {
                Err(AppError::Internal(anyhow::anyhow!(
                    "Sidecar request failed ({}): {}",
                    status,
                    error_text
                )))
            }
        }
    }

    async fn handle_success_response<T: for<'de> Deserialize<'de> + SidecarSuccess>(
        &self,
        response: reqwest::Response,
    ) -> Result<T, AppError> {
        let status = response.status();

        if status.is_success() {
            let value: T = response
                .json()
                .await
                .map_err(|e| AppError::Internal(e.into()))?;
            ensure_sidecar_success(value)
        } else {
            self.handle_response(response).await
        }
    }
}

#[cfg(test)]
mod verify_tests {
    use super::*;
    use axum::{routing::post, Json, Router};
    use serde_json::json;

    #[tokio::test]
    async fn verify_sol_transfer_calls_sidecar_and_parses_response() {
        async fn handler(Json(body): Json<serde_json::Value>) -> Json<serde_json::Value> {
            assert_eq!(body["signature"], "sig1");
            assert_eq!(body["expectedSource"], "src1");
            assert_eq!(body["expectedDestination"], "dst1");
            Json(json!({
                "ok": true,
                "signature": "sig1",
                "observedLamports": 123,
                "source": "src1",
                "destination": "dst1"
            }))
        }

        let app = Router::new().route("/verify/sol-transfer", post(handler));
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        let server = tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });

        let client = PrivacySidecarClient::new(SidecarClientConfig {
            base_url: format!("http://{}", addr),
            timeout_ms: 2_000,
            api_key: "k".to_string(),
        })
        .unwrap();

        let result = client
            .verify_sol_transfer("sig1", "src1", "dst1", Some(100))
            .await
            .unwrap();

        assert!(result.ok);
        assert_eq!(result.observed_lamports, 123);

        server.abort();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deposit_request_serialization() {
        let request = DepositRequest {
            user_private_key: "privatekey123".to_string(),
            amount_lamports: 500_000_000,
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"user_private_key\":\"privatekey123\""));
        assert!(json.contains("\"amount_lamports\":500000000"));
    }

    #[test]
    fn test_deposit_response_deserialization() {
        let json = r#"{
            "success": true,
            "tx_signature": "sig456",
            "user_pubkey": "abc123"
        }"#;

        let response: DepositResponse = serde_json::from_str(json).unwrap();
        assert!(response.success);
        assert_eq!(response.tx_signature, "sig456");
        assert_eq!(response.user_pubkey, "abc123");
    }

    #[test]
    fn test_ensure_sidecar_success_rejects_success_false() {
        let value = DepositResponse {
            success: false,
            tx_signature: "".to_string(),
            user_pubkey: "".to_string(),
        };
        assert!(ensure_sidecar_success(value).is_err());

        let value = BatchSwapResponse {
            success: false,
            tx_signature: "".to_string(),
            input_lamports: 0,
            output_amount: "0".to_string(),
            output_currency: "USDC".to_string(),
            error: Some("insufficient funds".to_string()),
        };
        let err = ensure_sidecar_success(value).unwrap_err();
        match err {
            AppError::Internal(e) => assert!(e.to_string().contains("insufficient funds")),
            other => panic!("Unexpected error: {other:?}"),
        }
    }

    #[test]
    fn test_withdraw_request_serialization() {
        let request = WithdrawRequest {
            user_private_key: "privatekey456".to_string(),
            amount_lamports: 100_000_000,
            target_currency: None,
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"user_private_key\":\"privatekey456\""));
        assert!(json.contains("\"amount_lamports\":100000000"));
        // target_currency should be skipped when None
        assert!(!json.contains("target_currency"));
    }

    #[test]
    fn test_withdraw_request_with_currency_serialization() {
        let request = WithdrawRequest {
            user_private_key: "privatekey789".to_string(),
            amount_lamports: 50_000_000,
            target_currency: Some("USDC".to_string()),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"target_currency\":\"USDC\""));
    }

    #[test]
    fn test_withdraw_response_deserialization() {
        let json = r#"{
            "success": true,
            "tx_signature": "sig123",
            "fee_lamports": 6000000,
            "amount_lamports": 94000000,
            "is_partial": false
        }"#;

        let response: WithdrawResponse = serde_json::from_str(json).unwrap();
        assert!(response.success);
        assert_eq!(response.tx_signature, "sig123");
        assert_eq!(response.fee_lamports, 6000000);
        assert_eq!(response.amount_lamports, 94000000);
        assert!(!response.is_partial);
    }

    #[test]
    fn test_withdraw_response_partial() {
        let json = r#"{
            "success": true,
            "tx_signature": "sig456",
            "fee_lamports": 5000000,
            "amount_lamports": 50000000,
            "is_partial": true
        }"#;

        let response: WithdrawResponse = serde_json::from_str(json).unwrap();
        assert!(response.success);
        assert!(response.is_partial);
        assert_eq!(response.amount_lamports, 50000000);
    }

    #[test]
    fn test_balance_response_deserialization() {
        let json = r#"{
            "balance_lamports": 1000000000,
            "balance_sol": 1.0,
            "user_pubkey": "xyz789"
        }"#;

        let response: BalanceResponse = serde_json::from_str(json).unwrap();
        assert_eq!(response.balance_lamports, 1000000000);
        assert_eq!(response.balance_sol, 1.0);
        assert_eq!(response.user_pubkey, "xyz789");
    }

    #[test]
    fn test_swap_and_deposit_request_serialization() {
        let request = SwapAndDepositRequest {
            user_private_key: "privatekey789".to_string(),
            input_mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v".to_string(),
            amount: "10000000".to_string(),
        };

        let json = serde_json::to_string(&request).unwrap();
        assert!(json.contains("\"user_private_key\":\"privatekey789\""));
        assert!(json.contains("\"input_mint\":\"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\""));
        assert!(json.contains("\"amount\":\"10000000\""));
    }

    #[test]
    fn test_swap_and_deposit_response_deserialization() {
        let json = r#"{
            "success": true,
            "swap_tx_signature": "swap123",
            "deposit_tx_signature": "deposit456",
            "sol_amount_lamports": 50000000,
            "input_mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            "input_amount": "10000000",
            "user_pubkey": "user789"
        }"#;

        let response: SwapAndDepositResponse = serde_json::from_str(json).unwrap();
        assert!(response.success);
        assert_eq!(response.swap_tx_signature, "swap123");
        assert_eq!(response.deposit_tx_signature, "deposit456");
        assert_eq!(response.sol_amount_lamports, 50000000);
        assert_eq!(
            response.input_mint,
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        );
        assert_eq!(response.input_amount, "10000000");
        assert_eq!(response.user_pubkey, "user789");
    }
}
