//! MFA Attempt Tracking Service
//!
//! SEC-04: Per-user rate limiting for MFA verification to prevent brute-force attacks.
//!
//! This service tracks failed MFA attempts per user and implements lockout after
//! exceeding the maximum attempts. This complements the IP-based rate limiting
//! already in place on auth_sensitive_routes.
//!
//! # Threat Model
//!
//! An attacker with a stolen session token could attempt to brute-force TOTP codes.
//! With 10^6 possible codes per 30-second window:
//! - IP rate limiting alone (10/min) would take ~70 days minimum
//! - Per-user lockout (5 attempts) stops the attack after 5 tries
//!
//! # Design Choices
//!
//! - In-memory store (matches existing rate limit pattern)
//! - Per-user tracking (not per-session) to prevent session cycling attacks
//! - 5 attempts, 15 minute lockout (standard MFA best practice)
//! - Auto-cleanup of stale entries to bound memory

use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::RwLock;
use uuid::Uuid;

/// Maximum failed MFA attempts before lockout
const MAX_FAILED_ATTEMPTS: u32 = 5;

/// Lockout duration after exceeding max attempts (15 minutes)
const LOCKOUT_DURATION: Duration = Duration::from_secs(15 * 60);

/// Cleanup interval for stale entries
const CLEANUP_INTERVAL: Duration = Duration::from_secs(300);

/// Maximum entries in the store (prevents OOM)
const MAX_ENTRIES: usize = 50_000;

/// Entry tracking MFA attempts for a user
#[derive(Debug, Clone)]
struct MfaAttemptEntry {
    /// Number of consecutive failed attempts
    failed_count: u32,
    /// When the lockout expires (if locked out)
    locked_until: Option<Instant>,
    /// Last attempt time (for cleanup)
    last_attempt: Instant,
}

impl MfaAttemptEntry {
    fn new() -> Self {
        Self {
            failed_count: 0,
            locked_until: None,
            last_attempt: Instant::now(),
        }
    }

    /// Check if currently locked out
    fn is_locked_out(&self) -> bool {
        match self.locked_until {
            Some(until) => Instant::now() < until,
            None => false,
        }
    }

    /// Get remaining lockout duration (for error message)
    fn lockout_remaining(&self) -> Option<Duration> {
        self.locked_until
            .filter(|until| Instant::now() < *until)
            .map(|until| until.duration_since(Instant::now()))
    }
}

/// Service for tracking MFA verification attempts
#[derive(Clone)]
pub struct MfaAttemptService {
    entries: Arc<RwLock<HashMap<Uuid, MfaAttemptEntry>>>,
    last_cleanup: Arc<RwLock<Instant>>,
}

impl MfaAttemptService {
    /// Create a new MFA attempt tracking service
    pub fn new() -> Self {
        Self {
            entries: Arc::new(RwLock::new(HashMap::new())),
            last_cleanup: Arc::new(RwLock::new(Instant::now())),
        }
    }

    /// Check if user is allowed to attempt MFA verification
    ///
    /// Returns `Ok(())` if allowed, or `Err` with remaining lockout time if locked out.
    pub async fn check_allowed(&self, user_id: Uuid) -> Result<(), Duration> {
        self.maybe_cleanup().await;

        let entries = self.entries.read().await;
        if let Some(entry) = entries.get(&user_id) {
            if let Some(remaining) = entry.lockout_remaining() {
                return Err(remaining);
            }
        }
        Ok(())
    }

    /// Record a failed MFA attempt
    ///
    /// Returns `Ok(remaining_attempts)` if still under limit,
    /// or `Err(lockout_duration)` if now locked out.
    pub async fn record_failed(&self, user_id: Uuid) -> Result<u32, Duration> {
        self.maybe_cleanup().await;

        let mut entries = self.entries.write().await;

        // Evict if at capacity
        if entries.len() >= MAX_ENTRIES && !entries.contains_key(&user_id) {
            self.evict_oldest(&mut entries);
        }

        let entry = entries.entry(user_id).or_insert_with(MfaAttemptEntry::new);
        entry.last_attempt = Instant::now();

        // If lockout expired, reset counter
        if !entry.is_locked_out() && entry.locked_until.is_some() {
            entry.failed_count = 0;
            entry.locked_until = None;
        }

        entry.failed_count += 1;

        tracing::debug!(
            user_id = %user_id,
            failed_count = entry.failed_count,
            max_attempts = MAX_FAILED_ATTEMPTS,
            "SEC-04: MFA attempt failed"
        );

        if entry.failed_count >= MAX_FAILED_ATTEMPTS {
            // Lock out the user
            entry.locked_until = Some(Instant::now() + LOCKOUT_DURATION);
            tracing::warn!(
                user_id = %user_id,
                lockout_minutes = LOCKOUT_DURATION.as_secs() / 60,
                "SEC-04: User locked out due to too many failed MFA attempts"
            );
            Err(LOCKOUT_DURATION)
        } else {
            Ok(MAX_FAILED_ATTEMPTS - entry.failed_count)
        }
    }

