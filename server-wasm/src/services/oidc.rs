//! Federated ID-token verification (Google/Apple) over the host `http` egress
//! seam. Fetches the provider JWKS (the operator must allowlist the provider
//! host in `CEDROS_EXTENSION_HTTP_ALLOWLIST`), matches the token `kid`, and
//! verifies the RS256 signature + issuer/audience/expiry in-guest.
//!
//! NOTE: the per-request fresh instance means there is no JWKS cache — one fetch
//! per verification. Persistent JWKS caching requires a host capability; the
//! guest validates the token header before IO and decodes JWKS directly.
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::de::DeserializeOwned;
use serde::Deserialize;

use super::AuthError;
use crate::host::http;
#[path = "../../../server/src/domain/oidc.rs"]
mod claims_policy;

#[derive(Deserialize)]
struct Jwk {
    kty: String,
    #[serde(default)]
    alg: Option<String>,
    #[serde(default, rename = "use")]
    usage: Option<String>,
    #[serde(default)]
    key_ops: Option<Vec<String>>,
    #[serde(default)]
    kid: Option<String>,
    // Optional so a JWKS that mixes RSA with non-RSA keys (EC/OKP, which lack
    // n/e) still parses — we filter to RSA below instead of failing the whole set.
    #[serde(default)]
    n: Option<String>,
    #[serde(default)]
    e: Option<String>,
}

#[derive(Deserialize)]
struct Jwks {
    keys: Vec<Jwk>,
}

/// Fetch the provider JWKS over egress, then verify the token into `T`.
pub fn verify_id_token<T: DeserializeOwned>(
    jwks_url: &str,
    token: &str,
    audiences: &[&str],
    issuers: &[&str],
) -> Result<T, AuthError> {
    // Reject malformed/unsupported tokens before invoking the network seam.
    let header = token_header(token)?;
    let jwks: Jwks = http::get_json_typed(jwks_url)
        .map_err(|error| AuthError::Unauthorized(format!("jwks fetch: {error}")))?;
    verify_parsed(jwks, header, token, audiences, issuers)
}

fn token_header(token: &str) -> Result<jsonwebtoken::Header, AuthError> {
    let header = decode_header(token)
        .map_err(|error| AuthError::Unauthorized(format!("token header: {error}")))?;
    if header.alg != Algorithm::RS256 || header.kid.as_deref().is_none_or(str::is_empty) {
        return Err(AuthError::Unauthorized(
            "unsupported token algorithm".into(),
        ));
    }
    Ok(header)
}

#[cfg(test)]
fn verify_with_jwks<T: DeserializeOwned>(
    jwks_json: &str,
    token: &str,
    audiences: &[&str],
    issuers: &[&str],
) -> Result<T, AuthError> {
    let header = token_header(token)?;
    let jwks: Jwks = serde_json::from_str(jwks_json)
        .map_err(|error| AuthError::Unauthorized(format!("jwks parse: {error}")))?;
    verify_parsed(jwks, header, token, audiences, issuers)
}

