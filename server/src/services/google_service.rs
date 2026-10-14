//! Google OAuth ID token verification service
//!
//! # Security Considerations
//!
//! ID tokens are verified locally against cached public keys. Expiry and
//! unknown-key refreshes share ownership and a provider-wide 30-second cooldown;
//! access-token login still uses Google's remote token/userinfo endpoints.
//!
//! ## Resilience
//!
//! This service implements a circuit breaker pattern for JWKS fetching:
//! - Opens after 3 consecutive failures
//! - Stays open for 60 seconds before retrying
//! - Falls back to cached keys (up to 24 hours old) during outages

use super::circuit_breaker::CircuitBreaker;
use crate::config::GoogleConfig;
use crate::errors::AppError;
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::jwk::{
    AlgorithmParameters, Jwk, JwkSet, KeyAlgorithm, KeyOperations, PublicKeyUse,
};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, RwLock};

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
    /// Hosted-domain claim. Its presence means Google is authoritative for
    /// the Workspace address rather than only reporting user verification.
    pub hd: Option<String>,
    /// Audience (should match our client ID)
    pub aud: String,
    /// Issuer
    pub iss: String,
    /// Expiration time (Unix timestamp)
    pub exp: i64,
}

impl GoogleTokenClaims {
    pub fn is_authoritative_email(&self) -> bool {
        self.email_verified == Some(true)
            && (self.hd.is_some()
                || self
                    .email
                    .as_deref()
                    .is_some_and(|email| email.to_ascii_lowercase().ends_with("@gmail.com")))
    }
}

/// Default timeout for Google API requests (5 seconds)
const GOOGLE_API_TIMEOUT_SECS: u64 = 5;
const GOOGLE_JWKS_URL: &str = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_TOKENINFO_URL: &str = "https://www.googleapis.com/oauth2/v3/tokeninfo";
const GOOGLE_JWKS_CACHE_TTL_SECS: u64 = 3600;

/// Google OAuth service for verifying ID tokens
#[derive(Clone)]
pub struct GoogleService {
    http_client: reqwest::Client,
    jwks_url: String,
    refresh_state: Arc<Mutex<Option<Instant>>>,
    jwks_cache: Arc<RwLock<Option<JwksCache>>>,
    circuit_breaker: Arc<RwLock<CircuitBreaker>>,
}

/// JwkSet wrapped in Arc to avoid cloning on each cache hit
#[derive(Debug, Clone)]
struct JwksCache {
    keys: Arc<JwkSet>,
    expires_at: Instant,
    /// When keys were fetched (for circuit breaker fallback TTL)
    fetched_at: Instant,
}

