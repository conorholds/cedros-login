//! SOL price service with caching
//!
//! Fetches SOL price from Jupiter Price API and caches it with a 30s TTL.
//! Used for displaying USD equivalents in the deposit flow.

use reqwest::Client;
use serde::Deserialize;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tracing::{debug, warn};

use crate::errors::AppError;

/// Cache entry for SOL price
#[derive(Debug, Clone)]
struct PriceCacheEntry {
    price_usd: f64,
    fetched_at: Instant,
}

/// SOL price service with caching
pub struct SolPriceService {
    http_client: Client,
    cache: Arc<RwLock<Option<PriceCacheEntry>>>,
    /// Fallback price if API fails (updated on each successful fetch)
    fallback_price: Arc<RwLock<f64>>,
    /// Cache TTL (default 30 seconds)
    cache_ttl: Duration,
}

/// Jupiter Price API response
#[derive(Debug, Deserialize)]
struct JupiterPriceResponse {
    data: std::collections::HashMap<String, JupiterPriceData>,
}

#[derive(Debug, Deserialize)]
struct JupiterPriceData {
    price: f64,
}

/// SOL mint address (native SOL wrapped)
const SOL_MINT: &str = "So11111111111111111111111111111111111111112";

/// Jupiter Price API endpoint
const JUPITER_PRICE_API: &str = "https://price.jup.ag/v4/price";

/// Default fallback price if no cached value exists
const DEFAULT_FALLBACK_PRICE: f64 = 200.0;

/// HTTP timeout for Jupiter Price API requests
const JUPITER_HTTP_TIMEOUT_SECS: u64 = 10;

/// Lamports per SOL
const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

