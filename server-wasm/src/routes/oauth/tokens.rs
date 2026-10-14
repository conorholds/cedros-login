//! Code consumption, refresh rotation/reuse detection and online token checks.
use super::*;
use crate::services::jwt::OAuthAccessClaims;

pub(super) fn validate_registration(config: &Config, c: &Connection) -> Result<(), RouteError> {
    let client = config.client(&c.client_id)?;
    if c.issuer != config.issuer
        || !config::redirect_matches(&client.redirect_uris, &c.redirect_uri)
        || !client.resources.contains(&c.resource)
        || scopes(&c.scope, client)? != c.scope
    {
        return Err(RouteError::Status(400, "invalid_grant"));
    }
    Ok(())
}
fn invalid() -> RouteError {
    RouteError::Status(400, "invalid_grant")
}
fn token_id(token: &str) -> Result<&str, RouteError> {
    let id = token.split('.').next().ok_or_else(invalid)?;
    if id.len() != 64 || !id.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err(invalid());
    }
    Ok(id)
}
fn refresh_token(c: &Connection, secret: &str) -> String {
    // Domain-separated deterministic MAC permits recognition of ANY previously
    // issued generation without storing an unbounded list or a plaintext token.
    let mac = hash_refresh_token(
        &format!("oauth-refresh:{}:{}", c.id, c.refresh_generation),
        secret,
    );
    format!("{}.{}.{}", c.id, c.refresh_generation, mac)
}
fn refresh_generation(token: &str, c: &Connection, secret: &str) -> Result<u64, RouteError> {
    let fields: Vec<_> = token.split('.').collect();
    if fields.len() != 3 || fields[0] != c.id {
        return Err(invalid());
    }
    let generation: u64 = fields[1].parse().map_err(|_| invalid())?;
    if fields[1] != generation.to_string() {
        return Err(invalid());
    }
    let mut expected = c.clone();
    expected.refresh_generation = generation;
    if !constant_time_eq(token, &refresh_token(&expected, secret)) {
        return Err(invalid());
    }
    Ok(generation)
}

pub(super) fn exchange(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let config = Config::load()?;
    let p = form(request)?;
    let client_id = required(&p, "client_id")?;
    config.client(client_id)?;
    // Registered public clients MUST use PKCE. A secret does not turn a caller
    // into another client and cannot replace the resource/verifier checks.
    if p.contains_key("client_secret")
        || request
            .headers
            .iter()
            .any(|(k, _)| k.eq_ignore_ascii_case("authorization"))
    {
        return Err(RouteError::Status(400, "invalid_client"));
    }
    let grant_type = required(&p, "grant_type")?;
    let presented = match grant_type {
        "authorization_code" => required(&p, "code")?,
        "refresh_token" => required(&p, "refresh_token")?,
        _ => return Err(RouteError::Status(400, "unsupported_grant_type")),
    };
    let mut row = store::read(token_id(presented)?)?.ok_or_else(invalid)?;
    let c = &mut row.value;
    if c.client_id != client_id
        || c.resource != required(&p, "resource")?
        || c.expires_at <= clock::now_iso()
    {
        return Err(invalid());
    }
    validate_registration(&config, c)?;
    let secret = auth::hmac_secret()?;
    match grant_type {
        "authorization_code" => {
            if c.status == "active"
                && c.redirect_uri == required(&p, "redirect_uri")?
                && c.code_hash
                    .as_deref()
                    .is_some_and(|h| constant_time_eq(h, &hash_verification_token(presented)))
                && verify_pkce(required(&p, "code_verifier")?, &c.code_challenge)
            {
                revoke_competing_reuse(&c.id, grant_type, presented, &p, &secret)?;
                return Err(invalid());
            }
            if c.status != "code"
                || c.redirect_uri != required(&p, "redirect_uri")?
                || !c
                    .code_expires_at
                    .as_ref()
                    .is_some_and(|t| t > &clock::now_iso())
                || !c
                    .code_hash
                    .as_deref()
                    .is_some_and(|h| constant_time_eq(h, &hash_verification_token(presented)))
                || !verify_pkce(required(&p, "code_verifier")?, &c.code_challenge)
            {
                return Err(invalid());
            }
        }
        "refresh_token" => {
            if c.status != "active" {
                return Err(invalid());
            }
            let generation = refresh_generation(presented, c, &secret)?;
            if generation < c.refresh_generation {
                revoke_competing_reuse(&c.id, grant_type, presented, &p, &secret)?;
                return Err(invalid());
            }
            if generation != c.refresh_generation {
                return Err(invalid());
            }
            if p.get("scope").is_some_and(|scope| scope != &c.scope) {
                return Err(RouteError::Status(400, "invalid_scope"));
            }
        }
        _ => unreachable!(),
    }
    let identity = c.identity.clone().ok_or_else(invalid)?;
    // These stored claims were authenticated at explicit consent. Revalidate
    // every mutable fact now; the original Login JWT need not remain unexpired.
    let context = match auth::authoritative_session(identity) {
        Ok(context) => context,
        Err(RouteError::Auth(_)) | Err(RouteError::Status(401 | 403, _)) => {
            cleanup::revoke(c, row.condition)?;
            return Err(invalid());
        }
        Err(error) => return Err(error),
    };
    let now = clock::now_unix() as i64;
    let session_exp = chrono::DateTime::parse_from_rfc3339(&context.session.expires_at)
        .map_err(|_| invalid())?
        .timestamp();
    let family_exp = chrono::DateTime::parse_from_rfc3339(&c.expires_at)
        .map_err(|_| invalid())?
        .timestamp();
    let expires_at = (now + ACCESS_TTL).min(session_exp).min(family_exp);
    if expires_at <= now {
        return Err(invalid());
    }
    let mut identity = context.claims;
    identity.iss = config.issuer;
    identity.aud = c.resource.clone();
    identity.iat = now;
    identity.nbf = now;
    identity.exp = expires_at;
    let claims = OAuthAccessClaims {
        identity,
        client_id: c.client_id.clone(),
        jti: uuid::Uuid::new_v4().to_string(),
        scope: c.scope.clone(),
        oauth_grant: c.id.clone(),
        grant_exp: family_exp,
        site_id: c.site_id.clone(),
        runtime_site_id: c.runtime_site_id.clone(),
    };
    let (jwt, _) = auth::build_jwt()?;
    let access_token = jwt.sign_oauth(&claims)?;
    c.refresh_generation = c.refresh_generation.checked_add(1).ok_or_else(invalid)?;
    let refresh_token = refresh_token(c, &secret);
    c.status = "active".into();
    c.state.clear();
    // A concurrent redemption/rotation can publish exactly one result; tokens
    // are returned only after the host commits the row-version precondition.
    if let Err(error) = store::save(c, row.condition) {
        if !error.is_db_conflict() {
            return Err(error.into());
        }
        // The submitted proof was already fully authenticated above. A second
        // valid redemption/rotation racing the winner is reuse as well. Re-read
        // rather than treating every storage conflict as a proven replay.
        revoke_competing_reuse(&c.id, grant_type, presented, &p, &secret)?;
        return Err(invalid());
    }
    Ok(json(200,&serde_json::json!({"access_token":access_token,"token_type":"Bearer","expires_in":expires_at-now,"refresh_token":refresh_token,"scope":c.scope}).to_string()))
}

