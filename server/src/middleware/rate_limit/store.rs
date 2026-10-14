//! In-memory rate limit store
//!
//! # Single-Instance Limitation
//!
//! **WARNING**: This store is in-memory only and NOT shared across instances.
//! In load-balanced or multi-instance deployments, each instance maintains independent
//! counters, effectively multiplying the allowed request rate by the number of instances.
//!
//! ## Production Recommendations
//!
//! For multi-instance deployments, prefer the Redis-backed store in
//! `redis_store.rs` with `RATE_LIMIT_STORE=redis` and `REDIS_URL` configured.
//! If memory is used across multiple replicas, divide configured limits by the
//! expected instance count and treat that as a temporary fallback only.
//!
//! # Memory Bounds
//!
//! The store enforces a maximum entry count (default 100,000) to prevent OOM under attack.
//! At capacity, new keys fail closed until expired entries can be reclaimed.
//! Active budgets are never evicted to admit attacker-selected identifiers.
//!
//! For production monitoring, consider tracking:
//! - Entry count vs max_entries (alert if approaching limit)
//! - Capacity rejection count (pressure or an undersized limit)

use dashmap::DashMap;
use std::{
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::Mutex;

use super::types::{RateLimitConfig, RateLimitEntry, RateLimitResult};

/// Default maximum entries in the rate limit store (100,000 IPs)
const DEFAULT_MAX_ENTRIES: usize = 100_000;

/// In-memory rate limit store
#[derive(Debug, Clone)]
pub struct RateLimitStore {
    /// Map of key -> rate limit entry
    entries: Arc<DashMap<String, RateLimitEntry>>,
    /// Cleanup interval
    cleanup_interval: Duration,
    /// Last cleanup time
    last_cleanup: Arc<Mutex<Instant>>,
    /// Maximum entries (prevents OOM under attack)
    max_entries: usize,
    /// Serialize admission so concurrent new keys cannot exceed capacity.
    admission: Arc<Mutex<()>>,
}

impl RateLimitStore {
    fn parse_replicas_hint(value: Option<&str>) -> u32 {
        value
            .and_then(|v| v.parse::<u32>().ok())
            .filter(|v| *v > 0)
            .unwrap_or(1)
    }

    pub(crate) fn replicas_hint() -> u32 {
        Self::parse_replicas_hint(std::env::var("REPLICAS").ok().as_deref())
    }

    pub(crate) fn is_multi_instance_environment() -> bool {
        Self::replicas_hint() > 1
            || std::env::var("KUBERNETES_SERVICE_HOST").is_ok()
            || std::env::var("DYNO").is_ok()
            || std::env::var("FLY_APP_NAME").is_ok()
            || std::env::var("RENDER").is_ok()
    }

    /// Create a new rate limit store with default settings
    pub fn new() -> Self {
        Self::with_max_entries(DEFAULT_MAX_ENTRIES)
    }

    /// Create a rate limit store with custom max entries
    ///
    /// # Multi-Instance Warning
    ///
    /// This store is in-memory only. In load-balanced deployments, each instance
    /// has independent counters, effectively multiplying allowed requests by N.
    pub fn with_max_entries(max_entries: usize) -> Self {
        // Always log info about in-memory store to ensure operators are aware
        tracing::info!(
            max_entries = max_entries,
            "Rate limiter initialized with in-memory store (not shared across instances)"
        );

        // Elevated warning for detected multi-instance environments
        let replicas_hint = Self::replicas_hint();
        let is_multi_instance = Self::is_multi_instance_environment();

        if is_multi_instance {
            tracing::warn!(
                replicas = replicas_hint,
                "Multi-instance environment detected! Rate limiter uses in-memory store. \
                 Each instance has independent counters, effectively multiplying allowed \
                 requests by instance count. Consider Redis backend or adjust limits."
            );
        }

        Self {
            entries: Arc::new(DashMap::new()),
            cleanup_interval: Duration::from_secs(300), // Cleanup every 5 minutes
            last_cleanup: Arc::new(Mutex::new(Instant::now())),
            max_entries,
            admission: Arc::new(Mutex::new(())),
        }
    }

    /// Check if request is allowed and record it using sliding window counter.
    ///
    /// The sliding window counter approximates a true sliding window by:
    /// 1. Dividing time into fixed windows of size `window_secs`
    /// 2. Tracking counts in the current and previous windows
    /// 3. Estimating the sliding window count as:
    ///    `prev_count * (1 - elapsed_ratio) + curr_count`
    ///
    /// This provides O(1) time and O(1) memory per key.
    pub async fn check_and_record(&self, key: &str, config: &RateLimitConfig) -> RateLimitResult {
        let now = Instant::now();
        let window = Duration::from_secs(config.window_secs);

        self.maybe_cleanup(now).await;

        let _admission = self.admission.lock().await;
        if self.entries.len() >= self.max_entries && !self.entries.contains_key(key) {
            metrics::counter!("cedros_rate_limit_capacity_rejected_total").increment(1);
            return RateLimitResult {
                unavailable: true,
                allowed: false,
                limit: config.limit,
                remaining: 0,
                reset_secs: 1,
            };
        }

        let mut entry = self.entries.entry(key.to_string()).or_default();

        entry.last_access = now;
        entry.retention = entry.retention.max(window.saturating_mul(2));

        // Rotate windows if needed
        let elapsed = now.duration_since(entry.window_start);
        if elapsed >= window {
            // Check if we've passed multiple windows (entry is stale)
            if elapsed >= window * 2 {
                // More than 2 windows passed - reset completely
                entry.prev_count = 0;
                entry.curr_count = 0;
            } else {
                // One window passed - rotate
                entry.prev_count = entry.curr_count;
                entry.curr_count = 0;
            }
            // Align window_start to the start of the current window
            let windows_passed = elapsed.as_secs() / config.window_secs;
            entry.window_start += Duration::from_secs(windows_passed * config.window_secs);
        }

        // Calculate elapsed ratio within current window
        let elapsed_in_window = now.duration_since(entry.window_start);
        let elapsed_ratio = elapsed_in_window.as_secs_f64() / config.window_secs as f64;
        let elapsed_ratio = elapsed_ratio.clamp(0.0, 1.0);

        // Estimate sliding window count
        let estimated_count = (entry.prev_count as f64 * (1.0 - elapsed_ratio)
            + entry.curr_count as f64)
            .ceil() as u32;

        // Calculate reset time (when the current window ends)
        let time_until_reset = window.saturating_sub(elapsed_in_window);
        let reset_secs = time_until_reset.as_secs();

        if estimated_count >= config.limit {
            // Rate limited
            RateLimitResult {
                unavailable: false,
                allowed: false,
                limit: config.limit,
                remaining: 0,
                reset_secs,
            }
        } else {
            // Allowed - record the request in current window
            entry.curr_count += 1;

            RateLimitResult {
                unavailable: false,
                allowed: true,
                limit: config.limit,
                remaining: config.limit.saturating_sub(estimated_count + 1),
                reset_secs,
            }
        }
    }

    /// Cleanup old entries periodically.
    /// 3.2: Single lock acquisition for check + update to eliminate TOCTOU race.
    async fn maybe_cleanup(&self, now: Instant) {
        let should_cleanup = {
            let mut last = self.last_cleanup.lock().await;
            if now.duration_since(*last) > self.cleanup_interval {
                *last = now;
                true
            } else {
                false
            }
        };

        if should_cleanup {
            self.entries
                .retain(|_, entry| now.duration_since(entry.last_access) < entry.retention);
        }
    }
}

impl Default for RateLimitStore {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn cleanup_preserves_long_window_budgets() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 1,
            window_secs: 3600,
        };
        assert!(store.check_and_record("long-window", &config).await.allowed);
        let now = Instant::now();
        store.entries.get_mut("long-window").unwrap().last_access = now - Duration::from_secs(601);
        *store.last_cleanup.lock().await = now - Duration::from_secs(301);
        store.maybe_cleanup(now).await;
        assert!(!store.check_and_record("long-window", &config).await.allowed);
    }

    #[test]
    fn test_parse_replicas_hint_defaults_to_one() {
        assert_eq!(RateLimitStore::parse_replicas_hint(None), 1);
        assert_eq!(RateLimitStore::parse_replicas_hint(Some("")), 1);
        assert_eq!(RateLimitStore::parse_replicas_hint(Some("not-a-number")), 1);
        assert_eq!(RateLimitStore::parse_replicas_hint(Some("0")), 1);
    }

    #[test]
    fn test_parse_replicas_hint_parses_positive_int() {
        assert_eq!(RateLimitStore::parse_replicas_hint(Some("1")), 1);
        assert_eq!(RateLimitStore::parse_replicas_hint(Some("2")), 2);
    }

    #[tokio::test]
    async fn test_rate_limit_allows_within_limit() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 5,
            window_secs: 60,
        };

        for i in 0..5 {
            let result = store.check_and_record("test-key", &config).await;
            assert!(result.allowed, "Request {i} should be allowed");
            assert_eq!(result.remaining, 4 - i);
        }
    }

    #[tokio::test]
    async fn test_rate_limit_blocks_over_limit() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 3,
            window_secs: 60,
        };

        // Use up the limit
        for _ in 0..3 {
            let result = store.check_and_record("test-key", &config).await;
            assert!(result.allowed);
        }

        // Should be blocked
        let result = store.check_and_record("test-key", &config).await;
        assert!(!result.allowed);
        assert_eq!(result.remaining, 0);
    }

    #[tokio::test]
    async fn test_rate_limit_separate_keys() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 2,
            window_secs: 60,
        };

        // Key 1 uses its limit
        for _ in 0..2 {
            store.check_and_record("key1", &config).await;
        }
        let result = store.check_and_record("key1", &config).await;
        assert!(!result.allowed);

        // Key 2 should still have its full limit
        let result = store.check_and_record("key2", &config).await;
        assert!(result.allowed);
        assert_eq!(result.remaining, 1);
    }

    #[tokio::test]
    async fn test_rate_limit_result_fields() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 10,
            window_secs: 60,
        };

        let result = store.check_and_record("test-key", &config).await;
        assert!(result.allowed);
        assert_eq!(result.limit, 10);
        assert_eq!(result.remaining, 9);
        assert!(result.reset_secs <= 60);
    }

    #[tokio::test]
    async fn test_rate_limit_blocked_has_zero_remaining() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 1,
            window_secs: 60,
        };

        // Use the single allowed request
        let result = store.check_and_record("test-key", &config).await;
        assert!(result.allowed);
        assert_eq!(result.remaining, 0);

        // Next request should be blocked
        let result = store.check_and_record("test-key", &config).await;
        assert!(!result.allowed);
        assert_eq!(result.remaining, 0);
        assert_eq!(result.limit, 1);
    }

    #[tokio::test]
    async fn test_rate_limit_store_clone() {
        let store1 = RateLimitStore::new();
        let store2 = store1.clone();
        let config = RateLimitConfig {
            limit: 2,
            window_secs: 60,
        };

        // Use store1 to record a request
        store1.check_and_record("shared-key", &config).await;

        // store2 should see the same state (shared Arc)
        let result = store2.check_and_record("shared-key", &config).await;
        assert!(result.allowed);
        assert_eq!(result.remaining, 0);
    }

    #[tokio::test]
    async fn test_rate_limit_multiple_configs() {
        let store = RateLimitStore::new();

        let strict_config = RateLimitConfig {
            limit: 2,
            window_secs: 60,
        };
        let relaxed_config = RateLimitConfig {
            limit: 100,
            window_secs: 60,
        };

        // Same key, different configs
        store.check_and_record("key", &strict_config).await;
        store.check_and_record("key", &strict_config).await;

        // Should be blocked with strict config
        let result = store.check_and_record("key", &strict_config).await;
        assert!(!result.allowed);

        // With relaxed config, only 2 requests were recorded
        let result = store.check_and_record("key", &relaxed_config).await;
        assert!(result.allowed);
        assert_eq!(result.remaining, 97);
    }

    #[test]
    fn test_rate_limit_store_default() {
        let store = RateLimitStore::default();
        assert!(std::sync::Arc::strong_count(&store.entries) >= 1);
    }

    #[tokio::test]
    async fn test_rate_limit_concurrent_access() {
        let store = RateLimitStore::new();
        let config = RateLimitConfig {
            limit: 100,
            window_secs: 60,
        };

        // Simulate concurrent requests
        let mut handles = vec![];
        for i in 0..10 {
            let store = store.clone();
            let config = config.clone();
            handles.push(tokio::spawn(async move {
                store
                    .check_and_record(&format!("concurrent-{}", i % 3), &config)
                    .await
            }));
        }

        // All should complete without deadlock
        for handle in handles {
            let result = handle.await.unwrap();
            assert!(result.allowed);
        }
    }

    #[tokio::test]
    async fn capacity_pressure_cannot_erase_an_exhausted_budget() {
        let store = RateLimitStore::with_max_entries(10);
        let config = RateLimitConfig {
            limit: 1,
            window_secs: 60,
        };
        for i in 0..10 {
            assert!(
                store
                    .check_and_record(&format!("key-{i}"), &config)
                    .await
                    .allowed
            );
        }
        for i in 10..500 {
            let denied = store.check_and_record(&format!("key-{i}"), &config).await;
            assert!(!denied.allowed);
            assert!(denied.unavailable);
        }
        assert_eq!(store.entries.len(), 10);
        assert!(!store.check_and_record("key-0", &config).await.allowed);
    }

    #[tokio::test]
    async fn expired_budgets_release_capacity_without_resetting_live_ones() {
        let store = RateLimitStore::with_max_entries(2);
        let config = RateLimitConfig {
            limit: 2,
            window_secs: 60,
        };
        store.check_and_record("expired", &config).await;
        store.check_and_record("live", &config).await;
        let now = Instant::now();
        store.entries.get_mut("expired").unwrap().last_access = now - Duration::from_secs(121);
        *store.last_cleanup.lock().await = now - Duration::from_secs(301);
        assert!(store.check_and_record("new", &config).await.allowed);
        assert!(store.check_and_record("live", &config).await.allowed);
        assert!(!store.check_and_record("live", &config).await.allowed);
        assert_eq!(store.entries.len(), 2);
    }

    #[tokio::test]
    async fn concurrent_new_identities_cannot_exceed_capacity() {
        let store = RateLimitStore::with_max_entries(10);
        let mut jobs = Vec::new();
        for i in 0..100 {
            let store = store.clone();
            jobs.push(tokio::spawn(async move {
                store
                    .check_and_record(&format!("key-{i}"), &RateLimitConfig::default())
                    .await
                    .allowed
            }));
        }
        let mut admitted = 0;
        for job in jobs {
            admitted += usize::from(job.await.unwrap());
        }
        assert_eq!(admitted, 10);
        assert_eq!(store.entries.len(), 10);
    }
}
