//! SSO (Single Sign-On) models for Enterprise OIDC providers
//!
//! Supports configurable OIDC providers per organization.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// OIDC provider configuration for an organization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SsoProvider {
    pub id: Uuid,
    /// Organization this provider is configured for
    pub org_id: Uuid,
    /// Display name (e.g., "Okta", "Azure AD", "Auth0")
    pub name: String,
    /// OIDC Issuer URL (e.g., "https://login.microsoftonline.com/{tenant}/v2.0")
    pub issuer_url: String,
    /// Client ID from the identity provider
    pub client_id: String,
    /// Client secret (encrypted at rest)
    pub client_secret_encrypted: String,
    /// Scopes to request (default: "openid email profile")
    pub scopes: Vec<String>,
    /// Whether this provider is active
    pub enabled: bool,
    /// Whether users can self-register via this provider
    pub allow_registration: bool,
    /// Domain restriction (e.g., only allow emails from "company.com")
    pub email_domain: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl SsoProvider {
    /// Create a new SSO provider
    pub fn new(
        org_id: Uuid,
        name: String,
        issuer_url: String,
        client_id: String,
        client_secret_encrypted: String,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            org_id,
            name,
            issuer_url,
            client_id,
            client_secret_encrypted,
            scopes: vec!["openid".into(), "email".into(), "profile".into()],
            enabled: true,
            allow_registration: true,
            email_domain: None,
            created_at: now,
            updated_at: now,
        }
    }

    /// Get default scopes as a space-separated string
    pub fn scopes_string(&self) -> String {
        self.scopes.join(" ")
    }
}

/// SSO authentication state (stored during auth flow)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SsoAuthState {
    pub state_id: Uuid,
    pub provider_id: Uuid,
    pub org_id: Uuid,
    /// PKCE code verifier (stored server-side)
    pub pkce_verifier: String,
    /// OIDC nonce for token validation
    pub nonce: String,
    /// Redirect URL after authentication
    pub redirect_uri: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

impl SsoAuthState {
    /// Create a new SSO auth state
    pub fn new(
        provider_id: Uuid,
        org_id: Uuid,
        pkce_verifier: String,
        nonce: String,
        redirect_uri: Option<String>,
        ttl_seconds: i64,
    ) -> Self {
        let now = Utc::now();
        Self {
            state_id: Uuid::new_v4(),
            provider_id,
            org_id,
            pkce_verifier,
            nonce,
            redirect_uri,
            created_at: now,
            expires_at: now + chrono::Duration::seconds(ttl_seconds),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sso_provider_creation() {
        let org_id = Uuid::new_v4();
        let provider = SsoProvider::new(
            org_id,
            "Okta".into(),
            "https://dev-123.okta.com".into(),
            "client-id".into(),
            "encrypted-secret".into(),
        );

        assert_eq!(provider.org_id, org_id);
        assert_eq!(provider.name, "Okta");
        assert!(provider.enabled);
        assert_eq!(provider.scopes_string(), "openid email profile");
    }

    #[test]
    fn test_sso_auth_state_expiry() {
        let state = SsoAuthState::new(
            Uuid::new_v4(),
            Uuid::new_v4(),
            "verifier".into(),
            "nonce".into(),
            None,
            300,
        );

        assert!(state.expires_at > state.created_at);
    }
}
