//! TOTP service for MFA operations
//!
//! # SHA-1 Algorithm Usage (SEC-011)
//!
//! This service uses **SHA-1** as the HMAC algorithm for TOTP, which is the default
//! specified in [RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238).
//!
//! ## Why SHA-1 is Safe Here
//!
//! While SHA-1 has known collision vulnerabilities, TOTP only uses it for HMAC
//! (keyed hashing), not for collision resistance. HMAC-SHA1 remains secure for
//! authentication purposes per NIST and cryptographic consensus.
//!
//! ## Compatibility Considerations
//!
//! SHA-1 is used for maximum compatibility with authenticator apps:
//! - Google Authenticator defaults to SHA-1
//! - Microsoft Authenticator supports SHA-1 by default
//! - Many older hardware tokens only support SHA-1
//!
//! Using SHA-256 or SHA-512 may cause compatibility issues with some authenticators.
//!
//! ## Future Migration
//!
//! If stronger algorithms are needed in the future, consider:
//! 1. Adding algorithm parameter to TOTP secrets in database
//! 2. Allowing users to choose algorithm during enrollment
//! 3. Maintaining SHA-1 for existing enrollments

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use totp_rs::{Algorithm, Secret, TOTP};

use crate::errors::AppError;

/// Number of recovery codes to generate
const RECOVERY_CODE_COUNT: usize = 10;

/// Recovery code length (characters)
/// SVC-3: Increased from 8 to 12 for ~62 bits entropy (vs ~41 bits)
/// SEC-009: Increased from 12 to 16 for ~83 bits entropy (36^16 combinations)
const RECOVERY_CODE_LENGTH: usize = 16;

/// TOTP service for generating and verifying time-based one-time passwords
///
/// # Skew Configuration (S-13)
///
/// The `skew` parameter controls how many 30-second time steps are accepted
/// before/after the current step. Current setting: `skew=1`
///
/// ## Trade-off: Usability vs Security
///
/// - **skew=0**: Strictest. Only current code valid. Users with slight clock
///   drift (common on mobile devices) may experience frequent failures.
/// - **skew=1** (current): Balanced. Accepts current and ±1 step (90-second window).
///   Tolerates typical clock drift while limiting replay window.
/// - **skew=2+**: Permissive. Larger window makes codes easier to use but
///   extends the time an intercepted code remains valid.
///
/// ## Replay Attack Mitigation
///
/// For stricter deployments, consider adding replay detection:
/// - Store last used code timestamp per user
/// - Reject codes older than last successful verification
/// - This prevents reuse even within the valid window
///
/// The current `skew=1` setting is intentional for usability. Systems
/// requiring stronger security should implement replay detection rather
/// than reducing skew, as skew=0 causes too many false rejections.
#[derive(Clone)]
pub struct TotpService {
    /// Application name shown in authenticator apps
    issuer: String,
    /// How many time steps to accept (for clock drift)
    skew: u8,
}

impl TotpService {
    /// Create a new TOTP service
    ///
    /// Uses `skew=1` by default. See struct-level docs for security trade-offs.
    pub fn new(issuer: impl Into<String>) -> Self {
        Self {
            issuer: issuer.into(),
            skew: 1, // Accept codes from 1 step before/after current
        }
    }

    /// Generate a new TOTP secret
    pub fn generate_secret(&self) -> String {
        Secret::generate_secret().to_encoded().to_string()
    }

    /// Get the otpauth URI for QR code generation
    pub fn get_otpauth_uri(&self, secret: &str, email: &str) -> Result<String, AppError> {
        let totp = self.create_totp(secret, email)?;
        Ok(totp.get_url())
    }

