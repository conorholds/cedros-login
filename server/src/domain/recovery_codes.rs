use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

use crate::errors::AppError;

/// Hash a user recovery code for storage using Argon2id.
pub fn hash_recovery_code(code: &str) -> Result<String, AppError> {
    let normalized = normalize_recovery_code(code);
    let salt = SaltString::generate(&mut OsRng);

    Argon2::default()
        .hash_password(normalized.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Recovery code hashing failed: {e}")))
}

/// Verify a user recovery code against an Argon2id hash.
pub fn verify_recovery_code(code: &str, hash: &str) -> bool {
    let normalized = normalize_recovery_code(code);
    let parsed_hash = match PasswordHash::new(hash) {
        Ok(hash) => hash,
        Err(_) => return false,
    };

    Argon2::default()
        .verify_password(normalized.as_bytes(), &parsed_hash)
        .is_ok()
}

fn normalize_recovery_code(code: &str) -> String {
    code.to_uppercase().replace('-', "")
}

#[cfg(test)]
mod tests {
    use super::{hash_recovery_code, verify_recovery_code};

    #[test]
    fn recovery_code_hashes_are_salted() {
        let hash1 = hash_recovery_code("ABCD-1234").unwrap();
        let hash2 = hash_recovery_code("ABCD-1234").unwrap();

        assert_ne!(hash1, hash2);
        assert!(verify_recovery_code("ABCD-1234", &hash1));
        assert!(verify_recovery_code("ABCD-1234", &hash2));
    }

    #[test]
    fn recovery_code_verification_normalizes_input() {
        let hash = hash_recovery_code("ABCD-1234").unwrap();

        assert!(verify_recovery_code("ABCD-1234", &hash));
        assert!(verify_recovery_code("abcd-1234", &hash));
        assert!(verify_recovery_code("ABCD1234", &hash));
        assert!(!verify_recovery_code("WXYZ-5678", &hash));
    }
}
