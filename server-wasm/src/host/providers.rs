//! Site-owned providers (host `providers` seam, granted by `providerAccess[]`).
//! The host owns provider selection, identity, and rate limits.
//!
//! Post-#2009 the call takes a leading `access-id` (the manifest grant). The
//! host returns a structured provider error; we keep its stable code/category in
//! logs while callers continue to expose only [`SeamError::code`].
use super::{to_json, Result, SeamError};
use crate::cedros::extension::providers;
use serde::{Deserialize, Serialize};

pub const EMAIL_ACCESS: &str = "cedros-login:email-provider";
pub const STORAGE_ACCESS: &str = "cedros-login:image-storage";
pub const EMAIL_MESSAGE_CONTRACT_VERSION: u8 = 1;

fn map_err(e: providers::HostError) -> SeamError {
    SeamError::Provider(format!("{}:{}: {}", e.category, e.code, e.message))
}

/// Low-level provider call: (access-id, provider kind, operation/scope, payload).
pub fn execute(
    access_id: &str,
    provider: &str,
    operation: &str,
    payload_json: &str,
) -> Result<String> {
    providers::execute(access_id, provider, operation, payload_json).map_err(map_err)
}

/// A transactional email rendered by cedros-login, sent via the site provider.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailMessage<'a> {
    pub to: &'a str,
    pub subject: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub html_body: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text_body: Option<&'a str>,
    /// Optional additive contract version. Hosts should ignore unknown fields.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub contract_version: Option<u8>,
    /// Stable outbox-derived identity for correlation/provider deduplication.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub idempotency_key: Option<&'a str>,
    /// One-based send attempt, safe for provider diagnostics.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attempt: Option<u32>,
    /// True when an earlier provider acceptance may not have been acknowledged.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duplicate_risk: Option<bool>,
    /// Host-issued token-email evidence preserved from the durable outbox row.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub essential_email_evidence: Option<&'a serde_json::Value>,
}

/// Optional provider acknowledgement returned by `email.send`.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct EmailAcceptance {
    pub provider_message_ref: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EmailProviderResponse {
    #[serde(default, alias = "messageId")]
    provider_message_ref: Option<String>,
}

/// Send transactional email through the site's email provider (scope `email.send`).
pub fn send_email(message: &EmailMessage) -> Result<EmailAcceptance> {
    let response = execute(EMAIL_ACCESS, "email", "email.send", &to_json(message)?)?;
    Ok(parse_email_acceptance(&response))
}

/// Old hosts returned an empty/opaque success string. Treat that as accepted
/// without a reference; parsing failure must not turn acceptance into a retry.
fn parse_email_acceptance(response: &str) -> EmailAcceptance {
    serde_json::from_str::<EmailProviderResponse>(response)
        .map(|value| EmailAcceptance {
            provider_message_ref: value.provider_message_ref,
        })
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn email_payload_is_camelcase_and_omits_empty_bodies() {
        let m = EmailMessage {
            to: "u@x.test",
            subject: "Verify",
            html_body: Some("<b>hi</b>"),
            text_body: None,
            contract_version: None,
            idempotency_key: None,
            attempt: None,
            duplicate_risk: None,
            essential_email_evidence: None,
        };
        let j = serde_json::to_value(&m).unwrap();
        assert_eq!(j["htmlBody"], "<b>hi</b>");
        assert!(j.get("textBody").is_none());
        assert!(j.get("contractVersion").is_none());
    }

    #[test]
    fn versioned_email_payload_carries_safe_delivery_context() {
        let m = EmailMessage {
            to: "u@x.test",
            subject: "Verify",
            html_body: None,
            text_body: Some("hello"),
            contract_version: Some(EMAIL_MESSAGE_CONTRACT_VERSION),
            idempotency_key: Some("cedros-login-outbox-018f94eb"),
            attempt: Some(2),
            duplicate_risk: Some(true),
            essential_email_evidence: Some(&serde_json::json!({"version":1,"reference":"r"})),
        };
        let j = serde_json::to_value(&m).unwrap();
        assert_eq!(j["contractVersion"], 1);
        assert_eq!(j["idempotencyKey"], "cedros-login-outbox-018f94eb");
        assert_eq!(j["attempt"], 2);
        assert_eq!(j["duplicateRisk"], true);
        assert_eq!(j["essentialEmailEvidence"]["version"], 1);
    }

    #[test]
    fn provider_acceptance_is_optional_for_legacy_hosts() {
        assert_eq!(parse_email_acceptance(""), EmailAcceptance::default());
        assert_eq!(
            parse_email_acceptance(r#"{"providerMessageRef":"pm-123"}"#),
            EmailAcceptance {
                provider_message_ref: Some("pm-123".into())
            }
        );
        assert_eq!(
            parse_email_acceptance(r#"{"messageId":"legacy-123"}"#),
            EmailAcceptance {
                provider_message_ref: Some("legacy-123".into())
            }
        );
    }

    #[test]
    fn provider_host_error_keeps_stable_context() {
        let err = map_err(providers::HostError {
            code: "cedros.provider.not_configured".into(),
            category: "provider_not_configured".into(),
            message: "no active email sending provider is configured".into(),
        });
        assert_eq!(err.code(), "provider_error");
        assert!(err.to_string().contains("provider_not_configured"));
        assert!(err.to_string().contains("cedros.provider.not_configured"));
    }
}
