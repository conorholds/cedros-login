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
//! ## Resilience
//!
//! This service implements a circuit breaker pattern for JWKS fetching:
//! - Opens after 3 consecutive failures
//! - Stays open for 60 seconds before retrying
//! - Falls back to cached keys (up to 24 hours old) during outages

use super::circuit_breaker::CircuitBreaker;
use crate::config::AppleConfig;
use crate::errors::AppError;
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::jwk::{
    AlgorithmParameters, Jwk, JwkSet, KeyAlgorithm, KeyOperations, PublicKeyUse,
};
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Deserializer};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{Mutex, RwLock};

/// Deserialize a value that may be a JSON boolean or a string "true"/"false" into `Option<bool>`.
///
/// Apple's `email_verified` claim has been observed as both types across token versions.
/// Uses `serde_json::Value` as a catch-all so that any unexpected type (number, array, etc.)
/// gracefully becomes `None` rather than failing the entire token deserialization.
fn deserialize_bool_or_string_opt<'de, D>(deserializer: D) -> Result<Option<bool>, D::Error>
where
    D: Deserializer<'de>,
{
    match Option::<serde_json::Value>::deserialize(deserializer)? {
        None | Some(serde_json::Value::Null) => Ok(None),
        Some(serde_json::Value::Bool(b)) => Ok(Some(b)),
        Some(serde_json::Value::String(s)) => Ok(Some(s.eq_ignore_ascii_case("true"))),
        Some(other) => {
            tracing::warn!(value = %other, "Unexpected type for Apple email_verified claim; treating as unverified");
            Ok(None)
        }
    }
}

/// Apple ID token claims
#[derive(Debug, Clone, Deserialize)]
pub struct AppleTokenClaims {
    /// Subject (Apple user ID) - stable identifier
    pub sub: String,
    /// Email address (may be nil if user hides it)
    pub email: Option<String>,
    /// Email verified flag.
    /// Apple has sent this as both a JSON boolean (`true`) and a string (`"true"`)
    /// across different token versions. The custom deserializer accepts either.
    #[serde(default, deserialize_with = "deserialize_bool_or_string_opt")]
    pub email_verified: Option<bool>,
    /// Audience (should match our client ID)
    pub aud: String,
    /// Issuer
    pub iss: String,
    /// Expiration time (Unix timestamp)
    pub exp: i64,
    /// Real user status (0 = unsupported, 1 = unknown, 2 = real)
    pub real_user_status: Option<i64>,
    /// Nonce claim — SHA-256 hash of the nonce sent in the authorization request.
    /// Present only if the client included a nonce.
    pub nonce: Option<String>,
}

impl AppleTokenClaims {
    /// Check if email is verified
    pub fn is_email_verified(&self) -> bool {
        self.email_verified == Some(true)
    }

    /// Check if the user is likely a real person based on Apple's anti-fraud analysis.
    ///
    /// Apple provides `real_user_status`:
    /// - 0: Unsupported (device doesn't support this feature)
    /// - 1: Unknown (system couldn't determine if user is real - potential bot)
    /// - 2: LikelyReal (user appears to be a real person)
    /// - None: Field not present
    ///
    /// Returns true if status is 0 or 2.
    /// Returns false if status is 1 or missing.
    pub fn is_likely_real(&self) -> bool {
        matches!(self.real_user_status, Some(0 | 2))
    }
}

const APPLE_API_TIMEOUT_SECS: u64 = 5;
const APPLE_JWKS_URL: &str = "https://appleid.apple.com/auth/keys";
const APPLE_JWKS_CACHE_TTL_SECS: u64 = 3600;
const APPLE_ISSUER: &str = "https://appleid.apple.com";

/// Apple Sign-In service for verifying ID tokens
#[derive(Clone)]
pub struct AppleService {
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

impl AppleService {
    /// Create a new Apple service from config
    pub fn new(_config: &AppleConfig) -> Self {
        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(APPLE_API_TIMEOUT_SECS))
            .build()
            .unwrap_or_else(|e| {
                tracing::error!(error = %e, "Failed to build Apple HTTP client; falling back to defaults");
                reqwest::Client::new()
            });

        Self {
            http_client,
            jwks_url: APPLE_JWKS_URL.to_owned(),
            refresh_state: Arc::new(Mutex::new(None)),
            jwks_cache: Arc::new(RwLock::new(None)),
            circuit_breaker: Arc::new(RwLock::new(CircuitBreaker::new("apple_jwks"))),
        }
    }

