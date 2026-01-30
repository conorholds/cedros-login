//! Apple Sign-In ID token verification service
//!
//! # Security Considerations
//!
//! This service verifies Apple ID tokens using Apple's public keys (JWKS).
//! Apple tokens are RS256-signed JWTs that must be verified against
//! Apple's `https://appleid.apple.com/auth/keys` endpoint.
//!
//! ## Token Verification
//!
//! - Fetches and caches Apple's public keys from their JWKS endpoint
//! - Verifies JWT signatures locally using cached keys
//! - Validates issuer, audience, and expiration
//! - Email may or may not be present (user can choose to hide it)
//!
//! ## Important Notes
//!
//! - Apple only provides name/email on FIRST sign-in; subsequent logins omit them
//! - Client must store and forward name from the authorization response
//! - Apple's `sub` is the stable user identifier (never changes)
//!
//! See: <https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user>
//!
//! ## Resilience (SVC-1)
//!
//! This service implements a circuit breaker pattern for JWKS fetching:
//! - Opens after 3 consecutive failures
//! - Stays open for 60 seconds before retrying
//! - Falls back to cached keys (up to 24 hours old) during outages

use super::circuit_breaker::CircuitBreaker;
use crate::config::AppleConfig;
use crate::errors::AppError;
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::jwk::{Jwk, JwkSet};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Apple ID token claims
#[derive(Debug, Clone, Deserialize)]
pub struct AppleTokenClaims {
    /// Subject (Apple user ID) - stable identifier
    pub sub: String,
    /// Email address (may be nil if user hides it)
    pub email: Option<String>,
    /// Email verified flag
    pub email_verified: Option<String>, // Apple returns "true"/"false" as string
    /// Audience (should match our client ID)
    pub aud: String,
    /// Issuer
    pub iss: String,
    /// Expiration time (Unix timestamp)
    pub exp: i64,
    /// Real user status (0 = unsupported, 1 = unknown, 2 = real)
    pub real_user_status: Option<i64>,
}

impl AppleTokenClaims {
    /// Check if email is verified (handles Apple's string-based boolean)
    pub fn is_email_verified(&self) -> bool {
        self.email_verified.as_deref() == Some("true")
    }

    /// Check if the user is likely a real person based on Apple's anti-fraud analysis.
    ///
    /// Apple provides `real_user_status`:
    /// - 0: Unsupported (device doesn't support this feature)
    /// - 1: Unknown (system couldn't determine if user is real - potential bot)
    /// - 2: LikelyReal (user appears to be a real person)
    /// - None: Field not present (older Apple accounts)
    ///
    /// Returns true if status is 0, 2, or None (fail-open for compatibility).
    /// Returns false only if status is 1 (unknown/potential bot).
    pub fn is_likely_real(&self) -> bool {
        match self.real_user_status {
            Some(1) => false, // Unknown - potential bot
            _ => true,        // 0 (unsupported), 2 (real), or None
        }
    }
}

const APPLE_API_TIMEOUT_SECS: u64 = 5;
const APPLE_JWKS_URL: &str = "https://appleid.apple.com/auth/keys";
const APPLE_JWKS_CACHE_TTL_SECS: u64 = 3600;
const APPLE_ISSUER: &str = "https://appleid.apple.com";

/// Apple Sign-In service for verifying ID tokens
#[derive(Clone)]
pub struct AppleService {
    client_id: Option<String>,
    team_id: Option<String>,
    http_client: reqwest::Client,
    jwks_cache: Arc<RwLock<Option<JwksCache>>>,
    circuit_breaker: Arc<RwLock<CircuitBreaker>>,
}

/// SVC-4: JwkSet wrapped in Arc to avoid cloning on each cache hit
#[derive(Debug, Clone)]
struct JwksCache {
    keys: Arc<JwkSet>,
    expires_at: Instant,
    /// When keys were fetched (for circuit breaker fallback TTL)
    fetched_at: Instant,
}

impl AppleService {
    /// Create a new Apple service from config
    pub fn new(config: &AppleConfig) -> Self {
        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(APPLE_API_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|e| {
                tracing::error!(error = %e, "Failed to build Apple HTTP client; falling back to defaults");
                reqwest::Client::new()
            });

        Self {
            client_id: config.client_id.clone(),
            team_id: config.team_id.clone(),
            http_client,
            jwks_cache: Arc::new(RwLock::new(None)),
            circuit_breaker: Arc::new(RwLock::new(CircuitBreaker::new("apple_jwks"))),
        }
    }