fn revoke_competing_reuse(
    id: &str,
    grant_type: &str,
    presented: &str,
    p: &std::collections::HashMap<String, String>,
    secret: &str,
) -> Result<(), RouteError> {
    // Bound contention; all writes use fresh versions. Never revoke for a
    // guessed proof or a transient storage failure.
    for _ in 0..8 {
        let Some(row) = store::read(id)? else {
            return Ok(());
        };
        let c = &row.value;
        if c.status != "active"
            || c.client_id != required(p, "client_id")?
            || c.resource != required(p, "resource")?
        {
            return Ok(());
        }
        let reused = if grant_type == "refresh_token" {
            refresh_generation(presented, c, secret)
                .is_ok_and(|generation| generation < c.refresh_generation)
        } else {
            c.redirect_uri == required(p, "redirect_uri")?
                && c.code_hash
                    .as_deref()
                    .is_some_and(|hash| constant_time_eq(hash, &hash_verification_token(presented)))
                && verify_pkce(required(p, "code_verifier")?, &c.code_challenge)
        };
        if !reused {
            return Ok(());
        }
        match cleanup::revoke(c, row.condition) {
            Ok(()) => return Ok(()),
            Err(RouteError::Seam(error)) if error.is_db_conflict() => continue,
            Err(error) => return Err(error),
        }
    }
    // Under sustained competing refresh, the existing host-atomic revocation
    // takes the dedicated session out of service without a revision race. Its
    // persisted lifecycle check then revokes/queues the grant after restart.
    if let Some(row) = store::read(id)? {
        if let Some(identity) = row.value.identity.as_ref() {
            crate::data::sessions::revoke(&identity.sid, "oauth_token_reuse")?;
        }
    }
    Ok(())
}

