//! OIDC service for Enterprise SSO
//!
//! Handles OpenID Connect authentication flows with configurable providers.

use openidconnect::{
    core::{CoreProviderMetadata, CoreResponseType, CoreTokenResponse},
    AsyncHttpClient, AuthenticationFlow, AuthorizationCode, ClientId, ClientSecret, CsrfToken,
    EndUserEmail, HttpClientError, HttpRequest, HttpResponse, IssuerUrl, Nonce, PkceCodeChallenge,
    PkceCodeVerifier, RedirectUrl, Scope, TokenResponse,
};
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use unicode_normalization::UnicodeNormalization;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::sso::{SsoAuthState, SsoProvider};
use crate::repositories::SsoRepository;

/// Default TTL for auth states (5 minutes)
const AUTH_STATE_TTL_SECS: i64 = 300;
const OIDC_HTTP_TIMEOUT_SECS: u64 = 10;
const OIDC_METADATA_CACHE_TTL_SECS: u64 = 3600;

type PinnedHttpFuture = Pin<Box<dyn Future<Output = Result<HttpResponse, PinnedHttpError>> + Send>>;

#[derive(Debug, thiserror::Error)]
enum PinnedHttpError {
    #[error("OIDC endpoint is outside the configured issuer origin")]
    DestinationRejected,
    #[error(transparent)]
    Request(#[from] HttpClientError<reqwest::Error>),
}

/// Accept only the issuer's exact origin. DNS ancestry is not sufficient because
/// parent and child zones can have different operators. Effective ports are
/// compared so another service on the same host cannot receive OIDC secrets.
fn endpoint_belongs_to_issuer(issuer: &str, endpoint: &str) -> bool {
    let (Ok(issuer), Ok(endpoint)) = (url::Url::parse(issuer), url::Url::parse(endpoint)) else {
        return false;
    };
    if !issuer.username().is_empty()
        || issuer.password().is_some()
        || !endpoint.username().is_empty()
        || endpoint.password().is_some()
        || !matches!(issuer.scheme(), "http" | "https")
    {
        return false;
    }
    let (Some(issuer_host), Some(endpoint_host), Some(issuer_port), Some(endpoint_port)) = (
        issuer.host_str(),
        endpoint.host_str(),
        issuer.port_or_known_default(),
        endpoint.port_or_known_default(),
    ) else {
        return false;
    };
    issuer.scheme() == endpoint.scheme()
        && issuer_host == endpoint_host
        && issuer_port == endpoint_port
}

/// Validate email domain with exact matching and Unicode normalization.
/// Returns Ok(()) if domain matches, Err if it doesn't or email is invalid.
fn validate_email_domain(email: &str, expected_domain: &str) -> Result<(), AppError> {
    let email_domain = email
        .split('@')
        .nth(1)
        .ok_or_else(|| AppError::Validation("Invalid email format".into()))?;

    // Apply NFKC normalization to both domains and lowercase for comparison
    let normalized_email_domain: String = email_domain.to_lowercase().nfkc().collect();
    let normalized_expected_domain: String = expected_domain.to_lowercase().nfkc().collect();

    if normalized_email_domain != normalized_expected_domain {
        return Err(AppError::Forbidden(format!(
            "Email domain not allowed. Must be @{expected_domain}"
        )));
    }
    Ok(())
}

type DiscoveryRefresh = tokio::sync::Mutex<Option<std::time::Instant>>;

/// OIDC service for handling Enterprise SSO
pub struct OidcService {
    /// Callback URL template (e.g., "https://api.example.com/auth/sso/callback")
    callback_url: String,
    http_client: reqwest::Client,
    metadata_cache: Arc<RwLock<HashMap<String, CachedProviderMetadata>>>,
    refreshes: tokio::sync::Mutex<HashMap<String, std::sync::Weak<DiscoveryRefresh>>>,
}

/// Result of starting an SSO auth flow
#[derive(Debug)]
pub struct SsoAuthStart {
    /// The authorization URL to redirect the user to
    pub auth_url: String,
    /// State ID (returned as `state` parameter in callback)
    pub state_id: Uuid,
}

/// Claims extracted from a verified OIDC token
#[derive(Debug, Clone)]
pub struct OidcClaims {
    /// Subject (unique user ID from provider)
    pub sub: String,
    /// Email address
    pub email: Option<String>,
    /// Whether email is verified
    pub email_verified: Option<bool>,
    /// Display name
    pub name: Option<String>,
    /// Given name
    pub given_name: Option<String>,
    /// Family name
    pub family_name: Option<String>,
    /// Profile picture URL
    pub picture: Option<String>,
}

#[derive(Debug, Clone)]
struct CachedProviderMetadata {
    metadata: CoreProviderMetadata,
    expires_at: std::time::Instant,
}

impl OidcService {
    /// Create a new OIDC service
    pub fn new(callback_url: String) -> Self {
        let http_client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_secs(OIDC_HTTP_TIMEOUT_SECS))
            .build()
            .expect("OIDC HTTP client construction must succeed");

