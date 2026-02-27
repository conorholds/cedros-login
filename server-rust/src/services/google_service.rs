//! Google OAuth ID token verification service
//!
//! # Security Considerations
//!
//! ## Token Verification Approach
//!
//! This service uses Google's `tokeninfo` endpoint to verify ID tokens.
//! While this is simpler than local JWT verification, it has trade-offs:
//!
//! **Current approach (tokeninfo endpoint):**
//! - Simple implementation, no key management
//! - Relies on Google's endpoint availability
//! - Network latency on every verification
//! - Google is deprecating this in favor of local verification
//!
//! **Recommended production approach (local JWK verification):**
//! - Fetch and cache Google's public keys from their JWKS endpoint
//! - Verify JWT signatures locally using cached keys
//! - Better performance and reliability
//! - Requires key rotation handling
//!
//! See: <https://developers.google.com/identity/sign-in/web/backend-auth>
//!
//! The current implementation is suitable for moderate traffic but should
//! be upgraded for high-volume production deployments.
//!
//! ## Resilience (S-10, SVC-1)
//!
//! This service implements a circuit breaker pattern for JWKS fetching:
//! - Opens after 3 consecutive failures
//! - Stays open for 60 seconds before retrying
//! - Falls back to cached keys (up to 24 hours old) during outages

use super::circuit_breaker::CircuitBreaker;
use crate::config::GoogleConfig;
use crate::errors::AppError;
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::jwk::{Jwk, JwkSet};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

/// Google ID token claims we care about
#[derive(Debug, Clone, Deserialize)]
pub struct GoogleTokenClaims {
    /// Subject (Google user ID)
    pub sub: String,
    /// Email address
    pub email: Option<String>,
    /// Email verified flag
    pub email_verified: Option<bool>,
    /// Display name
    pub name: Option<String>,
    /// Profile picture URL
    pub picture: Option<String>,
    /// Audience (should match our client ID)
    pub aud: String,
    /// Issuer
    pub iss: String,
    /// Expiration time (Unix timestamp)
    pub exp: i64,
}

/// Default timeout for Google API requests (5 seconds)
const GOOGLE_API_TIMEOUT_SECS: u64 = 5;
const GOOGLE_JWKS_URL: &str = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_JWKS_CACHE_TTL_SECS: u64 = 3600;

/// Google OAuth service for verifying ID tokens
#[derive(Clone)]
pub struct GoogleService {
    #[allow(dead_code)] // Kept for backward compat; caller now passes client_id at runtime
    client_id: Option<String>,
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

impl GoogleService {
    /// Create a new Google service from config
    pub fn new(config: &GoogleConfig) -> Self {
        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(GOOGLE_API_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|e| {
                tracing::error!(
                    error = %e,
                    "Failed to build Google HTTP client; falling back to defaults"
                );
                reqwest::Client::new()
            });

        Self {
            client_id: config.client_id.clone(),
            http_client,
            jwks_cache: Arc::new(RwLock::new(None)),
            circuit_breaker: Arc::new(RwLock::new(CircuitBreaker::new("google_jwks"))),
        }
    }

    async fn fetch_jwks(&self) -> Result<JwkSet, AppError> {
        let response = tokio::time::timeout(
            Duration::from_secs(GOOGLE_API_TIMEOUT_SECS),
            self.http_client.get(GOOGLE_JWKS_URL).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to fetch JWKS: request timed out after {}s",
                GOOGLE_API_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch JWKS: {}", e)))?;

        if !response.status().is_success() {
            return Err(AppError::Internal(anyhow::anyhow!(
                "Failed to fetch JWKS: {}",
                response.status()
            )));
        }

        tokio::time::timeout(Duration::from_secs(GOOGLE_API_TIMEOUT_SECS), async move {
            response.json::<JwkSet>().await
        })
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to parse JWKS: request timed out after {}s",
                GOOGLE_API_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse JWKS: {}", e)))
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
                        service = "google_jwks",
                        age_secs = cached.fetched_at.elapsed().as_secs(),
                        "Serving stale JWKS (circuit open)"
                    );
                    return Ok(Arc::clone(&cached.keys));
                }
            }
            return Err(AppError::ServiceUnavailable(
                "Google JWKS service temporarily unavailable".into(),
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
                        expires_at: now + Duration::from_secs(GOOGLE_JWKS_CACHE_TTL_SECS),
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
                            service = "google_jwks",
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

    /// Verify a Google ID token and return the claims
    ///
    /// This verifies JWT signatures locally using Google's JWKS.
    /// The `client_id` is passed by the caller so it can be resolved at runtime
    /// from `SettingsService` (with static config fallback).
    pub async fn verify_id_token(
        &self,
        id_token: &str,
        client_id: &str,
    ) -> Result<GoogleTokenClaims, AppError> {
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
                    expires_at: now + Duration::from_secs(GOOGLE_JWKS_CACHE_TTL_SECS),
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
        validation.set_audience(&[client_id]);
        validation.set_issuer(&["accounts.google.com", "https://accounts.google.com"]);

        let token_data = decode::<GoogleTokenClaims>(id_token, &decoding_key, &validation)
            .map_err(|err| match err.kind() {
                ErrorKind::ExpiredSignature => AppError::TokenExpired,
                _ => AppError::InvalidToken,
            })?;
        let claims = token_data.claims;

        // Verify email is present and verified
        if claims.email.is_none() {
            return Err(AppError::Validation("Email not provided by Google".into()));
        }

        if claims.email_verified != Some(true) {
            return Err(AppError::Validation(
                "Email not verified with Google".into(),
            ));
        }

        Ok(claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine as _;

    #[test]
    fn test_google_service_creation() {
        let config = GoogleConfig {
            enabled: true,
            client_id: Some("test-client-id".to_string()),
        };
        let service = GoogleService::new(&config);
        assert!(service.client_id.is_some());
    }

    #[test]
    fn test_google_service_no_client_id() {
        let config = GoogleConfig {
            enabled: true,
            client_id: None,
        };
        let service = GoogleService::new(&config);
        assert!(service.client_id.is_none());
    }

    #[test]
    fn test_extract_kid_requires_header_kid() {
        let service = GoogleService::new(&GoogleConfig {
            enabled: true,
            client_id: Some("client-id".to_string()),
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
        let service = GoogleService::new(&GoogleConfig {
            enabled: true,
            client_id: Some("client-id".to_string()),
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

    #[test]
    fn test_select_jwk_with_fallback() {
        let service = GoogleService::new(&GoogleConfig {
            enabled: true,
            client_id: Some("client-id".to_string()),
        });

        let cached_jwks_json = r#"{
            "keys": [
                {
                    "kty": "RSA",
                    "kid": "cached-kid",
                    "use": "sig",
                    "alg": "RS256",
                    "n": "AQAB",
                    "e": "AQAB"
                }
            ]
        }"#;
        let fresh_jwks_json = r#"{
            "keys": [
                {
                    "kty": "RSA",
                    "kid": "fresh-kid",
                    "use": "sig",
                    "alg": "RS256",
                    "n": "AQAB",
                    "e": "AQAB"
                }
            ]
        }"#;

        let cached: JwkSet = serde_json::from_str(cached_jwks_json).unwrap();
        let fresh: JwkSet = serde_json::from_str(fresh_jwks_json).unwrap();
        let jwk = service.select_jwk_with_fallback(&cached, &fresh, "fresh-kid");
        assert!(jwk.is_some());
    }
}