fn bearer(request: &RouteRequest) -> Result<&str, RouteError> {
    let headers: Vec<_> = request
        .headers
        .iter()
        .filter(|(k, _)| k.eq_ignore_ascii_case("authorization"))
        .collect();
    if headers.len() != 1 {
        return Err(RouteError::Status(401, "invalid_token"));
    }
    let (scheme, token) = headers[0]
        .1
        .split_once(' ')
        .ok_or(RouteError::Status(401, "invalid_token"))?;
    if !scheme.eq_ignore_ascii_case("bearer")
        || token.is_empty()
        || token.len() > 8192
        || token.contains(char::is_whitespace)
    {
        return Err(RouteError::Status(401, "invalid_token"));
    }
    Ok(token)
}
fn verify(config: &Config, token: &str) -> Result<OAuthAccessClaims, RouteError> {
    let (jwt, _) = auth::build_jwt()?;
    let resources: Vec<&str> = config
        .clients
        .iter()
        .flat_map(|c| c.resources.iter().map(String::as_str))
        .collect();
    Ok(jwt.validate_oauth(token, &config.issuer, &resources)?)
}
fn grant_matches(c: &Connection, t: &OAuthAccessClaims) -> bool {
    c.status == "active"
        && c.id == t.oauth_grant
        && c.client_id == t.client_id
        && c.scope == t.scope
        && chrono::DateTime::parse_from_rfc3339(&c.expires_at)
            .is_ok_and(|expiry| expiry.timestamp() == t.grant_exp)
        && c.resource == t.identity.aud
        && c.site_id == t.site_id
        && c.runtime_site_id == t.runtime_site_id
        && c.expires_at > clock::now_iso()
        && c.identity
            .as_ref()
            .is_some_and(|i| identity_matches(i, &t.identity))
        && (!site_required(&c.scope) || c.site_id.as_deref().is_some_and(|s| !s.is_empty()))
}
fn inactive() -> RouteResponse {
    json(200, r#"{"active":false}"#)
}
pub(super) fn introspect(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let config = Config::load()?;
    let token = bearer(request)?;
    let claims = match verify(&config, token) {
        Ok(c) => c,
        Err(RouteError::Auth(_)) => return Ok(inactive()),
        Err(e) => return Err(e),
    };
    let Some(row) = store::read(&claims.oauth_grant)? else {
        return Ok(inactive());
    };
    if !grant_matches(&row.value, &claims) {
        return Ok(inactive());
    }
    if validate_registration(&config, &row.value).is_err() {
        cleanup::revoke(&row.value, row.condition)?;
        return Ok(inactive());
    }
    let context = match auth::authoritative_session(claims.identity.clone()) {
        Ok(context) => context,
        Err(RouteError::Status(401 | 403, _)) | Err(RouteError::Auth(_)) => {
            cleanup::revoke(&row.value, row.condition)?;
            return Ok(inactive());
        }
        Err(e) => return Err(e),
    };
    let role = context
        .organization
        .as_ref()
        .map(|org| org.membership.role.as_str());
    let email = context
        .user
        .email
        .as_deref()
        .filter(|email| context.user.email_verified && !email.trim().is_empty());
    let c = claims.identity;
    Ok(json(200,&serde_json::json!({"active":true,"iss":c.iss,"sub":c.sub,"sid":c.sid,"org_id":c.org_id,"aud":c.aud,"scope":claims.scope,"client_id":claims.client_id,"jti":claims.jti,"oauth_grant":claims.oauth_grant,"exp":c.exp,"grant_exp":claims.grant_exp,"site_id":claims.site_id,"runtime_site_id":claims.runtime_site_id,"user_email":email,"email_verified":context.user.email_verified,"org_role":role}).to_string()))
}

pub(super) fn revoke(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let config = Config::load()?;
    let p = form(request)?;
    let client_id = required(&p, "client_id")?;
    config.client(client_id)?;
    let token = required(&p, "token")?;
    let authenticated = match verify(&config, token) {
        Ok(claims) => (claims.client_id == client_id).then_some((claims.oauth_grant, None)),
        Err(RouteError::Auth(_)) => token_id(token).ok().map(|id| (id.to_string(), Some(token))),
        Err(e) => return Err(e),
    };
    let Some((id, refresh)) = authenticated else {
        return Ok(json(200, "{}"));
    };
    let Some(mut row) = store::read(&id)? else {
        return Ok(json(200, "{}"));
    };
    if row.value.client_id != client_id {
        return Ok(json(200, "{}"));
    }
    if let Some(token) = refresh {
        if refresh_generation(token, &row.value, &auth::hmac_secret()?).is_err() {
            return Ok(json(200, "{}"));
        }
    }
    if row.value.status != "revoked" {
        row.value.status = "revoked".into();
        cleanup::revoke(&row.value, row.condition)?;
    }
    Ok(json(200, "{}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn refresh_mac_is_family_and_generation_bound() {
        let mut c = super::super::tests::connection();
        let one = refresh_token(&c, "secret");
        assert_eq!(refresh_generation(&one, &c, "secret").unwrap(), 0);
        c.refresh_generation = 1;
        assert_eq!(refresh_generation(&one, &c, "secret").unwrap(), 0); // authenticated reuse
        assert_ne!(one, refresh_token(&c, "secret"));
        assert!(refresh_generation(&one, &c, "wrong-secret").is_err());
        c.id = "b".repeat(64);
        assert!(refresh_generation(&one, &c, "secret").is_err());
    }
}
