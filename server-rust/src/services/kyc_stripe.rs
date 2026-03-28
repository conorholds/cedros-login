//! Stripe Identity API client
//!
//! Lightweight HTTP client for the Stripe Identity VerificationSession API.
//! Handles session creation, retrieval, webhook signature verification, and
//! webhook event parsing.
//!
//! # Auth
//! All requests use HTTP Bearer auth with the Stripe secret key.
//!
//! # Webhook Verification
//! Follows the official Stripe pattern:
//! 1. Parse `t=` and `v1=` from the `Stripe-Signature` header.
//! 2. Construct signed payload: `"{timestamp}.{raw_body}"`.
//! 3. HMAC-SHA256 with the webhook signing secret.
//! 4. Compare hex-encoded result with the `v1` value using constant-time eq.

use std::collections::HashMap;

use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

const STRIPE_IDENTITY_BASE: &str = "https://api.stripe.com/v1/identity/verification_sessions";

// ---------------------------------------------------------------------------
// Public response types
// ---------------------------------------------------------------------------

/// A Stripe Identity VerificationSession object.
///
/// `status` values: `"requires_input"`, `"processing"`, `"verified"`, `"canceled"`.
#[derive(Debug, Deserialize, Serialize)]
pub struct StripeVerificationSession {
    /// Session ID, e.g. `"vs_..."`.
    pub id: String,
    /// Session status.
    pub status: String,
    /// Redirect URL presented to the user to complete verification.
    pub url: Option<String>,
    /// Client secret for front-end SDK flows.
    pub client_secret: Option<String>,
    /// Most recent error, if any.
    pub last_error: Option<StripeLastError>,
    /// Arbitrary metadata attached at creation time.
    pub metadata: Option<HashMap<String, String>>,
}

/// Error detail returned inside a VerificationSession.
#[derive(Debug, Deserialize, Serialize)]
pub struct StripeLastError {
    pub code: Option<String>,
    pub reason: Option<String>,
}

/// Top-level Stripe webhook event envelope.
#[derive(Debug, Deserialize)]
pub struct StripeWebhookEvent {
    #[serde(rename = "type")]
    pub event_type: String,
    pub data: StripeEventData,
}

/// The `data.object` wrapper inside a webhook event.
#[derive(Debug, Deserialize)]
pub struct StripeEventData {
    pub object: StripeVerificationSession,
}

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/// Errors produced by [`StripeIdentityClient`].
#[derive(Debug)]
pub enum StripeError {
    /// Transport-level failure (connection refused, timeout, etc.).
    Network(String),
    /// Stripe returned a non-2xx status with an error body.
    Api(String),
    /// Response body could not be deserialized.
    Parse(String),
}

impl std::fmt::Display for StripeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            StripeError::Network(s) => write!(f, "Stripe network error: {s}"),
            StripeError::Api(s) => write!(f, "Stripe API error: {s}"),
            StripeError::Parse(s) => write!(f, "Stripe parse error: {s}"),
        }
    }
}

impl std::error::Error for StripeError {}

// ---------------------------------------------------------------------------
// Internal Stripe error response shape
// ---------------------------------------------------------------------------

#[derive(Deserialize)]
struct StripeErrorBody {
    error: StripeErrorDetail,
}

#[derive(Deserialize)]
struct StripeErrorDetail {
    message: String,
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/// HTTP client for the Stripe Identity API.
///
/// Construct once and reuse; the inner `reqwest::Client` holds a connection pool.
pub struct StripeIdentityClient {
    client: reqwest::Client,
    api_key: String,
}

impl StripeIdentityClient {
    /// Create a new client with the given Stripe secret key.
    pub fn new(api_key: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            api_key,
        }
    }

    // -----------------------------------------------------------------------
    // API methods
    // -----------------------------------------------------------------------

    /// Create a Stripe Identity VerificationSession.
    ///
    /// # Arguments
    /// - `user_id` — stored in `metadata[user_id]` for correlation.
    /// - `return_url` — URL Stripe redirects the user to after the flow.
    /// - `document_types` — accepted document kinds: `"driving_license"`,
    ///   `"id_card"`, `"passport"`.
    /// - `require_selfie` — whether a matching selfie is required.
    ///
    /// # Errors
    /// Returns [`StripeError::Network`] on transport failure,
    /// [`StripeError::Api`] on non-2xx Stripe response,
    /// [`StripeError::Parse`] on deserialization failure.
    pub async fn create_session(
        &self,
        user_id: &str,
        return_url: &str,
        document_types: &[&str],
        require_selfie: bool,
    ) -> Result<StripeVerificationSession, StripeError> {
        let mut params = vec![
            ("type".to_string(), "document".to_string()),
            ("return_url".to_string(), return_url.to_string()),
            ("metadata[user_id]".to_string(), user_id.to_string()),
        ];

        for (i, doc_type) in document_types.iter().enumerate() {
            params.push((
                format!("options[document][allowed_types][{}]", i),
                doc_type.to_string(),
            ));
        }

        if require_selfie {
            params.push((
                "options[document][require_matching_selfie]".to_string(),
                "true".to_string(),
            ));
        }

        let resp = self
            .client
            .post(STRIPE_IDENTITY_BASE)
            .bearer_auth(&self.api_key)
            .form(&params)
            .send()
            .await
            .map_err(|e| StripeError::Network(e.to_string()))?;

        parse_response(resp).await
    }

