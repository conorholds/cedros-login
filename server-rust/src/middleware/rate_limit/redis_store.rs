//! Redis-backed rate limit store for distributed deployments
//!
//! This store uses Redis to maintain rate limit counters across multiple instances.
//! Requires the `redis-rate-limit` feature to be enabled.
//!
//! # Algorithm
//!
//! Uses a sliding window counter algorithm implemented via Lua script for atomicity:
//! 1. Each key stores: prev_count, curr_count, window_start (as Unix timestamp)
//! 2. On each request, the script:
//!    - Rotates windows if needed
//!    - Calculates sliding window estimate
//!    - Increments counter if under limit
//! 3. Keys expire after 2 * window_secs to prevent memory bloat
//!
//! # Connection Management
//!
//! Uses redis connection manager for automatic reconnection on failure.

use super::types::{RateLimitConfig, RateLimitResult};
use std::sync::Arc;
use tokio::sync::OnceCell;

/// Redis rate limit store
#[derive(Clone)]
pub struct RedisRateLimitStore {
    client: redis::Client,
    connection: Arc<OnceCell<redis::aio::ConnectionManager>>,
}

impl std::fmt::Debug for RedisRateLimitStore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RedisRateLimitStore")
            .field("url", &"<redacted>")
            .finish()
    }
}

impl RedisRateLimitStore {
    /// Create a new Redis rate limit store
    ///
    /// # Arguments
    /// * `redis_url` - Redis connection URL (e.g., "redis://localhost:6379")
    ///
    /// # Errors
    /// Returns error if the URL is invalid
    pub fn new(redis_url: &str) -> Result<Self, redis::RedisError> {
        let client = redis::Client::open(redis_url)?;
        tracing::info!("Redis rate limiter initialized (shared across instances)");
        Ok(Self {
            client,
            connection: Arc::new(OnceCell::new()),
        })
    }

    /// Get or create the connection manager
    async fn get_connection(&self) -> Result<redis::aio::ConnectionManager, redis::RedisError> {
        self.connection
            .get_or_try_init(|| async {
                let conn = self.client.get_connection_manager().await?;
                tracing::debug!("Redis rate limit connection established");
                Ok(conn)
            })
            .await
            .cloned()
    }

    /// Check if request is allowed and record it using sliding window counter.
    ///
    /// Uses a Lua script for atomic check-and-increment operations.
    pub async fn check_and_record(&self, key: &str, config: &RateLimitConfig) -> RateLimitResult {
        match self.check_and_record_inner(key, config).await {
            Ok(result) => result,
            Err(e) => {
                // On Redis errors, fail open (allow) but log warning
                // This prevents Redis outages from blocking all traffic
                tracing::warn!(
                    key = key,
                    error = %e,
                    "Redis rate limit check failed, allowing request (fail-open)"
                );
                RateLimitResult {
                    allowed: true,
                    limit: config.limit,
                    remaining: config.limit.saturating_sub(1),
                    reset_secs: config.window_secs,
                }
            }
        }
    }

    async fn check_and_record_inner(
        &self,
        key: &str,
        config: &RateLimitConfig,
    ) -> Result<RateLimitResult, redis::RedisError> {
        let mut conn = self.get_connection().await?;
        let redis_key = format!("rl:{}", key);

        // Lua script for atomic sliding window rate limiting
        // Stored values: hash with prev_count, curr_count, window_start
        let script = redis::Script::new(
            r#"
            local key = KEYS[1]
            local limit = tonumber(ARGV[1])
            local window_secs = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])

            -- Get current state
            local state = redis.call('HMGET', key, 'prev_count', 'curr_count', 'window_start')
            local prev_count = tonumber(state[1]) or 0
            local curr_count = tonumber(state[2]) or 0
            local window_start = tonumber(state[3]) or now

            -- Calculate elapsed time since window start
            local elapsed = now - window_start

            -- Rotate windows if needed
            if elapsed >= window_secs then
                local windows_passed = math.floor(elapsed / window_secs)
                if windows_passed >= 2 then
                    prev_count = 0
                    curr_count = 0
                else
                    prev_count = curr_count
                    curr_count = 0
                end
                window_start = window_start + (windows_passed * window_secs)
                elapsed = now - window_start
            end

            -- Calculate sliding window estimate
            local elapsed_ratio = elapsed / window_secs
            if elapsed_ratio > 1 then elapsed_ratio = 1 end
            if elapsed_ratio < 0 then elapsed_ratio = 0 end

            local estimated_count = math.ceil(prev_count * (1 - elapsed_ratio) + curr_count)
            local reset_secs = window_secs - elapsed
            if reset_secs < 0 then reset_secs = 0 end

            if estimated_count >= limit then
                -- Rate limited, don't increment
                return {0, limit, 0, reset_secs}
            end

            -- Allowed - increment counter
            curr_count = curr_count + 1

            -- Save state
            redis.call('HMSET', key, 'prev_count', prev_count, 'curr_count', curr_count, 'window_start', window_start)
            redis.call('EXPIRE', key, window_secs * 2)

            local remaining = limit - estimated_count - 1
            if remaining < 0 then remaining = 0 end

            return {1, limit, remaining, reset_secs}
            "#,
        );

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let result: (i32, u32, u32, u64) = script
            .key(&redis_key)
            .arg(config.limit)
            .arg(config.window_secs)
            .arg(now)
            .invoke_async(&mut conn)
            .await?;

        Ok(RateLimitResult {
            allowed: result.0 == 1,
            limit: result.1,
            remaining: result.2,
            reset_secs: result.3,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_redis_store_debug_redacts_url() {
        // Just verify the struct can be debug-printed without exposing secrets
        let client = redis::Client::open("redis://secret:password@localhost:6379").unwrap();
        let store = RedisRateLimitStore {
            client,
            connection: Arc::new(OnceCell::new()),
        };
        let debug = format!("{:?}", store);
        assert!(debug.contains("<redacted>"));
        assert!(!debug.contains("secret"));
        assert!(!debug.contains("password"));
    }
}