    async fn fetch_jwks(&self) -> Result<JwkSet, AppError> {
        let response = tokio::time::timeout(
            std::time::Duration::from_secs(APPLE_API_TIMEOUT_SECS),
            self.http_client.get(&self.jwks_url).send(),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "Failed to fetch Apple JWKS: request timed out after {APPLE_API_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to fetch Apple JWKS: {e}")))?;

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
                "Failed to parse Apple JWKS: request timed out after {APPLE_API_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Apple JWKS: {e}")))
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

    /// Verify an Apple ID token and return the claims
    ///
    /// This verifies JWT signatures locally using Apple's JWKS.
    /// The `client_id` is passed by the caller so it can be resolved at runtime
    /// from `SettingsService` (with static config fallback).
    pub async fn verify_id_token(
        &self,
        id_token: &str,
        client_id: &str,
    ) -> Result<AppleTokenClaims, AppError> {
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
        validation.set_issuer(&[APPLE_ISSUER]);

        validation.leeway = 0;
        validation.validate_nbf = true;
        validation.set_required_spec_claims(&["exp", "iat", "iss", "aud", "sub"]);
        let token_data =
            decode::<serde_json::Value>(id_token, &decoding_key, &validation).map_err(|err| {
                tracing::warn!(error = %err, kind = ?err.kind(), "Apple ID token verification failed");
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
        let claims: AppleTokenClaims =
            serde_json::from_value(token_data.claims).map_err(|_| AppError::InvalidToken)?;
        Ok(claims)
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
            ..AppleConfig::default()
        };
        let service = AppleService::new(&config);
        assert!(service.jwks_cache.try_read().unwrap().is_none());
    }

    #[test]
    fn test_apple_claims_email_verified() {
        let claims = AppleTokenClaims {
            sub: "001234.abc".to_string(),
            email: Some("test@example.com".to_string()),
            email_verified: Some(true),
            aud: "com.example.app".to_string(),
            iss: "https://appleid.apple.com".to_string(),
            exp: 9999999999,
            real_user_status: Some(2),
            nonce: None,
        };
        assert!(claims.is_email_verified());

        let claims_not_verified = AppleTokenClaims {
            email_verified: Some(false),
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
            email_verified: Some(true),
            aud: "com.example.app".to_string(),
            iss: "https://appleid.apple.com".to_string(),
            exp: 9999999999,
            real_user_status: None,
            nonce: None,
        };

        assert!(!base_claims.is_likely_real());

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
            ..AppleConfig::default()
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
        let service = AppleService::new(&AppleConfig {
            enabled: true,
            client_id: Some("client-id".to_string()),
            team_id: Some("team-id".to_string()),
            ..AppleConfig::default()
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
    fn test_email_verified_deserializes_from_bool() {
        let json = r#"{
            "sub": "001234.abc",
            "email": "test@example.com",
            "email_verified": true,
            "aud": "com.example.app",
            "iss": "https://appleid.apple.com",
            "exp": 9999999999
        }"#;
        let claims: AppleTokenClaims = serde_json::from_str(json).unwrap();
        assert_eq!(claims.email_verified, Some(true));
        assert!(claims.is_email_verified());
    }

    #[test]
    fn test_email_verified_deserializes_from_string() {
        let json = r#"{
            "sub": "001234.abc",
            "email": "test@example.com",
            "email_verified": "true",
            "aud": "com.example.app",
            "iss": "https://appleid.apple.com",
            "exp": 9999999999
        }"#;
        let claims: AppleTokenClaims = serde_json::from_str(json).unwrap();
        assert_eq!(claims.email_verified, Some(true));

        let json_false = json.replace("\"true\"", "\"false\"");
        let claims_false: AppleTokenClaims = serde_json::from_str(&json_false).unwrap();
        assert_eq!(claims_false.email_verified, Some(false));
    }

    #[test]
    fn test_email_verified_deserializes_from_missing() {
        let json = r#"{
            "sub": "001234.abc",
            "aud": "com.example.app",
            "iss": "https://appleid.apple.com",
            "exp": 9999999999
        }"#;
        let claims: AppleTokenClaims = serde_json::from_str(json).unwrap();
        assert_eq!(claims.email_verified, None);
        assert!(!claims.is_email_verified());
    }

    #[test]
    fn test_email_verified_unexpected_type_does_not_fail() {
        // If Apple ever sends an integer or other unexpected type,
        // the token should still parse — email_verified becomes None.
        let json = r#"{
            "sub": "001234.abc",
            "email_verified": 1,
            "aud": "com.example.app",
            "iss": "https://appleid.apple.com",
            "exp": 9999999999
        }"#;
        let claims: AppleTokenClaims = serde_json::from_str(json).unwrap();
        assert_eq!(claims.email_verified, None);
        assert!(!claims.is_email_verified());
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
        let mut service = AppleService::new(&AppleConfig::default());
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
        let mut service = AppleService::new(&AppleConfig::default());
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