    // -----------------------------------------------------------------------
    // Webhook helpers (stateless — no `&self` needed)
    // -----------------------------------------------------------------------

    /// Verify a Stripe webhook signature.
    ///
    /// Parses the `Stripe-Signature` header (format: `"t=<ts>,v1=<hex>,..."`),
    /// reconstructs the signed payload as `"{t}.{raw_body}"`, computes
    /// HMAC-SHA256 with `webhook_secret`, and compares using constant-time eq.
    ///
    /// Returns `true` only when the signature matches.
    /// Maximum age in seconds for a webhook event before it's rejected.
    /// Stripe recommends 5 minutes to prevent replay attacks.
    const WEBHOOK_TOLERANCE_SECS: i64 = 300;

    pub fn verify_webhook_signature(
        payload: &[u8],
        signature_header: &str,
        webhook_secret: &str,
    ) -> bool {
        let (timestamp, v1_sig) = match parse_stripe_signature_header(signature_header) {
            Some(pair) => pair,
            None => return false,
        };

        if webhook_secret.is_empty() {
            return false;
        }

        // Reject events older than tolerance window (replay attack mitigation)
        if let Ok(ts) = timestamp.parse::<i64>() {
            let now = chrono::Utc::now().timestamp();
            if (now - ts).abs() > Self::WEBHOOK_TOLERANCE_SECS {
                tracing::warn!(
                    timestamp = ts,
                    now = now,
                    "Rejecting KYC webhook: timestamp outside tolerance window"
                );
                return false;
            }
        } else {
            return false; // unparseable timestamp
        }

        let Ok(mut mac) = HmacSha256::new_from_slice(webhook_secret.as_bytes()) else {
            return false;
        };

        // Stripe signed payload: "{timestamp}.{raw_body}"
        mac.update(timestamp.as_bytes());
        mac.update(b".");
        mac.update(payload);

        let computed = hex::encode(mac.finalize().into_bytes());

        constant_time_eq(computed.as_bytes(), v1_sig.as_bytes())
    }

    /// Deserialize a raw webhook body into a [`StripeWebhookEvent`].
    ///
    /// Call [`verify_webhook_signature`](Self::verify_webhook_signature) before
    /// parsing to ensure authenticity.
    ///
    /// # Errors
    /// Returns [`StripeError::Parse`] if the JSON is malformed or missing fields.
    pub fn parse_webhook_event(payload: &[u8]) -> Result<StripeWebhookEvent, StripeError> {
        serde_json::from_slice(payload).map_err(|e| StripeError::Parse(e.to_string()))
    }
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/// Parse `Stripe-Signature` header into `(timestamp, v1_hex)`.
///
/// Format: `"t=1234567890,v1=abc123def456,..."`
/// Returns `None` if either part is missing.
fn parse_stripe_signature_header(header: &str) -> Option<(String, String)> {
    let mut timestamp = None;
    let mut v1_sig = None;

    for part in header.split(',') {
        let part = part.trim();
        if let Some(ts) = part.strip_prefix("t=") {
            timestamp = Some(ts.to_string());
        } else if let Some(sig) = part.strip_prefix("v1=") {
            // Take the first v1= value only
            if v1_sig.is_none() {
                v1_sig = Some(sig.to_string());
            }
        }
    }

    match (timestamp, v1_sig) {
        (Some(t), Some(v)) if !t.is_empty() && !v.is_empty() => Some((t, v)),
        _ => None,
    }
}

/// Parse a `reqwest::Response` into `T`, mapping Stripe error bodies to
/// [`StripeError::Api`].
async fn parse_response(resp: reqwest::Response) -> Result<StripeVerificationSession, StripeError> {
    let status = resp.status();

    if status.is_success() {
        resp.json::<StripeVerificationSession>()
            .await
            .map_err(|e| StripeError::Parse(e.to_string()))
    } else {
        // Best-effort parse of Stripe's standard error envelope
        let text = resp.text().await.unwrap_or_default();
        let message = serde_json::from_str::<StripeErrorBody>(&text)
            .map(|b| b.error.message)
            .unwrap_or_else(|_| format!("HTTP {status}: {text}"));
        Err(StripeError::Api(message))
    }
}

/// Constant-time byte slice comparison.
///
/// Returns `true` iff `a == b` in length and content, without early exit.
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // ---- webhook signature verification -----------------------------------

    fn make_signature(timestamp: &str, body: &[u8], secret: &str) -> String {
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(timestamp.as_bytes());
        mac.update(b".");
        mac.update(body);
        hex::encode(mac.finalize().into_bytes())
    }