    /// Record a successful MFA verification (clears failed attempts)
    pub async fn record_success(&self, user_id: Uuid) {
        let mut entries = self.entries.write().await;
        entries.remove(&user_id);

        tracing::debug!(
            user_id = %user_id,
            "SEC-04: MFA verification successful, cleared attempt tracking"
        );
    }

    /// Periodic cleanup of stale entries
    async fn maybe_cleanup(&self) {
        let should_cleanup = {
            let last = self.last_cleanup.read().await;
            Instant::now().duration_since(*last) > CLEANUP_INTERVAL
        };

        if should_cleanup {
            let mut last = self.last_cleanup.write().await;
            *last = Instant::now();
            drop(last);

            let mut entries = self.entries.write().await;
            let stale_threshold = Duration::from_secs(30 * 60); // 30 minutes
            let now = Instant::now();

            entries.retain(|_, entry| {
                // Keep if:
                // - Still locked out, OR
                // - Recently accessed
                entry.is_locked_out() || now.duration_since(entry.last_attempt) < stale_threshold
            });
        }
    }

    /// Evict oldest entries when at capacity
    fn evict_oldest(&self, entries: &mut HashMap<Uuid, MfaAttemptEntry>) {
        let evict_count = std::cmp::max(1, MAX_ENTRIES / 5);
        let now = Instant::now();

        let mut by_age: Vec<_> = entries
            .iter()
            .map(|(k, v)| (*k, now.duration_since(v.last_attempt)))
            .collect();

        if by_age.len() <= evict_count {
            entries.clear();
            return;
        }

        by_age.sort_by(|a, b| b.1.cmp(&a.1));

        for (key, _) in by_age.into_iter().take(evict_count) {
            entries.remove(&key);
        }
    }
}

impl Default for MfaAttemptService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_initially_allowed() {
        let service = MfaAttemptService::new();
        let user_id = Uuid::new_v4();

        assert!(service.check_allowed(user_id).await.is_ok());
    }

    #[tokio::test]
    async fn test_failed_attempts_under_limit() {
        let service = MfaAttemptService::new();
        let user_id = Uuid::new_v4();

        // 4 failures should still be allowed
        for i in 0..4 {
            let result = service.record_failed(user_id).await;
            assert!(
                result.is_ok(),
                "Attempt {} should not trigger lockout",
                i + 1
            );
            assert_eq!(result.unwrap(), MAX_FAILED_ATTEMPTS - (i as u32 + 1));
        }

        // Should still be allowed to attempt
        assert!(service.check_allowed(user_id).await.is_ok());
    }

    #[tokio::test]
    async fn test_lockout_after_max_attempts() {
        let service = MfaAttemptService::new();
        let user_id = Uuid::new_v4();

        // 5 failures should trigger lockout
        for i in 0..5 {
            let _ = service.record_failed(user_id).await;
            if i < 4 {
                assert!(service.check_allowed(user_id).await.is_ok());
            }
        }

        // Should be locked out
        let result = service.check_allowed(user_id).await;
        assert!(result.is_err());
        let remaining = result.unwrap_err();
        assert!(remaining.as_secs() > 0);
    }

    #[tokio::test]
    async fn test_success_clears_attempts() {
        let service = MfaAttemptService::new();
        let user_id = Uuid::new_v4();

        // Record some failures
        service.record_failed(user_id).await.ok();
        service.record_failed(user_id).await.ok();

        // Success clears attempts
        service.record_success(user_id).await;

        // Should be back to full quota
        let result = service.record_failed(user_id).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), MAX_FAILED_ATTEMPTS - 1);
    }

    #[tokio::test]
    async fn test_different_users_independent() {
        let service = MfaAttemptService::new();
        let user1 = Uuid::new_v4();
        let user2 = Uuid::new_v4();

        // Lock out user1
        for _ in 0..5 {
            let _ = service.record_failed(user1).await;
        }
        assert!(service.check_allowed(user1).await.is_err());

        // user2 should still be allowed
        assert!(service.check_allowed(user2).await.is_ok());
    }

    #[tokio::test]
    async fn test_lockout_returns_duration() {
        let service = MfaAttemptService::new();
        let user_id = Uuid::new_v4();

        // Trigger lockout
        for _ in 0..5 {
            let _ = service.record_failed(user_id).await;
        }

        // Check returns remaining duration
        let result = service.check_allowed(user_id).await;
        assert!(result.is_err());
        let remaining = result.unwrap_err();
        // Should be close to LOCKOUT_DURATION (15 minutes)
        assert!(remaining.as_secs() > 14 * 60); // At least 14 minutes
        assert!(remaining.as_secs() <= 15 * 60); // At most 15 minutes
    }
}
