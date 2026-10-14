//! Password hashing and validation service
//!
//! # Argon2 Parameters
//!
//! This service uses **Argon2id** with RFC 9106's memory-constrained profile:
//!
//! | Parameter | Value | Description |
//! |-----------|-------|-------------|
//! | m_cost | 65536 KiB (64 MiB) | Memory cost |
//! | t_cost | 3 | Time cost (iterations) |
//! | p_cost | 1 | Parallelism |
//!
//! Existing Argon2id hashes remain verifiable within the current resource ceiling.
//!
//! # Common Password Checking
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
    Algorithm, Argon2, Params, Version,
};
use tokio::task;

use crate::errors::AppError;

const ARGON2_MEMORY_KIB: u32 = 65_536;
const ARGON2_ITERATIONS: u32 = 3;
const ARGON2_PARALLELISM: u32 = 1;
const MAX_PASSWORD_CHARS: usize = 1_024;

fn check_password_size(password: &str) -> Result<(), AppError> {
    if password.len() > MAX_PASSWORD_CHARS * 4 || password.chars().count() > MAX_PASSWORD_CHARS {
        return Err(AppError::Validation("Password is too long".into()));
    }
    Ok(())
}

fn password_hasher() -> Argon2<'static> {
    let params = Params::new(
        ARGON2_MEMORY_KIB,
        ARGON2_ITERATIONS,
        ARGON2_PARALLELISM,
        Some(32),
    )
    .expect("static Argon2id parameters are valid");
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
}

fn hash_is_safe_to_verify(parsed: &PasswordHash<'_>) -> bool {
    parsed.algorithm.as_str() == "argon2id"
        && parsed.version == Some(19)
        && parsed
            .params
            .get_decimal("m")
            .is_some_and(|value| value <= ARGON2_MEMORY_KIB)
        && parsed
            .params
            .get_decimal("t")
            .is_some_and(|value| value <= ARGON2_ITERATIONS)
        && parsed
            .params
            .get_decimal("p")
            .is_some_and(|value| value <= ARGON2_PARALLELISM)
}

fn hash_meets_policy(parsed_hash: &PasswordHash<'_>) -> bool {
    parsed_hash.algorithm.as_str() == "argon2id"
        && parsed_hash.version == Some(19)
        && parsed_hash.params.get_decimal("m") >= Some(ARGON2_MEMORY_KIB)
        && parsed_hash.params.get_decimal("t") >= Some(ARGON2_ITERATIONS)
        && parsed_hash.params.get_decimal("p") >= Some(ARGON2_PARALLELISM)
        && parsed_hash.salt.is_some_and(|salt| salt.len() >= 16)
        && parsed_hash.hash.is_some_and(|output| output.len() >= 32)
}

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
            min_length: 8,
            require_uppercase: false,
            require_lowercase: false,
            require_number: false,
            require_special: false,
            check_common_passwords: true,
        }
    }
}