    async fn fetch_jwks(&self) -> Result<JwkSet, AppError> {
        let response = tokio::time::timeout(
            std::time::Duration::from_secs(APPLE_API_TIMEOUT_SECS),
            self.http_client.get(APPLE_JWKS_URL).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to fetch Apple JWKS: request timed out after {}s",
                APPLE_API_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch Apple JWKS: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Failed to fetch Apple JWKS: {}",
                response.status()
            )));
        }

        tokio::time::timeout(
            std::time::Duration::from_secs(APPLE_API_TIMEOUT_SECS),
            async move { response.json::<JwkSet>().await },
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to parse Apple JWKS: request timed out after {}s",
                APPLE_API_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Apple JWKS: {}", e)))
    }

    async fn get_jwks(&self) -> Result<Arc<JwkSet>, AppError> {
        // Fast path: check if cache is still valid (not expired)
        {
            let cache = self.jwks_cache.read().await;
            if let Some(cached) = cache.as_ref() {
                if Instant::now() < cached.expires_at {
                    // SVC-4: Arc::clone is cheap pointer copy vs deep JwkSet clone
                    return Ok(Arc::clone(&cached.keys));
                }
            }
        }

        // Cache expired or missing - check circuit breaker
        let mut cb = self.circuit_breaker.write().await;
        let should_fetch = cb.should_allow_request();

        // Get current cache state for fallback
        let stale_cache = {
            let cache = self.jwks_cache.read().await;
            cache.clone()
        };

        if !should_fetch {
            // Circuit is open - try to serve stale cache
            if let Some(cached) = stale_cache {
                if cb.is_fallback_valid(cached.fetched_at) {
                    tracing::debug!(
                        service = "apple_jwks",
                        age_secs = cached.fetched_at.elapsed().as_secs(),
                        "Serving stale JWKS (circuit open)"
                    );
                    return Ok(Arc::clone(&cached.keys));
                }
            }
            return Err(AppError::ServiceUnavailable(
                "Apple JWKS service temporarily unavailable".into(),
            ));
        }

        // Release circuit breaker lock before network call
        drop(cb);

        // Attempt to fetch fresh keys
        match self.fetch_jwks().await {
            Ok(jwks) => {
                let jwks = Arc::new(jwks);
                let now = Instant::now();

                // Update cache
                {
                    let mut cache = self.jwks_cache.write().await;
                    *cache = Some(JwksCache {
                        keys: Arc::clone(&jwks),
                        expires_at: now + Duration::from_secs(APPLE_JWKS_CACHE_TTL_SECS),
                        fetched_at: now,
                    });
                }

                // Record success
                self.circuit_breaker.write().await.record_success();
                Ok(jwks)
            }
            Err(e) => {
                // Record failure
                self.circuit_breaker.write().await.record_failure();

                // Try to serve stale cache as fallback
                let cb = self.circuit_breaker.read().await;
                if let Some(cached) = stale_cache {
                    if cb.is_fallback_valid(cached.fetched_at) {
                        tracing::warn!(
                            service = "apple_jwks",
                            error = %e,
                            age_secs = cached.fetched_at.elapsed().as_secs(),
                            "JWKS fetch failed, serving stale cache"
                        );
                        return Ok(Arc::clone(&cached.keys));
                    }
                }

                // No valid fallback - propagate error
                Err(e)
            }
        }
    }

    fn extract_kid(&self, id_token: &str) -> Result<String, AppError> {
        let header = decode_header(id_token).map_err(|_| AppError::InvalidToken)?;
        header.kid.ok_or(AppError::InvalidToken)
    }

    fn select_jwk<'a>(&self, jwks: &'a JwkSet, kid: &str) -> Option<&'a Jwk> {
        jwks.keys
            .iter()
            .find(|jwk| jwk.common.key_id.as_deref() == Some(kid))
    }

    fn select_jwk_with_fallback<'a>(
        &self,
        cached: &'a JwkSet,
        fresh: &'a JwkSet,
        kid: &str,
    ) -> Option<&'a Jwk> {
        self.select_jwk(cached, kid)
            .or_else(|| self.select_jwk(fresh, kid))
    }

    /// Verify an Apple ID token and return the claims
    ///
    /// This verifies JWT signatures locally using Apple's JWKS.
    pub async fn verify_id_token(&self, id_token: &str) -> Result<AppleTokenClaims, AppError> {
        let client_id = self
            .client_id
            .as_ref()
            .ok_or_else(|| AppError::Config("Apple client ID not configured".into()))?;

        // team_id is validated at config time, but check here too
        if self.team_id.is_none() {
            return Err(AppError::Config("Apple team ID not configured".into()));
        }

        let kid = self.extract_kid(id_token)?;
        let jwks = self.get_jwks().await?;

        let decoding_key = if let Some(jwk) = self.select_jwk(&jwks, &kid) {
            DecodingKey::from_jwk(jwk).map_err(|_| AppError::InvalidToken)?
        } else {
            // Key not in cache - fetch fresh and record with circuit breaker
            let fresh = Arc::new(self.fetch_jwks().await?);
            let now = Instant::now();
            {
                let mut cache = self.jwks_cache.write().await;
                *cache = Some(JwksCache {
                    keys: Arc::clone(&fresh),
                    expires_at: now + Duration::from_secs(APPLE_JWKS_CACHE_TTL_SECS),
                    fetched_at: now,
                });
            }
            self.circuit_breaker.write().await.record_success();
            let jwk = self
                .select_jwk_with_fallback(&jwks, &fresh, &kid)
                .ok_or(AppError::InvalidToken)?;
            DecodingKey::from_jwk(jwk).map_err(|_| AppError::InvalidToken)?
        };

        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_audience(&[client_id.as_str()]);
        validation.set_issuer(&[APPLE_ISSUER]);

        let token_data =
            decode::<AppleTokenClaims>(id_token, &decoding_key, &validation).map_err(|err| {
                match err.kind() {
                    ErrorKind::ExpiredSignature => AppError::TokenExpired,
                    _ => AppError::InvalidToken,
                }
            })?;

        Ok(token_data.claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine as _;

    #[test]
    fn test_apple_service_creation() {
        let config = AppleConfig {
            enabled: true,
            client_id: Some("com.example.service".to_string()),
            team_id: Some("ABCD123456".to_string()),
        };
        let service = AppleService::new(&config);
        assert!(service.client_id.is_some());
        assert!(service.team_id.is_some());
    }

    #[test]
    fn test_apple_service_no_config() {
        let config = AppleConfig {
            enabled: true,
            client_id: None,
            team_id: None,
        };
        let service = AppleService::new(&config);
        assert!(service.client_id.is_none());
    }

    #[test]
    fn test_apple_claims_email_verified() {
        let claims = AppleTokenClaims {
            sub: "001234.abc".to_string(),
            email: Some("test@example.com".to_string()),
            email_verified: Some("true".to_string()),
            aud: "com.example.app".to_string(),
            iss: "https://appleid.apple.com".to_string(),
            exp: 9999999999,
            real_user_status: Some(2),
        };
        assert!(claims.is_email_verified());

        let claims_not_verified = AppleTokenClaims {
            email_verified: Some("false".to_string()),
            ..claims.clone()
        };
        assert!(!claims_not_verified.is_email_verified());

        let claims_none = AppleTokenClaims {
            email_verified: None,
            ..claims
        };
        assert!(!claims_none.is_email_verified());
    }

    #[test]
    fn test_apple_claims_is_likely_real() {
        let base_claims = AppleTokenClaims {
            sub: "001234.abc".to_string(),
            email: Some("test@example.com".to_string()),
            email_verified: Some("true".to_string()),
            aud: "com.example.app".to_string(),
            iss: "https://appleid.apple.com".to_string(),
            exp: 9999999999,
            real_user_status: None,
        };

        // None = allowed (fail-open for compatibility)
        assert!(base_claims.is_likely_real());

        // 0 = unsupported device, allowed
        let claims_unsupported = AppleTokenClaims {
            real_user_status: Some(0),
            ..base_claims.clone()
        };
        assert!(claims_unsupported.is_likely_real());

        // 1 = unknown/potential bot, BLOCKED
        let claims_unknown = AppleTokenClaims {
            real_user_status: Some(1),
            ..base_claims.clone()
        };
        assert!(!claims_unknown.is_likely_real());

        // 2 = likely real, allowed
        let claims_real = AppleTokenClaims {
            real_user_status: Some(2),
            ..base_claims
        };
        assert!(claims_real.is_likely_real());
    }

    #[test]
    fn test_extract_kid_requires_header_kid() {
        let service = AppleService::new(&AppleConfig {
            enabled: true,
            client_id: Some("client-id".to_string()),
            team_id: Some("team-id".to_string()),
        });
        let header = jsonwebtoken::Header {
            alg: Algorithm::RS256,
            kid: None,
            ..Default::default()
        };
        let header_json = serde_json::to_string(&header).unwrap();
        let header_b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(header_json);
        let payload_b64 = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode("{}");
        let token = format!("{}.{}.", header_b64, payload_b64);

        let result = service.extract_kid(&token);
        assert!(result.is_err());
    }

    #[test]
    fn test_select_jwk_by_kid() {
        let service = AppleService::new(&AppleConfig {
            enabled: true,
            client_id: Some("client-id".to_string()),
            team_id: Some("team-id".to_string()),
        });
        let jwks_json = r#"{
            "keys": [
                {
                    "kty": "RSA",
                    "kid": "test-kid",
                    "use": "sig",
                    "alg": "RS256",
                    "n": "AQAB",
                    "e": "AQAB"
                }
            ]
        }"#;
        let jwks: JwkSet = serde_json::from_str(jwks_json).unwrap();
        let jwk = service.select_jwk(&jwks, "test-kid");
        assert!(jwk.is_some());
    }
}