impl GoogleService {
    /// Create a new Google service from config
    pub fn new(_config: &GoogleConfig) -> Self {
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
            http_client,
            jwks_url: GOOGLE_JWKS_URL.to_owned(),
            refresh_state: Arc::new(Mutex::new(None)),
            jwks_cache: Arc::new(RwLock::new(None)),
            circuit_breaker: Arc::new(RwLock::new(CircuitBreaker::new("google_jwks"))),
        }
    }

    async fn fetch_jwks(&self) -> Result<JwkSet, AppError> {
        let response = tokio::time::timeout(
            Duration::from_secs(GOOGLE_API_TIMEOUT_SECS),
            self.http_client.get(&self.jwks_url).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to fetch JWKS: request timed out after {GOOGLE_API_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch JWKS: {e}")))?;

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
                "Failed to parse JWKS: request timed out after {GOOGLE_API_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse JWKS: {e}")))
    }

    async fn usable_keys(&self, missing_kid: Option<&str>) -> Option<Arc<JwkSet>> {
        let cache = self.jwks_cache.read().await;
        let cached = cache.as_ref()?;
        (Instant::now() < cached.expires_at
            && missing_kid.is_none_or(|kid| self.select_jwk(&cached.keys, kid).is_some()))
        .then(|| Arc::clone(&cached.keys))
    }

    async fn get_jwks(&self) -> Result<Arc<JwkSet>, AppError> {
        self.refresh_jwks(None).await
    }

    async fn refresh_jwks(&self, missing_kid: Option<&str>) -> Result<Arc<JwkSet>, AppError> {
        if let Some(keys) = self.usable_keys(missing_kid).await {
            return Ok(keys);
        }
        // Only refresh ownership is held through IO; warm readers use the cache
        // lock independently. Cancellation releases ownership automatically.
        let mut last_attempt = self.refresh_state.lock().await;
        if let Some(keys) = self.usable_keys(missing_kid).await {
            return Ok(keys);
        }
        if last_attempt.is_some_and(|at| at.elapsed() < Duration::from_secs(30)) {
            let cache = self.jwks_cache.read().await;
            let cb = self.circuit_breaker.read().await;
            if let Some(cached) = cache.as_ref() {
                if cb.is_fallback_valid(cached.fetched_at) {
                    return Ok(Arc::clone(&cached.keys));
                }
            }
            return Err(AppError::ServiceUnavailable(
                "Provider keys temporarily unavailable".into(),
            ));
        }
        *last_attempt = Some(Instant::now());

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
        if header.alg != Algorithm::RS256 {
            return Err(AppError::InvalidToken);
        }
        header
            .kid
            .filter(|kid| !kid.is_empty())
            .ok_or(AppError::InvalidToken)
    }

    fn select_jwk<'a>(&self, jwks: &'a JwkSet, kid: &str) -> Option<&'a Jwk> {
        jwks.keys.iter().find(|jwk| {
            jwk.common.key_id.as_deref() == Some(kid)
                && matches!(jwk.algorithm, AlgorithmParameters::RSA(_))
                && jwk
                    .common
                    .key_algorithm
                    .is_none_or(|alg| alg == KeyAlgorithm::RS256)
                && jwk
                    .common
                    .public_key_use
                    .as_ref()
                    .is_none_or(|usage| *usage == PublicKeyUse::Signature)
                && jwk
                    .common
                    .key_operations
                    .as_ref()
                    .is_none_or(|ops| ops.contains(&KeyOperations::Verify))
        })
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
            let fresh = self.refresh_jwks(Some(&kid)).await?;
            let jwk = self
                .select_jwk_with_fallback(&jwks, &fresh, &kid)
                .ok_or(AppError::InvalidToken)?;
            DecodingKey::from_jwk(jwk).map_err(|_| AppError::InvalidToken)?
        };

        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_audience(&[client_id]);
        validation.set_issuer(&["accounts.google.com", "https://accounts.google.com"]);

        validation.leeway = 0;
        validation.validate_nbf = true;
        validation.set_required_spec_claims(&["exp", "iat", "iss", "aud", "sub"]);
        let token_data = decode::<serde_json::Value>(id_token, &decoding_key, &validation)
            .map_err(|err| {
                tracing::warn!(error = %err, kind = ?err.kind(), "Google ID token verification failed");
                match err.kind() {
                    ErrorKind::ExpiredSignature => AppError::TokenExpired,
                    _ => AppError::InvalidToken,
                }
            })?;
        if !crate::domain::oidc::valid_claims(
            &token_data.claims,
            &[client_id],
            chrono::Utc::now().timestamp(),
        ) {
            return Err(AppError::InvalidToken);
        }
        let claims: GoogleTokenClaims =
            serde_json::from_value(token_data.claims).map_err(|_| AppError::InvalidToken)?;

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

    /// Verify a Google access token by calling Google's userinfo endpoint.
    ///
    /// Used when the client authenticates via the OAuth popup flow
    /// (`google.accounts.oauth2.initTokenClient`) which returns an access
    /// token instead of an ID token.
    pub async fn verify_access_token(
        &self,
        access_token: &str,
        client_id: &str,
    ) -> Result<GoogleTokenClaims, AppError> {
        // Bind the access token to our configured OAuth client to prevent
        // token substitution across different Google apps.
        let token_info_resp = tokio::time::timeout(
            Duration::from_secs(GOOGLE_API_TIMEOUT_SECS),
            self.http_client
                .get(GOOGLE_TOKENINFO_URL)
                .query(&[("access_token", access_token)])
                .send(),
        )
        .await
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Google tokeninfo request timed out")))?
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "Google tokeninfo request failed: {}",
                e.without_url()
            ))
        })?;

        if !token_info_resp.status().is_success() {
            return Err(AppError::InvalidToken);
        }

        let token_info: GoogleAccessTokenInfo = token_info_resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse tokeninfo response: {e}"))
        })?;
        if !token_info.matches_client_id(client_id) {
            return Err(AppError::InvalidToken);
        }

        let resp = tokio::time::timeout(
            Duration::from_secs(GOOGLE_API_TIMEOUT_SECS),
            self.http_client
                .get("https://www.googleapis.com/oauth2/v3/userinfo")
                .bearer_auth(access_token)
                .send(),
        )
        .await
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Google userinfo request timed out")))?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Google userinfo request failed: {e}")))?;

        if !resp.status().is_success() {
            return Err(AppError::InvalidToken);
        }

        let info: GoogleUserInfo = resp
            .json()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse userinfo: {e}")))?;

        if info.email_verified != Some(true) {
            return Err(AppError::Validation(
                "Email not verified with Google".into(),
            ));
        }

        Ok(GoogleTokenClaims {
            sub: info.sub,
            email: info.email,
            email_verified: info.email_verified,
            name: info.name,
            picture: info.picture,
            hd: info.hd,
            // These fields aren't in userinfo but aren't used after verification
            aud: String::new(),
            iss: "https://accounts.google.com".into(),
            exp: 0,
        })
    }
}

/// Response from Google's userinfo endpoint
#[derive(Debug, Deserialize)]
struct GoogleUserInfo {
    sub: String,
    email: Option<String>,
    email_verified: Option<bool>,
    name: Option<String>,
    picture: Option<String>,
    hd: Option<String>,
}

/// Response from Google's tokeninfo endpoint for access tokens.
#[derive(Debug, Deserialize)]
struct GoogleAccessTokenInfo {
    aud: Option<String>,
    azp: Option<String>,
    issued_to: Option<String>,
}

