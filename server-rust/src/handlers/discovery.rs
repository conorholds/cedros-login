//! Discovery endpoints for API documentation and agent authentication

use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// OpenAPI specification loaded at compile time from external file.
/// This keeps the handler code clean while ensuring the spec is always available.
const OPENAPI_SPEC: &str = include_str!("../openapi.json");

/// Authentication method available for agents
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthMethod {
    /// Method identifier
    pub method: String,
    /// Human-readable description
    pub description: String,
    /// Whether this method is recommended for agents
    pub recommended_for_agents: bool,
    /// Endpoints for this auth method
    pub endpoints: Vec<AuthEndpoint>,
    /// Step-by-step flow description
    pub flow: Vec<String>,
}

/// An authentication endpoint
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthEndpoint {
    /// HTTP method
    pub method: String,
    /// Path (relative to auth prefix)
    pub path: String,
    /// Description of what this endpoint does
    pub description: String,
    /// Whether authentication is required
    pub requires_auth: bool,
}

/// Discovery response for agent authentication
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthConfigResponse {
    /// API version
    pub version: String,
    /// Base URL hint (agents should use their configured base URL)
    pub base_path: String,
    /// Available authentication methods
    pub auth_methods: Vec<AuthMethod>,
    /// How to use the API key after authentication
    pub api_key_usage: ApiKeyUsage,
    /// Links to additional resources
    pub links: DiscoveryLinks,
    /// Wallet configuration (if enabled)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wallet: Option<WalletDiscoveryConfig>,
}

/// How to use API keys
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiKeyUsage {
    /// Header name for API key
    pub header: String,
    /// Header format
    pub format: String,
    /// Example
    pub example: String,
    /// Prefix for API keys
    pub key_prefix: String,
}

/// Links to additional resources
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoveryLinks {
    /// Link to full API documentation (if available)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub documentation: Option<String>,
    /// Link to OpenAPI spec (if available)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub openapi: Option<String>,
}

/// Wallet configuration exposed to clients
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WalletDiscoveryConfig {
    /// Whether server-side signing wallet is enabled
    pub enabled: bool,
    /// Recovery mode: "share_c_only" (app-locked) or "full_seed" (portable)
    pub recovery_mode: String,
    /// Session unlock TTL in seconds
    pub unlock_ttl_seconds: u64,
}

/// GET /.well-known/auth-config - Discovery endpoint for agent authentication
///
/// Returns information about available authentication methods, with a focus on
/// helping AI agents understand how to authenticate programmatically.
pub async fn auth_config<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Json<AuthConfigResponse> {
    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    let base_path = if base_path.is_empty() { "/" } else { base_path };
    let openapi_path = if base_path == "/" {
        "/openapi.json".to_string()
    } else {
        format!("{}/openapi.json", base_path)
    };

    // Build wallet config if enabled
    let wallet = if state.config.wallet.enabled {
        Some(WalletDiscoveryConfig {
            enabled: true,
            recovery_mode: state.config.wallet.recovery_mode.as_str().to_string(),
            unlock_ttl_seconds: state.config.wallet.unlock_ttl_secs,
        })
    } else {
        None
    };

    let auth_methods = build_auth_methods(&state.config, base_path);

    Json(AuthConfigResponse {
        version: "1.0".to_string(),
        base_path: base_path.to_string(),
        auth_methods,
        api_key_usage: ApiKeyUsage {
            header: "Authorization".to_string(),
            format: "Bearer <api-key>".to_string(),
            example: "Authorization: Bearer ck_abc123...".to_string(),
            key_prefix: "ck_".to_string(),
        },
        links: DiscoveryLinks {
            documentation: None,
            openapi: Some(openapi_path),
        },
        wallet,
    })
}

