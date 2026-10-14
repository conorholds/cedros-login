//! Email service implementations (providers)

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::sync::Arc;
use tokio::sync::RwLock;

use super::{Email, EmailDeliveryContext, EmailDeliveryReceipt, EmailService};
use crate::errors::AppError;

/// Default timeout for Postmark requests (seconds)
/// Increased from 10s to 20s to account for occasional email provider latency
const POSTMARK_TIMEOUT_SECS: u64 = 20;
/// Max number of emails retained in log-only service
const LOG_EMAIL_BUFFER_MAX: usize = 1000;

/// Sensitive patterns to redact from email bodies.
///
/// Each pattern should match query parameter or assignment patterns.
/// The redaction replaces values up to the next delimiter (whitespace, &, ", ', <, >).
const SENSITIVE_PATTERNS: &[&str] = &[
    "token=",
    "api_key=",
    "apikey=",
    "password=",
    "secret=",
    "code=",
    "key=",
    "auth=",
    "credential=",
    "access_token=",
    "refresh_token=",
];

/// Redact sensitive data from email bodies for safe logging.
///
/// Redacts values matching patterns in `SENSITIVE_PATTERNS`.
/// Truncates output to MAX_LEN characters for log safety.
fn redact_email_body(body: &str) -> String {
    const MAX_LEN: usize = 200;

    // Apply redaction for each sensitive pattern
    let mut result = body.to_string();
    for pattern in SENSITIVE_PATTERNS {
        result = redact_pattern(&result, pattern);
    }

    // Truncate if too long
    if result.len() > MAX_LEN {
        result.truncate(MAX_LEN);
        result.push_str("...(truncated)");
    }

    result
}

/// Redact all occurrences of a specific pattern=value.
fn redact_pattern(body: &str, pattern: &str) -> String {
    let mut redacted = String::with_capacity(body.len());
    let mut idx = 0;
    let body_lower = body.to_ascii_lowercase();

    while let Some(pos) = body_lower[idx..].find(pattern) {
        let start = idx + pos;
        redacted.push_str(&body[idx..start]);
        // Preserve original case of pattern in output
        redacted.push_str(&body[start..start + pattern.len()]);
        redacted.push_str("[REDACTED]");

        // Skip past the value
        let mut end = start + pattern.len();
        let bytes = body.as_bytes();
        while end < bytes.len() {
            let ch = bytes[end] as char;
            if ch.is_whitespace() || ch == '&' || ch == '"' || ch == '\'' || ch == '<' || ch == '>'
            {
                break;
            }
            end += 1;
        }
        idx = end;
    }

    redacted.push_str(&body[idx..]);
    redacted
}

/// Return coarse recipient context for logs without exposing the full address.
fn email_domain_for_log(email: &str) -> &str {
    email
        .rsplit_once('@')
        .map(|(_, domain)| domain)
        .filter(|domain| !domain.is_empty())
        .unwrap_or("unknown")
}

/// Log-based email service for development
#[derive(Debug, Clone, Default)]
pub struct LogEmailService {
    sent_emails: Arc<RwLock<Vec<Email>>>,
}

impl LogEmailService {
    pub fn new() -> Self {
        Self::default()
    }

    /// Get all sent emails (for testing)
    pub async fn get_sent_emails(&self) -> Vec<Email> {
        self.sent_emails.read().await.clone()
    }

    /// Clear sent emails (for testing)
    pub async fn clear(&self) {
        self.sent_emails.write().await.clear();
    }
}

#[async_trait]
impl EmailService for LogEmailService {
    async fn send(&self, email: Email) -> Result<(), AppError> {
        let safe_body = redact_email_body(&email.text_body);
        let recipient_domain = email_domain_for_log(&email.to);
        tracing::info!(
            recipient_domain = %recipient_domain,
            email_type = ?email.email_type,
            "Email sent (logged)"
        );
        tracing::debug!(body = %safe_body, "Email body");
        let mut sent = self.sent_emails.write().await;
        sent.push(email);
        if sent.len() > LOG_EMAIL_BUFFER_MAX {
            let overflow = sent.len() - LOG_EMAIL_BUFFER_MAX;
            sent.drain(0..overflow);
        }
        Ok(())
    }
}

/// Postmark API email service for production
#[derive(Debug, Clone)]
pub struct PostmarkEmailService {
    api_token: String,
    from_email: String,
    client: reqwest::Client,
}

