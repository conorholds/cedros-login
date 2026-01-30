//! Webhook signature verification utilities

use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::time::{SystemTime, UNIX_EPOCH};

type HmacSha256 = Hmac<Sha256>;

use super::types::MIN_WEBHOOK_SECRET_LEN;

/// Verify a webhook signature (for use by webhook receivers)
/// Verify a webhook signature for a pre-signed payload.
///
/// If you are using timestamped signatures (recommended), pass
/// `format!("{}.{}", timestamp, payload)` as the payload.
///
/// # Security
/// SEC-008: This function rejects empty secrets to prevent signature forgery.
/// A minimum secret length is enforced for security.
pub fn verify_signature(payload: &str, signature: &str, secret: &str) -> bool {
    // SEC-008: Reject empty or short secrets to prevent forgery
    if secret.is_empty() {
        tracing::warn!("Webhook signature verification rejected: secret is empty");
        return false;
    }
    if secret.len() < MIN_WEBHOOK_SECRET_LEN {
        tracing::warn!(
            secret_len = secret.len(),
            min_len = MIN_WEBHOOK_SECRET_LEN,
            "Webhook signature verification rejected: secret too short"
        );
        return false;
    }

    // HMAC-SHA256 accepts keys of any size, so this should never fail
    let Ok(mut mac) = HmacSha256::new_from_slice(secret.as_bytes()) else {
        return false;
    };
    mac.update(payload.as_bytes());

    let expected = hex::encode(mac.finalize().into_bytes());

    // Constant-time comparison to prevent timing attacks
    constant_time_eq(signature.as_bytes(), expected.as_bytes())
}

/// Verify a webhook signature with timestamp freshness check.
///
/// Returns false if the timestamp is invalid or older than max_age_secs.
#[allow(dead_code)]
pub fn verify_signature_with_timestamp(
    payload: &str,
    signature: &str,
    secret: &str,
    timestamp: &str,
    max_age_secs: u64,
) -> bool {
    let Ok(ts) = timestamp.parse::<u64>() else {
        return false;
    };
    let Ok(now) = SystemTime::now().duration_since(UNIX_EPOCH) else {
        return false;
    };
    if now.as_secs().saturating_sub(ts) > max_age_secs {
        return false;
    }

    let signed_payload = format!("{}.{}", timestamp, payload);
    verify_signature(&signed_payload, signature, secret)
}

/// Constant-time string comparison
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }

    let mut result = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        result |= x ^ y;
    }
    result == 0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::callback::webhook::{WebhookCallback, WebhookConfig};

    #[test]
    fn test_sign_and_verify() {
        // SEC-008: Secret must be at least MIN_WEBHOOK_SECRET_LEN chars
        let secret = "test-webhook-secret-that-is-long-enough-for-security";
        let payload = r#"{"event":"user_authenticated","timestamp":1234567890}"#;
        let timestamp = "1234567890";
        let signed_payload = format!("{}.{}", timestamp, payload);

        let config = WebhookConfig {
            url: "http://localhost:8080/webhook".to_string(),
            secret: secret.to_string(),
            timeout_secs: 10,
            retry_attempts: 2,
        };

        let callback = WebhookCallback::try_new(config).unwrap();
        let signature = callback.sign_payload(&signed_payload);

        assert!(verify_signature(&signed_payload, &signature, secret));
        assert!(!verify_signature(
            &signed_payload,
            "invalid-signature",
            secret
        ));
        assert!(!verify_signature("different-payload", &signature, secret));
    }

    #[test]
    fn test_constant_time_eq() {
        assert!(constant_time_eq(b"hello", b"hello"));
        assert!(!constant_time_eq(b"hello", b"world"));
        assert!(!constant_time_eq(b"hello", b"hello!"));
    }

    #[test]
    fn test_constant_time_eq_empty() {
        assert!(constant_time_eq(b"", b""));
        assert!(!constant_time_eq(b"", b"a"));
        assert!(!constant_time_eq(b"a", b""));
    }

    #[test]
    fn test_verify_signature_rejects_empty_secret() {
        // SEC-008: Empty secrets should be rejected to prevent forgery
        let payload = r#"{"event":"test"}"#;
        let secret = "";
        let timestamp = "123";
        let signed_payload = format!("{}.{}", timestamp, payload);

        // Sign with empty secret (this would work cryptographically, but is insecure)
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let signature = hex::encode(mac.finalize().into_bytes());

        // Verification should fail because empty secret is rejected
        assert!(!verify_signature(&signed_payload, &signature, secret));
    }

    #[test]
    fn test_verify_signature_rejects_short_secret() {
        // SEC-008: Short secrets should be rejected
        let payload = r#"{"event":"test"}"#;
        let secret = "too-short"; // Less than 32 chars
        let timestamp = "123";
        let signed_payload = format!("{}.{}", timestamp, payload);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let signature = hex::encode(mac.finalize().into_bytes());

        // Verification should fail because secret is too short
        assert!(!verify_signature(&signed_payload, &signature, secret));
    }

    #[test]
    fn test_verify_signature_different_secrets() {
        let payload = r#"{"event":"test"}"#;
        // SEC-008: Secrets must be at least MIN_WEBHOOK_SECRET_LEN chars
        let secret1 = "secret1-that-is-long-enough-for-security-testing";
        let secret2 = "secret2-that-is-also-long-enough-for-testing";
        let timestamp = "456";
        let signed_payload = format!("{}.{}", timestamp, payload);

        let mut mac = HmacSha256::new_from_slice(secret1.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let signature = hex::encode(mac.finalize().into_bytes());

        assert!(verify_signature(&signed_payload, &signature, secret1));
        assert!(!verify_signature(&signed_payload, &signature, secret2));
    }

    #[test]
    fn test_verify_signature_with_timestamp_valid() {
        let payload = r#"{"event":"test"}"#;
        // SEC-008: Secret must be at least MIN_WEBHOOK_SECRET_LEN chars
        let secret = "secret-that-is-long-enough-for-security-testing";
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let signed_payload = format!("{}.{}", now, payload);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let signature = hex::encode(mac.finalize().into_bytes());

        assert!(verify_signature_with_timestamp(
            payload,
            &signature,
            secret,
            &now.to_string(),
            60
        ));
    }

    #[test]
    fn test_verify_signature_with_timestamp_stale() {
        let payload = r#"{"event":"test"}"#;
        // SEC-008: Secret must be at least MIN_WEBHOOK_SECRET_LEN chars
        let secret = "secret-that-is-long-enough-for-security-testing";
        let stale = 1u64;
        let signed_payload = format!("{}.{}", stale, payload);

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(signed_payload.as_bytes());
        let signature = hex::encode(mac.finalize().into_bytes());

        assert!(!verify_signature_with_timestamp(
            payload,
            &signature,
            secret,
            &stale.to_string(),
            60
        ));
    }
}