fn build_auth_methods(config: &crate::config::Config, base_path: &str) -> Vec<AuthMethod> {
    let mut methods = Vec::new();
    let prefix = if base_path == "/" {
        String::new()
    } else {
        base_path.to_string()
    };

    if config.solana.enabled {
        methods.push(AuthMethod {
            method: "solana".to_string(),
            description: "Authenticate using a Solana wallet signature. Recommended for AI agents as it requires no email and allows key recovery.".to_string(),
            recommended_for_agents: true,
            endpoints: vec![
                AuthEndpoint {
                    method: "POST".to_string(),
                    path: format!("{}/solana/challenge", prefix),
                    description: "Get a challenge nonce to sign. Send { \"publicKey\": \"<base58-pubkey>\" }".to_string(),
                    requires_auth: false,
                },
                AuthEndpoint {
                    method: "POST".to_string(),
                    path: format!("{}/solana", prefix),
                    description: "Authenticate with signed challenge. Send { \"publicKey\": \"<base58-pubkey>\", \"signature\": \"<base58-signature>\" }".to_string(),
                    requires_auth: false,
                },
            ],
            flow: vec![
                "1. Generate a Solana keypair (Ed25519)".to_string(),
                "2. POST /auth/solana/challenge with your public key".to_string(),
                "3. Sign the returned nonce with your private key".to_string(),
                "4. POST /auth/solana with public key and signature".to_string(),
                "5. Receive API key in response (apiKey field for new users)".to_string(),
                "6. Use API key for all subsequent requests".to_string(),
                "7. To recover/regenerate: repeat steps 2-5 with same keypair".to_string(),
            ],
        });
    }

    if config.email.enabled {
        methods.push(AuthMethod {
            method: "email".to_string(),
            description: "Traditional email/password registration and login.".to_string(),
            recommended_for_agents: false,
            endpoints: vec![
                AuthEndpoint {
                    method: "POST".to_string(),
                    path: format!("{}/register", prefix),
                    description:
                        "Register new account. Send { \"email\": \"...\", \"password\": \"...\" }"
                            .to_string(),
                    requires_auth: false,
                },
                AuthEndpoint {
                    method: "POST".to_string(),
                    path: format!("{}/login", prefix),
                    description: "Login to existing account".to_string(),
                    requires_auth: false,
                },
            ],
            flow: vec![
                "1. POST /auth/register with email and password".to_string(),
                "2. Receive API key in response (for new accounts)".to_string(),
                "3. Note: Email verification may be required for some features".to_string(),
            ],
        });
    }

    methods
}

/// GET /.well-known/jwks.json - JSON Web Key Set endpoint
///
/// Returns the public RSA key used for JWT signature verification.
/// Clients (like cedros-pay) use this to validate access tokens.
pub async fn jwks<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Response {
    let jwks = state.jwt_service.get_jwks();
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/json")],
        Json(jwks),
    )
        .into_response()
}

