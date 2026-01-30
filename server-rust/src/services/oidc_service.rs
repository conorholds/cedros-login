//! OIDC service for Enterprise SSO
//!
//! Handles OpenID Connect authentication flows with configurable providers.

use openidconnect::{
    core::{CoreProviderMetadata, CoreResponseType, CoreTokenResponse},
    AuthenticationFlow, AuthorizationCode, ClientId, ClientSecret, CsrfToken, EndUserEmail,
    IssuerUrl, Nonce, PkceCodeChallenge, PkceCodeVerifier, RedirectUrl, Scope, TokenResponse,
};
use std::collections::HashMap;
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

/// S-01: Validate email domain with exact matching and Unicode normalization.
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
            "Email domain not allowed. Must be @{}",
            expected_domain
        )));
    }
    Ok(())
}

/// OIDC service for handling Enterprise SSO
pub struct OidcService {
    /// Callback URL template (e.g., "https://api.example.com/auth/sso/callback")
    callback_url: String,
    http_client: reqwest::Client,
    metadata_cache: Arc<RwLock<HashMap<String, CachedProviderMetadata>>>,
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
            .unwrap_or_else(|e| {
                tracing::error!(
                    error = %e,
                    "Failed to build OIDC HTTP client; falling back to defaults"
                );
                reqwest::Client::new()
            });

        Self {
            callback_url,
            http_client,
            metadata_cache: Arc::new(RwLock::new(HashMap::new())),
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

        let issuer_url = IssuerUrl::new(issuer.to_string())
            .map_err(|e| AppError::Config(format!("Invalid issuer URL: {}", e)))?;
        let provider_metadata = tokio::time::timeout(
            Duration::from_secs(OIDC_HTTP_TIMEOUT_SECS),
            CoreProviderMetadata::discover_async(issuer_url, &self.http_client),
        )
        .await
        .map_err(|_| {
            AppError::Internal(anyhow::anyhow!(
                "OIDC discovery failed: request timed out after {}s",
                OIDC_HTTP_TIMEOUT_SECS
            ))
        })?
        .map_err(|e| AppError::Internal(anyhow::anyhow!("OIDC discovery failed: {:?}", e)))?;

        {
            let mut cache = self.metadata_cache.write().await;
            cache.insert(
                issuer.to_string(),
                CachedProviderMetadata {
                    metadata: provider_metadata.clone(),
                    expires_at: now + Duration::from_secs(OIDC_METADATA_CACHE_TTL_SECS),
                },
            );
        }

        Ok(provider_metadata)
    }

    /// Start the SSO authentication flow
    pub async fn start_auth(
        &self,
        provider: &SsoProvider,
        client_secret: &str,
        redirect_uri: Option<String>,
        sso_repo: &Arc<dyn SsoRepository>,
    ) -> Result<SsoAuthStart, AppError> {
        // Build OIDC client inline (type-state pattern prevents returning from helper)
        let provider_metadata = self.get_provider_metadata(&provider.issuer_url).await?;

        let client_id = ClientId::new(provider.client_id.clone());
        let client_secret_obj = ClientSecret::new(client_secret.to_string());
        let redirect_url = RedirectUrl::new(self.callback_url.clone())
            .map_err(|e| AppError::Config(format!("Invalid redirect URL: {}", e)))?;

        let client = openidconnect::core::CoreClient::from_provider_metadata(
            provider_metadata,
            client_id,
            Some(client_secret_obj),
        )
        .set_redirect_uri(redirect_url);

        // Generate PKCE challenge
        let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

        // S-19: Generate our state ID upfront and use it directly as the CSRF token
        // This avoids fragile string replacement and ensures the state parameter
        // matches what we store.
        let state_id = Uuid::new_v4();
        let state_id_string = state_id.to_string();
        let state_id_for_closure = state_id_string.clone();

        // Generate nonce for token validation
        let nonce = Nonce::new_random();
        let nonce_secret = nonce.secret().to_string();
        let nonce_for_url = nonce.clone();

        // Build authorization URL with CoreResponseType
        // Pass our state_id directly as the CSRF token instead of generating
        // a random one and replacing it later.
        let mut auth_request = client.authorize_url(
            AuthenticationFlow::<CoreResponseType>::AuthorizationCode,
            move || CsrfToken::new(state_id_for_closure.clone()),
            move || nonce_for_url.clone(),
        );

        // Add scopes
        for scope in &provider.scopes {
            auth_request = auth_request.add_scope(Scope::new(scope.clone()));
        }

        // Add PKCE
        let (auth_url, _csrf_token, _nonce) = auth_request.set_pkce_challenge(pkce_challenge).url();

        // Create auth state with our state_id
        let mut auth_state = SsoAuthState::new(
            provider.id,
            provider.org_id,
            pkce_verifier.secret().to_string(),
            nonce_secret,
            redirect_uri,
            AUTH_STATE_TTL_SECS,
        );
        auth_state.state_id = state_id;

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
            .map_err(|e| AppError::Config(format!("Invalid redirect URL: {}", e)))?;

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
            .map_err(|e| AppError::Config(format!("OIDC token endpoint error: {:?}", e)))?;
        let token_response: CoreTokenResponse = token_request
            .set_pkce_verifier(pkce_verifier)
            .request_async(&self.http_client)
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
            .map_err(|e| AppError::Validation(format!("Token verification failed: {:?}", e)))?;

        // Extract claims - email() returns Option<&EndUserEmail>
        let email: Option<String> = claims
            .email()
            .map(|e: &EndUserEmail| e.as_str().to_string());
        let email_verified = claims.email_verified();

        // S-01: Verify email domain with exact matching and Unicode normalization
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

#[cfg(test)]
mod tests {
    use super::*;
    use openidconnect::core::{CoreJwsSigningAlgorithm, CoreSubjectIdentifierType};
    use openidconnect::{AuthUrl, JsonWebKeySetUrl, ResponseTypes};

    #[test]
    fn test_oidc_service_creation() {
        let service = OidcService::new("https://api.example.com/auth/sso/callback".into());
        assert_eq!(
            service.callback_url,
            "https://api.example.com/auth/sso/callback"
        );
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

    // S-01: Tests for email domain validation

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
        // This was the vulnerability: ends_with("@example.com") would not catch this,
        // but now we extract and compare the exact domain
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
