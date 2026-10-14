//! TOTP (RFC 6238) MFA: secret generation, otpauth provisioning URI, and code
//! verification with replay protection. Ported from
//! `server/src/services/totp_service.rs` (SHA-1, 6 digits, 30s step, skew=1).
//! `now_unix` is passed in (from the host clock) so verification is testable.
use totp_rs::{Algorithm, Secret, TOTP};

use super::AuthError;

const ISSUER: &str = "Cedros";
const SKEW: u8 = 1;
const STEP: u64 = 30;
const DIGITS: usize = 6;

fn build(secret: &str, email: &str) -> Result<TOTP, AuthError> {
    let bytes = Secret::Encoded(secret.to_string())
        .to_bytes()
        .map_err(|_| AuthError::Validation(vec!["invalid TOTP secret".to_string()]))?;
    TOTP::new(
        Algorithm::SHA1,
        DIGITS,
        SKEW,
        STEP,
        bytes,
        Some(ISSUER.to_string()),
        email.to_string(),
    )
    .map_err(|e| AuthError::Crypto(format!("totp init: {e}")))
}

/// Generate a new base32-encoded TOTP secret.
pub fn generate_secret() -> String {
    Secret::generate_secret().to_encoded().to_string()
}

/// otpauth:// provisioning URI for QR-code display.
pub fn otpauth_uri(secret: &str, email: &str) -> Result<String, AuthError> {
    Ok(build(secret, email)?.get_url())
}

/// Verify a code at `now_unix` with replay protection. On success returns
/// the matched time step to persist; returns `None` for a wrong code or a replay
/// (time step <= the last used one).
pub fn verify(
    secret: &str,
    code: &str,
    email: &str,
    last_used_time_step: Option<i64>,
    now_unix: u64,
) -> Result<Option<i64>, AuthError> {
    let mut totp = build(secret, email)?;
    // Match the authenticator's step, not the verifier's wall-clock step.
    // A future code accepted through skew must remain spent when time advances.
    totp.skew = 0;
    if code.len() != DIGITS || !code.bytes().all(|byte| byte.is_ascii_digit()) {
        return Ok(None);
    }
    let current = now_unix / STEP;
    let mut matched = None;
    for step in current.saturating_sub(u64::from(SKEW))..=current + u64::from(SKEW) {
        if totp.check(code, step * STEP) {
            matched = Some(step as i64);
        }
    }
    Ok(matched.filter(|step| last_used_time_step.is_none_or(|last| *step > last)))
}

#[cfg(test)]
mod tests {
    use super::*;

    const NOW: u64 = 1_900_000_000;

    fn code_at(secret: &str, email: &str, time: u64) -> String {
        build(secret, email).unwrap().generate(time)
    }

    #[test]
    fn skew_window_codes_cannot_be_replayed_across_clock_boundaries() {
        let secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
        let email = "user@example.com";
        let make = |time| build(secret, email).unwrap().generate(time);
        let step = 60_000_000u64;
        for offset in [-1i64, 0, 1] {
            let generated = (step as i64 + offset) as u64;
            let code = make(generated * 30);
            let now = step * 30;
            let last = None;
            let spent = verify(secret, &code, email, last, now).unwrap();
            assert_eq!(spent, Some(generated as i64));
            for advance in 0..=2 {
                let now = (step + advance) * 30;
                let last = spent;
                assert_eq!(verify(secret, &code, email, last, now).unwrap(), None);
            }
        }
        for code in ["", "12345", "1234567", "１２３４５６", "abcdef"] {
            let code = code.to_string();
            let now = step * 30;
            let last = None;
            assert_eq!(verify(secret, &code, email, last, now).unwrap(), None);
        }
    }

    #[test]
    fn verifies_a_fresh_code_and_returns_step() {
        let secret = generate_secret();
        let code = code_at(&secret, "u@x.test", NOW);
        let step = verify(&secret, &code, "u@x.test", None, NOW).unwrap();
        assert_eq!(step, Some((NOW / STEP) as i64));
    }

    #[test]
    fn rejects_wrong_code() {
        let secret = generate_secret();
        assert_eq!(
            verify(&secret, "000000", "u@x.test", None, NOW).unwrap(),
            None
        );
    }

    #[test]
    fn rejects_replayed_step() {
        let secret = generate_secret();
        let code = code_at(&secret, "u@x.test", NOW);
        let used = (NOW / STEP) as i64;
        // Same step already used => rejected even though the code is otherwise valid.
        assert_eq!(
            verify(&secret, &code, "u@x.test", Some(used), NOW).unwrap(),
            None
        );
    }

    #[test]
    fn otpauth_uri_is_well_formed() {
        let secret = generate_secret();
        let uri = otpauth_uri(&secret, "u@x.test").unwrap();
        assert!(uri.starts_with("otpauth://totp/"));
        assert!(uri.contains("issuer=Cedros"));
    }
}
