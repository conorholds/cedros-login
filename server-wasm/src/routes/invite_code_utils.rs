use rand::rngs::OsRng;
use rand::RngCore;

use super::{validation, RouteError};

pub(super) fn validate_window(
    starts: Option<&str>,
    expires: Option<&str>,
) -> Result<(), RouteError> {
    if let (Some(s), Some(e)) = (starts, expires) {
        if e <= s {
            return Err(validation("expiresAt must be after startsAt"));
        }
    }
    Ok(())
}

pub(super) fn normalize_code(code: &str) -> Result<String, RouteError> {
    let normalized = code.trim().to_ascii_uppercase();
    if !(4..=64).contains(&normalized.len()) {
        return Err(validation("Invite code must be 4-64 characters"));
    }
    if !normalized
        .bytes()
        .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
    {
        return Err(validation(
            "Invite code can only contain letters, numbers, hyphens, and underscores",
        ));
    }
    Ok(normalized)
}

pub(super) fn generate_invite_code() -> String {
    const ALPHABET: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let mut bytes = [0u8; 10];
    OsRng.fill_bytes(&mut bytes);
    bytes
        .iter()
        .map(|byte| ALPHABET[*byte as usize % ALPHABET.len()] as char)
        .collect()
}

pub(super) fn path_code_id(path: &str) -> Option<&str> {
    let id = path
        .strip_prefix("/admin/invite-codes/")?
        .split('/')
        .next()?;
    (!id.is_empty()).then_some(id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalize_uppercases_and_validates_charset() {
        assert_eq!(normalize_code(" ab-c1 ").unwrap(), "AB-C1");
        assert!(normalize_code("bad code").is_err());
        assert!(normalize_code("abc").is_err());
    }

    #[test]
    fn generated_code_has_expected_shape() {
        let code = generate_invite_code();
        assert_eq!(code.len(), 10);
        assert!(code
            .bytes()
            .all(|b| b.is_ascii_uppercase() || b.is_ascii_digit()));
    }

    #[test]
    fn window_must_be_ordered() {
        assert!(validate_window(None, None).is_ok());
        assert!(validate_window(Some("2026-06-01T00:00:00.000Z"), None).is_ok());
        assert!(validate_window(
            Some("2026-06-01T00:00:00.000Z"),
            Some("2026-06-02T00:00:00.000Z")
        )
        .is_ok());
        assert!(validate_window(
            Some("2026-06-02T00:00:00.000Z"),
            Some("2026-06-01T00:00:00.000Z")
        )
        .is_err());
    }

    #[test]
    fn path_id_extraction() {
        assert_eq!(path_code_id("/admin/invite-codes/abc"), Some("abc"));
        assert_eq!(path_code_id("/admin/invite-codes/abc/extra"), Some("abc"));
        assert_eq!(path_code_id("/admin/invite-codes/"), None);
        assert_eq!(path_code_id("/admin/invite-codes"), None);
    }
}
