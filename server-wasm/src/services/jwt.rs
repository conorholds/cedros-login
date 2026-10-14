//! JWT issuance + validation, ported faithfully from
//! `server/src/services/jwt_service.rs`: **RS256** access tokens with a `kid`
//! header + JWKS, and **opaque** random refresh tokens (not JWTs).
//!
//! Made synchronous for the component. The RSA private key is loaded from the
//! per-extension `secrets` seam, which is **guest-writable only** (no operator
//! path in wasm mode), so the extension seeds its own key with
//! [`generate_private_key_pem`] via `secrets::get_or_create` on first token or
//! JWKS use. Keygen runs once, then the sealed PEM is reused, so the signing key
//! is stable across the per-request fresh instances.
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use chrono::{Duration, Utc};
use jsonwebtoken::{
    decode, decode_header, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use rand::distributions::Alphanumeric;
use rand::{rngs::OsRng, Rng};
use rsa::pkcs1::{DecodeRsaPrivateKey, EncodeRsaPrivateKey, LineEnding};
use rsa::traits::PublicKeyParts;
use rsa::{RsaPrivateKey, RsaPublicKey};
use serde::{Deserialize, Serialize};

use super::AuthError;

#[path = "oauth_jwt.rs"]
mod oauth;
pub use oauth::OAuthAccessClaims;

/// Generate a fresh PKCS#1 RSA-2048 private-key PEM for the JWT signing key.
/// Called once via `secrets::get_or_create` on first token or JWKS use.
pub fn generate_private_key_pem() -> Result<String, AuthError> {
    let key = RsaPrivateKey::new(&mut OsRng, 2048)
        .map_err(|e| AuthError::Crypto(format!("rsa keygen: {e}")))?;
    Ok(key
        .to_pkcs1_pem(LineEnding::LF)
        .map_err(|e| AuthError::Crypto(format!("rsa pem encode: {e}")))?
        .to_string())
}

/// Access-token claims (mirrors the standalone server). Ids are strings.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AccessTokenClaims {
    pub sub: String,
    pub sid: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub org_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_system_admin: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email_verified: Option<bool>,
    pub iat: i64,
    pub nbf: i64,
    pub exp: i64,
    pub iss: String,
    pub aud: String,
}

/// Optional org/role context stamped into the access token.
#[derive(Debug, Clone, Default)]
pub struct TokenContext {
    pub org_id: Option<String>,
    pub role: Option<String>,
    pub is_system_admin: Option<bool>,
    pub email_verified: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: u64,
}

#[derive(Clone, Debug, Serialize)]
pub struct Jwk {
    pub kty: String,
    pub alg: String,
    pub kid: String,
    #[serde(rename = "use")]
    pub key_use: String,
    pub n: String,
    pub e: String,
}

#[derive(Debug, Serialize)]
pub struct Jwks {
    pub keys: Vec<Jwk>,
}

#[derive(Clone)]
pub struct JwtService {
    encoding_key: EncodingKey,
    kid: String,
    verification_keys: Vec<VerificationKey>,
    issuer: String,
    audience: String,
    access_expiry_secs: u64,
}

#[derive(Clone)]
struct VerificationKey {
    jwk: Jwk,
    decoding_key: DecodingKey,
}

impl JwtService {
    /// Build from a PKCS#1 RSA private-key PEM (from the host secret store).
    pub fn from_pem(
        private_key_pem: &str,
        issuer: String,
        audience: String,
        access_expiry_secs: u64,
    ) -> Result<Self, AuthError> {
        Self::from_key_ring(private_key_pem, None, issuer, audience, access_expiry_secs)
    }

    /// Build with the active signing key and an optional previous verification
    /// key. During rotation both `kid`s remain in JWKS and validate until the
    /// caller removes the previous key after the overlap window.
    pub fn from_key_ring(
        active_private_key_pem: &str,
        previous_private_key_pem: Option<&str>,
        issuer: String,
        audience: String,
        access_expiry_secs: u64,
    ) -> Result<Self, AuthError> {
        let (encoding_key, active) = key_material(active_private_key_pem)?;
        let kid = active.jwk.kid.clone();
        let mut verification_keys = vec![active];
        if let Some(previous_pem) = previous_private_key_pem {
            let (_, previous) = key_material(previous_pem)?;
            if previous.jwk.kid != kid {
                verification_keys.push(previous);
            }
        }

        Ok(Self {
            encoding_key,
            kid,
            verification_keys,
            issuer,
            audience,
            access_expiry_secs,
        })
    }