    /// S-14: Verify a TOTP code with replay protection
    ///
    /// Returns `Ok(Some(time_step))` if verification succeeds and the code hasn't been used,
    /// where `time_step` should be recorded to prevent replay.
    /// Returns `Ok(None)` if verification fails (wrong code OR replay detected).
    ///
    /// # Arguments
    /// * `secret` - The Base32-encoded TOTP secret
    /// * `code` - The 6-digit code to verify
    /// * `email` - User's email (for TOTP account name)
    /// * `last_used_time_step` - The last successfully used time step (from TotpSecret)
    ///
    /// # Replay Protection
    ///
    /// A code is rejected if its time step is <= the last used time step.
    /// This prevents reuse of intercepted codes within the skew window.
    ///
    /// # Clock Monotonicity Requirement (H-05)
    ///
    /// **CRITICAL:** This function assumes the system clock is monotonically increasing.
    /// If the clock jumps backward (e.g., NTP adjustment, VM snapshot restore, manual
    /// time change), verification will fail until time catches up.
    ///
    /// **Operational requirements:**
    /// - Use NTP with `iburst` for initial sync before service starts
    /// - Configure NTP to slew (gradual adjustment) rather than step (instant jump)
    /// - Monitor for clock skew > 1 second between servers
    /// - Avoid VM snapshots in production
    ///
    /// If `current_time_step < last_used_time_step`, a warning is logged to help
    /// diagnose clock drift vs. replay attacks.
    pub fn verify_with_replay_check(
        &self,
        secret: &str,
        code: &str,
        email: &str,
        last_used_time_step: Option<i64>,
    ) -> Result<Option<i64>, AppError> {
        let totp = self.create_totp(secret, email)?;

        // Get current time and time step
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("System time error: {}", e)))?
            .as_secs();
        let current_time_step = (now / 30) as i64;

        // Verify the code
        if !totp.check_current(code).unwrap_or(false) {
            return Ok(None);
        }

        // S-14/SERVICE-002/SEC-03: Check for replay attack with boundary handling
        // The code is valid, but we need to ensure it hasn't been used before.
        // With skew=1, valid codes can come from time_step-1, time_step, or time_step+1.
        //
        // Boundary behavior: We use current_time_step (server's view of time) for comparison,
        // not the time step the code was generated for. This means:
        // - If last_used=T, codes from T or earlier are rejected (even if still valid via skew)
        // - This is intentional: time moves forward only, preventing clock-manipulation attacks
        // - Edge case: if user's clock is ahead and they use a T+1 code, T codes become invalid
        //
        // SEC-03 SECURITY NOTE: This edge case is an accepted trade-off. Alternatives considered:
        // - Store actual code used: Would require storing plaintext codes (security risk)
        // - Use code's time step: Attacker could manipulate client clock to bypass replay check
        // Current approach prioritizes security over edge-case usability.
        if let Some(last_step) = last_used_time_step {
            if current_time_step < last_step {
                // H-05: Clock went backward - this is likely a system clock issue, not a replay attack
                tracing::warn!(
                    current_time_step = current_time_step,
                    last_used_time_step = last_step,
                    drift_steps = last_step - current_time_step,
                    "H-05: TOTP verification failed - system clock appears to have gone backward. \
                     Check NTP configuration and avoid clock stepping."
                );
                return Ok(None);
            } else if current_time_step == last_step {
                // Same time step as last use - this is a replay attack attempt
                tracing::warn!(
                    current_time_step = current_time_step,
                    last_used_time_step = last_step,
                    "S-14: TOTP replay attack detected - code reuse within same time step"
                );
                return Ok(None);
            }
        }

        // S-31: Returns server's current_time_step rather than the matched step.
        // See SEC-03 note above: this is intentional to prevent clock-manipulation attacks.
        Ok(Some(current_time_step))
    }

    /// Generate recovery codes
    pub fn generate_recovery_codes(&self) -> Vec<String> {
        (0..RECOVERY_CODE_COUNT)
            .map(|_| self.generate_recovery_code())
            .collect()
    }

    /// Hash a recovery code for storage using Argon2id.
    ///
    /// # Security
    ///
    /// Uses Argon2id for strong resistance against GPU/ASIC attacks. Each hash includes
    /// a unique random salt, so the same code produces different hashes.
    ///
    /// # Returns
    ///
    /// Returns the Argon2id hash string on success, or an error if hashing fails.
    pub fn hash_recovery_code(code: &str) -> Result<String, AppError> {
        let normalized = code.to_uppercase().replace('-', "");
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        argon2
            .hash_password(normalized.as_bytes(), &salt)
            .map(|hash| hash.to_string())
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Recovery code hashing failed: {}", e)))
    }

    /// Verify a recovery code against a stored hash.
    ///
    /// Uses Argon2id verification which is constant-time.
    ///
    /// # Arguments
    ///
    /// * `code` - The plaintext recovery code to verify
    /// * `hash` - The stored Argon2id hash to verify against
    ///
    /// # Returns
    ///
    /// Returns `true` if the code matches the hash, `false` otherwise.
    pub fn verify_recovery_code(code: &str, hash: &str) -> bool {
        let normalized = code.to_uppercase().replace('-', "");
        let parsed_hash = match PasswordHash::new(hash) {
            Ok(h) => h,
            Err(_) => return false,
        };

        Argon2::default()
            .verify_password(normalized.as_bytes(), &parsed_hash)
            .is_ok()
    }

    /// Create a TOTP instance
    fn create_totp(&self, secret: &str, email: &str) -> Result<TOTP, AppError> {
        let secret = Secret::Encoded(secret.to_string())
            .to_bytes()
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid TOTP secret: {}", e)))?;

        TOTP::new(
            Algorithm::SHA1,
            6,         // digits
            self.skew, // skew
            30,        // step (seconds)
            secret,
            Some(self.issuer.clone()),
            email.to_string(),
        )
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create TOTP: {}", e)))
    }

    /// Generate a single recovery code (format: XXXX-XXXX-XXXX-XXXX)
    fn generate_recovery_code(&self) -> String {
        use rand::Rng;
        // SEC-08: Use OsRng for cryptographic random generation
        let mut rng = rand::rngs::OsRng;
        let charset: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let code: String = (0..RECOVERY_CODE_LENGTH)
            .map(|_| {
                let idx = rng.gen_range(0..charset.len());
                charset[idx] as char
            })
            .collect();

        // SEC-009: Format as XXXX-XXXX-XXXX-XXXX (16 chars = ~83 bits entropy)
        format!(
            "{}-{}-{}-{}",
            &code[0..4],
            &code[4..8],
            &code[8..12],
            &code[12..16]
        )
    }
}

