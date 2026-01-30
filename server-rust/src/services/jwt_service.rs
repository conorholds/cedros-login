//! JWT token generation and validation service
//!
//! Uses RS256 (asymmetric RSA) for JWT signing, with public keys exposed
//! via the standard JWKS endpoint at `/.well-known/jwks.json`.

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use rand::{distributions::Alphanumeric, rngs::OsRng, Rng};
use rsa::pkcs1::{DecodeRsaPrivateKey, EncodeRsaPrivateKey, EncodeRsaPublicKey};
use rsa::traits::PublicKeyParts;
use rsa::{RsaPrivateKey, RsaPublicKey};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::config::JwtConfig;
use crate::errors::AppError;
use crate::models::TokenPair;

/// RSA key size in bits (2048 is minimum for RS256)
const RSA_KEY_BITS: usize = 2048;

/// Access token claims
#[derive(Debug, Serialize, Deserialize)]
pub struct AccessTokenClaims {
    /// Subject (user ID)
    pub sub: Uuid,
    /// Session ID (for revocation check)
    pub sid: Uuid,
    /// Active organization ID (for multi-tenancy)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub org_id: Option<Uuid>,
    /// User's role in the active organization
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    /// Whether user is a system-wide admin
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_system_admin: Option<bool>,
    /// Issued at (Unix timestamp)
    pub iat: i64,
    /// Expiration (Unix timestamp)
    pub exp: i64,
    /// Issuer
    pub iss: String,
    /// Audience
    pub aud: String,
}

/// Context for generating tokens with org info
#[derive(Debug, Clone, Default)]
pub struct TokenContext {
    /// Active organization ID
    pub org_id: Option<Uuid>,
    /// User's role in the organization
    pub role: Option<String>,
    /// Whether user is a system-wide admin
    pub is_system_admin: Option<bool>,
}

/// JWKS (JSON Web Key Set) response
#[derive(Debug, Serialize)]
pub struct JwksResponse {
    pub keys: Vec<Jwk>,
}

/// Individual JWK (JSON Web Key) for RSA
#[derive(Debug, Serialize)]
pub struct Jwk {
    /// Key type (always "RSA" for RS256)
    pub kty: String,
    /// Algorithm (RS256)
    pub alg: String,
    /// Key ID
    pub kid: String,
    /// Key use (signature)
    #[serde(rename = "use")]
    pub key_use: String,
    /// RSA modulus (base64url encoded)
    pub n: String,
    /// RSA exponent (base64url encoded)
    pub e: String,
}

/// JWT service for token operations using RS256
#[derive(Clone)]
pub struct JwtService {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    /// Key ID for the current RSA key
    kid: String,
    /// Public key components for JWKS
    modulus_b64: String,
    exponent_b64: String,
    issuer: String,
    audience: String,
    access_expiry_secs: u64,
    refresh_expiry_secs: u64,
}

impl JwtService {
    /// Create a new JWT service from config
    ///
    /// If `rsa_private_key_pem` is set, uses that key.
    /// Otherwise, generates an ephemeral RSA key pair.
    pub fn new(config: &JwtConfig) -> Self {
        match Self::try_new(config) {
            Ok(svc) => svc,
            Err(e) => {
                // NOTE: This constructor cannot return a Result. Avoid panicking to reduce
                // backtrace noise in production and instead fail fast with a clear log.
                tracing::error!(error = %e, "Failed to initialize JwtService");

                // Best-effort fallback: if a provided RSA key is invalid/unsupported, try
                // again with an ephemeral key.
                let mut fallback = config.clone();
                fallback.rsa_private_key_pem = None;
                match Self::try_new(&fallback) {
                    Ok(svc) => {
                        tracing::warn!(
                            "JwtService initialized with ephemeral key due to prior failure; tokens will be invalid after restart"
                        );
                        svc
                    }
                    Err(e2) => {
                        tracing::error!(error = %e2, "JwtService fallback initialization failed");
                        std::process::exit(1)
                    }
                }
            }
        }
    }