        Self {
            callback_url,
            http_client,
            metadata_cache: Arc::new(RwLock::new(HashMap::new())),
            refreshes: tokio::sync::Mutex::new(HashMap::new()),
        }
    }

    async fn get_provider_metadata(&self, issuer: &str) -> Result<CoreProviderMetadata, AppError> {
        let now = std::time::Instant::now();
        {
            let cache = self.metadata_cache.read().await;
            if let Some(cached) = cache.get(issuer) {
                if now < cached.expires_at {
                    return Ok(cached.metadata.clone());
                }
            }
        }

        let refresh = {
            let mut owners = self.refreshes.lock().await;
            owners.retain(|_, owner| owner.strong_count() > 0);
            if let Some(owner) = owners.get(issuer).and_then(std::sync::Weak::upgrade) {
                owner
            } else {
                let owner = Arc::new(tokio::sync::Mutex::new(None));
                owners.insert(issuer.to_owned(), Arc::downgrade(&owner));
                owner
            }
        };
        let mut attempted = refresh.lock().await;
        if let Some(cached) = self.metadata_cache.read().await.get(issuer) {
            if std::time::Instant::now() < cached.expires_at {
                return Ok(cached.metadata.clone());
            }
        }
        if attempted.is_some() {
            return Err(AppError::ServiceUnavailable(
                "OIDC discovery temporarily unavailable".into(),
            ));
        }
        *attempted = Some(std::time::Instant::now());

        let issuer_url = IssuerUrl::new(issuer.to_string())
            .map_err(|e| AppError::Config(format!("Invalid issuer URL: {e}")))?;
        let pinned_http = self.pinned_http_client(issuer);
        let provider_metadata = tokio::time::timeout(
            Duration::from_secs(OIDC_HTTP_TIMEOUT_SECS),
            CoreProviderMetadata::discover_async(issuer_url, &pinned_http),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "OIDC discovery failed: request timed out after {OIDC_HTTP_TIMEOUT_SECS}s"
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("OIDC discovery failed: {e:?}")))?;

        validate_provider_metadata(issuer, &provider_metadata)?;

        {
            let mut cache = self.metadata_cache.write().await;
            cache.insert(
                issuer.to_string(),
                CachedProviderMetadata {
                    metadata: provider_metadata.clone(),
                    expires_at: std::time::Instant::now()
                        + Duration::from_secs(OIDC_METADATA_CACHE_TTL_SECS),
                },
            );
        }

