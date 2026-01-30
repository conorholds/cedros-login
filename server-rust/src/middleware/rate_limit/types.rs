//! Rate limiting types and configuration

use axum::{body::Body, http::Response, response::IntoResponse};
use serde::Serialize;
use std::time::Instant;

#[cfg(feature = "redis-rate-limit")]
use super::redis_store::RedisRateLimitStore;
use super::store::RateLimitStore;

/// Backend for rate limiting, supporting both in-memory and Redis stores
#[derive(Debug, Clone)]
pub enum RateLimitBackend {
    /// In-memory store (single instance only)
    Memory(RateLimitStore),
    /// Redis-backed store (multi-instance)
    #[cfg(feature = "redis-rate-limit")]
    Redis(RedisRateLimitStore),
}

impl RateLimitBackend {
    /// Check if request is allowed and record it
    pub async fn check_and_record(&self, key: &str, config: &RateLimitConfig) -> RateLimitResult {
        match self {
            RateLimitBackend::Memory(store) => store.check_and_record(key, config).await,
            #[cfg(feature = "redis-rate-limit")]
            RateLimitBackend::Redis(store) => store.check_and_record(key, config).await,
        }
    }
}

impl From<RateLimitStore> for RateLimitBackend {
    fn from(store: RateLimitStore) -> Self {
        RateLimitBackend::Memory(store)
    }
}

#[cfg(feature = "redis-rate-limit")]
impl From<RedisRateLimitStore> for RateLimitBackend {
    fn from(store: RedisRateLimitStore) -> Self {
        RateLimitBackend::Redis(store)
    }
}

/// Rate limit configuration for an endpoint
#[derive(Debug, Clone)]
pub struct RateLimitConfig {
    /// Maximum requests allowed in the window
    pub limit: u32,
    /// Time window in seconds
    pub window_secs: u64,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            limit: 60,
            window_secs: 60,
        }
    }
}

/// Rate limit entry using sliding window counter algorithm.
///
/// Uses O(1) memory and O(1) time per check/record operation.
/// Approximates a true sliding window by interpolating between
/// the previous and current fixed window counts.
#[derive(Debug, Clone)]
pub struct RateLimitEntry {
    /// Start of the current fixed window
    pub window_start: Instant,
    /// Request count in the previous fixed window
    pub prev_count: u32,
    /// Request count in the current fixed window
    pub curr_count: u32,
    /// When the entry was last accessed (for cleanup/eviction)
    pub last_access: Instant,
}

impl RateLimitEntry {
    pub fn new() -> Self {
        Self {
            window_start: Instant::now(),
            prev_count: 0,
            curr_count: 0,
            last_access: Instant::now(),
        }
    }
}

impl Default for RateLimitEntry {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of a rate limit check
#[derive(Debug, Clone)]
pub struct RateLimitResult {
    /// Whether the request is allowed
    pub allowed: bool,
    /// Maximum requests in the window
    pub limit: u32,
    /// Remaining requests in the window
    pub remaining: u32,
    /// Seconds until the window resets
    pub reset_secs: u64,
}

/// Rate limit error response
#[derive(Debug, Serialize)]
pub struct RateLimitError {
    pub code: &'static str,
    pub message: String,
    pub retry_after: u64,
}

impl IntoResponse for RateLimitError {
    fn into_response(self) -> axum::response::Response {
        let body = serde_json::to_string(&self).unwrap_or_default();
        Response::builder()
            .status(axum::http::StatusCode::TOO_MANY_REQUESTS)
            .header("Content-Type", "application/json")
            .header("Retry-After", self.retry_after.to_string())
            .body(Body::from(body))
            .expect("response builder with valid body cannot fail")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limit_config_default() {
        let config = RateLimitConfig::default();
        assert_eq!(config.limit, 60);
        assert_eq!(config.window_secs, 60);
    }

    #[test]
    fn test_rate_limit_entry_new() {
        let entry = RateLimitEntry::new();
        assert_eq!(entry.prev_count, 0);
        assert_eq!(entry.curr_count, 0);
    }

    #[test]
    fn test_rate_limit_error_serialization() {
        let error = RateLimitError {
            code: "RATE_LIMITED",
            message: "Too many requests".to_string(),
            retry_after: 30,
        };

        let json = serde_json::to_string(&error).unwrap();
        assert!(json.contains("RATE_LIMITED"));
        assert!(json.contains("Too many requests"));
        assert!(json.contains("30"));
    }
}