impl Default for TotpService {
    fn default() -> Self {
        Self::new("Cedros")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_secret() {
        let service = TotpService::new("Test App");
        let secret = service.generate_secret();
        assert!(!secret.is_empty());
        // Base32 encoded secret should be valid
        assert!(secret
            .chars()
            .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit()));
    }

    #[test]
    fn test_get_otpauth_uri() {
        let service = TotpService::new("Test App");
        let secret = service.generate_secret();
        let uri = service
            .get_otpauth_uri(&secret, "test@example.com")
            .unwrap();

        assert!(uri.starts_with("otpauth://totp/"));
        assert!(uri.contains("test%40example.com"));
        assert!(uri.contains("issuer=Test%20App"));
    }

    // C-01: Removed deprecated test_verify_code test - use test_verify_with_replay_check_* tests instead

    #[test]
    fn test_generate_recovery_codes() {
        let service = TotpService::new("Test App");
        let codes = service.generate_recovery_codes();

        assert_eq!(codes.len(), RECOVERY_CODE_COUNT);
        for code in &codes {
            // SEC-009: XXXX-XXXX-XXXX-XXXX = 19 chars (16 chars + 3 dashes)
            assert_eq!(code.len(), 19);
            assert!(code.chars().nth(4) == Some('-'));
            assert!(code.chars().nth(9) == Some('-'));
            assert!(code.chars().nth(14) == Some('-'));
        }

        // All codes should be unique
        let mut unique = codes.clone();
        unique.sort();
        unique.dedup();
        assert_eq!(unique.len(), codes.len());
    }

    #[test]
    fn test_hash_recovery_code() {
        // Hashing should succeed
        let hash1 = TotpService::hash_recovery_code("ABCD-1234").unwrap();
        let hash2 = TotpService::hash_recovery_code("ABCD-1234").unwrap();

        // Same code produces different hashes due to random salt
        assert_ne!(hash1, hash2);

        // But both should verify against the original code
        assert!(TotpService::verify_recovery_code("ABCD-1234", &hash1));
        assert!(TotpService::verify_recovery_code("ABCD-1234", &hash2));

        // Hash should be in Argon2id format
        assert!(hash1.starts_with("$argon2id$"));
    }