impl GoogleAccessTokenInfo {
    fn matches_client_id(&self, client_id: &str) -> bool {
        !client_id.is_empty()
            && self
                .aud
                .as_deref()
                .or(self.issued_to.as_deref())
                .or(self.azp.as_deref())
                == Some(client_id)
            && self.azp.as_deref().is_none_or(|value| value == client_id)
            && self
                .issued_to
                .as_deref()
                .is_none_or(|value| value == client_id)
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
        assert!(service.jwks_cache.try_read().unwrap().is_none());
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
        let token = format!("{header_b64}.{payload_b64}.");

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
        for (field, value) in [
            ("use", serde_json::json!("enc")),
            ("alg", serde_json::json!("RS512")),
            ("key_ops", serde_json::json!(["encrypt"])),
            ("kid", serde_json::json!("other")),
        ] {
            let mut invalid: serde_json::Value = serde_json::from_str(jwks_json).unwrap();
            invalid["keys"][0][field] = value;
            let invalid: JwkSet = serde_json::from_value(invalid).unwrap();
            assert!(
                service.select_jwk(&invalid, "test-kid").is_none(),
                "{field}"
            );
        }
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

    #[test]
    fn test_access_token_info_matches_client_id() {
        let info = GoogleAccessTokenInfo {
            aud: Some("client-123".into()),
            azp: None,
            issued_to: None,
        };
        assert!(info.matches_client_id("client-123"));
    }

    #[test]
    fn test_access_token_info_rejects_other_client_id() {
        let info = GoogleAccessTokenInfo {
            aud: Some("different-client".into()),
            azp: Some("another-client".into()),
            issued_to: None,
        };
        assert!(!info.matches_client_id("client-123"));
    }

    #[test]
    fn test_access_token_info_does_not_ignore_mismatched_audience() {
        let info = GoogleAccessTokenInfo {
            aud: Some("attacker-client".into()),
            azp: Some("client-123".into()),
            issued_to: Some("client-123".into()),
        };
        assert!(!info.matches_client_id("client-123"));
    }

    #[test]
    fn only_google_authoritative_addresses_are_marked_verified() {
        let claims = |email: &str, hd: Option<&str>| GoogleTokenClaims {
            sub: "subject".into(),
            email: Some(email.into()),
            email_verified: Some(true),
            name: None,
            picture: None,
            hd: hd.map(str::to_string),
            aud: "client".into(),
            iss: "https://accounts.google.com".into(),
            exp: i64::MAX,
        };
        assert!(claims("user@gmail.com", None).is_authoritative_email());
        assert!(claims("user@example.com", Some("example.com")).is_authoritative_email());
        assert!(!claims("user@example.com", None).is_authoritative_email());
        let mut unverified = claims("user@gmail.com", None);
        unverified.email_verified = None;
        assert!(!unverified.is_authoritative_email());
    }
}

#[cfg(test)]
mod refresh_tests {
    use super::*;
    use crate::services::provider_test_support::ProviderFixture;
    use std::sync::atomic::Ordering;

    #[tokio::test]
    async fn expiry_waves_and_unknown_kids_share_one_bounded_refresh() {
        let fixture = ProviderFixture::start().await;
        let mut service = GoogleService::new(&GoogleConfig::default());
        service.jwks_url = fixture.url.clone();
        let service = Arc::new(service);
        for expected in 1..=2 {
            let mut requests = tokio::task::JoinSet::new();
            for _ in 0..32 {
                let service = service.clone();
                requests.spawn(async move { service.get_jwks().await });
            }
            while let Some(result) = requests.join_next().await {
                result.unwrap().unwrap();
            }
            assert_eq!(fixture.calls.load(Ordering::SeqCst), expected);
            for _ in 0..32 {
                service.refresh_jwks(Some("unknown")).await.unwrap();
            }
            assert_eq!(fixture.calls.load(Ordering::SeqCst), expected);
            service
                .jwks_cache
                .write()
                .await
                .as_mut()
                .unwrap()
                .expires_at = Instant::now() - Duration::from_secs(1);
            *service.refresh_state.lock().await = Some(Instant::now() - Duration::from_secs(31));
        }
    }

    #[tokio::test]
    async fn failed_refresh_wave_uses_bounded_stale_fallback() {
        let fixture = ProviderFixture::start().await;
        let mut service = GoogleService::new(&GoogleConfig::default());
        service.jwks_url = fixture.url.clone();
        service.get_jwks().await.unwrap();
        fixture.failing.store(true, Ordering::SeqCst);
        service
            .jwks_cache
            .write()
            .await
            .as_mut()
            .unwrap()
            .expires_at = Instant::now() - Duration::from_secs(1);
        *service.refresh_state.lock().await = None;
        for _ in 0..32 {
            service.get_jwks().await.unwrap();
        }
        assert_eq!(fixture.calls.load(Ordering::SeqCst), 2);
        service
            .jwks_cache
            .write()
            .await
            .as_mut()
            .unwrap()
            .fetched_at = Instant::now() - Duration::from_secs(86401);
        assert!(service.get_jwks().await.is_err());
    }
}
