//! Webhook callback implementation

use async_trait::async_trait;
use hmac::{Hmac, Mac};
use rand::Rng;
use reqwest::Client;
use serde_json::Value;
use sha2::Sha256;
use std::net::IpAddr;
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::{debug, error, warn};

use crate::callback::{AuthCallback, AuthCallbackPayload};
use crate::errors::AppError;

use super::types::{
    AuthWebhookData, LogoutWebhookData, WebhookConfig, WebhookData, WebhookEvent, WebhookPayload,
};

type HmacSha256 = Hmac<Sha256>;

/// Webhook callback that sends signed HTTP POST requests
pub struct WebhookCallback {
    config: WebhookConfig,
    client: Client,
    secret_valid: bool,
}

impl WebhookCallback {
    /// Create a new webhook callback with the given configuration
    ///
    /// # Security Warning
    /// This method logs warnings but does not fail for weak secrets.
    /// Use `try_new()` for strict validation.
    #[deprecated(note = "Use try_new() for strict secret validation")]
    pub fn new(config: WebhookConfig) -> Self {
        // SEC-008: Validate secret and fail closed on send.
        let secret_valid = match config.validate_secret() {
            Ok(()) => true,
            Err(e) => {
                tracing::error!(
                    error = %e,
                    "SECURITY WARNING: Webhook secret validation failed. \
                    Webhooks may be vulnerable to forgery attacks. \
                    Use a strong secret generated with: openssl rand -base64 32"
                );
                false
            }
        };

        if !secret_valid {
            tracing::error!(
                "WebhookCallback created with invalid secret; delivery will fail closed. \
                Use WebhookCallback::try_new() to validate at construction."
            );
        }

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_secs))
            .build()
            .unwrap_or_else(|e| {
                tracing::error!(
                    error = %e,
                    "Failed to build webhook HTTP client; falling back to defaults"
                );
                Client::new()
            });

        Self {
            config,
            client,
            secret_valid,
        }
    }

    /// Try to create a new webhook callback, returning an error if it fails
    ///
    /// SEC-008: Validates that the webhook secret meets minimum security requirements.
    pub fn try_new(config: WebhookConfig) -> Result<Self, AppError> {
        // SEC-008: Validate secret before allowing webhook creation
        config.validate_secret().map_err(AppError::Config)?;

        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_secs))
            .build()
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to create HTTP client: {}", e))
            })?;

        Ok(Self {
            config,
            client,
            secret_valid: true,
        })
    }

    /// Send a webhook with retries
    async fn send_webhook(&self, payload: &WebhookPayload) -> Result<Value, AppError> {
        if !self.secret_valid {
            return Err(AppError::Config(
                "Webhook secret validation failed. Generate with: openssl rand -base64 32"
                    .into(),
            ));
        }
        let body = serde_json::to_string(payload).map_err(|e| AppError::Internal(e.into()))?;

        let timestamp = payload.timestamp.to_string();
        let signed_payload = format!("{}.{}", timestamp, body);
        let signature = self.sign_payload(&signed_payload);

        let mut last_error = None;

        // SEC-006: Max backoff cap prevents total retry time exceeding request timeout
        const MAX_BACKOFF_MS: u64 = 10_000; // 10 seconds max per retry

        for attempt in 0..=self.config.retry_attempts {
            if attempt > 0 {
                // Exponential backoff with jitter: base * 2^(attempt-1) +/- 25%
                let base_delay_ms = 100u64 * (1 << (attempt - 1));
                let jitter_range = base_delay_ms / 4; // +/- 25%
                let jitter =
                    rand::thread_rng().gen_range(0..=jitter_range * 2) as i64 - jitter_range as i64;
                // Cap delay at MAX_BACKOFF_MS to prevent excessive total retry time
                let delay_ms = (base_delay_ms as i64 + jitter)
                    .max(50)
                    .min(MAX_BACKOFF_MS as i64) as u64;
                let delay = std::time::Duration::from_millis(delay_ms);
                tokio::time::sleep(delay).await;
                debug!(
                    "Retrying webhook (attempt {}, delay {}ms)",
                    attempt + 1,
                    delay_ms
                );
            }

            match self.send_request(&body, &signature, &timestamp).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    warn!("Webhook attempt {} failed: {}", attempt + 1, e);
                    last_error = Some(e);
                }
            }
        }

        // All retries exhausted
        error!(
            "Webhook failed after {} attempts",
            self.config.retry_attempts + 1
        );
        Err(last_error.unwrap_or_else(|| AppError::Internal(anyhow::anyhow!("Webhook failed"))))
    }

    /// Send a single webhook request
    async fn send_request(
        &self,
        body: &str,
        signature: &str,
        timestamp: &str,
    ) -> Result<Value, AppError> {
        self.validate_destination().await?;

        let response_fut = self
            .client
            .post(&self.config.url)
            .header("Content-Type", "application/json")
            .header("X-Cedros-Signature", signature)
            .header("X-Cedros-Timestamp", timestamp)
            .body(body.to_string())
            .send();

        let response = tokio::time::timeout(
            std::time::Duration::from_secs(self.config.timeout_secs),
            response_fut,
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Webhook request timed out after {}s",
                self.config.timeout_secs
            ))
        })?
        .map_err(|e| AppError::Internal(e.into()))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_body = tokio::time::timeout(
                std::time::Duration::from_secs(self.config.timeout_secs),
                response.text(),
            )
            .await
            .ok()
            .and_then(|r| r.ok())
            .unwrap_or_default();
            return Err(AppError::Internal(anyhow::anyhow!(
                "Webhook returned {}: {}",
                status,
                error_body
            )));
        }

        // Try to parse response body as JSON, default to empty object
        let response_body = tokio::time::timeout(
            std::time::Duration::from_secs(self.config.timeout_secs),
            response.text(),
        )
        .await
        .ok()
        .and_then(|r| r.ok())
        .unwrap_or_default();
        let callback_data: Value = serde_json::from_str(&response_body)
            .unwrap_or_else(|_| Value::Object(serde_json::Map::new()));

        Ok(callback_data)
    }

    async fn validate_destination(&self) -> Result<(), AppError> {
        const DNS_LOOKUP_TIMEOUT_SECS: u64 = 2;

        let url = url::Url::parse(&self.config.url)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Invalid webhook URL: {}", e)))?;

        if url.scheme() != "http" && url.scheme() != "https" {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Webhook URL must use http or https scheme"
            )));
        }

        let host = url
            .host()
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Webhook URL must have a host")))?;

        match host {
            url::Host::Ipv4(ip) => {
                if is_private_ip(IpAddr::V4(ip)) {
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Webhook URL cannot target private IP addresses"
                    )));
                }
            }
            url::Host::Ipv6(ip) => {
                if is_private_ip(IpAddr::V6(ip)) {
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Webhook URL cannot target private IP addresses"
                    )));
                }
            }
            url::Host::Domain(domain) => {
                if domain == "localhost"
                    || domain.ends_with(".local")
                    || domain.ends_with(".internal")
                {
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Webhook URL cannot target internal hostnames"
                    )));
                }

                let port = url.port_or_known_default().unwrap_or(443);
                let addrs = tokio::time::timeout(
                    std::time::Duration::from_secs(DNS_LOOKUP_TIMEOUT_SECS),
                    tokio::net::lookup_host((domain, port)),
                )
                .await
                .map_err(|_| AppError::Internal(anyhow::anyhow!("Webhook DNS lookup timed out")))?
                .map_err(|e| {
                    AppError::Internal(anyhow::anyhow!("Failed to resolve webhook URL: {}", e))
                })?;
                for addr in addrs {
                    if is_private_ip(addr.ip()) {
                        return Err(AppError::Internal(anyhow::anyhow!(
                            "Webhook URL resolves to private IP addresses"
                        )));
                    }
                }
            }
        }

        Ok(())
    }

    /// Sign the payload with HMAC-SHA256
    ///
    /// Note: HMAC-SHA256 accepts keys of any size, so new_from_slice only fails
    /// if the algorithm is invalid (which it isn't for Sha256). This unwrap is safe.
    pub fn sign_payload(&self, payload: &str) -> String {
        // SAFETY: HMAC-SHA256 accepts keys of any length, this cannot fail
        let mut mac = HmacSha256::new_from_slice(self.config.secret.as_bytes())
            .expect("HMAC-SHA256 accepts keys of any size");
        mac.update(payload.as_bytes());
        let result = mac.finalize();
        hex::encode(result.into_bytes())
    }

    /// Get current Unix timestamp
    fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            // SAFETY: SystemTime::now() is always after UNIX_EPOCH on any reasonable system
            .expect("System clock is before Unix epoch")
            .as_secs()
    }
}