    /// Create a new JWT service from config.
    ///
    /// This is the non-panicking constructor. Prefer this in embedding contexts
    /// where you can surface configuration errors to the caller.
    pub fn try_new(config: &JwtConfig) -> Result<Self, AppError> {
        fn generate_keypair() -> Result<(RsaPrivateKey, RsaPublicKey), AppError> {
            let private_key = RsaPrivateKey::new(&mut OsRng, RSA_KEY_BITS).map_err(|e| {
                AppError::Internal(anyhow::anyhow!("Failed to generate RSA key pair: {e}"))
            })?;
            let public_key = RsaPublicKey::from(&private_key);
            Ok((private_key, public_key))
        }

        let (mut private_key, mut public_key) = if let Some(ref pem) = config.rsa_private_key_pem {
            match RsaPrivateKey::from_pkcs1_pem(pem) {
                Ok(private_key) => {
                    let public_key = RsaPublicKey::from(&private_key);
                    (private_key, public_key)
                }
                Err(e) => {
                    tracing::error!(
                        error = %e,
                        "Invalid JWT_RSA_PRIVATE_KEY; falling back to ephemeral key"
                    );
                    tracing::warn!(
                        "JWTs will be invalid after restart. Fix JWT_RSA_PRIVATE_KEY configuration."
                    );
                    generate_keypair()?
                }
            }
        } else {
            tracing::warn!(
                "No RSA private key configured (JWT_RSA_PRIVATE_KEY). \
                Generating ephemeral key. JWTs will be invalid after restart."
            );
            generate_keypair()?
        };

        // Build signing material. If something goes wrong encoding keys, retry once with a fresh
        // ephemeral keypair; if that still fails, exit.
        for attempt in 0..2 {
            // Generate kid from public key fingerprint (first 8 bytes of modulus hash)
            let kid = {
                use sha2::{Digest, Sha256};
                let n_bytes = public_key.n().to_bytes_be();
                let hash = Sha256::digest(&n_bytes);
                hex::encode(&hash[..8])
            };

            let private_pem = match private_key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF) {
                Ok(pem) => pem,
                Err(e) => {
                    tracing::error!(error = %e, "Failed to encode private key to PEM");
                    if attempt == 0 {
                        (private_key, public_key) = generate_keypair()?;
                        continue;
                    }
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Failed to encode private key to PEM: {e}"
                    )));
                }
            };

            let public_pem = match public_key.to_pkcs1_pem(rsa::pkcs1::LineEnding::LF) {
                Ok(pem) => pem,
                Err(e) => {
                    tracing::error!(error = %e, "Failed to encode public key to PEM");
                    if attempt == 0 {
                        (private_key, public_key) = generate_keypair()?;
                        continue;
                    }
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Failed to encode public key to PEM: {e}"
                    )));
                }
            };

            let encoding_key = match EncodingKey::from_rsa_pem(private_pem.as_bytes()) {
                Ok(k) => k,
                Err(e) => {
                    tracing::error!(error = %e, "Failed to create RSA encoding key");
                    if attempt == 0 {
                        (private_key, public_key) = generate_keypair()?;
                        continue;
                    }
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Failed to create RSA encoding key: {e}"
                    )));
                }
            };

            let decoding_key = match DecodingKey::from_rsa_pem(public_pem.as_bytes()) {
                Ok(k) => k,
                Err(e) => {
                    tracing::error!(error = %e, "Failed to create RSA decoding key");
                    if attempt == 0 {
                        (private_key, public_key) = generate_keypair()?;
                        continue;
                    }
                    return Err(AppError::Internal(anyhow::anyhow!(
                        "Failed to create RSA decoding key: {e}"
                    )));
                }
            };

            // Extract modulus and exponent for JWKS
            let modulus_b64 = URL_SAFE_NO_PAD.encode(public_key.n().to_bytes_be());
            let exponent_b64 = URL_SAFE_NO_PAD.encode(public_key.e().to_bytes_be());

            return Ok(Self {
                encoding_key,
                decoding_key,
                kid,
                modulus_b64,
                exponent_b64,
                issuer: config.issuer.clone(),
                audience: config.audience.clone(),
                access_expiry_secs: config.access_token_expiry,
                refresh_expiry_secs: config.refresh_token_expiry,
            });
        }

        Err(AppError::Internal(anyhow::anyhow!(
            "Failed to initialize JwtService"
        )))
    }

    /// Get the JWKS (JSON Web Key Set) containing the public key
    pub fn get_jwks(&self) -> JwksResponse {
        JwksResponse {
            keys: vec![Jwk {
                kty: "RSA".to_string(),
                alg: "RS256".to_string(),
                kid: self.kid.clone(),
                key_use: "sig".to_string(),
                n: self.modulus_b64.clone(),
                e: self.exponent_b64.clone(),
            }],
        }
    }

    /// Get the key ID (kid) for the current signing key
    pub fn kid(&self) -> &str {
        &self.kid
    }

    /// Generate an access token for a user session
    pub fn generate_access_token(
        &self,
        user_id: Uuid,
        session_id: Uuid,
    ) -> Result<String, AppError> {
        self.generate_access_token_with_context(user_id, session_id, &TokenContext::default())
    }

    /// Generate an access token with organization context
    pub fn generate_access_token_with_context(
        &self,
        user_id: Uuid,
        session_id: Uuid,
        context: &TokenContext,
    ) -> Result<String, AppError> {
        let now = Utc::now();
        let exp = now + Duration::seconds(self.access_expiry_secs as i64);

        let claims = AccessTokenClaims {
            sub: user_id,
            sid: session_id,
            org_id: context.org_id,
            role: context.role.clone(),
            is_system_admin: context.is_system_admin,
            iat: now.timestamp(),
            exp: exp.timestamp(),
            iss: self.issuer.clone(),
            aud: self.audience.clone(),
        };

        // Create header with kid for JWKS lookup
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some(self.kid.clone());

        encode(&header, &claims, &self.encoding_key)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to encode JWT")))
    }

    /// Generate an opaque refresh token (random string, not JWT)
    pub fn generate_refresh_token(&self) -> String {
        // SEC-08: Use OsRng for cryptographic random generation
        OsRng
            .sample_iter(&Alphanumeric)
            .take(44) // S-09: 44 chars = ~262 bits of entropy (log2(62^44) ≈ 262)
            .map(char::from)
            .collect()
    }

    /// Validate and decode an access token
    ///
    /// # Security
    ///
    /// Explicitly specifies RS256 algorithm to prevent algorithm confusion attacks.
    /// Also explicitly enables expiration validation (enabled by default but explicit
    /// for defense-in-depth).
    pub fn validate_access_token(&self, token: &str) -> Result<AccessTokenClaims, AppError> {
        // Explicitly specify RS256 to prevent algorithm confusion attacks
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&[&self.issuer]);
        validation.set_audience(&[&self.audience]);
        // Explicitly enable exp validation (defense-in-depth)
        validation.validate_exp = true;

        decode::<AccessTokenClaims>(token, &self.decoding_key, &validation)
            .map(|data| data.claims)
            .map_err(|e| match e.kind() {
                jsonwebtoken::errors::ErrorKind::ExpiredSignature => AppError::TokenExpired,
                _ => AppError::InvalidToken,
            })
    }

    /// Generate a complete token pair
    pub fn generate_token_pair(
        &self,
        user_id: Uuid,
        session_id: Uuid,
    ) -> Result<TokenPair, AppError> {
        self.generate_token_pair_with_context(user_id, session_id, &TokenContext::default())
    }

    /// Generate a complete token pair with organization context
    pub fn generate_token_pair_with_context(
        &self,
        user_id: Uuid,
        session_id: Uuid,
        context: &TokenContext,
    ) -> Result<TokenPair, AppError> {
        let access_token = self.generate_access_token_with_context(user_id, session_id, context)?;
        let refresh_token = self.generate_refresh_token();

        Ok(TokenPair {
            access_token,
            refresh_token,
            expires_in: self.access_expiry_secs,
        })
    }

    /// Get the refresh token expiry duration in seconds
    pub fn refresh_expiry_secs(&self) -> u64 {
        self.refresh_expiry_secs
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> JwtConfig {
        JwtConfig {
            secret: "test-secret-key-for-testing-only".to_string(),
            // Use ephemeral key for tests
            rsa_private_key_pem: None,
            issuer: "test-issuer".to_string(),
            audience: "test-audience".to_string(),
            access_token_expiry: 900,
            refresh_token_expiry: 604800,
        }
    }

    #[test]
    fn test_generate_and_validate_access_token() {
        let service = JwtService::new(&test_config());
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let token = service.generate_access_token(user_id, session_id).unwrap();
        let claims = service.validate_access_token(&token).unwrap();

        assert_eq!(claims.sub, user_id);
        assert_eq!(claims.sid, session_id);
        assert_eq!(claims.iss, "test-issuer");
        assert_eq!(claims.aud, "test-audience");
    }

    #[test]
    fn test_try_new_constructs_service() {
        let service = JwtService::try_new(&test_config()).unwrap();
        assert!(!service.kid().is_empty());
    }

    #[test]
    fn test_token_has_kid_header() {
        let service = JwtService::new(&test_config());
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let token = service.generate_access_token(user_id, session_id).unwrap();

        // Decode header without verification
        let header = jsonwebtoken::decode_header(&token).unwrap();
        assert_eq!(header.alg, Algorithm::RS256);
        assert!(header.kid.is_some());
        assert_eq!(header.kid.unwrap(), service.kid());
    }

    #[test]
    fn test_jwks_response() {
        let service = JwtService::new(&test_config());
        let jwks = service.get_jwks();

        assert_eq!(jwks.keys.len(), 1);
        let key = &jwks.keys[0];
        assert_eq!(key.kty, "RSA");
        assert_eq!(key.alg, "RS256");
        assert_eq!(key.key_use, "sig");
        assert_eq!(key.kid, service.kid());
        assert!(!key.n.is_empty());
        assert!(!key.e.is_empty());
    }

    #[test]
    fn test_invalid_token() {
        let service = JwtService::new(&test_config());
        let result = service.validate_access_token("invalid.token.here");
        assert!(matches!(result, Err(AppError::InvalidToken)));
    }

    #[test]
    fn test_refresh_token_uniqueness() {
        let service = JwtService::new(&test_config());
        let token1 = service.generate_refresh_token();
        let token2 = service.generate_refresh_token();
        assert_ne!(token1, token2);
        assert_eq!(token1.len(), 44); // S-09: increased from 43 to 44 chars
    }

    #[test]
    fn test_token_pair_generation() {
        let service = JwtService::new(&test_config());
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let pair = service.generate_token_pair(user_id, session_id).unwrap();
        assert!(!pair.access_token.is_empty());
        assert!(!pair.refresh_token.is_empty());
        assert_eq!(pair.expires_in, 900);
    }

    #[test]
    fn test_jwt_uses_rs256_algorithm() {
        let service = JwtService::new(&test_config());
        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();

        let token = service.generate_access_token(user_id, session_id).unwrap();
        let header = jsonwebtoken::decode_header(&token).unwrap();

        assert_eq!(header.alg, Algorithm::RS256);
    }
}
