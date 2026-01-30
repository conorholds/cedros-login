//! Login attempt tracking repository for account lockouts

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Login attempt record
#[derive(Debug, Clone)]
pub struct LoginAttemptRecord {
    pub id: Uuid,
    /// User ID if known, None for unknown email attempts
    pub user_id: Option<Uuid>,
    /// Email used in the attempt
    pub email: String,
    /// IP address of the attempt
    pub ip_address: Option<String>,
    /// Whether the attempt was successful
    pub successful: bool,
    /// Timestamp of the attempt
    pub attempted_at: DateTime<Utc>,
}

/// Lockout status for a user/email
#[derive(Debug, Clone)]
pub struct LockoutStatus {
    /// Whether the account is currently locked
    pub is_locked: bool,
    /// Number of failed attempts in the window
    pub failed_attempts: u32,
    /// When the lockout expires (if locked)
    pub lockout_expires_at: Option<DateTime<Utc>>,
    /// Remaining time until lockout expires (seconds)
    pub lockout_remaining_secs: Option<i64>,
}

/// Configuration for login attempt tracking
#[derive(Debug, Clone)]
pub struct LoginAttemptConfig {
    /// Maximum failed attempts before lockout
    pub max_attempts: u32,
    /// Window in minutes to count failures
    pub window_minutes: u32,
    /// Lockout duration in minutes
    pub lockout_minutes: u32,
}

impl Default for LoginAttemptConfig {
    fn default() -> Self {
        Self {
            max_attempts: 5,
            window_minutes: 15,
            lockout_minutes: 30,
        }
    }
}

/// Login attempt repository trait
#[async_trait]
pub trait LoginAttemptRepository: Send + Sync {
    /// Record a login attempt
    async fn record_attempt(
        &self,
        user_id: Option<Uuid>,
        email: &str,
        ip_address: Option<&str>,
        successful: bool,
    ) -> Result<(), AppError>;

    /// Get lockout status for an email
    async fn get_lockout_status(
        &self,
        email: &str,
        config: &LoginAttemptConfig,
    ) -> Result<LockoutStatus, AppError>;

    /// Record a failed attempt and atomically return lockout status.
    ///
    /// ## REPO-11: Atomicity Guarantee
    ///
    /// This method is "atomic" in the sense that record + lockout check happens
    /// within a single lock acquisition, preventing race conditions where:
    /// - Two concurrent requests each see 4 failures (below threshold)
    /// - Both proceed to verify passwords
    /// - Both record failure #5, bypassing the lockout
    ///
    /// With this atomic method, one request will see 5 failures and trigger
    /// lockout while the other will see the lockout already in effect.
    async fn record_failed_attempt_atomic(
        &self,
        user_id: Option<Uuid>,
        email: &str,
        ip_address: Option<&str>,
        config: &LoginAttemptConfig,
    ) -> Result<LockoutStatus, AppError>;

    /// Clear failed attempts (e.g., after successful login)
    async fn clear_failed_attempts(&self, email: &str) -> Result<(), AppError>;

    /// Clean up old records
    async fn cleanup_old_records(&self, older_than: DateTime<Utc>) -> Result<u64, AppError>;
}

/// In-memory login attempt repository
pub struct InMemoryLoginAttemptRepository {
    attempts: RwLock<HashMap<String, Vec<LoginAttemptRecord>>>,
}