fn is_private_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => {
            let octets = v4.octets();
            octets[0] == 10
                || (octets[0] == 172 && (16..=31).contains(&octets[1]))
                || (octets[0] == 192 && octets[1] == 168)
                || octets[0] == 127
                || (octets[0] == 169 && octets[1] == 254)
                || octets[0] == 0
                || (octets[0] == 100 && (octets[1] & 0b1100_0000) == 64)
                || (octets[0] == 192 && octets[1] == 0 && octets[2] == 0)
                || (octets[0] == 198 && (octets[1] == 18 || octets[1] == 19))
                || octets[0] >= 224
        }
        IpAddr::V6(v6) => {
            v6.is_loopback()
                || v6.is_unspecified()
                || v6.is_multicast()
                || v6.segments()[0] & 0xfe00 == 0xfc00
                || v6.segments()[0] & 0xffc0 == 0xfe80
        }
    }
}

#[async_trait]
impl AuthCallback for WebhookCallback {
    async fn on_authenticated(&self, payload: &AuthCallbackPayload) -> Result<Value, AppError> {
        let webhook_payload = WebhookPayload {
            event: WebhookEvent::UserAuthenticated,
            timestamp: Self::current_timestamp(),
            data: WebhookData::Auth(AuthWebhookData {
                user_id: payload.user.id.to_string(),
                email: payload.user.email.clone(),
                name: payload.user.name.clone(),
                wallet_address: payload.user.wallet_address.clone(),
                auth_method: payload.method.as_str().to_string(),
                is_new_user: payload.is_new_user,
                session_id: payload.session_id.clone(),
                ip_address: payload.ip_address.clone(),
                user_agent: payload.user_agent.clone(),
            }),
        };

        self.send_webhook(&webhook_payload).await
    }