/// GET /openapi.json - OpenAPI 3.0 specification
///
/// Returns the complete OpenAPI specification for the authentication service.
/// The spec is loaded from an external JSON file at compile time.
/// When this service is mounted as a sub-path (e.g., /auth), consuming apps
/// should aggregate this spec with others at the root level.
pub async fn openapi_spec() -> Response {
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/json")],
        OPENAPI_SPEC,
    )
        .into_response()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_config_response_structure() {
        // Test that the response types serialize correctly
        let response = AuthConfigResponse {
            version: "1.0".to_string(),
            base_path: "/auth".to_string(),
            auth_methods: vec![AuthMethod {
                method: "solana".to_string(),
                description: "Test".to_string(),
                recommended_for_agents: true,
                endpoints: vec![],
                flow: vec![],
            }],
            api_key_usage: ApiKeyUsage {
                header: "Authorization".to_string(),
                format: "Bearer <api-key>".to_string(),
                example: "Authorization: Bearer ck_abc...".to_string(),
                key_prefix: "ck_".to_string(),
            },
            links: DiscoveryLinks {
                documentation: None,
                openapi: Some("/openapi.json".to_string()),
            },
            wallet: None,
        };

        assert_eq!(response.version, "1.0");
        assert!(!response.auth_methods.is_empty());

        // Solana should be recommended for agents
        let solana = response.auth_methods.iter().find(|m| m.method == "solana");
        assert!(solana.is_some());
        assert!(solana.unwrap().recommended_for_agents);

        // Serialization should work
        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"version\":\"1.0\""));
        assert!(!json.contains("\"wallet\"")); // None should be omitted
    }

    #[test]
    fn test_wallet_discovery_config() {
        // Test wallet config serialization
        let response = AuthConfigResponse {
            version: "1.0".to_string(),
            base_path: "/auth".to_string(),
            auth_methods: vec![],
            api_key_usage: ApiKeyUsage {
                header: "Authorization".to_string(),
                format: "Bearer <api-key>".to_string(),
                example: "Authorization: Bearer ck_abc...".to_string(),
                key_prefix: "ck_".to_string(),
            },
            links: DiscoveryLinks {
                documentation: None,
                openapi: None,
            },
            wallet: Some(WalletDiscoveryConfig {
                enabled: true,
                recovery_mode: "share_c_only".to_string(),
                unlock_ttl_seconds: 900,
            }),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("\"wallet\""));
        assert!(json.contains("\"recoveryMode\":\"share_c_only\""));
        assert!(json.contains("\"unlockTtlSeconds\":900"));
    }

    #[tokio::test]
    async fn test_openapi_spec_is_valid_json() {
        // Verify the OpenAPI spec is valid JSON
        let parsed: Result<serde_json::Value, _> = serde_json::from_str(OPENAPI_SPEC);
        assert!(parsed.is_ok(), "OpenAPI spec should be valid JSON");

        let spec = parsed.unwrap();
        assert_eq!(spec["openapi"], "3.0.3");
        assert!(spec["info"]["title"].is_string());
        assert!(spec["paths"].is_object());
    }

    #[test]
    fn test_auth_methods_respect_config_flags() {
        let mut config = crate::config::Config {
            server: crate::config::ServerConfig::default(),
            jwt: crate::config::JwtConfig {
                secret: "s".repeat(32),
                rsa_private_key_pem: None,
                issuer: crate::config::default_issuer(),
                audience: crate::config::default_audience(),
                access_token_expiry: crate::config::default_access_expiry(),
                refresh_token_expiry: crate::config::default_refresh_expiry(),
            },
            email: crate::config::EmailConfig::default(),
            google: crate::config::GoogleConfig::default(),
            apple: crate::config::AppleConfig::default(),
            solana: crate::config::SolanaConfig::default(),
            webauthn: crate::config::WebAuthnConfig::default(),
            cors: crate::config::CorsConfig::default(),
            cookie: crate::config::CookieConfig::default(),
            webhook: crate::config::WebhookConfig::default(),
            rate_limit: crate::config::RateLimitConfig::default(),
            database: crate::config::DatabaseConfig::default(),
            notification: crate::config::NotificationConfig::default(),
            sso: crate::config::SsoConfig::default(),
            wallet: crate::config::WalletConfig::default(),
            privacy: crate::config::PrivacyConfig::default(),
        };

        config.solana.enabled = false;
        config.email.enabled = true;
        let methods = build_auth_methods(&config, "/auth");
        assert!(methods.iter().all(|m| m.method != "solana"));
        assert!(methods.iter().any(|m| m.method == "email"));
    }

    #[test]
    fn test_auth_methods_apply_base_path() {
        let config = crate::config::Config {
            server: crate::config::ServerConfig::default(),
            jwt: crate::config::JwtConfig {
                secret: "s".repeat(32),
                rsa_private_key_pem: None,
                issuer: crate::config::default_issuer(),
                audience: crate::config::default_audience(),
                access_token_expiry: crate::config::default_access_expiry(),
                refresh_token_expiry: crate::config::default_refresh_expiry(),
            },
            email: crate::config::EmailConfig::default(),
            google: crate::config::GoogleConfig::default(),
            apple: crate::config::AppleConfig::default(),
            solana: crate::config::SolanaConfig::default(),
            webauthn: crate::config::WebAuthnConfig::default(),
            cors: crate::config::CorsConfig::default(),
            cookie: crate::config::CookieConfig::default(),
            webhook: crate::config::WebhookConfig::default(),
            rate_limit: crate::config::RateLimitConfig::default(),
            database: crate::config::DatabaseConfig::default(),
            notification: crate::config::NotificationConfig::default(),
            sso: crate::config::SsoConfig::default(),
            wallet: crate::config::WalletConfig::default(),
            privacy: crate::config::PrivacyConfig::default(),
        };

        let methods = build_auth_methods(&config, "/auth/v2");
        let solana = methods.iter().find(|m| m.method == "solana").unwrap();
        assert!(solana
            .endpoints
            .iter()
            .any(|e| e.path == "/auth/v2/solana/challenge"));
    }
}