    pub fn kid(&self) -> &str {
        &self.kid
    }

    /// Public JWKS for the `/.well-known/jwks.json` route. The active key is
    /// first; a still-valid previous key follows during rotation overlap.
    pub fn jwks(&self) -> Jwks {
        Jwks {
            keys: self
                .verification_keys
                .iter()
                .map(|key| key.jwk.clone())
                .collect(),
        }
    }

    /// Issue an RS256 access token (with `kid` header) for a session.
    pub fn generate_access_token(
        &self,
        user_id: &str,
        session_id: &str,
        context: &TokenContext,
    ) -> Result<String, AuthError> {
        let now = Utc::now();
        let claims = AccessTokenClaims {
            sub: user_id.to_string(),
            sid: session_id.to_string(),
            org_id: context.org_id.clone(),
            role: context.role.clone(),
            is_system_admin: context.is_system_admin,
            email_verified: context.email_verified,
            iat: now.timestamp(),
            nbf: now.timestamp(),
            exp: (now + Duration::seconds(self.access_expiry_secs as i64)).timestamp(),
            iss: self.issuer.clone(),
            aud: self.audience.clone(),
        };
        self.encode_claims(&claims)
    }

    fn encode_claims(&self, claims: &AccessTokenClaims) -> Result<String, AuthError> {
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some(self.kid.clone());
        encode(&header, claims, &self.encoding_key)
            .map_err(|e| AuthError::Crypto(format!("token encode: {e}")))
    }

    /// Opaque, high-entropy refresh token (44 chars ~= 262 bits). Stored hashed.
    pub fn generate_refresh_token(&self) -> String {
        OsRng
            .sample_iter(&Alphanumeric)
            .take(44)
            .map(char::from)
            .collect()
    }

    /// Validate an access token: exact `kid`, RS256, issuer, audience, `exp`,
    /// and `nbf`. Unknown key ids never fall back to another key.
    pub fn validate_access_token(&self, token: &str) -> Result<AccessTokenClaims, AuthError> {
        let header = decode_header(token)
            .map_err(|e| AuthError::Unauthorized(format!("bad header: {e}")))?;
        if header.alg != Algorithm::RS256 {
            return Err(AuthError::Unauthorized("unsupported algorithm".to_string()));
        }
        let kid = header
            .kid
            .as_deref()
            .ok_or_else(|| AuthError::Unauthorized("missing key id".to_string()))?;
        let key = self
            .verification_keys
            .iter()
            .find(|key| key.jwk.kid == kid)
            .ok_or_else(|| AuthError::Unauthorized("unknown key id".to_string()))?;
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&[&self.issuer]);
        validation.set_audience(&[&self.audience]);
        validation.leeway = 0;
        validation.validate_exp = true;
        validation.validate_nbf = true;
        decode::<AccessTokenClaims>(token, &key.decoding_key, &validation)
            .map_err(|e| AuthError::Unauthorized(format!("invalid token: {e}")))
            .and_then(|data| {
                let claims = data.claims;
                let now = crate::clock::now_unix() as i64;
                if claims.exp <= now
                    || claims.iat > now
                    || claims.exp <= claims.iat
                    || claims.nbf >= claims.exp
                    || claims.sub.is_empty()
                    || claims.sid.is_empty()
                {
                    return Err(AuthError::Unauthorized("invalid token claims".into()));
                }
                Ok(claims)
            })
    }
}