    async fn on_registered(&self, payload: &AuthCallbackPayload) -> Result<Value, AppError> {
        let webhook_payload = WebhookPayload {
            event: WebhookEvent::UserRegistered,
            timestamp: Self::current_timestamp(),
            data: WebhookData::Auth(AuthWebhookData {
                user_id: payload.user.id.to_string(),
                email: payload.user.email.clone(),
                name: payload.user.name.clone(),
                wallet_address: payload.user.wallet_address.clone(),
                auth_method: payload.method.as_str().to_string(),
                is_new_user: payload.is_new_user,
                session_id: payload.session_id.clone(),
                ip_address: payload.ip_address.clone(),
                user_agent: payload.user_agent.clone(),
            }),
        };

        self.send_webhook(&webhook_payload).await
    }

    async fn on_logout(&self, user_id: &str) -> Result<(), AppError> {
        let webhook_payload = WebhookPayload {
            event: WebhookEvent::UserLogout,
            timestamp: Self::current_timestamp(),
            data: WebhookData::Logout(LogoutWebhookData {
                user_id: user_id.to_string(),
            }),
        };

        self.send_webhook(&webhook_payload).await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::callback::AuthCallback;

    fn config_with_url(url: &str) -> WebhookConfig {
        WebhookConfig {
            url: url.to_string(),
            secret: "a".repeat(32),
            timeout_secs: 1,
            retry_attempts: 0,
        }
    }

    #[tokio::test]
    async fn test_validate_destination_rejects_private_ip() {
        let callback = WebhookCallback::try_new(config_with_url("http://127.0.0.1:8080")).unwrap();
        assert!(callback.validate_destination().await.is_err());
    }

    #[tokio::test]
    async fn test_validate_destination_accepts_public_ip() {
        let callback =
            WebhookCallback::try_new(config_with_url("https://8.8.8.8/webhook")).unwrap();
        assert!(callback.validate_destination().await.is_ok());
    }

    #[tokio::test]
    #[allow(deprecated)]
    async fn test_new_fails_closed_on_invalid_secret() {
        let mut config = config_with_url("https://example.com/webhook");
        config.secret = "short".to_string();
        let callback = WebhookCallback::new(config);
        let err = callback.on_logout("user-123").await.unwrap_err().to_string();
        assert!(err.contains("Webhook secret validation failed"));
    }
}
