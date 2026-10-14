//! Password validation + Argon2id hashing/verification.
//!
//! Ported from `server/src/services/password_service.rs`, made synchronous (the
//! component has no async runtime). Same Argon2id defaults (m=64 MiB, t=3, p=1,
//! RFC 9106's memory-constrained profile), same validation rules and common-password rejection,
//! and the same constant-time dummy verification for email-enumeration
//! resistance. One Argon2 hash (~tens of ms) is well within the host CPU deadline.
use std::collections::HashSet;
use std::sync::OnceLock;

use argon2::password_hash::{
    rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
};
use argon2::{Algorithm, Argon2, Params, Version};

use super::common_passwords::COMMON_PASSWORDS;
use super::AuthError;

static COMMON_PASSWORD_SET: OnceLock<HashSet<&'static str>> = OnceLock::new();

const ARGON2_MEMORY_KIB: u32 = 65_536;
const ARGON2_ITERATIONS: u32 = 3;
const ARGON2_PARALLELISM: u32 = 1;
const MAX_PASSWORD_CHARS: usize = 1_024;

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

fn hash_meets_policy(parsed: &PasswordHash<'_>) -> bool {
    parsed.algorithm.as_str() == "argon2id"
        && parsed.version == Some(19)
        && parsed.params.get_decimal("m") == Some(ARGON2_MEMORY_KIB)
        && parsed.params.get_decimal("t") == Some(ARGON2_ITERATIONS)
        && parsed.params.get_decimal("p") == Some(ARGON2_PARALLELISM)
        && parsed.salt.is_some_and(|salt| salt.len() >= 16)
        && parsed.hash.is_some_and(|output| output.len() >= 32)
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

fn common_password_set() -> &'static HashSet<&'static str> {
    COMMON_PASSWORD_SET.get_or_init(|| COMMON_PASSWORDS.iter().copied().collect())
}

/// True if `password` matches a common password or a common base word with a
/// trailing digit/symbol suffix (e.g. "Summer2024!" -> "summer").
fn is_common_password(password: &str) -> bool {
    let lower = password.to_lowercase();
    if common_password_set().contains(lower.as_str()) {
        return true;
    }
    let base: String = lower
        .chars()
        .take_while(|c| c.is_ascii_alphabetic())
        .collect();
    !base.is_empty() && common_password_set().contains(base.as_str())
}

/// Password policy (defaults mirror the standalone server).
#[derive(Clone)]
pub struct PasswordRules {
    pub min_length: usize,
    pub require_uppercase: bool,
    pub require_lowercase: bool,
    pub require_number: bool,
    pub require_special: bool,
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

#[derive(Clone, Default)]
pub struct PasswordService {
    rules: PasswordRules,
}

impl PasswordService {
    /// Bound attacker-controlled verifier input before entering Argon2. This is
    /// intentionally independent of password policy so login failures remain
    /// generic while oversized inputs cannot amplify CPU/memory use.
    pub fn is_verifiable_input(&self, password: &str) -> bool {
        password.chars().take(MAX_PASSWORD_CHARS + 1).count() <= MAX_PASSWORD_CHARS
    }

    /// Validate against the policy. Returns every failing rule at once.
    pub fn validate(&self, password: &str) -> Result<(), AuthError> {
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
        if self.rules.require_special && !password.chars().any(|c| "@$!%*?&#^()-._".contains(c)) {
            errors.push("Password must contain at least one special character".to_string());
        }
        if self.rules.check_common_passwords && is_common_password(password) {
            errors.push(
                "This password is too common and easily guessable. Please choose a stronger password."
                    .to_string(),
            );
        }
        if errors.is_empty() {
            Ok(())
        } else {
            Err(AuthError::Validation(errors))
        }
    }

    /// Hash a password with Argon2id and a fresh random salt.
    pub fn hash(&self, password: &str) -> Result<String, AuthError> {
        let salt = SaltString::generate(&mut OsRng);
        password_hasher()
            .hash_password(password.as_bytes(), &salt)
            .map(|hash| hash.to_string())
            .map_err(|e| AuthError::Crypto(format!("password hashing failed: {e}")))
    }

    /// Validate an imported password hash uses Cedros Login's Argon2id PHC format.
    pub fn validate_imported_hash(&self, hash: &str) -> Result<String, AuthError> {
        let trimmed = hash.trim();
        if trimmed.is_empty() || trimmed.len() > 512 {
            return Err(AuthError::Validation(vec![
                "Imported password hash must be a non-empty Argon2id PHC string".to_string(),
            ]));
        }

        let parsed = PasswordHash::new(trimmed).map_err(|_| {
            AuthError::Validation(vec![
                "Imported password hash must be a valid PHC string".to_string()
            ])
        })?;
        if !hash_meets_policy(&parsed) {
            return Err(AuthError::Validation(vec![
                "Imported password hash must use the current Argon2id policy".to_string(),
            ]));
        }

        Ok(trimmed.to_string())
    }

    /// Owner setup in Cedros Data uses argon2's default profile. Accept that
    /// exact profile only at the authenticated host-admin import boundary;
    /// successful password sign-in upgrades it through the existing rehash path.
    pub fn validate_host_admin_imported_hash(&self, hash: &str) -> Result<String, AuthError> {
        if let Ok(hash) = self.validate_imported_hash(hash) {
            return Ok(hash);
        }
        let trimmed = hash.trim();
        if trimmed.len() > 512 {
            return self.validate_imported_hash(hash);
        }
        let Ok(parsed) = PasswordHash::new(trimmed) else {
            return self.validate_imported_hash(hash);
        };
        if parsed.algorithm.as_str() == "argon2id"
            && parsed.version == Some(19)
            && parsed.params.get_decimal("m") == Some(19_456)
            && parsed.params.get_decimal("t") == Some(2)
            && parsed.params.get_decimal("p") == Some(1)
            && parsed.salt.is_some_and(|salt| salt.len() >= 16)
            && parsed.hash.is_some_and(|output| output.len() == 32)
        {
            return Ok(trimmed.to_string());
        }
        self.validate_imported_hash(hash)
    }

    /// Verify a password against a stored hash (timing-safe via Argon2).
    pub fn verify(&self, password: &str, hash: &str) -> bool {
        if !self.is_verifiable_input(password) || hash.len() > 512 {
            return false;
        }
        match PasswordHash::new(hash) {
            Ok(parsed) if hash_is_safe_to_verify(&parsed) => Argon2::default()
                .verify_password(password.as_bytes(), &parsed)
                .is_ok(),
            _ => false,
        }
    }

    pub fn needs_rehash(&self, hash: &str) -> bool {
        PasswordHash::new(hash)
            .map(|parsed| !hash_meets_policy(&parsed))
            .unwrap_or(true)
    }

    /// Constant-time dummy verification for unknown accounts, so login latency
    /// doesn't reveal whether an email exists (email-enumeration resistance).
    pub fn verify_dummy(&self, password: &str) {
        let _ = password_hasher().verify_password(
            password.as_bytes(),
            &PasswordHash::new(dummy_hash()).expect("dummy hash is valid"),
        );
    }
}

/// Precomputed public Argon2 verifier for `verify_dummy` timing parity.
fn dummy_hash() -> &'static str {
    // Public, non-account verifier. Avoid a second Argon2 pass on a cold process
    // or fresh Wasm instance. The policy test below detects parameter changes.
    "$argon2id$v=19$m=65536,t=3,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$qkpBeUSNgQ0ZzYsqmYiZ7z0s0wlL7ZZg/2JlTHjDu7A"
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_strong_passwords() {
        let s = PasswordService::default();
        assert!(s.validate("correct horse staple").is_ok());
        assert!(s.validate("a long passphrase").is_ok());
    }

    #[test]
    fn rejects_length_violations_without_composition_rules() {
        let s = PasswordService::default();
        assert!(s.validate("x7K#q2L").is_err());
        assert!(s.validate("x7K#q2Lm").is_ok());
        assert!(s.validate("🔐🔐🔐🔐🔐🔐🔐").is_err());
        assert!(s.validate("🔐🔐🔐🔐🔐🔐🔐🔐").is_ok());
        assert!(s.validate("lowercase is fine").is_ok());
        assert!(s.validate(&"a".repeat(MAX_PASSWORD_CHARS + 1)).is_err());
    }

    #[test]
    fn rejects_common_passwords_and_base_words() {
        let s = PasswordService::default();
        assert!(s.validate("Password123!").is_err());
        assert!(s.validate("PaSsWoRd123!").is_err()); // case-insensitive
        assert!(s.validate("Summer2024!").is_err()); // base word + suffix
    }

    #[test]
    fn hash_is_salted_and_verifies() {
        let s = PasswordService::default();
        let h1 = s.hash("correct horse staple").unwrap();
        let h2 = s.hash("correct horse staple").unwrap();
        assert_ne!(h1, h2, "random salt => distinct hashes");
        assert!(s.verify("correct horse staple", &h1));
        assert!(s.verify("correct horse staple", &h2));
        assert!(!s.verify("WrongPass1!", &h1));
    }

    #[test]
    fn validate_imported_hash_accepts_argon2id_phc() {
        let s = PasswordService::default();
        let hash = s.hash("correct horse staple").unwrap();

        let imported = s.validate_imported_hash(&format!(" {hash} ")).unwrap();

        assert_eq!(imported, hash);
        assert!(s.verify("correct horse staple", &imported));
        assert!(!s.needs_rehash(&imported));
    }

    #[test]
    fn validate_imported_hash_rejects_non_argon2id() {
        let s = PasswordService::default();

        assert!(s.validate_imported_hash("plain-text").is_err());
        assert!(s
            .validate_imported_hash("$argon2i$v=19$m=4096,t=3,p=1$c2FsdA$YmFk")
            .is_err());
        assert!(s
            .validate_imported_hash("$argon2id$v=19$m=19456,t=2,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI")
            .is_err());
        assert!(s
            .validate_imported_hash("$argon2id$v=19$m=131072,t=3,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI")
            .is_err());
    }

    #[test]
    fn host_admin_import_preserves_cedros_data_hash_and_requires_rehash() {
        let service = PasswordService::default();
        let salt = SaltString::generate(&mut OsRng);
        let original = Argon2::default()
            .hash_password(b"CorrectOwnerPassword1!", &salt)
            .unwrap()
            .to_string();
        assert!(service.validate_imported_hash(&original).is_err());
        let imported = service
            .validate_host_admin_imported_hash(&original)
            .unwrap();
        assert_eq!(imported, original);
        assert!(service.verify("CorrectOwnerPassword1!", &imported));
        assert!(!service.verify("WrongOwnerPassword1!", &imported));
        assert!(service.needs_rehash(&imported));
        let upgraded = service.hash("CorrectOwnerPassword1!").unwrap();
        assert!(!service.needs_rehash(&upgraded));
        assert!(service.validate_host_admin_imported_hash(&upgraded).is_ok());
    }

    #[test]
    fn host_admin_import_rejects_other_profiles_and_malformed_hashes() {
        let service = PasswordService::default();
        for hash in [
            "plain-text",
            "$argon2i$v=19$m=19456,t=2,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI",
            "$argon2id$v=19$m=4096,t=2,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI",
            "$argon2id$v=19$m=19456,t=1,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI",
            "$argon2id$v=19$m=19456,t=2,p=2$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI",
            "$argon2id$v=19$m=131072,t=3,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$gV9SD4sPu+Zu93DjlN8OmnRItm8wf7xlFBys90UusfI",
            "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$YmFk",
        ] {
            assert!(service.validate_host_admin_imported_hash(hash).is_err(), "accepted {hash}");
        }
    }

    #[test]
    fn verify_rejects_garbage_hash_without_panic() {
        assert!(!PasswordService::default().verify("x", "not-a-hash"));
    }

    #[test]
    fn verifier_rejects_oversized_input_before_argon2() {
        let service = PasswordService::default();
        assert!(service.is_verifiable_input(&"a".repeat(MAX_PASSWORD_CHARS)));
        assert!(!service.is_verifiable_input(&"a".repeat(MAX_PASSWORD_CHARS + 1)));
        assert!(!service.verify(&"a".repeat(MAX_PASSWORD_CHARS + 1), dummy_hash()));
    }

    #[test]
    fn verifier_rejects_untrusted_high_cost_phc_parameters() {
        let high_memory = "$argon2id$v=19$m=131072,t=3,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$qkpBeUSNgQ0ZzYsqmYiZ7z0s0wlL7ZZg/2JlTHjDu7A";
        let high_iterations = "$argon2id$v=19$m=65536,t=30,p=1$Y2Vkcm9zLWR1bW15LXNhbHQ$qkpBeUSNgQ0ZzYsqmYiZ7z0s0wlL7ZZg/2JlTHjDu7A";
        assert!(!PasswordService::default().verify("password", high_memory));
        assert!(!PasswordService::default().verify("password", high_iterations));
    }

    #[test]
    fn verify_dummy_never_panics() {
        let s = PasswordService::default();
        s.verify_dummy("");
        s.verify_dummy(&"a".repeat(1000));
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