        Ok(provider_metadata)
    }

    fn pinned_http_client(&self, issuer: &str) -> impl Fn(HttpRequest) -> PinnedHttpFuture + Clone {
        let client = self.http_client.clone();
        let issuer = issuer.to_string();
        move |request: HttpRequest| {
            let client = client.clone();
            let issuer = issuer.clone();
            Box::pin(async move {
                if !endpoint_belongs_to_issuer(&issuer, &request.uri().to_string()) {
                    return Err(PinnedHttpError::DestinationRejected);
                }
                AsyncHttpClient::call(&client, request)
                    .await
                    .map_err(PinnedHttpError::Request)
            })
        }
    }

    /// Start the SSO authentication flow
    pub async fn start_auth(
        &self,
        provider: &SsoProvider,
        client_secret: &str,
        redirect_uri: Option<String>,
        access_code: Option<String>,
        referral: Option<String>,
        sso_repo: &Arc<dyn SsoRepository>,
    ) -> Result<SsoAuthStart, AppError> {
        // Build OIDC client inline (type-state pattern prevents returning from helper)
        let provider_metadata = self.get_provider_metadata(&provider.issuer_url).await?;

        let client_id = ClientId::new(provider.client_id.clone());
        let client_secret_obj = ClientSecret::new(client_secret.to_string());
        let redirect_url = RedirectUrl::new(self.callback_url.clone())
            .map_err(|e| AppError::Config(format!("Invalid redirect URL: {e}")))?;

        let client = openidconnect::core::CoreClient::from_provider_metadata(
            provider_metadata,
            client_id,
            Some(client_secret_obj),
        )
        .set_redirect_uri(redirect_url);

        let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

        // Use the persisted state ID as the CSRF token so callback lookup and
        // OIDC state validation compare the same value.
        let state_id = Uuid::new_v4();
        let state_id_string = state_id.to_string();
        let state_id_for_closure = state_id_string.clone();

        let nonce = Nonce::new_random();
        let nonce_secret = nonce.secret().to_string();
        let nonce_for_url = nonce.clone();

        let mut auth_request = client.authorize_url(
            AuthenticationFlow::<CoreResponseType>::AuthorizationCode,
            move || CsrfToken::new(state_id_for_closure.clone()),
            move || nonce_for_url.clone(),
        );

        for scope in &provider.scopes {
            auth_request = auth_request.add_scope(Scope::new(scope.clone()));
        }

        let (auth_url, _csrf_token, _nonce) = auth_request.set_pkce_challenge(pkce_challenge).url();

        let mut auth_state = SsoAuthState::new(
            provider.id,
            provider.org_id,
            pkce_verifier.secret().to_string(),
            nonce_secret,
            redirect_uri,
            AUTH_STATE_TTL_SECS,
        );
        auth_state.state_id = state_id;
        auth_state.access_code = access_code;
        auth_state.referral = referral;

        sso_repo.store_auth_state(auth_state).await?;

        Ok(SsoAuthStart {
            auth_url: auth_url.to_string(),
            state_id,
        })
    }

    /// Complete the SSO authentication flow
    pub async fn complete_auth(
        &self,
        code: &str,
        state_id: Uuid,
        provider: &SsoProvider,
        client_secret: &str,
        sso_repo: &Arc<dyn SsoRepository>,
    ) -> Result<OidcClaims, AppError> {
        // Retrieve and consume auth state
        let auth_state = sso_repo
            .consume_auth_state(state_id)
            .await?
            .ok_or_else(|| AppError::Validation("Invalid or expired SSO state".into()))?;

        // Verify provider matches
        if auth_state.provider_id != provider.id {
            return Err(AppError::Validation("Provider mismatch".into()));
        }

        // Build OIDC client inline (type-state pattern prevents returning from helper)
        let provider_metadata = self.get_provider_metadata(&provider.issuer_url).await?;

        let client_id = ClientId::new(provider.client_id.clone());
        let client_secret_obj = ClientSecret::new(client_secret.to_string());
        let redirect_url = RedirectUrl::new(self.callback_url.clone())
            .map_err(|e| AppError::Config(format!("Invalid redirect URL: {e}")))?;

        let client = openidconnect::core::CoreClient::from_provider_metadata(
            provider_metadata,
            client_id,
            Some(client_secret_obj),
        )
        .set_redirect_uri(redirect_url);

        // Exchange code for tokens
        let pkce_verifier = PkceCodeVerifier::new(auth_state.pkce_verifier);
        let token_request = client
            .exchange_code(AuthorizationCode::new(code.to_string()))
            .map_err(|e| AppError::Config(format!("OIDC token endpoint error: {e:?}")))?;
        let token_response: CoreTokenResponse = token_request
            .set_pkce_verifier(pkce_verifier)
            .request_async(&self.pinned_http_client(&provider.issuer_url))
            .await
            .map_err(|_| AppError::InvalidCredentials)?;

        // Extract and verify ID token
        let id_token = token_response
            .id_token()
            .ok_or_else(|| AppError::Validation("No ID token in response".into()))?;

        // Verify the ID token with nonce
        let nonce = Nonce::new(auth_state.nonce);
        let claims = id_token
            .claims(&client.id_token_verifier(), &nonce)
            .map_err(|e| AppError::Validation(format!("Token verification failed: {e:?}")))?;

        // Extract claims - email() returns Option<&EndUserEmail>
        let email: Option<String> = claims
            .email()
            .map(|e: &EndUserEmail| e.as_str().to_string());
        let email_verified = claims.email_verified();

        // Verify email domain with exact matching and Unicode normalization
        if let (Some(expected_domain), Some(email_str)) = (&provider.email_domain, &email) {
            validate_email_domain(email_str, expected_domain)?;
        }

        // Note: Extracting localized claims (name, picture) requires complex type handling.
        // For simplicity, we skip these optional fields - email and sub are the essential ones.
        Ok(OidcClaims {
            sub: claims.subject().to_string(),
            email,
            email_verified,
            name: None,
            given_name: None,
            family_name: None,
            picture: None,
        })
    }
}

