//! Password hashing and validation service
//!
//! # Argon2 Parameters (MAINT-003)
//!
//! This service uses **Argon2id** with the following default parameters (via `Argon2::default()`):
//!
//! | Parameter | Value | Description |
//! |-----------|-------|-------------|
//! | m_cost | 19456 KiB (~19 MiB) | Memory cost |
//! | t_cost | 2 | Time cost (iterations) |
//! | p_cost | 1 | Parallelism |
//!
//! These parameters are the `argon2` crate defaults and meet OWASP recommendations for
//! password hashing. The ~50-100ms hash time on typical hardware provides good security
//! while remaining responsive for interactive authentication.
//!
//! To adjust parameters, replace `Argon2::default()` with `Argon2::new()` and custom `Params`.
//!
//! # Common Password Checking (SEC-28)
//!
//! The service checks passwords against a list of commonly-used passwords to prevent
//! users from choosing easily-guessable passwords. This list includes:
//! - Top 100 most common passwords from various breach datasets
//! - Common keyboard patterns (qwerty, 12345, etc.)
//! - Common words/phrases (password, letmein, etc.)
//!
//! Enable via `PASSWORD_CHECK_COMMON=true` (default: true).

use std::collections::HashSet;
use std::sync::OnceLock;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use tokio::task;

use crate::errors::AppError;

/// Common passwords that are rejected during registration/password change.
/// This list is compiled from various breach datasets and security research.
/// All entries are lowercase for case-insensitive matching.
const COMMON_PASSWORDS: &[&str] = &[
    // Top passwords from breach datasets
    "password",
    "123456",
    "12345678",
    "1234567890",
    "qwerty",
    "abc123",
    "monkey",
    "1234567",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "passw0rd",
    "shadow",
    "123123",
    "654321",
    "superman",
    "qazwsx",
    "michael",
    "football",
    "password1",
    "password123",
    "batman",
    "login",
    "welcome",
    "admin",
    "princess",
    "starwars",
    "admin123",
    "hello",
    "charlie",
    "donald",
    "login",
    "loveme",
    "mustang",
    "access",
    "ninja",
    "hunter",
    "zaq1zaq1",
    "qwerty123",
    "letmein1",
    "welcome1",
    "password!",
    "passw0rd!",
    "qwerty!",
    "123456!",
    "hello123",
    "welcome123",
    "secret",
    "secret123",
    "changeme",
    "passpass",
    "freedom",
    "whatever",
    "qwertyuiop",
    "123456789",
    "12345678!",
    // Common patterns
    "aaaaaa",
    "111111",
    "000000",
    "abcdef",
    "abcdefg",
    "abcdefgh",
    "abc12345",
    "123abc",
    "1q2w3e4r",
    "1qaz2wsx",
    "zxcvbnm",
    "asdfghjkl",
    "1234qwer",
    "qwer1234",
    // Year-based
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
    // Common word + number patterns (base words)
    "summer",
    "winter",
    "spring",
    "autumn",
    "january",
    "february",
    "monday",
    "friday",
    "soccer",
    "hockey",
    "cookie",
    "chocolate",
    "computer",
    "internet",
    "flower",
    "orange",
    "pepper",
    "cheese",
    "winner",
    "loser",
];

/// O(1) lookup set built from the common password list.
static COMMON_PASSWORD_SET: OnceLock<HashSet<&'static str>> = OnceLock::new();

fn common_password_set() -> &'static HashSet<&'static str> {
    COMMON_PASSWORD_SET.get_or_init(|| COMMON_PASSWORDS.iter().copied().collect())
}

/// Check if a password is in the common password list.
/// Performs case-insensitive comparison and also checks if the password
/// (without trailing digits/special chars) matches a common base word.
fn is_common_password(password: &str) -> bool {
    let lower = password.to_lowercase();

    // Direct match — O(1) via HashSet
    if common_password_set().contains(lower.as_str()) {
        return true;
    }

    // Check base word (strip trailing digits and special chars)
    // Catches patterns like "Password123!" matching "password"
    let base: String = lower
        .chars()
        .take_while(|c| c.is_ascii_alphabetic())
        .collect();

    if !base.is_empty() && common_password_set().contains(base.as_str()) {
        return true;
    }

    false
}

/// Password validation rules
#[derive(Clone)]
pub struct PasswordRules {
    pub min_length: usize,
    pub require_uppercase: bool,
    pub require_lowercase: bool,
    pub require_number: bool,
    pub require_special: bool,
    /// Check against list of commonly-breached passwords
    pub check_common_passwords: bool,
}

impl Default for PasswordRules {
    fn default() -> Self {
        Self {
            min_length: 10,
            require_uppercase: true,
            require_lowercase: true,
            require_number: true,
            require_special: true,
            check_common_passwords: true,
        }
    }
}