    #[test]
    fn test_verify_recovery_code_case_insensitive() {
        let hash = TotpService::hash_recovery_code("ABCD-1234").unwrap();

        // Should verify regardless of case and dashes
        assert!(TotpService::verify_recovery_code("ABCD-1234", &hash));
        assert!(TotpService::verify_recovery_code("abcd-1234", &hash));
        assert!(TotpService::verify_recovery_code("ABCD1234", &hash));
        assert!(TotpService::verify_recovery_code("abcd1234", &hash));

        // Wrong code should not verify
        assert!(!TotpService::verify_recovery_code("WXYZ-5678", &hash));
    }

    #[test]
    fn test_verify_recovery_code_invalid_hash() {
        // Invalid hash should return false, not panic
        assert!(!TotpService::verify_recovery_code(
            "ABCD-1234",
            "invalid-hash"
        ));
        assert!(!TotpService::verify_recovery_code("ABCD-1234", ""));
    }

    #[test]
    fn test_verify_with_replay_check_no_previous_use() {
        let service = TotpService::new("Test App");
        let secret = service.generate_secret();

        // Generate current valid code
        let totp = TOTP::new(
            Algorithm::SHA1,
            6,
            1,
            30,
            Secret::Encoded(secret.clone()).to_bytes().unwrap(),
            Some("Test App".to_string()),
            "test@example.com".to_string(),
        )
        .unwrap();

        let valid_code = totp.generate_current().unwrap();

        // Should succeed with no previous use (None)
        let result = service
            .verify_with_replay_check(&secret, &valid_code, "test@example.com", None)
            .unwrap();
        assert!(result.is_some());
        assert!(result.unwrap() > 0);
    }

    #[test]
    fn test_verify_with_replay_check_rejects_replay() {
        let service = TotpService::new("Test App");
        let secret = service.generate_secret();

        // Generate current valid code
        let totp = TOTP::new(
            Algorithm::SHA1,
            6,
            1,
            30,
            Secret::Encoded(secret.clone()).to_bytes().unwrap(),
            Some("Test App".to_string()),
            "test@example.com".to_string(),
        )
        .unwrap();

        let valid_code = totp.generate_current().unwrap();

        // First verification should succeed
        let first_result = service
            .verify_with_replay_check(&secret, &valid_code, "test@example.com", None)
            .unwrap();
        assert!(first_result.is_some());
        let time_step = first_result.unwrap();

        // S-14: Second verification with same time step should be REJECTED (replay attack)
        let second_result = service
            .verify_with_replay_check(&secret, &valid_code, "test@example.com", Some(time_step))
            .unwrap();
        assert!(
            second_result.is_none(),
            "S-14: Replay attack should be rejected"
        );
    }

    #[test]
    fn test_verify_with_replay_check_invalid_code() {
        let service = TotpService::new("Test App");
        let secret = service.generate_secret();

        // Invalid code should fail regardless of replay state
        let result = service
            .verify_with_replay_check(&secret, "000000", "test@example.com", None)
            .unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_verify_with_replay_check_backward_clock() {
        // H-05: Test that backward clock is detected and rejected
        let service = TotpService::new("Test App");
        let secret = service.generate_secret();

        // Generate current valid code
        let totp = TOTP::new(
            Algorithm::SHA1,
            6,
            1,
            30,
            Secret::Encoded(secret.clone()).to_bytes().unwrap(),
            Some("Test App".to_string()),
            "test@example.com".to_string(),
        )
        .unwrap();

        let valid_code = totp.generate_current().unwrap();

        // Simulate backward clock: last_used_time_step is in the "future"
        // (i.e., current time step would be less than last used)
        // We do this by passing a very large last_used_time_step
        let future_time_step = i64::MAX - 1;
        let result = service
            .verify_with_replay_check(
                &secret,
                &valid_code,
                "test@example.com",
                Some(future_time_step),
            )
            .unwrap();

        // H-05: Should be rejected due to backward clock detection
        assert!(result.is_none(), "H-05: Backward clock should be rejected");
    }
}