fn verify_parsed<T: DeserializeOwned>(
    jwks: Jwks,
    header: jsonwebtoken::Header,
    token: &str,
    audiences: &[&str],
    issuers: &[&str],
) -> Result<T, AuthError> {
    // Require an exact `kid` match against an RSA key. No fallback to "first key":
    // a token whose kid is absent from the current JWKS must be rejected, not
    // verified against an arbitrary key (the signature would still gate, but
    // matching the wrong key on rotation is a correctness trap).
    let jwk = jwks
        .keys
        .iter()
        .filter(|k| {
            k.kty == "RSA"
                && k.n.is_some()
                && k.e.is_some()
                && k.alg.as_deref().is_none_or(|alg| alg == "RS256")
                && k.usage.as_deref().is_none_or(|usage| usage == "sig")
                && k.key_ops
                    .as_ref()
                    .is_none_or(|ops| ops.iter().any(|op| op == "verify"))
        })
        .find(|k| k.kid == header.kid)
        .ok_or_else(|| AuthError::Unauthorized("no matching jwk".to_string()))?;
    let (n, e) = (
        jwk.n.as_deref().unwrap_or(""),
        jwk.e.as_deref().unwrap_or(""),
    );
    let key = DecodingKey::from_rsa_components(n, e)
        .map_err(|e| AuthError::Unauthorized(format!("jwk key: {e}")))?;
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(audiences);
    validation.set_issuer(issuers);
    validation.leeway = 0;
    validation.validate_nbf = true;
    validation.set_required_spec_claims(&["exp", "iat", "iss", "aud", "sub"]);
    let claims = decode::<serde_json::Value>(token, &key, &validation)
        .map_err(|e| AuthError::Unauthorized(format!("token invalid: {e}")))?
        .claims;
    if !claims_policy::valid_claims(&claims, audiences, crate::clock::now_unix() as i64) {
        return Err(AuthError::Unauthorized("invalid OIDC claims".into()));
    }
    serde_json::from_value(claims)
        .map_err(|_| AuthError::Unauthorized("invalid OIDC claims".into()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::engine::general_purpose::URL_SAFE_NO_PAD;
    use base64::Engine;
    use jsonwebtoken::{encode, EncodingKey, Header};
    use rsa::pkcs1::{EncodeRsaPrivateKey, LineEnding};
    use rsa::traits::PublicKeyParts;
    use rsa::{RsaPrivateKey, RsaPublicKey};
    use serde::Serialize;
    use std::sync::OnceLock;

    #[derive(Serialize, Deserialize, PartialEq, Debug)]
    struct TestClaims {
        sub: String,
        aud: String,
        iss: String,
        exp: i64,
        iat: i64,
    }

    fn key() -> &'static RsaPrivateKey {
        static K: OnceLock<RsaPrivateKey> = OnceLock::new();
        K.get_or_init(|| RsaPrivateKey::new(&mut rand::rngs::OsRng, 2048).expect("keygen"))
    }

    fn jwks_json() -> String {
        let public = RsaPublicKey::from(key());
        let n = URL_SAFE_NO_PAD.encode(public.n().to_bytes_be());
        let e = URL_SAFE_NO_PAD.encode(public.e().to_bytes_be());
        format!(r#"{{"keys":[{{"kty":"RSA","kid":"test","n":"{n}","e":"{e}"}}]}}"#)
    }

    fn sign(claims: &TestClaims) -> String {
        let pem = key().to_pkcs1_pem(LineEnding::LF).unwrap();
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some("test".to_string());
        encode(
            &header,
            claims,
            &EncodingKey::from_rsa_pem(pem.as_bytes()).unwrap(),
        )
        .unwrap()
    }

    fn claims(aud: &str, iss: &str, exp: i64) -> TestClaims {
        TestClaims {
            sub: "g1".into(),
            aud: aud.into(),
            iss: iss.into(),
            exp,
            iat: crate::clock::now_unix() as i64,
        }
    }

    #[test]
    fn verifies_valid_token() {
        let c = claims("client", "accounts.google.com", 9_999_999_999);
        let out: TestClaims = verify_with_jwks(
            &jwks_json(),
            &sign(&c),
            &["client"],
            &["accounts.google.com"],
        )
        .unwrap();
        assert_eq!(out, c);
    }

    #[test]
    fn rejects_wrong_audience() {
        let token = sign(&claims("other", "accounts.google.com", 9_999_999_999));
        assert!(verify_with_jwks::<TestClaims>(
            &jwks_json(),
            &token,
            &["client"],
            &["accounts.google.com"]
        )
        .is_err());
    }

    #[test]
    fn rejects_wrong_issuer() {
        let token = sign(&claims("client", "evil.example", 9_999_999_999));
        assert!(verify_with_jwks::<TestClaims>(
            &jwks_json(),
            &token,
            &["client"],
            &["accounts.google.com"]
        )
        .is_err());
    }

    #[test]
    fn rejects_expired() {
        let token = sign(&claims("client", "accounts.google.com", 1));
        assert!(verify_with_jwks::<TestClaims>(
            &jwks_json(),
            &token,
            &["client"],
            &["accounts.google.com"]
        )
        .is_err());
    }

    #[test]
    fn rejects_unknown_kid_without_fallback() {
        // Token kid is "test"; the JWKS only advertises "rotated" — no match must
        // reject, never fall back to an arbitrary key.
        let public = RsaPublicKey::from(key());
        let n = URL_SAFE_NO_PAD.encode(public.n().to_bytes_be());
        let e = URL_SAFE_NO_PAD.encode(public.e().to_bytes_be());
        let jwks = format!(r#"{{"keys":[{{"kty":"RSA","kid":"rotated","n":"{n}","e":"{e}"}}]}}"#);
        let token = sign(&claims("client", "accounts.google.com", 9_999_999_999));
        assert!(verify_with_jwks::<TestClaims>(
            &jwks,
            &token,
            &["client"],
            &["accounts.google.com"]
        )
        .is_err());
    }

    #[test]
    fn tolerates_mixed_jwks_with_non_rsa_key() {
        // A non-RSA (EC) key lacking n/e must not break parsing of the RSA key.
        let public = RsaPublicKey::from(key());
        let n = URL_SAFE_NO_PAD.encode(public.n().to_bytes_be());
        let e = URL_SAFE_NO_PAD.encode(public.e().to_bytes_be());
        let mixed = format!(
            r#"{{"keys":[{{"kty":"EC","kid":"ec1","crv":"P-256","x":"a","y":"b"}},{{"kty":"RSA","kid":"test","n":"{n}","e":"{e}"}}]}}"#
        );
        let c = claims("client", "accounts.google.com", 9_999_999_999);
        let out: TestClaims =
            verify_with_jwks(&mixed, &sign(&c), &["client"], &["accounts.google.com"]).unwrap();
        assert_eq!(out, c);
    }
    #[test]
    fn signed_tokens_reject_missing_claims_future_time_and_conflicting_key_metadata() {
        let original =
            serde_json::to_value(claims("client", "accounts.google.com", 9_999_999_999)).unwrap();
        let sign_value = |value: &serde_json::Value| {
            let pem = key().to_pkcs1_pem(LineEnding::LF).unwrap();
            let mut header = Header::new(Algorithm::RS256);
            header.kid = Some("test".into());
            encode(
                &header,
                value,
                &EncodingKey::from_rsa_pem(pem.as_bytes()).unwrap(),
            )
            .unwrap()
        };
        for (field, value) in [
            ("sub", serde_json::json!("")),
            ("iat", serde_json::json!(null)),
            ("nbf", serde_json::json!(9_999_999_999i64)),
            ("azp", serde_json::json!("attacker")),
            ("aud", serde_json::json!(["client", "other"])),
        ] {
            let mut bad = original.clone();
            bad[field] = value;
            assert!(verify_with_jwks::<serde_json::Value>(
                &jwks_json(),
                &sign_value(&bad),
                &["client"],
                &["accounts.google.com"]
            )
            .is_err());
        }
        for (field, value) in [("kty", "EC"), ("alg", "RS512"), ("use", "enc")] {
            let mut jwks: serde_json::Value = serde_json::from_str(&jwks_json()).unwrap();
            jwks["keys"][0][field] = serde_json::json!(value);
            assert!(verify_with_jwks::<serde_json::Value>(
                &jwks.to_string(),
                &sign_value(&original),
                &["client"],
                &["accounts.google.com"]
            )
            .is_err());
        }
    }
}

#[cfg(test)]
mod early_rejection_tests {
    use super::*;
    #[test]
    fn malformed_token_is_rejected_without_a_host_import() {
        // Native tests cannot invoke WIT HTTP imports; reaching one would panic.
        assert!(verify_id_token::<serde_json::Value>(
            "https://unused.test",
            "not-a-token",
            &["aud"],
            &["iss"]
        )
        .is_err());
    }
}
