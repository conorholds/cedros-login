//! Circuit breaker pattern for external service calls (SVC-1)
//!
//! Provides graceful degradation when external services are unavailable.
//! State machine: CLOSED → (N failures) → OPEN → (cooldown) → HALF_OPEN → success → CLOSED
//!
//! # Security Considerations (SVC-CACHE)
//!
//! The `fallback_cache_ttl` (default: 24 hours) creates a security window during outages.
//! If an identity provider (Google/Apple) revokes a signing key after compromise,
//! this service may continue accepting tokens signed with the compromised key for
//! up to 24 hours if the JWKS endpoint is unreachable.
//!
//! **Trade-off rationale:**
//! - Shorter TTL: Better security, but more outage exposure during provider issues
//! - Longer TTL: Better resilience, but larger window for compromised key acceptance
//!
//! **Mitigations:**
//! - 24 hours is bounded; tokens have shorter expiry (typically 1 hour)
//! - Key compromise at Google/Apple is extremely rare
//! - Provider key rotation is gradual (new + old keys overlap)

use std::time::{Duration, Instant};

/// Circuit breaker state
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CircuitState {
    /// Normal operation - requests allowed
    Closed,
    /// Circuit tripped - requests blocked, using fallback
    Open,
    /// Testing if service recovered - one request allowed
    HalfOpen,
}

/// Configuration for circuit breaker behavior
#[derive(Debug, Clone)]
pub struct CircuitBreakerConfig {
    /// Number of consecutive failures before opening circuit
    pub failure_threshold: u32,
    /// How long to stay open before trying half-open
    pub open_duration: Duration,
    /// Maximum age of cached data to serve as fallback (24 hours default)
    /// SVC-CACHE: See module docs for security implications of stale key window
    pub fallback_cache_ttl: Duration,
}

impl Default for CircuitBreakerConfig {
    fn default() -> Self {
        Self {
            failure_threshold: 3,
            open_duration: Duration::from_secs(60),
            fallback_cache_ttl: Duration::from_secs(86400), // 24 hours
        }
    }
}

/// Circuit breaker for protecting against external service failures
///
/// # Thread Safety (REL-007)
///
/// This struct is **not thread-safe**. It uses interior mutability via `&mut self`
/// methods (`should_allow_request`, `record_success`, `record_failure`).
///
/// For concurrent usage in async contexts, wrap in `Arc<Mutex<CircuitBreaker>>`:
///
/// ```text
/// let cb = Arc::new(Mutex::new(CircuitBreaker::new("my_service")));
///
/// // In async handler:
/// let mut guard = cb.lock().await;
/// if guard.should_allow_request() {
///     match make_request().await {
///         Ok(_) => guard.record_success(),
///         Err(_) => guard.record_failure(),
///     }
/// }
/// ```
///
/// Alternatively, use `tokio::sync::Mutex` for async-safe locking in Tokio contexts.
#[derive(Debug)]
pub struct CircuitBreaker {
    state: CircuitState,
    failure_count: u32,
    opened_at: Option<Instant>,
    config: CircuitBreakerConfig,
    service_name: &'static str,
}

impl CircuitBreaker {
    /// Create a new circuit breaker with default config
    pub fn new(service_name: &'static str) -> Self {
        Self::with_config(service_name, CircuitBreakerConfig::default())
    }

    /// Create a circuit breaker with custom config
    pub fn with_config(service_name: &'static str, config: CircuitBreakerConfig) -> Self {
        Self {
            state: CircuitState::Closed,
            failure_count: 0,
            opened_at: None,
            config,
            service_name,
        }
    }

    /// Check if a request should be allowed
    ///
    /// Returns `true` if the request can proceed, `false` if blocked.
    /// Automatically transitions from Open to HalfOpen after cooldown.
    pub fn should_allow_request(&mut self) -> bool {
        match self.state {
            CircuitState::Closed => true,
            CircuitState::Open => {
                // Check if cooldown has passed
                if let Some(opened) = self.opened_at {
                    if opened.elapsed() >= self.config.open_duration {
                        tracing::info!(
                            service = self.service_name,
                            "Circuit breaker transitioning to half-open"
                        );
                        self.state = CircuitState::HalfOpen;
                        return true;
                    }
                }
                false
            }
            CircuitState::HalfOpen => true,
        }
    }

    /// Record a successful request - resets circuit to closed
    pub fn record_success(&mut self) {
        if self.state != CircuitState::Closed {
            tracing::info!(
                service = self.service_name,
                previous_state = ?self.state,
                "Circuit breaker closing after successful request"
            );
        }
        self.state = CircuitState::Closed;
        self.failure_count = 0;
        self.opened_at = None;
    }

