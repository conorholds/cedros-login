use super::*;

pub(super) fn claims(req: &TokenRequest, client_id: &str) -> Result<ProviderClaims, RouteError> {
    if let Some(id_token) = req.id_token.as_deref() {
        return Ok(oidc::verify_id_token(
            GOOGLE_JWKS_URL,
            id_token,
            &[client_id],
            GOOGLE_ISSUERS,
        )?);
    }
    if let Some(access_token) = req.access_token.as_deref() {
        return verify_access_token(access_token, client_id);
    }
    Err(RouteError::Status(400, "google_token_required"))
}

fn verify_access_token(access_token: &str, client_id: &str) -> Result<ProviderClaims, RouteError> {
    let info_url = format!(
        "{GOOGLE_TOKENINFO_URL}?access_token={}",
        percent_encode_query(access_token),
    );
    let token_info: GoogleAccessTokenInfo = serde_json::from_value(
        http::get_json(&info_url)
            .map_err(|_| RouteError::Status(502, "google_verification_unavailable"))?,
    )
    .map_err(|_| AuthError::Unauthorized("invalid google token".into()))?;
    if !token_info.matches_client_id(client_id) {
        return Err(AuthError::Unauthorized("invalid google token".into()).into());
    }
    let response = http::fetch(&HttpRequest {
        method: "GET",
        url: GOOGLE_USERINFO_URL,
        headers: vec![("authorization".into(), format!("Bearer {access_token}"))],
        body: None,
    })?;
    if !(200..300).contains(&response.status) {
        return Err(AuthError::Unauthorized("invalid google token".into()).into());
    }
    let info: GoogleUserInfo = serde_json::from_str(&response.body)
        .map_err(|_| AuthError::Unauthorized("invalid google profile".into()))?;
    if info.email_verified != Some(true) {
        return Err(AuthError::Validation(vec!["Email not verified with Google".into()]).into());
    }
    Ok(ProviderClaims {
        sub: info.sub,
        email: info.email,
        email_verified: Some(true),
        name: info.name,
        picture: info.picture,
        hd: info.hd,
        nonce: None,
    })
}

#[derive(Deserialize)]
pub(super) struct GoogleAccessTokenInfo {
    #[serde(default)]
    pub(super) aud: Option<String>,
    #[serde(default)]
    pub(super) azp: Option<String>,
    #[serde(default)]
    pub(super) issued_to: Option<String>,
}

impl GoogleAccessTokenInfo {
    pub(super) fn matches_client_id(&self, client_id: &str) -> bool {
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

#[derive(Deserialize)]
struct GoogleUserInfo {
    sub: String,
    #[serde(default)]
    email: Option<String>,
    #[serde(default)]
    email_verified: Option<bool>,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    picture: Option<String>,
    #[serde(default)]
    hd: Option<String>,
}