#[derive(Debug, Serialize)]
struct PostmarkRequest {
    #[serde(rename = "From")]
    from: String,
    #[serde(rename = "To")]
    to: String,
    #[serde(rename = "Subject")]
    subject: String,
    #[serde(rename = "HtmlBody")]
    html_body: String,
    #[serde(rename = "TextBody")]
    text_body: String,
    #[serde(rename = "MessageStream")]
    message_stream: String,
    #[serde(rename = "Headers", skip_serializing_if = "Vec::is_empty")]
    headers: Vec<PostmarkHeader>,
    #[serde(rename = "Metadata", skip_serializing_if = "BTreeMap::is_empty")]
    metadata: BTreeMap<String, String>,
}

#[derive(Debug, Serialize)]
struct PostmarkHeader {
    #[serde(rename = "Name")]
    name: &'static str,
    #[serde(rename = "Value")]
    value: String,
}

#[derive(Debug, Deserialize)]
struct PostmarkResponse {
    #[serde(rename = "ErrorCode")]
    error_code: i32,
    #[serde(rename = "Message")]
    message: String,
    #[serde(rename = "MessageID", default)]
    message_id: Option<String>,
}

impl PostmarkEmailService {
    pub fn try_new(api_token: String, from_email: String) -> Result<Self, AppError> {
        let api_token = require_non_blank("POSTMARK_API_TOKEN", api_token)?;
        let from_email = require_non_blank("POSTMARK_FROM_EMAIL", from_email)?;
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(POSTMARK_TIMEOUT_SECS))
            .build()
            .map_err(|e| AppError::Internal(e.into()))?;
        Ok(Self {
            api_token,
            from_email,
            client,
        })
    }

    /// Compatibility constructor for callers that require an infallible API.
    /// Configuration paths should use [`Self::try_new`] so invalid provider
    /// settings can be returned to the operator.
    #[deprecated(note = "use PostmarkEmailService::try_new for validated configuration")]
    pub fn new(api_token: String, from_email: String) -> Self {
        Self::try_new(api_token.clone(), from_email.clone()).unwrap_or_else(|e| {
            tracing::error!(
                error = %e,
                "Failed to build Postmark HTTP client; falling back to defaults"
            );
            Self {
                api_token,
                from_email,
                client: reqwest::Client::new(),
            }
        })
    }
}

fn require_non_blank(name: &str, value: String) -> Result<String, AppError> {
    let value = value.trim().to_string();
    if value.is_empty() {
        Err(AppError::Config(format!("{name} must not be blank")))
    } else {
        Ok(value)
    }
}

#[async_trait]
impl EmailService for PostmarkEmailService {
    async fn send(&self, email: Email) -> Result<(), AppError> {
        self.send_to_postmark(email, None).await.map(|_| ())
    }

    async fn send_with_context(
        &self,
        email: Email,
        context: &EmailDeliveryContext,
    ) -> Result<EmailDeliveryReceipt, AppError> {
        self.send_to_postmark(email, Some(context)).await
    }
}

impl PostmarkEmailService {
    async fn send_to_postmark(
        &self,
        email: Email,
        context: Option<&EmailDeliveryContext>,
    ) -> Result<EmailDeliveryReceipt, AppError> {
        let recipient_domain = email_domain_for_log(&email.to).to_string();
        let email_type = email.email_type.clone();
        let request = build_postmark_request(&self.from_email, email, context);

        let response_fut = self
            .client
            .post("https://api.postmarkapp.com/email")
            .header("X-Postmark-Server-Token", &self.api_token)
            .header("Accept", "application/json")
            .header("Content-Type", "application/json")
            .json(&request)
            .send();

        let response = tokio::time::timeout(
            std::time::Duration::from_secs(POSTMARK_TIMEOUT_SECS),
            response_fut,
        )
        .await
        .map_err(|_| {
            tracing::warn!(
                timeout_secs = POSTMARK_TIMEOUT_SECS,
                "REL-002: Postmark request timed out"
            );
            AppError::Internal(anyhow::anyhow!(
                "Failed to send email: timed out after {POSTMARK_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to send email: {e}")))?;

        let status = response.status();
        let provider_response = parse_postmark_response(response).await;
        if !status.is_success() || provider_response.error_code != 0 {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Postmark error {}: {}",
                provider_response.error_code,
                provider_response.message
            )));
        }

        tracing::info!(
            recipient_domain = %recipient_domain,
            email_type = ?email_type,
            provider_message_id = provider_response.message_id.as_deref().unwrap_or("unavailable"),
            "Email sent via Postmark"
        );
        Ok(EmailDeliveryReceipt {
            provider_message_id: provider_response.message_id,
        })
    }
}