/// One default-policy Argon2 verification, including cold requests.
fn dummy_hash() -> &'static str {
    // Public, non-account verifier. Avoid a second Argon2 pass on a cold process
    // or fresh Wasm instance. The policy test below detects parameter changes.
    "$argon2id$v=19$m=65536,t=3,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$qkpBeUSNgQ0ZzYsqmYiZ7z0s0wlL7ZZg/2JlTHjDu7A"
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

        let password_chars = password.chars().count();
        if password_chars < self.rules.min_length {
            errors.push(format!(
                "Password must be at least {} characters",
                self.rules.min_length
            ));
        }

        if password_chars > MAX_PASSWORD_CHARS {
            errors.push(format!(
                "Password must be no more than {MAX_PASSWORD_CHARS} characters"
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
            // Accepted special characters. Includes common symbols users expect.
            // Original set: @$!%*?&#^()
            // Added: - (hyphen), . (period), _ (underscore) - commonly used in passwords
            // Note: Expanding the allowlist is always safe (existing passwords with the
            // original chars still work, and new passwords can now use more chars).
            let special_chars = "@$!%*?&#^()-._";
            if !password.chars().any(|c| special_chars.contains(c)) {
                errors.push("Password must contain at least one special character".to_string());
            }
        }

        // Check against common password list
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
    /// Runs in spawn_blocking to avoid blocking the async runtime.
    /// Argon2 hashing takes 50-100ms and would otherwise saturate the thread pool.
    pub async fn hash(&self, password: String) -> Result<String, AppError> {
        check_password_size(&password)?;
        super::cpu_work::auth(move || {
            let salt = SaltString::generate(&mut OsRng);
            let argon2 = password_hasher();

            argon2
                .hash_password(password.as_bytes(), &salt)
                .map(|hash| hash.to_string())
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Password hashing failed: {e}")))
        })
        .await
    }

    /// Validate an imported password hash uses Cedros Login's Argon2id PHC format.
    ///
    /// This is used by extension install/activation bootstrap when Cedros platform
    /// seeds the initial Login admin with an already-aligned password verifier.
    pub async fn validate_imported_hash(&self, hash: String) -> Result<String, AppError> {
        task::spawn_blocking(move || {
            let trimmed = hash.trim().to_string();
            if trimmed.is_empty() || trimmed.len() > 512 {
                return Err(AppError::Validation(
                    "Imported password hash must be a non-empty Argon2id PHC string".into(),
                ));
            }

            let parsed_hash = PasswordHash::new(&trimmed).map_err(|_| {
                AppError::Validation("Imported password hash must be a valid PHC string".into())
            })?;

            if parsed_hash.algorithm.as_str() != "argon2id" {
                return Err(AppError::Validation(
                    "Imported password hash must use Argon2id".into(),
                ));
            }

            if !hash_meets_policy(&parsed_hash) || !hash_is_safe_to_verify(&parsed_hash) {
                return Err(AppError::Validation(
                    "Imported Argon2id hash does not meet the current password policy".into(),
                ));
            }

            Ok(trimmed)
        })
        .await
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Password hash validation task failed: {e}"))
        })?
    }

    /// Existing hashes remain verifiable, but a successful login should
    /// replace hashes whose embedded parameters predate the current policy.
    pub fn needs_rehash(&self, hash: &str) -> bool {
        PasswordHash::new(hash)
            .map(|parsed| !hash_meets_policy(&parsed))
            .unwrap_or(true)
    }

    /// Verify a password against a hash (timing-safe)
    ///
    /// Runs in spawn_blocking to avoid blocking the async runtime.
    pub async fn verify(&self, password: String, hash: String) -> Result<bool, AppError> {
        check_password_size(&password)?;
        if hash.len() > 512 {
            return Ok(false);
        }
        super::cpu_work::auth(move || {
            let parsed_hash = PasswordHash::new(&hash)
                .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid password hash: {e}")))?;

            if !hash_is_safe_to_verify(&parsed_hash) {
                return Ok(false);
            }

            // Argon2 verify is timing-safe
            Ok(password_hasher()
                .verify_password(password.as_bytes(), &parsed_hash)
                .is_ok())
        })
        .await
    }

    /// Perform a dummy password verification to normalize timing.
    ///
    /// This method is called when an email is not found in the database.
    /// By running the same argon2 verification as a real login, we prevent
    /// timing attacks that could enumerate valid email addresses.
    ///
    /// The result is always false, but the timing matches real verification.
    ///
    /// Runs in spawn_blocking to avoid blocking the async runtime.
    pub async fn verify_dummy(&self, password: String) -> Result<(), AppError> {
        check_password_size(&password)?;
        super::cpu_work::auth(move || {
            let parsed_hash = PasswordHash::new(dummy_hash()).map_err(|error| {
                AppError::Internal(anyhow::anyhow!("Invalid dummy hash: {error}"))
            })?;
            let _ = password_hasher().verify_password(password.as_bytes(), &parsed_hash);
            Ok(())
        })
        .await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn verification_rejects_expensive_hashes_and_oversized_inputs_before_work() {
        let service = PasswordService::default();
        for hash in [
            dummy_hash().replace("m=65536", "m=4294967295"),
            dummy_hash().replace("t=3", "t=999999"),
            dummy_hash().replace("p=1", "p=99999"),
        ] {
            assert!(!service
                .verify("password".into(), hash.clone())
                .await
                .unwrap());
            assert!(service.validate_imported_hash(hash).await.is_err());
        }
        let oversized = "a".repeat(1025);
        assert!(service.hash(oversized.clone()).await.is_err());
        assert!(service
            .verify(oversized.clone(), dummy_hash().into())
            .await
            .is_err());
        assert!(service.verify_dummy(oversized).await.is_err());
    }

    #[test]
    fn test_password_validation_valid() {
        let service = PasswordService::default();
        assert!(service.validate("correct horse battery staple").is_ok());
        assert!(service.validate("MyP@ssw0rd12345").is_ok());
    }

    #[test]
    fn test_password_validation_too_short() {
        let service = PasswordService::default();
        let result = service.validate("Short1!");
        assert!(result.is_err());
    }

    #[test]
    fn test_password_validation_does_not_require_uppercase() {
        let service = PasswordService::default();
        assert!(service.validate("all lowercase is accepted").is_ok());
    }

    #[test]
    fn test_password_validation_does_not_require_special() {
        let service = PasswordService::default();
        assert!(service.validate("letters and numbers 123").is_ok());
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

    #[tokio::test]
    async fn test_validate_imported_hash_accepts_argon2id_phc() {
        let service = PasswordService::default();
        let hash = service.hash("SecurePass1!".to_string()).await.unwrap();

        let imported = service
            .validate_imported_hash(format!(" {hash} "))
            .await
            .unwrap();

        assert_eq!(imported, hash);
        assert!(service
            .verify("SecurePass1!".to_string(), imported)
            .await
            .unwrap());
    }

    #[tokio::test]
    async fn test_validate_imported_hash_rejects_non_argon2id() {
        let service = PasswordService::default();

        assert!(service
            .validate_imported_hash("plain-text".to_string())
            .await
            .is_err());
        assert!(service
            .validate_imported_hash("$argon2i$v=19$m=4096,t=3,p=1$c2FsdA$YmFk".to_string())
            .await
            .is_err());
    }

    #[tokio::test]
    async fn legacy_argon2id_hashes_verify_but_cannot_be_newly_imported() {
        let service = PasswordService::default();
        let legacy = "$argon2id$v=19$m=19456,t=2,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI";

        assert!(service
            .verify("timing-attack-mitigation-dummy".into(), legacy.into())
            .await
            .unwrap());
        assert!(service.validate_imported_hash(legacy.into()).await.is_err());
        assert!(service.needs_rehash(legacy));

        let current = service.hash("a current password".into()).await.unwrap();
        assert!(!service.needs_rehash(&current));
    }

    #[test]
    fn test_password_validation_does_not_require_lowercase() {
        let service = PasswordService::default();
        assert!(service.validate("FIFTEENCHARACTERS").is_ok());
    }

    #[test]
    fn test_password_validation_does_not_require_digit() {
        let service = PasswordService::default();
        assert!(service.validate("a long memorable passphrase").is_ok());
    }

    #[test]
    fn test_password_validation_all_special_chars() {
        let service = PasswordService::default();
        // Test various special characters work
        assert!(service.validate("SecurePass1234@").is_ok());
        assert!(service.validate("SecurePass1234$").is_ok());
        assert!(service.validate("SecurePass1234!").is_ok());
        assert!(service.validate("SecurePass1234%").is_ok());
        assert!(service.validate("SecurePass1234*").is_ok());
        assert!(service.validate("SecurePass1234?").is_ok());
        assert!(service.validate("SecurePass1234&").is_ok());
        assert!(service.validate("SecurePass1234#").is_ok());
        assert!(service.validate("SecurePass1234^").is_ok());
        assert!(service.validate("SecurePass1234(").is_ok());
        assert!(service.validate("SecurePass1234)").is_ok());
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
        // Exactly 8 Unicode scalar values (minimum)
        assert!(service.validate("x7K#q2Lm").is_ok());
        assert!(service.validate("x7K#q2L").is_err());
        assert!(service.validate("🔐🔐🔐🔐🔐🔐🔐").is_err());
        assert!(service.validate("🔐🔐🔐🔐🔐🔐🔐🔐").is_ok());
    }

    #[tokio::test]
    async fn test_verify_dummy_does_not_panic() {
        let service = PasswordService::default();
        // verify_dummy should not panic with any input
        service
            .verify_dummy("any-password".to_string())
            .await
            .unwrap();
        service.verify_dummy(String::new()).await.unwrap();
        service.verify_dummy("a".repeat(1000)).await.unwrap();
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
        assert!(service.validate("Xk9#mP2$vLqW890").is_ok());
        assert!(service.validate("MyUnique!Pass123").is_ok());
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
        assert!(service.validate("Password123!456").is_ok());
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

#[cfg(test)]
mod dummy_policy_tests {
    use super::*;
    #[test]
    fn public_dummy_verifier_matches_current_argon2_policy() {
        let salt = SaltString::encode_b64(b"cedros-dummy-salt").unwrap();
        let current = password_hasher()
            .hash_password(b"timing-attack-mitigation-dummy", &salt)
            .unwrap()
            .to_string();
        assert_eq!(
            dummy_hash(),
            current,
            "Regenerate the public dummy PHC when the password policy changes"
        );
    }
}
