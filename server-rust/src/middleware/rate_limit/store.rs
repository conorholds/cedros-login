//! In-memory rate limit store
//!
//! # Single-Instance Limitation (SEC-01/MW-06)
//!
//! **WARNING**: This store is in-memory only and NOT shared across instances.
//! In load-balanced or multi-instance deployments, each instance maintains independent
//! counters, effectively multiplying the allowed request rate by the number of instances.
//!
//! ## Production Recommendations
//!
//! For multi-instance deployments, consider:
//! - **Redis backend** (preferred): Implement a Redis-backed store using the same
//!   `check_rate_limit` interface. See TODO below.
//! - **Adjusted limits**: Divide configured limits by expected instance count
//! - **Sticky sessions**: Route by IP at load balancer (not recommended for security)
//!
//! ## TODO: Redis Implementation (SEC-01)
//!
//! To implement a Redis-backed rate limiter:
//! 1. Create `RedisRateLimitStore` implementing the same interface as `RateLimitStore`
//! 2. Use Redis MULTI/EXEC or Lua scripts for atomic increment + expiry
//! 3. Configure via `RATE_LIMIT_BACKEND=redis` environment variable
//! 4. Ensure connection pooling for performance
//!
//! # Memory Bounds
//!
//! The store enforces a maximum entry count (default 100,000) to prevent OOM under attack.
//! When the limit is reached, oldest entries are evicted. Use `with_max_entries()` to customize.
//!
//! For production monitoring, consider tracking:
//! - Entry count vs max_entries (alert if approaching limit)
//! - Eviction frequency (high eviction may indicate attack or undersized limit)