impl SolPriceService {
    /// Create a new SOL price service
    pub fn new() -> Self {
        let http_client = Client::builder()
            .timeout(Duration::from_secs(JUPITER_HTTP_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|e| {
                tracing::error!(
                    error = %e,
                    "Failed to create HTTP client for SOL price; falling back to defaults"
                );
                Client::new()
            });

        Self {
            http_client,
            cache: Arc::new(RwLock::new(None)),
            fallback_price: Arc::new(RwLock::new(DEFAULT_FALLBACK_PRICE)),
            cache_ttl: Duration::from_secs(30),
        }
    }

    /// Create with custom TTL (for testing)
    #[cfg(test)]
    pub fn with_ttl(cache_ttl: Duration) -> Self {
        let mut service = Self::new();
        service.cache_ttl = cache_ttl;
        service
    }

    /// Get SOL price in USD
    ///
    /// Returns cached value if available and fresh, otherwise fetches from Jupiter.
    /// Falls back to last known price if fetch fails.
    pub async fn get_sol_price_usd(&self) -> Result<f64, AppError> {
        // Check cache first
        {
            let cache = self.cache.read().await;
            if let Some(entry) = cache.as_ref() {
                if entry.fetched_at.elapsed() < self.cache_ttl {
                    debug!(price = entry.price_usd, "Using cached SOL price");
                    return Ok(entry.price_usd);
                }
            }
        }

        // Fetch fresh price
        match self.fetch_price().await {
            Ok(price) => {
                // Update cache and fallback
                {
                    let mut cache = self.cache.write().await;
                    *cache = Some(PriceCacheEntry {
                        price_usd: price,
                        fetched_at: Instant::now(),
                    });
                }
                {
                    let mut fallback = self.fallback_price.write().await;
                    *fallback = price;
                }
                debug!(price = price, "Fetched fresh SOL price");
                Ok(price)
            }
            Err(e) => {
                // Use fallback on error
                let fallback = *self.fallback_price.read().await;
                warn!(
                    error = %e,
                    fallback_price = fallback,
                    "Failed to fetch SOL price, using fallback"
                );
                Ok(fallback)
            }
        }
    }

    /// Fetch price from Jupiter API
    async fn fetch_price(&self) -> Result<f64, AppError> {
        let url = format!("{}?ids={}", JUPITER_PRICE_API, SOL_MINT);

        let response = tokio::time::timeout(
            Duration::from_secs(JUPITER_HTTP_TIMEOUT_SECS),
            self.http_client.get(&url).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Jupiter API request timed out after {}s",
                JUPITER_HTTP_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Jupiter API request failed: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Jupiter API returned status {}",
                response.status()
            )));
        }

        let price_response: JupiterPriceResponse =
            tokio::time::timeout(Duration::from_secs(JUPITER_HTTP_TIMEOUT_SECS), async move {
                response.json::<JupiterPriceResponse>().await
            })
            .await
            .map_err(|_| {
                AppError::Internal(anyhow::anyhow!(
                    "Failed to parse Jupiter response: timed out after {}s",
                    JUPITER_HTTP_TIMEOUT_SECS
                ))
            })?
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to parse Jupiter response: {}", e))
            })?;

        let price_data = price_response.data.get(SOL_MINT).ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!("SOL price not found in response"))
        })?;

        Ok(price_data.price)
    }

    /// Convert lamports to USD
    pub async fn lamports_to_usd(&self, lamports: u64) -> Result<f64, AppError> {
        let price = self.get_sol_price_usd().await?;
        let sol = lamports as f64 / LAMPORTS_PER_SOL as f64;
        Ok(sol * price)
    }

    /// Convert USD to lamports
    pub async fn usd_to_lamports(&self, usd: f64) -> Result<u64, AppError> {
        let price = self.get_sol_price_usd().await?;
        let sol = usd / price;
        Ok((sol * LAMPORTS_PER_SOL as f64) as u64)
    }

    /// Round USD up to nearest $5 (for display purposes)
    pub fn round_up_to_nearest_5(usd: f64) -> f64 {
        (usd / 5.0).ceil() * 5.0
    }

    /// Fetch prices for multiple tokens by mint address
    ///
    /// Returns a HashMap of mint address -> USD price.
    /// Tokens not found in Jupiter response are omitted from result.
    pub async fn get_token_prices(
        &self,
        mints: &[&str],
    ) -> Result<std::collections::HashMap<String, f64>, AppError> {
        if mints.is_empty() {
            return Ok(std::collections::HashMap::new());
        }

        let url = format!("{}?ids={}", JUPITER_PRICE_API, mints.join(","));

        let response = tokio::time::timeout(
            Duration::from_secs(JUPITER_HTTP_TIMEOUT_SECS),
            self.http_client.get(&url).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Jupiter API request timed out after {}s",
                JUPITER_HTTP_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Jupiter API request failed: {}", e)))?;

        if !response.status().is_success() {
            warn!(
                status = %response.status(),
                "Jupiter API returned error for token prices"
            );
            return Ok(std::collections::HashMap::new());
        }

        let price_response: JupiterPriceResponse =
            tokio::time::timeout(Duration::from_secs(JUPITER_HTTP_TIMEOUT_SECS), async move {
                response.json::<JupiterPriceResponse>().await
            })
            .await
            .map_err(|_| {
                AppError::Internal(anyhow::anyhow!(
                    "Failed to parse Jupiter response: timed out after {}s",
                    JUPITER_HTTP_TIMEOUT_SECS
                ))
            })?
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to parse Jupiter response: {}", e))
            })?;

        let mut prices = std::collections::HashMap::new();
        for (mint, data) in price_response.data {
            prices.insert(mint, data.price);
        }

        debug!(count = prices.len(), "Fetched token prices from Jupiter");
        Ok(prices)
    }
}

impl Default for SolPriceService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_round_up_to_nearest_5() {
        assert_eq!(SolPriceService::round_up_to_nearest_5(47.0), 50.0);
        assert_eq!(SolPriceService::round_up_to_nearest_5(50.0), 50.0);
        assert_eq!(SolPriceService::round_up_to_nearest_5(51.0), 55.0);
        assert_eq!(SolPriceService::round_up_to_nearest_5(12.5), 15.0);
        assert_eq!(SolPriceService::round_up_to_nearest_5(0.0), 0.0);
    }

    #[tokio::test]
    async fn test_fallback_on_failure() {
        let service = SolPriceService::new();
        // First call will try to fetch and fail (no network in test), but return fallback
        let price = service.get_sol_price_usd().await.unwrap();
        assert_eq!(price, DEFAULT_FALLBACK_PRICE);
    }
}