fn key_material(private_key_pem: &str) -> Result<(EncodingKey, VerificationKey), AuthError> {
    let private_key = RsaPrivateKey::from_pkcs1_pem(private_key_pem)
        .map_err(|e| AuthError::Crypto(format!("invalid RSA private key: {e}")))?;
    if private_key.n().bits() < 2048 {
        return Err(AuthError::Crypto(
            "RSA signing key must be at least 2048 bits".into(),
        ));
    }
    let public_key = RsaPublicKey::from(&private_key);

    let kid = {
        use sha2::{Digest, Sha256};
        let hash = Sha256::digest(public_key.n().to_bytes_be());
        hex::encode(&hash[..8])
    };
    // Reuse the parsed key and public components instead of decoding the private
    // PEM twice and serializing/parsing an intermediate public PEM.
    let private_der = rsa::pkcs1::EncodeRsaPrivateKey::to_pkcs1_der(&private_key)
        .map_err(|error| AuthError::Crypto(format!("encoding key: {error}")))?;
    let encoding_key = EncodingKey::from_rsa_der(private_der.as_bytes());
    let n = URL_SAFE_NO_PAD.encode(public_key.n().to_bytes_be());
    let e = URL_SAFE_NO_PAD.encode(public_key.e().to_bytes_be());
    let decoding_key = DecodingKey::from_rsa_components(&n, &e)
        .map_err(|error| AuthError::Crypto(format!("decoding key: {error}")))?;

    Ok((
        encoding_key,
        VerificationKey {
            decoding_key,
            jwk: Jwk {
                kty: "RSA".to_string(),
                alg: "RS256".to_string(),
                kid,
                key_use: "sig".to_string(),
                n,
                e,
            },
        },
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::OnceLock;

    /// One ephemeral RSA key (PEM) for the whole test binary — keygen is slow.
    /// Uses the same generator the runtime seeds via `secrets::get_or_create`.
    fn test_pem() -> &'static str {
        static PEM: OnceLock<String> = OnceLock::new();
        PEM.get_or_init(|| generate_private_key_pem().expect("keygen"))
    }

    #[test]
    fn rejects_undersized_signing_key_and_future_issued_at() {
        let weak = RsaPrivateKey::new(&mut OsRng, 1024)
            .unwrap()
            .to_pkcs1_pem(LineEnding::LF)
            .unwrap();
        assert!(JwtService::from_pem(&weak, "issuer".into(), "audience".into(), 900).is_err());
        let service = svc();
        let now = Utc::now().timestamp();
        let mut claims = claims_at(now);
        claims.iat = now + 300;
        assert!(service
            .validate_access_token(&service.encode_claims(&claims).unwrap())
            .is_err());
        claims.iat = now;
        claims.exp = now;
        assert!(service
            .validate_access_token(&service.encode_claims(&claims).unwrap())
            .is_err());
    }

    #[test]
    fn generated_key_is_a_valid_signing_key() {
        // The self-seeded PEM builds a working service.
        let pem = generate_private_key_pem().unwrap();
        let s = JwtService::from_pem(&pem, "iss".into(), "aud".into(), 900).unwrap();
        let token = s
            .generate_access_token("u", "sid", &TokenContext::default())
            .unwrap();
        assert_eq!(s.validate_access_token(&token).unwrap().sub, "u");
        // Two generations produce distinct keys (no fixed/shared default).
        assert_ne!(
            generate_private_key_pem().unwrap(),
            generate_private_key_pem().unwrap()
        );
    }

    fn svc() -> JwtService {
        JwtService::from_pem(test_pem(), "iss".into(), "aud".into(), 900).unwrap()
    }

    fn claims_at(now: i64) -> AccessTokenClaims {
        AccessTokenClaims {
            sub: "user-1".into(),
            sid: "session-1".into(),
            org_id: None,
            role: None,
            is_system_admin: None,
            email_verified: Some(true),
            iat: now,
            nbf: now,
            exp: now + 900,
            iss: "iss".into(),
            aud: "aud".into(),
        }
    }

    #[test]
    fn access_token_round_trips_with_context() {
        let s = svc();
        let ctx = TokenContext {
            org_id: Some("org-1".into()),
            role: Some("admin".into()),
            is_system_admin: Some(true),
            email_verified: Some(true),
        };
        let token = s.generate_access_token("user-1", "sess-1", &ctx).unwrap();
        let claims = s.validate_access_token(&token).unwrap();
        assert_eq!(claims.sub, "user-1");
        assert_eq!(claims.sid, "sess-1");
        assert_eq!(claims.org_id.as_deref(), Some("org-1"));
        assert_eq!(claims.iss, "iss");
        assert_eq!(claims.aud, "aud");
        assert_eq!(claims.nbf, claims.iat);
    }

    #[test]
    fn token_header_is_rs256_with_kid() {
        let s = svc();
        let token = s
            .generate_access_token("u", "sid", &TokenContext::default())
            .unwrap();
        let header = decode_header(&token).unwrap();
        assert_eq!(header.alg, Algorithm::RS256);
        assert_eq!(header.kid.as_deref(), Some(s.kid()));
    }

    #[test]
    fn jwks_exposes_the_public_key() {
        let s = svc();
        let jwks = s.jwks();
        assert_eq!(jwks.keys.len(), 1);
        assert_eq!(jwks.keys[0].kty, "RSA");
        assert_eq!(jwks.keys[0].kid, s.kid());
        assert!(!jwks.keys[0].n.is_empty());
    }

    #[test]
    fn refresh_tokens_are_unique_44_chars() {
        let s = svc();
        let (a, b) = (s.generate_refresh_token(), s.generate_refresh_token());
        assert_eq!(a.len(), 44);
        assert_ne!(a, b);
    }

    #[test]
    fn tampered_or_foreign_tokens_rejected() {
        let s = svc();
        assert!(s.validate_access_token("not.a.jwt").is_err());
        let token = s
            .generate_access_token("u", "sid", &TokenContext::default())
            .unwrap();
        // A token from a different signing key (different kid) must be rejected.
        use rsa::pkcs1::EncodeRsaPrivateKey;
        let other_pem = RsaPrivateKey::new(&mut OsRng, 2048)
            .unwrap()
            .to_pkcs1_pem(rsa::pkcs1::LineEnding::LF)
            .unwrap()
            .to_string();
        let other = JwtService::from_pem(&other_pem, "iss".into(), "aud".into(), 900).unwrap();
        assert!(other.validate_access_token(&token).is_err());
    }

    #[test]
    fn rejects_wrong_issuer_and_audience() {
        let token = svc()
            .generate_access_token("u", "sid", &TokenContext::default())
            .unwrap();
        let wrong_issuer =
            JwtService::from_pem(test_pem(), "other".into(), "aud".into(), 900).unwrap();
        assert!(wrong_issuer.validate_access_token(&token).is_err());
        let wrong_audience =
            JwtService::from_pem(test_pem(), "iss".into(), "other".into(), 900).unwrap();
        assert!(wrong_audience.validate_access_token(&token).is_err());
    }

    #[test]
    fn rejects_invalid_signature_with_known_kid() {
        let verifier = svc();
        let foreign_pem = generate_private_key_pem().unwrap();
        let foreign_encoding = EncodingKey::from_rsa_pem(foreign_pem.as_bytes()).unwrap();
        let now = Utc::now().timestamp();
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some(verifier.kid().to_string());
        let token = encode(&header, &claims_at(now), &foreign_encoding).unwrap();
        assert!(verifier.validate_access_token(&token).is_err());
    }

    #[test]
    fn rejects_expired_and_future_not_before() {
        let service = svc();
        let now = Utc::now().timestamp();
        let mut expired = claims_at(now - 1_000);
        expired.exp = now - 1;
        assert!(service
            .validate_access_token(&service.encode_claims(&expired).unwrap())
            .is_err());

        let future = claims_at(now + 300);
        assert!(service
            .validate_access_token(&service.encode_claims(&future).unwrap())
            .is_err());
    }

    #[test]
    fn rotation_overlap_accepts_old_and_new_tokens_and_publishes_both_keys() {
        let old = svc();
        let old_token = old
            .generate_access_token("u", "old-session", &TokenContext::default())
            .unwrap();
        let next_pem = generate_private_key_pem().unwrap();
        let rotated =
            JwtService::from_key_ring(&next_pem, Some(test_pem()), "iss".into(), "aud".into(), 900)
                .unwrap();
        let new_token = rotated
            .generate_access_token("u", "new-session", &TokenContext::default())
            .unwrap();

        assert_eq!(rotated.jwks().keys.len(), 2);
        assert_eq!(
            rotated.validate_access_token(&old_token).unwrap().sid,
            "old-session"
        );
        assert_eq!(
            rotated.validate_access_token(&new_token).unwrap().sid,
            "new-session"
        );
    }
}