    /// Record a failed request - may open the circuit
    pub fn record_failure(&mut self) {
        self.failure_count += 1;

        match self.state {
            CircuitState::Closed => {
                if self.failure_count >= self.config.failure_threshold {
                    tracing::warn!(
                        service = self.service_name,
                        failure_count = self.failure_count,
                        "Circuit breaker opening after {} failures",
                        self.failure_count
                    );
                    self.state = CircuitState::Open;
                    self.opened_at = Some(Instant::now());
                }
            }
            CircuitState::HalfOpen => {
                // Failed during probe - back to open
                tracing::warn!(
                    service = self.service_name,
                    "Circuit breaker reopening after half-open failure"
                );
                self.state = CircuitState::Open;
                self.opened_at = Some(Instant::now());
            }
            CircuitState::Open => {
                // Already open, just counting
            }
        }
    }

    /// Get current circuit state (for testing/debugging)
    #[cfg(test)]
    pub fn state(&self) -> CircuitState {
        self.state
    }

    /// Check if cached data is still valid as fallback
    pub fn is_fallback_valid(&self, fetched_at: Instant) -> bool {
        fetched_at.elapsed() < self.config.fallback_cache_ttl
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_circuit_starts_closed() {
        let cb = CircuitBreaker::new("test");
        assert_eq!(cb.state(), CircuitState::Closed);
    }

    #[test]
    fn test_allows_requests_when_closed() {
        let mut cb = CircuitBreaker::new("test");
        assert!(cb.should_allow_request());
    }

    #[test]
    fn test_opens_after_threshold_failures() {
        let config = CircuitBreakerConfig {
            failure_threshold: 3,
            ..Default::default()
        };
        let mut cb = CircuitBreaker::with_config("test", config);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Closed);
        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Closed);
        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);
    }

    #[test]
    fn test_blocks_requests_when_open() {
        let config = CircuitBreakerConfig {
            failure_threshold: 1,
            open_duration: Duration::from_secs(60),
            ..Default::default()
        };
        let mut cb = CircuitBreaker::with_config("test", config);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);
        assert!(!cb.should_allow_request());
    }

    #[test]
    fn test_transitions_to_half_open_after_cooldown() {
        let config = CircuitBreakerConfig {
            failure_threshold: 1,
            open_duration: Duration::from_millis(1),
            ..Default::default()
        };
        let mut cb = CircuitBreaker::with_config("test", config);

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);

        // Wait for cooldown
        std::thread::sleep(Duration::from_millis(5));

        assert!(cb.should_allow_request());
        assert_eq!(cb.state(), CircuitState::HalfOpen);
    }

    #[test]
    fn test_closes_on_success() {
        let config = CircuitBreakerConfig {
            failure_threshold: 1,
            open_duration: Duration::from_millis(1),
            ..Default::default()
        };
        let mut cb = CircuitBreaker::with_config("test", config);

        cb.record_failure();
        std::thread::sleep(Duration::from_millis(5));
        cb.should_allow_request(); // Transition to half-open

        cb.record_success();
        assert_eq!(cb.state(), CircuitState::Closed);
        assert_eq!(cb.failure_count, 0);
    }

    #[test]
    fn test_reopens_on_half_open_failure() {
        let config = CircuitBreakerConfig {
            failure_threshold: 1,
            open_duration: Duration::from_millis(1),
            ..Default::default()
        };
        let mut cb = CircuitBreaker::with_config("test", config);

        cb.record_failure();
        std::thread::sleep(Duration::from_millis(5));
        cb.should_allow_request(); // Transition to half-open

        cb.record_failure();
        assert_eq!(cb.state(), CircuitState::Open);
    }

    #[test]
    fn test_success_resets_failure_count() {
        let mut cb = CircuitBreaker::new("test");

        cb.record_failure();
        cb.record_failure();
        assert_eq!(cb.failure_count, 2);

        cb.record_success();
        assert_eq!(cb.failure_count, 0);
    }

    #[test]
    fn test_fallback_validity() {
        let config = CircuitBreakerConfig {
            fallback_cache_ttl: Duration::from_millis(50),
            ..Default::default()
        };
        let cb = CircuitBreaker::with_config("test", config);

        let fetched = Instant::now();
        assert!(cb.is_fallback_valid(fetched));

        std::thread::sleep(Duration::from_millis(60));
        assert!(!cb.is_fallback_valid(fetched));
    }
}