    /// Return a current timestamp string for tests.
    fn now_ts() -> String {
        chrono::Utc::now().timestamp().to_string()
    }

    #[test]
    fn verify_webhook_signature_happy_path() {
        let secret = "whsec_test_secret_long_enough";
        let body = br#"{"type":"identity.verification_session.verified"}"#;
        let ts = now_ts();
        let sig = make_signature(&ts, body, secret);
        let header = format!("t={ts},v1={sig}");
        assert!(StripeIdentityClient::verify_webhook_signature(
            body, &header, secret
        ));
    }

    #[test]
    fn verify_webhook_signature_wrong_secret_rejected() {
        let secret = "whsec_correct_secret_long_enough";
        let body = b"payload";
        let ts = now_ts();
        let sig = make_signature(&ts, body, secret);
        let header = format!("t={ts},v1={sig}");
        assert!(!StripeIdentityClient::verify_webhook_signature(
            body,
            &header,
            "whsec_wrong_secret_long_enough"
        ));
    }

    #[test]
    fn verify_webhook_signature_tampered_payload_rejected() {
        let secret = "whsec_test_secret_long_enough";
        let body = b"original_payload";
        let ts = now_ts();
        let sig = make_signature(&ts, body, secret);
        let header = format!("t={ts},v1={sig}");
        assert!(!StripeIdentityClient::verify_webhook_signature(
            b"tampered_payload",
            &header,
            secret
        ));
    }

    #[test]
    fn verify_webhook_signature_empty_secret_rejected() {
        let body = b"payload";
        let ts = now_ts();
        let sig = make_signature(&ts, body, "");
        let header = format!("t={ts},v1={sig}");
        assert!(!StripeIdentityClient::verify_webhook_signature(
            body, &header, ""
        ));
    }

    #[test]
    fn verify_webhook_signature_stale_timestamp_rejected() {
        let secret = "whsec_test_secret_long_enough";
        let body = b"payload";
        let stale_ts = (chrono::Utc::now().timestamp() - 600).to_string(); // 10 min ago
        let sig = make_signature(&stale_ts, body, secret);
        let header = format!("t={stale_ts},v1={sig}");
        assert!(!StripeIdentityClient::verify_webhook_signature(
            body, &header, secret
        ));
    }

    #[test]
    fn verify_webhook_signature_missing_v1_rejected() {
        let header = "t=1700000004,v0=abcdef";
        assert!(!StripeIdentityClient::verify_webhook_signature(
            b"body", header, "secret"
        ));
    }

    #[test]
    fn verify_webhook_signature_missing_timestamp_rejected() {
        let header = "v1=abcdef1234567890";
        assert!(!StripeIdentityClient::verify_webhook_signature(
            b"body", header, "secret"
        ));
    }

    // ---- header parsing ---------------------------------------------------

    #[test]
    fn parse_header_with_multiple_v1_takes_first() {
        let header = "t=100,v1=aaa,v1=bbb";
        let (ts, v1) = parse_stripe_signature_header(header).unwrap();
        assert_eq!(ts, "100");
        assert_eq!(v1, "aaa");
    }

    #[test]
    fn parse_header_empty_returns_none() {
        assert!(parse_stripe_signature_header("").is_none());
    }

    // ---- parse_webhook_event ----------------------------------------------

    #[test]
    fn parse_webhook_event_happy_path() {
        let json = br#"{
            "type": "identity.verification_session.verified",
            "data": {
                "object": {
                    "id": "vs_123",
                    "status": "verified",
                    "url": null,
                    "client_secret": null,
                    "last_error": null,
                    "metadata": {"user_id": "u_abc"}
                }
            }
        }"#;
        let event = StripeIdentityClient::parse_webhook_event(json).unwrap();
        assert_eq!(event.event_type, "identity.verification_session.verified");
        assert_eq!(event.data.object.id, "vs_123");
        assert_eq!(event.data.object.status, "verified");
        assert_eq!(
            event
                .data
                .object
                .metadata
                .as_ref()
                .unwrap()
                .get("user_id")
                .unwrap(),
            "u_abc"
        );
    }

    #[test]
    fn parse_webhook_event_malformed_returns_parse_error() {
        let result = StripeIdentityClient::parse_webhook_event(b"not json");
        assert!(matches!(result, Err(StripeError::Parse(_))));
    }

    // ---- constant_time_eq -------------------------------------------------

    #[test]
    fn constant_time_eq_identical() {
        assert!(constant_time_eq(b"hello", b"hello"));
    }

    #[test]
    fn constant_time_eq_different_content() {
        assert!(!constant_time_eq(b"hello", b"world"));
    }

    #[test]
    fn constant_time_eq_different_lengths() {
        assert!(!constant_time_eq(b"hi", b"hi!"));
    }

    #[test]
    fn constant_time_eq_both_empty() {
        assert!(constant_time_eq(b"", b""));
    }
}