/// SRV-12: Generate dummy hash at runtime with current Argon2 params.
/// This ensures timing consistency even if params change in the future.
fn dummy_hash() -> &'static str {
    use std::sync::OnceLock;
    static HASH: OnceLock<String> = OnceLock::new();
    HASH.get_or_init(|| {
        let salt = SaltString::generate(&mut OsRng);
        Argon2::default()
            .hash_password(b"timing-attack-mitigation-dummy", &salt)
            .expect("dummy hash generation must succeed")
            .to_string()
    })
}

/// Password service for hashing and validation
#[derive(Clone)]
pub struct PasswordService {
    rules: PasswordRules,
}

impl Default for PasswordService {
    fn default() -> Self {
        Self::new(PasswordRules::default())
    }
}

impl PasswordService {
    /// Create a new password service with custom rules
    pub fn new(rules: PasswordRules) -> Self {
        Self { rules }
    }

    /// Validate a password against the configured rules
    pub fn validate(&self, password: &str) -> Result<(), AppError> {
        let mut errors = Vec::new();

        if password.len() < self.rules.min_length {
            errors.push(format!(
                "Password must be at least {} characters",
                self.rules.min_length
            ));
        }

        if self.rules.require_uppercase && !password.chars().any(|c| c.is_uppercase()) {
            errors.push("Password must contain at least one uppercase letter".to_string());
        }

        if self.rules.require_lowercase && !password.chars().any(|c| c.is_lowercase()) {
            errors.push("Password must contain at least one lowercase letter".to_string());
        }

        if self.rules.require_number && !password.chars().any(|c| c.is_ascii_digit()) {
            errors.push("Password must contain at least one number".to_string());
        }

        if self.rules.require_special {
            // L-04: Accepted special characters. Includes common symbols users expect.
            // Original set: @$!%*?&#^()
            // Added: - (hyphen), . (period), _ (underscore) - commonly used in passwords
            // Note: Expanding the allowlist is always safe (existing passwords with the
            // original chars still work, and new passwords can now use more chars).
            let special_chars = "@$!%*?&#^()-._";
            if !password.chars().any(|c| special_chars.contains(c)) {
                errors.push("Password must contain at least one special character".to_string());
            }
        }

        // SEC-28: Check against common password list
        if self.rules.check_common_passwords && is_common_password(password) {
            errors.push(
                "This password is too common and easily guessable. Please choose a stronger password."
                    .to_string(),
            );
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(AppError::Validation(errors.join("; ")))
        }
    }

    /// Hash a password using argon2id
    ///
    /// P-01: Runs in spawn_blocking to avoid blocking the async runtime.
    /// Argon2 hashing takes 50-100ms and would otherwise saturate the thread pool.
    pub async fn hash(&self, password: String) -> Result<String, AppError> {
        task::spawn_blocking(move || {
            let salt = SaltString::generate(&mut OsRng);
            let argon2 = Argon2::default();

            argon2
                .hash_password(password.as_bytes(), &salt)
                .map(|hash| hash.to_string())
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hashing failed: {}", e)))
        })
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hash task failed: {}", e)))?
    }

    /// Verify a password against a hash (timing-safe)
    ///
    /// P-01: Runs in spawn_blocking to avoid blocking the async runtime.
    pub async fn verify(&self, password: String, hash: String) -> Result<bool, AppError> {
        task::spawn_blocking(move || {
            let parsed_hash = PasswordHash::new(&hash)
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid password hash: {}", e)))?;

            // Argon2 verify is timing-safe
            Ok(Argon2::default()
                .verify_password(password.as_bytes(), &parsed_hash)
                .is_ok())
        })
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Password verify task failed: {}", e)))?
    }

    /// Perform a dummy password verification to normalize timing.
    ///
    /// This method is called when an email is not found in the database.
    /// By running the same argon2 verification as a real login, we prevent
    /// timing attacks that could enumerate valid email addresses.
    ///
    /// The result is always false, but the timing matches real verification.
    ///
    /// P-01: Runs in spawn_blocking to avoid blocking the async runtime.
    pub async fn verify_dummy(&self, password: String) {
        let _ = task::spawn_blocking(move || {
            // Parse the pre-computed dummy hash
            let hash_str = dummy_hash();
            match PasswordHash::new(hash_str) {
                Ok(parsed_hash) => {
                    // Run verification (will always fail, but takes same time)
                    let _ = Argon2::default().verify_password(password.as_bytes(), &parsed_hash);
                }
                Err(e) => {
                    tracing::error!(error = %e, "SECURITY: Failed to parse dummy hash - falling back to sleep");
                    metrics::counter!("security.password.dummy_hash_fallback").increment(1);
                    use rand::Rng;
                    let sleep_ms: u64 = OsRng.gen_range(100..300);
                    std::thread::sleep(std::time::Duration::from_millis(sleep_ms));
                }
            }
        })
        .await;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_validation_valid() {
        let service = PasswordService::default();
        assert!(service.validate("SecurePass1!").is_ok());
        assert!(service.validate("MyP@ssw0rd123").is_ok());
    }

    #[test]
    fn test_password_validation_too_short() {
        let service = PasswordService::default();
        let result = service.validate("Short1!");
        assert!(result.is_err());
    }

    #[test]
    fn test_password_validation_missing_uppercase() {
        let service = PasswordService::default();
        let result = service.validate("securepass1!");
        assert!(result.is_err());
    }

    #[test]
    fn test_password_validation_missing_special() {
        let service = PasswordService::default();
        let result = service.validate("SecurePass123");
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_password_hash_and_verify() {
        let service = PasswordService::default();
        let password = "SecurePass1!";

        let hash = service.hash(password.to_string()).await.unwrap();
        assert!(service
            .verify(password.to_string(), hash.clone())
            .await
            .unwrap());
        assert!(!service
            .verify("WrongPassword1!".to_string(), hash)
            .await
            .unwrap());
    }

    #[test]
    fn test_password_validation_missing_lowercase() {
        let service = PasswordService::default();
        let result = service.validate("SECUREPASS1!");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("lowercase"));
    }

    #[test]
    fn test_password_validation_missing_digit() {
        let service = PasswordService::default();
        let result = service.validate("SecurePass!!");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("number"));
    }