fn validate_provider_metadata(
    issuer: &str,
    metadata: &CoreProviderMetadata,
) -> Result<(), AppError> {
    let mut endpoints = vec![
        metadata.authorization_endpoint().as_str(),
        metadata.jwks_uri().as_str(),
    ];
    if let Some(token_endpoint) = metadata.token_endpoint() {
        endpoints.push(token_endpoint.as_str());
    }
    if endpoints
        .into_iter()
        .all(|endpoint| endpoint_belongs_to_issuer(issuer, endpoint))
    {
        Ok(())
    } else {
        Err(AppError::Config(
            "OIDC discovery endpoint is outside the configured issuer origin".into(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::sso::SsoProvider;
    use crate::repositories::{InMemorySsoRepository, SsoRepository};
    use openidconnect::core::{CoreJwsSigningAlgorithm, CoreSubjectIdentifierType};
    use openidconnect::{AuthUrl, JsonWebKeySetUrl, ResponseTypes, TokenUrl};
    use std::sync::Arc;
    use uuid::Uuid;

    #[test]
    fn test_oidc_service_creation() {
        let service = OidcService::new("https://api.example.com/auth/sso/callback".into());
        assert_eq!(
            service.callback_url,
            "https://api.example.com/auth/sso/callback"
        );
    }

    #[test]
    fn oidc_endpoint_pinning_requires_exact_origin() {
        assert!(endpoint_belongs_to_issuer(
            "https://idp.example.com/tenant",
            "https://idp.example.com/token"
        ));
        assert!(endpoint_belongs_to_issuer(
            "https://idp.example.com:443/tenant",
            "https://idp.example.com/token"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://github.io/tenant",
            "https://attacker.github.io/token"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://example.com/tenant",
            "https://keys.example.com/jwks"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://login.example.com/tenant",
            "https://keys.example.com/jwks"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://idp.example.co.uk/tenant",
            "https://attacker.co.uk/token"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://idp.example.com/tenant",
            "http://idp.example.com/token"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://idp.example.com/tenant",
            "https://idp.example.com:8443/token"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "https://idp.example.com/tenant",
            "https://user:password@idp.example.com/token"
        ));
        assert!(!endpoint_belongs_to_issuer(
            "file:///issuer",
            "file:///token"
        ));
    }

    #[tokio::test]
    async fn pinned_http_rejects_cross_host_before_network_io() {
        let service = OidcService::new("https://api.example.com/auth/sso/callback".into());
        let client = service.pinned_http_client("https://idp.example.co.uk/tenant");
        let request = openidconnect::http::Request::builder()
            .uri("https://attacker.co.uk/token")
            .body(Vec::new())
            .unwrap();

        assert!(matches!(
            client(request).await,
            Err(PinnedHttpError::DestinationRejected)
        ));
    }

    #[test]
    fn provider_metadata_validation_checks_every_sensitive_endpoint() {
        let issuer = "https://issuer.example.com";
        let valid = CoreProviderMetadata::new(
            IssuerUrl::new(issuer.to_string()).unwrap(),
            AuthUrl::new("https://issuer.example.com/auth".to_string()).unwrap(),
            JsonWebKeySetUrl::new("https://issuer.example.com/jwks".to_string()).unwrap(),
            vec![ResponseTypes::new(vec![CoreResponseType::Code])],
            vec![CoreSubjectIdentifierType::Public],
            vec![CoreJwsSigningAlgorithm::RsaSsaPkcs1V15Sha256],
            Default::default(),
        )
        .set_token_endpoint(Some(
            TokenUrl::new("https://issuer.example.com/token".to_string()).unwrap(),
        ));
        assert!(validate_provider_metadata(issuer, &valid).is_ok());

        let invalid = valid.set_token_endpoint(Some(
            TokenUrl::new("https://issuer.example.com:8443/token".to_string()).unwrap(),
        ));
        assert!(validate_provider_metadata(issuer, &invalid).is_err());
    }

    #[tokio::test]
    async fn oidc_http_client_does_not_follow_redirects() {
        use std::io::{Read, Write};
        use std::net::TcpListener;

        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let server = std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut request = [0_u8; 1024];
            let _ = stream.read(&mut request).unwrap();
            stream
                .write_all(
                    b"HTTP/1.1 302 Found\r\nLocation: http://127.0.0.1:9/leak\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
                )
                .unwrap();
        });

        let issuer = format!("http://{address}");
        let service = OidcService::new("https://api.example.com/auth/sso/callback".into());
        let client = service.pinned_http_client(&issuer);
        let request = openidconnect::http::Request::builder()
            .uri(format!("{issuer}/redirect"))
            .body(Vec::new())
            .unwrap();
        let response = client(request).await.unwrap();

        assert_eq!(response.status(), openidconnect::http::StatusCode::FOUND);
        server.join().unwrap();
    }

    #[tokio::test]
    async fn test_provider_metadata_cache_hit() {
        let service = OidcService::new("https://api.example.com/auth/sso/callback".into());
        let issuer = "https://issuer.example.com";

        let metadata = CoreProviderMetadata::new(
            IssuerUrl::new(issuer.to_string()).unwrap(),
            AuthUrl::new("https://issuer.example.com/auth".to_string()).unwrap(),
            JsonWebKeySetUrl::new("https://issuer.example.com/jwks".to_string()).unwrap(),
            vec![ResponseTypes::new(vec![CoreResponseType::Code])],
            vec![CoreSubjectIdentifierType::Public],
            vec![CoreJwsSigningAlgorithm::RsaSsaPkcs1V15Sha256],
            Default::default(),
        );

        {
            let mut cache = service.metadata_cache.write().await;
            cache.insert(
                issuer.to_string(),
                CachedProviderMetadata {
                    metadata: metadata.clone(),
                    expires_at: std::time::Instant::now() + Duration::from_secs(60),
                },
            );
        }

        let fetched = service.get_provider_metadata(issuer).await.unwrap();
        let fetched_json = serde_json::to_string(&fetched).unwrap();
        let metadata_json = serde_json::to_string(&metadata).unwrap();
        assert_eq!(fetched_json, metadata_json);
    }

    #[tokio::test]
    async fn test_start_auth_persists_access_code_and_referral() {
        let service = OidcService::new("https://api.example.com/auth/sso/callback".into());
        let issuer = "https://issuer.example.com";
        let provider = SsoProvider::new(
            Uuid::new_v4(),
            "Okta".into(),
            issuer.to_string(),
            "client-id".into(),
            "encrypted-secret".into(),
        );
        let repo: Arc<dyn SsoRepository> = Arc::new(InMemorySsoRepository::new());

        let metadata = CoreProviderMetadata::new(
            IssuerUrl::new(issuer.to_string()).unwrap(),
            AuthUrl::new("https://issuer.example.com/auth".to_string()).unwrap(),
            JsonWebKeySetUrl::new("https://issuer.example.com/jwks".to_string()).unwrap(),
            vec![ResponseTypes::new(vec![CoreResponseType::Code])],
            vec![CoreSubjectIdentifierType::Public],
            vec![CoreJwsSigningAlgorithm::RsaSsaPkcs1V15Sha256],
            Default::default(),
        );

        {
            let mut cache = service.metadata_cache.write().await;
            cache.insert(
                issuer.to_string(),
                CachedProviderMetadata {
                    metadata,
                    expires_at: std::time::Instant::now() + Duration::from_secs(60),
                },
            );
        }

        let result = service
            .start_auth(
                &provider,
                "client-secret",
                Some("https://app.example.com/after-login".into()),
                Some("ACCESS123".into()),
                Some("REFERRAL1".into()),
                &repo,
            )
            .await
            .unwrap();

        let auth_state = repo.get_auth_state(result.state_id).await.unwrap().unwrap();
        assert_eq!(auth_state.access_code.as_deref(), Some("ACCESS123"));
        assert_eq!(auth_state.referral.as_deref(), Some("REFERRAL1"));
        assert_eq!(
            auth_state.redirect_uri.as_deref(),
            Some("https://app.example.com/after-login")
        );
    }

    // Tests for email domain validation

    #[test]
    fn test_email_domain_validation_exact_match() {
        assert!(validate_email_domain("user@example.com", "example.com").is_ok());
    }

    #[test]
    fn test_email_domain_validation_case_insensitive() {
        assert!(validate_email_domain("user@EXAMPLE.COM", "example.com").is_ok());
        assert!(validate_email_domain("user@example.com", "EXAMPLE.COM").is_ok());
    }

    #[test]
    fn test_email_domain_validation_rejects_subdomain_bypass() {
        // Domain validation must reject subdomains of an allowlisted parent.
        let result = validate_email_domain("user@evil.example.com", "example.com");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("not allowed"));
    }

    #[test]
    fn test_email_domain_validation_rejects_different_domain() {
        let result = validate_email_domain("user@attacker.com", "example.com");
        assert!(result.is_err());
    }

    #[test]
    fn test_email_domain_validation_rejects_unicode_lookalike() {
        // Test with Cyrillic 'а' (U+0430) which looks like Latin 'a'
        // "exаmple.com" with Cyrillic 'а' should not match "example.com"
        let result = validate_email_domain("user@ex\u{0430}mple.com", "example.com");
        assert!(result.is_err());
    }

    #[test]
    fn test_email_domain_validation_invalid_email_format() {
        let result = validate_email_domain("no-at-symbol", "example.com");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Invalid email"));
    }
}

#[cfg(test)]
mod discovery_refresh_tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    #[tokio::test]
    async fn concurrent_discovery_is_coalesced_per_issuer() {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let issuer = format!("http://{}", listener.local_addr().unwrap());
        let calls = Arc::new(AtomicUsize::new(0));
        let app = axum::Router::new()
            .route(
                "/.well-known/openid-configuration",
                axum::routing::get({
                    let issuer = issuer.clone();
                    let calls = calls.clone();
                    move || {
                        let issuer = issuer.clone();
                        let calls = calls.clone();
                        async move {
                            calls.fetch_add(1, Ordering::SeqCst);
                            tokio::time::sleep(Duration::from_millis(20)).await;
                            axum::Json(serde_json::json!({
                                "issuer": issuer,
                                "authorization_endpoint": format!("{issuer}/authorize"),
                                "token_endpoint": format!("{issuer}/token"),
                                "jwks_uri": format!("{issuer}/keys"),
                                "response_types_supported": ["code"],
                                "subject_types_supported": ["public"],
                                "id_token_signing_alg_values_supported": ["RS256"]
                            }))
                        }
                    }
                }),
            )
            .route(
                "/keys",
                axum::routing::get(|| async { axum::Json(serde_json::json!({"keys": []})) }),
            );
        let server = tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });
        let service = Arc::new(OidcService::new("http://fixture/callback".into()));
        let mut readers = tokio::task::JoinSet::new();
        for _ in 0..32 {
            let service = service.clone();
            let issuer = issuer.clone();
            readers.spawn(async move { service.get_provider_metadata(&issuer).await });
        }
        while let Some(result) = readers.join_next().await {
            result.unwrap().unwrap();
        }
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        server.abort();
    }
}
