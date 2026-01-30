//! Webhook payload types and configuration

use serde::{Deserialize, Serialize};
use std::net::IpAddr;
use url::Url;

/// Webhook event types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WebhookEvent {
    UserAuthenticated,
    UserRegistered,
    UserLogout,
}

/// Webhook payload sent to the target URL
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebhookPayload {
    /// Event type
    pub event: WebhookEvent,
    /// Unix timestamp when the event occurred
    pub timestamp: u64,
    /// Event-specific data
    pub data: WebhookData,
}

/// Event-specific data in the webhook payload
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum WebhookData {
    Auth(AuthWebhookData),
    Logout(LogoutWebhookData),
}

/// Data for authentication events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthWebhookData {
    pub user_id: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub wallet_address: Option<String>,
    pub auth_method: String,
    pub is_new_user: bool,
    pub session_id: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

/// Data for logout events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogoutWebhookData {
    pub user_id: String,
}

/// Configuration for webhook callbacks
#[derive(Debug, Clone)]
pub struct WebhookConfig {
    /// Target URL to send webhooks to
    pub url: String,
    /// Secret for HMAC-SHA256 signature
    pub secret: String,
    /// Request timeout in seconds
    pub timeout_secs: u64,
    /// Number of retry attempts on failure
    pub retry_attempts: u32,
}

impl Default for WebhookConfig {
    fn default() -> Self {
        Self {
            url: String::new(),
            secret: String::new(),
            timeout_secs: 10,
            // REL-007: Increased from 2 to 3 for better reliability during transient failures
            retry_attempts: 3,
        }
    }
}

/// Minimum secret length for secure HMAC-SHA256 signatures
/// 32 bytes = 256 bits of entropy when using high-quality random bytes
pub const MIN_WEBHOOK_SECRET_LEN: usize = 32;

impl WebhookConfig {
    /// SEC-008: Validate the webhook secret for minimum security requirements.
    ///
    /// Returns an error if:
    /// - Secret is empty
    /// - Secret is shorter than MIN_WEBHOOK_SECRET_LEN (32 chars)
    ///
    /// A strong secret should be generated with:
    /// `openssl rand -base64 32` or equivalent
    pub fn validate_secret(&self) -> Result<(), String> {
        if self.secret.is_empty() {
            return Err(
                "Webhook secret cannot be empty. Generate with: openssl rand -base64 32"
                    .to_string(),
            );
        }

        if self.secret.len() < MIN_WEBHOOK_SECRET_LEN {
            return Err(format!(
                "Webhook secret too short: {} chars (minimum {}). Generate with: openssl rand -base64 32",
                self.secret.len(),
                MIN_WEBHOOK_SECRET_LEN
            ));
        }

        Ok(())
    }

    /// S-17: Validate the webhook URL for basic security checks.
    ///
    /// Returns an error if:
    /// - URL is not valid
    /// - URL uses a non-HTTPS scheme (in production)
    /// - URL hostname resolves to a private/internal IP address
    ///
    /// Note: This does not fully prevent DNS rebinding attacks, as DNS can change
    /// between validation and request time. For full protection, use network-level
    /// allowlisting or a service mesh.
    pub fn validate_url(&self, allow_insecure: bool) -> Result<(), String> {
        if self.url.is_empty() {
            return Err("Webhook URL cannot be empty".to_string());
        }

        let parsed = Url::parse(&self.url).map_err(|e| format!("Invalid webhook URL: {}", e))?;

        // Require HTTPS unless explicitly allowed (for development)
        if !allow_insecure && parsed.scheme() != "https" {
            return Err("Webhook URL must use HTTPS in production".to_string());
        }

        // Check for obvious private/internal hostnames
        let host = parsed.host_str().ok_or("Webhook URL must have a host")?;

        // Reject localhost and internal hostnames
        if host == "localhost" || host.ends_with(".local") || host.ends_with(".internal") {
            return Err(format!(
                "Webhook URL hostname '{}' appears to be internal. \
                Use a public hostname or IP address.",
                host
            ));
        }

        // Check if hostname is an IP address and reject private ranges
        if let Ok(ip) = host.parse::<IpAddr>() {
            if Self::is_private_ip(&ip) {
                return Err(format!(
                    "Webhook URL IP '{}' is in a private range. \
                    Use a public IP address.",
                    ip
                ));
            }
        }

        Ok(())
    }