use dashmap::DashMap;
use std::{
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::Mutex;

use super::types::{RateLimitConfig, RateLimitEntry, RateLimitResult};

/// Default maximum entries in the rate limit store (100,000 IPs)
const DEFAULT_MAX_ENTRIES: usize = 100_000;

/// MW-02: Threshold for early warning (90% of capacity)
const CAPACITY_WARNING_THRESHOLD: f64 = 0.90;

/// RLS-001: Log capacity warning every N evictions during sustained attack
const EVICTION_WARNING_INTERVAL: u64 = 10;

/// MW-09: Cap eviction work per cycle to avoid large O(n) scans under attack.
const MAX_EVICT_PER_CYCLE: usize = 2_000;
/// MW-09: Only consider a bounded sample of entries when selecting the oldest to evict.
const EVICT_SAMPLE_MULTIPLIER: usize = 10;

/// In-memory rate limit store
#[derive(Debug, Clone)]
pub struct RateLimitStore {
    /// Map of key -> rate limit entry
    entries: Arc<DashMap<String, RateLimitEntry>>,
    /// Cleanup interval
    cleanup_interval: Duration,
    /// Last cleanup time
    last_cleanup: Arc<Mutex<Instant>>,
    /// Maximum entries before forced eviction (prevents OOM under attack)
    max_entries: usize,
    /// RLS-001: Counter for eviction events (for periodic warnings)
    eviction_count: Arc<std::sync::atomic::AtomicU64>,
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
        // MW-06: Always log info about in-memory store to ensure operators are aware
        tracing::info!(
            max_entries = max_entries,
            "Rate limiter initialized with in-memory store (not shared across instances)"
        );

        // MW-06: Elevated warning for detected multi-instance environments
        let replicas_hint = Self::replicas_hint();
        let is_multi_instance = replicas_hint > 1
            || std::env::var("KUBERNETES_SERVICE_HOST").is_ok()
            || std::env::var("DYNO").is_ok() // Heroku
            || std::env::var("FLY_APP_NAME").is_ok() // Fly.io
            || std::env::var("RENDER").is_ok(); // Render

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
            eviction_count: Arc::new(std::sync::atomic::AtomicU64::new(0)),
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

        // Maybe cleanup old entries
        self.maybe_cleanup(now).await;

        let entries_len = self.entries.len();

        // MW-02: Early warning at 90% capacity (before forced eviction)
        let warning_threshold = (self.max_entries as f64 * CAPACITY_WARNING_THRESHOLD) as usize;
        if entries_len >= warning_threshold && entries_len < self.max_entries {
            // Only warn once per crossing (check if this is a new entry)
            if !self.entries.contains_key(key) {
                tracing::warn!(
                    current_entries = entries_len,
                    max_entries = self.max_entries,
                    threshold_pct = CAPACITY_WARNING_THRESHOLD * 100.0,
                    "Rate limit store approaching capacity - consider scaling or investigating traffic"
                );
            }
        }

        // If we're at capacity and this is a new key, evict oldest entries
        if entries_len >= self.max_entries && !self.entries.contains_key(key) {
            self.evict_oldest(now);
        }

        let mut entry = self.entries.entry(key.to_string()).or_default();

        entry.last_access = now;

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
                allowed: false,
                limit: config.limit,
                remaining: 0,
                reset_secs,
            }
        } else {
            // Allowed - record the request in current window
            entry.curr_count += 1;

            RateLimitResult {
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
            let stale_threshold = Duration::from_secs(600); // 10 minutes
            self.entries
                .retain(|_, entry| now.duration_since(entry.last_access) < stale_threshold);
        }
    }

    /// Evict oldest entries to make room for new ones.
    /// Called when the store is at max capacity and a new key arrives.
    /// Removes approximately 20% of entries (oldest by last_access).
    fn evict_oldest(&self, now: Instant) {
        // M-03: Evict 20% of entries for better headroom under attack
        let entries_len = self.entries.len();
        let evict_count = std::cmp::max(1, self.max_entries / 5)
            .min(entries_len)
            .min(MAX_EVICT_PER_CYCLE);

        // RLS-001: Track eviction count and log periodic warnings during sustained attacks
        let prev_count = self
            .eviction_count
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let total_evictions = prev_count + 1;

        // Log every Nth eviction to provide ongoing visibility during sustained attacks
        if total_evictions % EVICTION_WARNING_INTERVAL == 1 || total_evictions == 1 {
            tracing::warn!(
                current_entries = entries_len,
                max_entries = self.max_entries,
                evicting = evict_count,
                total_evictions = total_evictions,
                "Rate limit store at capacity, evicting oldest entries (sustained pressure)"
            );
        } else {
            // M-03: Debug log for non-warning evictions
            tracing::debug!(
                current_entries = entries_len,
                evicting = evict_count,
                total_evictions = total_evictions,
                "Rate limit store eviction"
            );
        }

        // MW-09: Avoid scanning the full map under attack.
        // Sample a bounded number of entries and evict the oldest within that sample.
        let sample_size = (evict_count.saturating_mul(EVICT_SAMPLE_MULTIPLIER)).min(entries_len);
        let mut by_age: Vec<_> = self
            .entries
            .iter()
            .take(sample_size)
            .map(|entry| {
                (
                    entry.key().clone(),
                    now.duration_since(entry.value().last_access),
                )
            })
            .collect();

        if by_age.len() <= evict_count {
            self.entries.clear();
            return;
        }

        // Partition so the oldest `evict_count` entries are in the left slice.
        let (oldest, nth, _) = by_age.select_nth_unstable_by(evict_count - 1, |a, b| b.1.cmp(&a.1));

        // Remove the oldest entries
        for (key, _) in oldest.iter().chain(std::iter::once(&*nth)) {
            self.entries.remove(key.as_str());
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
            assert!(result.allowed, "Request {} should be allowed", i);
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
    async fn test_rate_limit_max_entries_eviction() {
        // Create a store with max 10 entries
        let store = RateLimitStore::with_max_entries(10);
        let config = RateLimitConfig {
            limit: 100,
            window_secs: 60,
        };

        // Add 10 entries (fill to capacity)
        for i in 0..10 {
            store.check_and_record(&format!("key-{}", i), &config).await;
        }

        // Verify we have 10 entries
        assert_eq!(store.entries.len(), 10);

        // Add one more - should trigger eviction
        store.check_and_record("key-new", &config).await;

        // Should have at most 10 entries (evicted some, added new)
        assert!(store.entries.len() <= 10, "Should not exceed max entries");
        assert!(
            store.entries.contains_key("key-new"),
            "New key should be present"
        );
    }

    #[tokio::test]
    async fn test_rate_limit_eviction_removes_oldest() {
        // Create a store with max 5 entries
        let store = RateLimitStore::with_max_entries(5);
        let config = RateLimitConfig {
            limit: 100,
            window_secs: 60,
        };

        // Add 5 entries with slight delays to ensure different last_access times
        for i in 0..5 {
            store.check_and_record(&format!("key-{}", i), &config).await;
        }

        // Access key-4 again to make it "recent"
        store.check_and_record("key-4", &config).await;

        // Add a new key - should evict oldest (key-0 likely)
        store.check_and_record("key-new", &config).await;

        // key-4 and key-new should still be present
        assert!(
            store.entries.contains_key("key-4"),
            "Recently accessed key should remain"
        );
        assert!(
            store.entries.contains_key("key-new"),
            "New key should be present"
        );
    }

    #[tokio::test]
    async fn test_rate_limit_eviction_stress_under_attack() {
        // T-02: Stress test simulating attack with many unique IPs
        // This tests the eviction behavior under sustained capacity pressure
        let store = RateLimitStore::with_max_entries(100);
        let config = RateLimitConfig {
            limit: 10,
            window_secs: 60,
        };

        // Simulate attack: 500 unique "IPs" (5x capacity)
        for i in 0..500 {
            store
                .check_and_record(&format!("attacker-ip-{}", i), &config)
                .await;
        }

        // Store should never exceed max_entries
        let entries_len = store.entries.len();
        assert!(
            entries_len <= 100,
            "Store should not exceed max_entries under attack. Got: {}",
            entries_len
        );

        // Legitimate user should still be able to use the system
        let result = store.check_and_record("legitimate-user", &config).await;
        assert!(
            result.allowed,
            "Legitimate user should still be allowed after eviction"
        );
        assert_eq!(result.remaining, 9);

        // Store should remain bounded
        assert!(
            store.entries.len() <= 100,
            "Store should remain bounded after legitimate request"
        );
    }

    #[tokio::test]
    async fn test_rate_limit_early_warning_at_ninety_percent() {
        // MW-02: Test that warning is logged at 90% capacity
        let store = RateLimitStore::with_max_entries(10);
        let config = RateLimitConfig {
            limit: 100,
            window_secs: 60,
        };

        // Fill to 90% (9 entries)
        for i in 0..9 {
            store.check_and_record(&format!("key-{}", i), &config).await;
        }

        // Verify at 90%
        assert_eq!(store.entries.len(), 9);

        // Adding 10th entry should trigger warning but not eviction
        // (Warning is logged but we can't easily verify tracing output in tests)
        store.check_and_record("key-9", &config).await;

        // Should have 10 entries (at capacity but no eviction yet)
        assert_eq!(store.entries.len(), 10);

        // Adding 11th entry should trigger eviction
        store.check_and_record("key-10", &config).await;

        // Should have evicted some entries
        assert!(store.entries.len() < 10, "Should have evicted entries");
        assert!(
            store.entries.contains_key("key-10"),
            "New key should be present"
        );
    }

    #[tokio::test]
    async fn test_rate_limit_eviction_evicts_twenty_percent() {
        // T-02: Test that eviction removes ~20% of entries (M-03 fix)
        let store = RateLimitStore::with_max_entries(100);
        let config = RateLimitConfig {
            limit: 100,
            window_secs: 60,
        };

        // Fill to capacity
        for i in 0..100 {
            store.check_and_record(&format!("key-{}", i), &config).await;
        }

        // Verify at capacity
        assert_eq!(store.entries.len(), 100);

        // Add one more to trigger eviction
        store.check_and_record("trigger-eviction", &config).await;

        // Should have evicted ~20 entries (20%), so ~81 entries remain
        // (100 - 20 = 80, plus the new one = 81)
        let entries_len = store.entries.len();
        // Allow some variance due to implementation details
        assert!(
            (75..=85).contains(&entries_len),
            "After eviction, should have ~80% of max entries. Got: {}",
            entries_len
        );
        assert!(
            store.entries.contains_key("trigger-eviction"),
            "Newly added key should be present"
        );
    }
}