    #[test]
    fn test_password_validation_all_special_chars() {
        let service = PasswordService::default();
        // Test various special characters work
        assert!(service.validate("SecurePass1@").is_ok());
        assert!(service.validate("SecurePass1$").is_ok());
        assert!(service.validate("SecurePass1!").is_ok());
        assert!(service.validate("SecurePass1%").is_ok());
        assert!(service.validate("SecurePass1*").is_ok());
        assert!(service.validate("SecurePass1?").is_ok());
        assert!(service.validate("SecurePass1&").is_ok());
        assert!(service.validate("SecurePass1#").is_ok());
        assert!(service.validate("SecurePass1^").is_ok());
        assert!(service.validate("SecurePass1(").is_ok());
        assert!(service.validate("SecurePass1)").is_ok());
    }

    #[tokio::test]
    async fn test_password_hash_is_unique() {
        let service = PasswordService::default();
        let password = "SecurePass1!";

        let hash1 = service.hash(password.to_string()).await.unwrap();
        let hash2 = service.hash(password.to_string()).await.unwrap();

        // Same password should produce different hashes (due to random salt)
        assert_ne!(hash1, hash2);

        // But both should verify correctly
        assert!(service.verify(password.to_string(), hash1).await.unwrap());
        assert!(service.verify(password.to_string(), hash2).await.unwrap());
    }

    #[test]
    fn test_password_exact_minimum_length() {
        let service = PasswordService::default();
        // Exactly 10 characters (minimum)
        assert!(service.validate("Secure1!ab").is_ok());
        // 9 characters (too short)
        assert!(service.validate("Secure1!a").is_err());
    }

    #[tokio::test]
    async fn test_verify_dummy_does_not_panic() {
        let service = PasswordService::default();
        // verify_dummy should not panic with any input
        service.verify_dummy("any-password".to_string()).await;
        service.verify_dummy(String::new()).await;
        service.verify_dummy("a".repeat(1000)).await;
    }

    #[test]
    fn test_common_password_rejection() {
        let service = PasswordService::default();
        // Direct common password matches should be rejected
        let result = service.validate("Password123!");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("too common"));

        let result = service.validate("Qwerty1234!");
        assert!(result.is_err());

        let result = service.validate("Letmein123!");
        assert!(result.is_err());
    }

    #[test]
    fn test_common_password_case_insensitive() {
        let service = PasswordService::default();
        // Case variations should also be rejected
        let result = service.validate("PASSWORD123!");
        assert!(result.is_err());

        let result = service.validate("PaSsWoRd123!");
        assert!(result.is_err());
    }

    #[test]
    fn test_common_password_with_suffix() {
        let service = PasswordService::default();
        // Common base word with numbers/special chars should be rejected
        let result = service.validate("Summer2024!");
        assert!(result.is_err());

        let result = service.validate("Dragon123!!");
        assert!(result.is_err());
    }

    #[test]
    fn test_uncommon_password_accepted() {
        let service = PasswordService::default();
        // Truly random passwords should be accepted
        assert!(service.validate("Xk9#mP2$vLqW").is_ok());
        assert!(service.validate("MyUnique!Pass1").is_ok());
        assert!(service.validate("Th1s1sN0tC0mm0n!").is_ok());
    }

    #[test]
    fn test_common_password_check_disabled() {
        let rules = PasswordRules {
            check_common_passwords: false,
            ..PasswordRules::default()
        };
        let service = PasswordService::new(rules);
        // With check disabled, common passwords meeting other rules should pass
        assert!(service.validate("Password123!").is_ok());
    }

    #[test]
    fn test_is_common_password_helper() {
        assert!(is_common_password("password"));
        assert!(is_common_password("PASSWORD"));
        assert!(is_common_password("Password123"));
        assert!(is_common_password("qwerty"));
        assert!(is_common_password("summer2024"));
        assert!(!is_common_password("xK9mP2vLqW"));
        assert!(!is_common_password("notinlist"));
    }
}