impl InMemoryLoginAttemptRepository {
    pub fn new() -> Self {
        Self {
            attempts: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryLoginAttemptRepository {
    fn default() -> Self {
        Self::new()
    }
}

/// Retention period for login attempt records (7 days)
const RETENTION_DAYS: i64 = 7;

/// R-11: Maximum attempts stored per email to prevent unbounded growth
/// With 1000 attempts * ~100 bytes = ~100KB per email max
const MAX_ATTEMPTS_PER_EMAIL: usize = 1000;

#[async_trait]
impl LoginAttemptRepository for InMemoryLoginAttemptRepository {
    async fn record_attempt(
        &self,
        user_id: Option<Uuid>,
        email: &str,
        ip_address: Option<&str>,
        successful: bool,
    ) -> Result<(), AppError> {
        let now = Utc::now();
        let record = LoginAttemptRecord {
            id: Uuid::new_v4(),
            user_id,
            email: email.to_lowercase(),
            ip_address: ip_address.map(|s| s.to_string()),
            successful,
            attempted_at: now,
        };

        let mut attempts = self.attempts.write().await;

        // Clean up records older than retention period to prevent memory leak
        let retention_cutoff = now - Duration::days(RETENTION_DAYS);
        for user_attempts in attempts.values_mut() {
            user_attempts.retain(|a| a.attempted_at >= retention_cutoff);
        }
        // Remove empty entries
        attempts.retain(|_, v| !v.is_empty());

        let user_attempts = attempts
            .entry(email.to_lowercase())
            .or_insert_with(Vec::new);
        user_attempts.push(record);

        // R-11: FIFO eviction when limit exceeded
        if user_attempts.len() > MAX_ATTEMPTS_PER_EMAIL {
            user_attempts.drain(0..(user_attempts.len() - MAX_ATTEMPTS_PER_EMAIL));
        }

        Ok(())
    }

    async fn get_lockout_status(
        &self,
        email: &str,
        config: &LoginAttemptConfig,
    ) -> Result<LockoutStatus, AppError> {
        let attempts = self.attempts.read().await;

        let email_lower = email.to_lowercase();
        let now = Utc::now();
        let window_start = now - Duration::minutes(config.window_minutes as i64);

        let user_attempts = match attempts.get(&email_lower) {
            Some(a) => a,
            None => {
                return Ok(LockoutStatus {
                    is_locked: false,
                    failed_attempts: 0,
                    lockout_expires_at: None,
                    lockout_remaining_secs: None,
                })
            }
        };

        // Count failed attempts in the window
        let failed_in_window: Vec<_> = user_attempts
            .iter()
            .filter(|a| !a.successful && a.attempted_at > window_start)
            .collect();

        let failed_attempts = failed_in_window.len() as u32;

        // Check if account is locked
        if failed_attempts >= config.max_attempts {
            // Find the most recent failed attempt
            if let Some(last_failed) = failed_in_window.iter().map(|a| a.attempted_at).max() {
                let lockout_expires_at =
                    last_failed + Duration::minutes(config.lockout_minutes as i64);

                if lockout_expires_at > now {
                    let remaining = (lockout_expires_at - now).num_seconds();
                    return Ok(LockoutStatus {
                        is_locked: true,
                        failed_attempts,
                        lockout_expires_at: Some(lockout_expires_at),
                        lockout_remaining_secs: Some(remaining),
                    });
                }
            }
        }

        Ok(LockoutStatus {
            is_locked: false,
            failed_attempts,
            lockout_expires_at: None,
            lockout_remaining_secs: None,
        })
    }

    async fn clear_failed_attempts(&self, email: &str) -> Result<(), AppError> {
        let mut attempts = self.attempts.write().await;

        // Keep only successful attempts
        if let Some(user_attempts) = attempts.get_mut(&email.to_lowercase()) {
            user_attempts.retain(|a| a.successful);
        }

        Ok(())
    }

    async fn record_failed_attempt_atomic(
        &self,
        user_id: Option<Uuid>,
        email: &str,
        ip_address: Option<&str>,
        config: &LoginAttemptConfig,
    ) -> Result<LockoutStatus, AppError> {
        let now = Utc::now();
        let email_lower = email.to_lowercase();
        let window_start = now - Duration::minutes(config.window_minutes as i64);

        let mut attempts = self.attempts.write().await;

        // Insert the new failed attempt
        let record = LoginAttemptRecord {
            id: Uuid::new_v4(),
            user_id,
            email: email_lower.clone(),
            ip_address: ip_address.map(|s| s.to_string()),
            successful: false,
            attempted_at: now,
        };

        let user_attempts = attempts.entry(email_lower).or_insert_with(Vec::new);
        user_attempts.push(record);

        // R-11: FIFO eviction when limit exceeded
        if user_attempts.len() > MAX_ATTEMPTS_PER_EMAIL {
            user_attempts.drain(0..(user_attempts.len() - MAX_ATTEMPTS_PER_EMAIL));
        }

        // Count failed attempts in the window (including the one we just added)
        let failed_in_window: Vec<_> = user_attempts
            .iter()
            .filter(|a| !a.successful && a.attempted_at > window_start)
            .collect();

        let failed_attempts = failed_in_window.len() as u32;

        // Check if account is now locked
        if failed_attempts >= config.max_attempts {
            if let Some(last_failed) = failed_in_window.iter().map(|a| a.attempted_at).max() {
                let lockout_expires_at =
                    last_failed + Duration::minutes(config.lockout_minutes as i64);

                if lockout_expires_at > now {
                    let remaining = (lockout_expires_at - now).num_seconds();
                    return Ok(LockoutStatus {
                        is_locked: true,
                        failed_attempts,
                        lockout_expires_at: Some(lockout_expires_at),
                        lockout_remaining_secs: Some(remaining),
                    });
                }
            }
        }

        Ok(LockoutStatus {
            is_locked: false,
            failed_attempts,
            lockout_expires_at: None,
            lockout_remaining_secs: None,
        })
    }

    async fn cleanup_old_records(&self, older_than: DateTime<Utc>) -> Result<u64, AppError> {
        let mut attempts = self.attempts.write().await;

        let mut removed = 0u64;
        for user_attempts in attempts.values_mut() {
            let before = user_attempts.len();
            user_attempts.retain(|a| a.attempted_at >= older_than);
            removed += (before - user_attempts.len()) as u64;
        }

        // Remove empty entries
        attempts.retain(|_, v| !v.is_empty());

        Ok(removed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_record_and_check_lockout() {
        let repo = InMemoryLoginAttemptRepository::new();
        let config = LoginAttemptConfig {
            max_attempts: 3,
            window_minutes: 15,
            lockout_minutes: 30,
        };

        // First check - no attempts
        let status = repo
            .get_lockout_status("test@example.com", &config)
            .await
            .unwrap();
        assert!(!status.is_locked);
        assert_eq!(status.failed_attempts, 0);

        // Record failed attempts
        for _ in 0..3 {
            repo.record_attempt(None, "test@example.com", None, false)
                .await
                .unwrap();
        }

        // Should be locked now
        let status = repo
            .get_lockout_status("test@example.com", &config)
            .await
            .unwrap();
        assert!(status.is_locked);
        assert_eq!(status.failed_attempts, 3);
        assert!(status.lockout_remaining_secs.is_some());
    }

    #[tokio::test]
    async fn test_clear_failed_attempts() {
        let repo = InMemoryLoginAttemptRepository::new();
        let config = LoginAttemptConfig::default();

        // Record failed attempts
        for _ in 0..3 {
            repo.record_attempt(None, "test@example.com", None, false)
                .await
                .unwrap();
        }

        let status = repo
            .get_lockout_status("test@example.com", &config)
            .await
            .unwrap();
        assert_eq!(status.failed_attempts, 3);

        // Clear failed attempts
        repo.clear_failed_attempts("test@example.com")
            .await
            .unwrap();

        let status = repo
            .get_lockout_status("test@example.com", &config)
            .await
            .unwrap();
        assert_eq!(status.failed_attempts, 0);
    }

    #[tokio::test]
    async fn test_successful_attempt_not_counted() {
        let repo = InMemoryLoginAttemptRepository::new();
        let config = LoginAttemptConfig::default();

        // Record some successful attempts
        for _ in 0..10 {
            repo.record_attempt(None, "test@example.com", None, true)
                .await
                .unwrap();
        }

        let status = repo
            .get_lockout_status("test@example.com", &config)
            .await
            .unwrap();
        assert!(!status.is_locked);
        assert_eq!(status.failed_attempts, 0);
    }

    #[tokio::test]
    async fn test_case_insensitive_email() {
        let repo = InMemoryLoginAttemptRepository::new();
        let config = LoginAttemptConfig {
            max_attempts: 2,
            window_minutes: 15,
            lockout_minutes: 30,
        };

        repo.record_attempt(None, "Test@Example.COM", None, false)
            .await
            .unwrap();
        repo.record_attempt(None, "test@example.com", None, false)
            .await
            .unwrap();

        let status = repo
            .get_lockout_status("TEST@EXAMPLE.COM", &config)
            .await
            .unwrap();
        assert!(status.is_locked);
        assert_eq!(status.failed_attempts, 2);
    }
}