    /// Check if an IP address is in a private/internal range.
    fn is_private_ip(ip: &IpAddr) -> bool {
        match ip {
            IpAddr::V4(v4) => {
                v4.is_private()
                    || v4.is_loopback()
                    || v4.is_link_local()
                    || v4.is_broadcast()
                    || v4.is_documentation()
                    || v4.octets()[0] == 0
                    // 100.64.0.0/10 (Carrier-grade NAT)
                    || (v4.octets()[0] == 100 && (v4.octets()[1] & 0xC0) == 64)
                    // 192.0.0.0/24 (IETF protocol assignments)
                    || (v4.octets()[0] == 192 && v4.octets()[1] == 0 && v4.octets()[2] == 0)
                    // 198.18.0.0/15 (benchmarking)
                    || (v4.octets()[0] == 198 && (v4.octets()[1] == 18 || v4.octets()[1] == 19))
                    // 224.0.0.0/4 (multicast) and 240.0.0.0/4 (reserved)
                    || v4.octets()[0] >= 224
            }
            IpAddr::V6(v6) => {
                v6.is_loopback()
                    || v6.is_unspecified()
                    || v6.is_multicast()
                    // Unique local addresses (fc00::/7)
                    || ((v6.segments()[0] & 0xfe00) == 0xfc00)
                    // Link-local addresses (fe80::/10)
                    || ((v6.segments()[0] & 0xffc0) == 0xfe80)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_webhook_payload_serialization() {
        let payload = WebhookPayload {
            event: WebhookEvent::UserAuthenticated,
            timestamp: 1234567890,
            data: WebhookData::Auth(AuthWebhookData {
                user_id: "user-123".to_string(),
                email: Some("test@example.com".to_string()),
                name: Some("Test User".to_string()),
                wallet_address: None,
                auth_method: "email".to_string(),
                is_new_user: false,
                session_id: "session-456".to_string(),
                ip_address: Some("127.0.0.1".to_string()),
                user_agent: Some("Mozilla/5.0".to_string()),
            }),
        };

        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("user_authenticated"));
        assert!(json.contains("test@example.com"));
    }

    #[test]
    fn test_logout_payload_serialization() {
        let payload = WebhookPayload {
            event: WebhookEvent::UserLogout,
            timestamp: 1234567890,
            data: WebhookData::Logout(LogoutWebhookData {
                user_id: "user-123".to_string(),
            }),
        };

        let json = serde_json::to_string(&payload).unwrap();
        assert!(json.contains("user_logout"));
        assert!(json.contains("user-123"));
    }

    #[test]
    fn test_webhook_event_serialization() {
        let auth = serde_json::to_string(&WebhookEvent::UserAuthenticated).unwrap();
        assert_eq!(auth, "\"user_authenticated\"");

        let register = serde_json::to_string(&WebhookEvent::UserRegistered).unwrap();
        assert_eq!(register, "\"user_registered\"");

        let logout = serde_json::to_string(&WebhookEvent::UserLogout).unwrap();
        assert_eq!(logout, "\"user_logout\"");
    }

    #[test]
    fn test_auth_webhook_data_with_wallet() {
        let data = AuthWebhookData {
            user_id: "user-123".to_string(),
            email: None,
            name: None,
            wallet_address: Some("SoLaNaWaLlEtAdDrEsS123456789".to_string()),
            auth_method: "solana".to_string(),
            is_new_user: true,
            session_id: "session-789".to_string(),
            ip_address: None,
            user_agent: None,
        };

        let json = serde_json::to_string(&data).unwrap();
        assert!(json.contains("SoLaNaWaLlEtAdDrEsS123456789"));
        assert!(json.contains("\"auth_method\":\"solana\""));
        assert!(json.contains("\"is_new_user\":true"));
    }

    #[test]
    fn test_webhook_payload_deserialization() {
        let json = r#"{
            "event": "user_authenticated",
            "timestamp": 1702400000,
            "data": {
                "user_id": "123",
                "email": "test@example.com",
                "name": null,
                "wallet_address": null,
                "auth_method": "email",
                "is_new_user": false,
                "session_id": "sess-456",
                "ip_address": "10.0.0.1",
                "user_agent": "TestAgent"
            }
        }"#;

        let payload: WebhookPayload = serde_json::from_str(json).unwrap();
        assert!(matches!(payload.event, WebhookEvent::UserAuthenticated));
        assert_eq!(payload.timestamp, 1702400000);
    }

    #[test]
    fn test_webhook_config_creation() {
        let config = WebhookConfig {
            url: "https://example.com/webhook".to_string(),
            secret: "super-secret".to_string(),
            timeout_secs: 30,
            retry_attempts: 5,
        };

        assert_eq!(config.url, "https://example.com/webhook");
        assert_eq!(config.secret, "super-secret");
        assert_eq!(config.timeout_secs, 30);
        assert_eq!(config.retry_attempts, 5);
    }

    // S-17: URL validation tests
    #[test]
    fn test_validate_url_accepts_https() {
        let config = WebhookConfig {
            url: "https://api.example.com/webhook".to_string(),
            ..Default::default()
        };
        assert!(config.validate_url(false).is_ok());
    }

    #[test]
    fn test_validate_url_rejects_http_in_production() {
        let config = WebhookConfig {
            url: "http://api.example.com/webhook".to_string(),
            ..Default::default()
        };
        assert!(config.validate_url(false).is_err());
        assert!(config.validate_url(true).is_ok()); // OK with allow_insecure
    }

    #[test]
    fn test_validate_url_rejects_localhost() {
        let config = WebhookConfig {
            url: "https://localhost/webhook".to_string(),
            ..Default::default()
        };
        let err = config.validate_url(false).unwrap_err();
        assert!(err.contains("internal"));
    }

    #[test]
    fn test_validate_url_rejects_private_ipv4() {
        let cases = [
            "https://192.168.1.1/webhook", // Private class C
            "https://10.0.0.1/webhook",    // Private class A
            "https://172.16.0.1/webhook",  // Private class B
            "https://127.0.0.1/webhook",   // Loopback
            "https://169.254.1.1/webhook", // Link-local
            "https://0.0.0.0/webhook",     // Current network
            "https://100.64.0.1/webhook",  // Carrier-grade NAT
            "https://192.0.0.1/webhook",   // IETF protocol assignments
            "https://198.18.0.1/webhook",  // Benchmarking
            "https://224.0.0.1/webhook",   // Multicast/reserved
        ];

        for url in cases {
            let config = WebhookConfig {
                url: url.to_string(),
                ..Default::default()
            };
            let result = config.validate_url(false);
            assert!(result.is_err(), "Expected {} to be rejected", url);
        }
    }

    #[test]
    fn test_validate_url_rejects_internal_hostnames() {
        let cases = [
            "https://server.local/webhook",
            "https://api.internal/webhook",
        ];

        for url in cases {
            let config = WebhookConfig {
                url: url.to_string(),
                ..Default::default()
            };
            let result = config.validate_url(false);
            assert!(result.is_err(), "Expected {} to be rejected", url);
        }
    }

    #[test]
    fn test_validate_url_accepts_public_ip() {
        let config = WebhookConfig {
            url: "https://8.8.8.8/webhook".to_string(),
            ..Default::default()
        };
        assert!(config.validate_url(false).is_ok());
    }
}
