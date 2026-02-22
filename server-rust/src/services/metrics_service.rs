//! Prometheus metrics service
//!
//! Provides application metrics for monitoring via Prometheus/Grafana.
//! Metrics are exposed at the /metrics endpoint with API key authentication.

use metrics::{counter, gauge, histogram};
use metrics_exporter_prometheus::{PrometheusBuilder, PrometheusHandle};
use std::sync::OnceLock;

/// Global prometheus handle for rendering metrics
static PROMETHEUS_HANDLE: OnceLock<PrometheusHandle> = OnceLock::new();

/// Initialize the Prometheus metrics exporter
///
/// This should be called once at application startup.
/// Returns Some(PrometheusHandle) on success, None on failure.
pub fn init_metrics() -> Option<PrometheusHandle> {
    let handle = match PrometheusBuilder::new().install_recorder() {
        Ok(h) => h,
        Err(e) => {
            tracing::error!(error = %e, "Failed to install Prometheus recorder, metrics disabled");
            return None;
        }
    };

    // Store handle globally for the metrics endpoint
    if let Err(existing) = PROMETHEUS_HANDLE.set(handle.clone()) {
        tracing::warn!("Metrics already initialized, using existing handle");
        return Some(existing);
    }

    // Register initial gauge values
    gauge!("cedros_login_up").set(1.0);

    tracing::info!("Prometheus metrics initialized");
    Some(handle)
}

/// Get the prometheus handle (for rendering metrics)
pub fn get_prometheus_handle() -> Option<&'static PrometheusHandle> {
    PROMETHEUS_HANDLE.get()
}

/// Render current metrics in Prometheus text format
pub fn render_metrics() -> String {
    PROMETHEUS_HANDLE
        .get()
        .map(|h| h.render())
        .unwrap_or_else(|| "# Metrics not initialized\n".to_string())
}

// =============================================================================
// Authentication Metrics
// =============================================================================

/// Record a successful authentication
pub fn record_auth_success(method: &str) {
    counter!("cedros_login_auth_total", "method" => method.to_string(), "result" => "success")
        .increment(1);
}

/// Record a failed authentication attempt
pub fn record_auth_failure(method: &str, reason: &str) {
    counter!(
        "cedros_login_auth_total",
        "method" => method.to_string(),
        "result" => "failure",
        "reason" => reason.to_string()
    )
    .increment(1);
}

/// Record authentication latency
pub fn record_auth_duration(method: &str, duration_secs: f64) {
    histogram!(
        "cedros_login_auth_duration_seconds",
        "method" => method.to_string()
    )
    .record(duration_secs);
}

// =============================================================================
// Session Metrics
// =============================================================================

/// Record active sessions gauge
pub fn set_active_sessions(count: u64) {
    gauge!("cedros_login_active_sessions").set(count as f64);
}

/// Record a session created
pub fn record_session_created() {
    counter!("cedros_login_sessions_total", "action" => "created").increment(1);
}

/// Record a session revoked
pub fn record_session_revoked() {
    counter!("cedros_login_sessions_total", "action" => "revoked").increment(1);
}

// =============================================================================
// User Metrics
// =============================================================================

/// Record total users gauge
pub fn set_total_users(count: u64) {
    gauge!("cedros_login_users_total").set(count as f64);
}

/// Record a new user registration
pub fn record_user_registered() {
    counter!("cedros_login_registrations_total").increment(1);
}

// =============================================================================
// Credit/Deposit Metrics
// =============================================================================

/// Record a deposit
pub fn record_deposit(token: &str, amount_usd: f64) {
    counter!("cedros_login_deposits_total", "token" => token.to_string()).increment(1);
    counter!("cedros_login_deposits_usd_total", "token" => token.to_string())
        .increment(amount_usd as u64);
}

/// Record credits spent
pub fn record_credits_spent(amount: u64) {
    counter!("cedros_login_credits_spent_total").increment(amount);
}

/// Record a withdrawal
pub fn record_withdrawal(status: &str) {
    counter!("cedros_login_withdrawals_total", "status" => status.to_string()).increment(1);
}

// =============================================================================
// HTTP Request Metrics
// =============================================================================

/// Record an HTTP request
pub fn record_http_request(method: &str, path: &str, status: u16, duration_secs: f64) {
    let status_class = match status {
        200..=299 => "2xx",
        300..=399 => "3xx",
        400..=499 => "4xx",
        500..=599 => "5xx",
        _ => "other",
    };

    counter!(
        "cedros_login_http_requests_total",
        "method" => method.to_string(),
        "path" => path.to_string(),
        "status" => status_class.to_string()
    )
    .increment(1);

    histogram!(
        "cedros_login_http_request_duration_seconds",
        "method" => method.to_string(),
        "path" => path.to_string()
    )
    .record(duration_secs);
}

// =============================================================================
// Rate Limit Metrics
// =============================================================================

/// Record a rate limit hit
pub fn record_rate_limit_hit(key_type: &str) {
    counter!("cedros_login_rate_limit_hits_total", "key_type" => key_type.to_string()).increment(1);
}

// =============================================================================
// Error Metrics
// =============================================================================

/// Record an error
pub fn record_error(error_type: &str) {
    counter!("cedros_login_errors_total", "type" => error_type.to_string()).increment(1);
}

#[cfg(test)]
mod tests {
    // Note: metrics tests are tricky because the global recorder can only be
    // installed once. These are basic smoke tests.

    #[test]
    fn test_render_without_init() {
        // Should return "not initialized" message when called before init
        // Can't actually test this in isolation due to global state
    }
}