fn build_postmark_request(
    from_email: &str,
    email: Email,
    context: Option<&EmailDeliveryContext>,
) -> PostmarkRequest {
    let mut headers = Vec::new();
    let mut metadata = BTreeMap::new();
    if let Some(context) = context {
        headers.push(PostmarkHeader {
            name: "Message-ID",
            value: context.message_id_header(),
        });
        metadata.insert("cedros-delivery-id".into(), context.delivery_id.clone());
        metadata.insert(
            "cedros-delivery-contract".into(),
            context.contract_version.to_string(),
        );
    }
    PostmarkRequest {
        from: from_email.to_string(),
        to: email.to,
        subject: email.subject,
        html_body: email.html_body,
        text_body: email.text_body,
        message_stream: "outbound".to_string(),
        headers,
        metadata,
    }
}

async fn parse_postmark_response(response: reqwest::Response) -> PostmarkResponse {
    tokio::time::timeout(
        std::time::Duration::from_secs(POSTMARK_TIMEOUT_SECS),
        response.json::<PostmarkResponse>(),
    )
    .await
    .ok()
    .and_then(Result::ok)
    .unwrap_or(PostmarkResponse {
        error_code: -1,
        message: "Unknown or malformed response".to_string(),
        message_id: None,
    })
}

/// No-op email service (does nothing)
#[derive(Debug, Clone, Default)]
pub struct NoopEmailService;

impl NoopEmailService {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl EmailService for NoopEmailService {
    async fn send(&self, _email: Email) -> Result<(), AppError> {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_redact_email_body_token() {
        let body = "Click here: https://example.com/reset?token=secret123";
        let redacted = redact_email_body(body);
        assert!(redacted.contains("token=[REDACTED]"));
        assert!(!redacted.contains("secret123"));
    }

    #[test]
    fn test_redact_multiple_patterns() {
        let body = "api_key=abc123&password=hunter2&code=xyz789";
        let redacted = redact_email_body(body);
        assert!(redacted.contains("api_key=[REDACTED]"));
        assert!(redacted.contains("password=[REDACTED]"));
        assert!(redacted.contains("code=[REDACTED]"));
        assert!(!redacted.contains("abc123"));
        assert!(!redacted.contains("hunter2"));
        assert!(!redacted.contains("xyz789"));
    }

    #[test]
    fn test_redact_case_insensitive() {
        let body = "TOKEN=secret123&API_KEY=mykey";
        let redacted = redact_email_body(body);
        assert!(redacted.contains("[REDACTED]"));
        assert!(!redacted.contains("secret123"));
        assert!(!redacted.contains("mykey"));
    }

    #[test]
    fn test_redact_email_body_non_ascii() {
        let body = "café token=secret Ω";
        let redacted = redact_email_body(body);
        assert!(redacted.contains("token=[REDACTED]"));
    }

    #[test]
    fn test_redact_oauth_tokens() {
        let body = "access_token=at123&refresh_token=rt456";
        let redacted = redact_email_body(body);
        assert!(redacted.contains("access_token=[REDACTED]"));
        assert!(redacted.contains("refresh_token=[REDACTED]"));
        assert!(!redacted.contains("at123"));
        assert!(!redacted.contains("rt456"));
    }

    #[test]
    fn test_email_domain_for_log_omits_local_part() {
        assert_eq!(email_domain_for_log("person@example.com"), "example.com");
        assert_eq!(email_domain_for_log("invalid-address"), "unknown");
        assert_eq!(email_domain_for_log("person@"), "unknown");
    }

    #[test]
    fn postmark_context_adds_stable_correlation_without_claiming_idempotency() {
        let event_id = uuid::Uuid::parse_str("018f94eb-6d42-7a4e-bf3a-221fac6a9d12").unwrap();
        let context = EmailDeliveryContext::for_outbox(event_id, 2);
        let request = build_postmark_request(
            "sender@example.com",
            Email {
                to: "recipient@example.com".into(),
                subject: "Subject".into(),
                html_body: "<p>Body</p>".into(),
                text_body: "Body".into(),
                email_type: super::super::EmailType::PasswordReset,
            },
            Some(&context),
        );
        let json = serde_json::to_value(request).unwrap();

        assert_eq!(json["Headers"][0]["Name"], "Message-ID");
        assert_eq!(json["Metadata"]["cedros-delivery-id"], context.delivery_id);
        assert_eq!(json["Metadata"]["cedros-delivery-contract"], "1");
        assert!(json.get("IdempotencyKey").is_none());
    }

    #[test]
    fn postmark_acceptance_message_id_is_parsed_for_persistence() {
        let response: PostmarkResponse = serde_json::from_value(serde_json::json!({
            "ErrorCode": 0,
            "Message": "OK",
            "MessageID": "b7bc2f4a-e38e-4336-af7d-e6c392c2f817"
        }))
        .unwrap();

        assert_eq!(
            response.message_id.as_deref(),
            Some("b7bc2f4a-e38e-4336-af7d-e6c392c2f817")
        );
    }
}
