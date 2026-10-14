//! Email normalization + validation, ported from the standalone server
//! (`normalize_email`, `is_valid_email`, `validate_email_ascii_local`).
//! NFKC+lowercase normalization and ASCII-local enforcement defend against
//! Unicode homograph attacks.
use unicode_normalization::UnicodeNormalization;

use super::AuthError;

/// NFKC-normalize then lowercase — the canonical stored form.
pub fn normalize_email(email: &str) -> String {
    email.nfkc().collect::<String>().to_lowercase()
}

/// Reject non-ASCII local parts (homograph protection). Domain handled by IDNA.
pub fn validate_ascii_local(email: &str) -> Result<(), AuthError> {
    if let Some(at) = email.rfind('@') {
        if !email[..at].is_ascii() {
            return Err(AuthError::Validation(vec![
                "Email local part must contain only ASCII characters".to_string(),
            ]));
        }
    }
    Ok(())
}

/// Structural email validation (length, single `@`, local/domain rules).
pub fn is_valid_email(email: &str) -> bool {
    if email.is_empty() || email.len() > 254 || email.contains(' ') {
        return false;
    }
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 {
        return false;
    }
    let (local, domain) = (parts[0], parts[1]);
    if local.is_empty()
        || local.len() > 64
        || local.starts_with('.')
        || local.ends_with('.')
        || local.contains("..")
    {
        return false;
    }
    if domain.is_empty() || domain.len() > 253 || !domain.contains('.') {
        return false;
    }
    if domain.starts_with('.')
        || domain.ends_with('.')
        || domain.starts_with('-')
        || domain.ends_with('-')
    {
        return false;
    }
    domain
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_to_lowercase() {
        assert_eq!(normalize_email("User@Example.COM"), "user@example.com");
    }

    #[test]
    fn accepts_valid_and_rejects_invalid() {
        assert!(is_valid_email("user@example.com"));
        assert!(is_valid_email("a.b-c@sub.example.co"));
        assert!(!is_valid_email("no-at-sign"));
        assert!(!is_valid_email("two@@example.com"));
        assert!(!is_valid_email("user@nodot"));
        assert!(!is_valid_email("user @example.com"));
        assert!(!is_valid_email(".lead@example.com"));
        assert!(!is_valid_email("dots..in@example.com"));
        assert!(!is_valid_email("user@-bad.com"));
    }

    #[test]
    fn rejects_non_ascii_local() {
        // Cyrillic 'а' in the local part must be rejected.
        assert!(validate_ascii_local("\u{0430}dmin@example.com").is_err());
        assert!(validate_ascii_local("admin@example.com").is_ok());
    }
}
