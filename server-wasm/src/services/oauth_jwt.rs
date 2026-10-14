//! Resource-bound OAuth access tokens share Login's audited RS256 key ring,
//! but use an explicit issuer, resource audience, and `at+jwt` token type.
use super::{AccessTokenClaims, AuthError, JwtService};
use jsonwebtoken::{decode, decode_header, encode, Algorithm, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthAccessClaims {
    #[serde(flatten)]
    pub identity: AccessTokenClaims,
    pub client_id: String,
    pub jti: String,
    pub scope: String,
    pub oauth_grant: String,
    pub grant_exp: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub site_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub runtime_site_id: Option<String>,
}

impl JwtService {
    pub fn sign_oauth(&self, claims: &OAuthAccessClaims) -> Result<String, AuthError> {
        let mut header = Header::new(Algorithm::RS256);
        header.kid = Some(self.kid.clone());
        header.typ = Some("at+jwt".into());
        encode(&header, claims, &self.encoding_key)
            .map_err(|error| AuthError::Crypto(format!("OAuth token encode: {error}")))
    }

    pub fn validate_oauth(
        &self,
        token: &str,
        issuer: &str,
        resources: &[&str],
    ) -> Result<OAuthAccessClaims, AuthError> {
        let invalid = || AuthError::Unauthorized("invalid OAuth token".into());
        let header = decode_header(token).map_err(|_| invalid())?;
        if header.alg != Algorithm::RS256 || header.typ.as_deref() != Some("at+jwt") {
            return Err(invalid());
        }
        let key = self
            .verification_keys
            .iter()
            .find(|key| Some(key.jwk.kid.as_str()) == header.kid.as_deref())
            .ok_or_else(invalid)?;
        if resources.is_empty() {
            return Err(invalid());
        }
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&[issuer]);
        validation.set_audience(resources);
        validation.set_required_spec_claims(&["iss", "aud", "sub", "exp", "iat", "nbf"]);
        validation.leeway = 0;
        validation.validate_nbf = true;
        let claims = decode::<OAuthAccessClaims>(token, &key.decoding_key, &validation)
            .map_err(|_| invalid())?
            .claims;
        let now = crate::clock::now_unix() as i64;
        let c = &claims.identity;
        if claims.grant_exp < c.exp
            || claims.grant_exp <= now
            || c.exp <= now
            || c.iat > now
            || c.exp <= c.iat
            || c.nbf >= c.exp
            || c.sub.is_empty()
            || c.sid.is_empty()
            || c.org_id.as_deref().is_none_or(str::is_empty)
            || claims.client_id.is_empty()
            || claims.jti.is_empty()
            || claims.oauth_grant.is_empty()
            || claims.scope.is_empty()
            || claims.site_id.is_some() != claims.runtime_site_id.is_some()
        {
            return Err(invalid());
        }
        Ok(claims)
    }
}
