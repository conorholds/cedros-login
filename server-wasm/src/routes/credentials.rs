//! Credential management for the authenticated user. Port of
//! `server/src/handlers/credentials.rs` over the wasm model: passkeys are rows
//! (`data::credentials`); password / Google / Apple / Solana are `UserEntry`
//! fields. The list unifies all login methods; unlink refuses to remove the last
//! one (anti-lockout, the standalone's `disable_if_not_last_primary` guarantee).
//!
//! - GET /credentials
//! - PATCH /credentials/{id}  (rename a passkey)
//! - DELETE /credentials/{id} (unlink a method)
use serde::{Deserialize, Serialize};

use super::auth::{authenticated_user, require_step_up};
use super::{error_response, json, validation, RouteError};
use crate::clock;
use crate::data::sso_identities::{self, SsoIdentityEntry};
use crate::data::users::{self, UserEntry, VersionedUserEntry};
use crate::data::{credentials, credentials::CredentialEntry};
use crate::exports::cedros::extension::routes::{RouteRequest, RouteResponse};
use crate::host::{from_json, to_json};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CredentialView {
    id: String,
    credential_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    label: Option<String>,
    created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    last_used_at: Option<String>,
    is_primary: bool,
}

#[derive(Serialize)]
struct ListResponse {
    credentials: Vec<CredentialView>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateRequest {
    #[serde(default)]
    label: Option<String>,
}

pub fn list(request: &RouteRequest) -> RouteResponse {
    run(list_inner(request))
}
pub fn update(request: &RouteRequest) -> RouteResponse {
    run(update_inner(request))
}
pub fn unlink(request: &RouteRequest) -> RouteResponse {
    run(unlink_inner(request))
}

fn run(result: Result<RouteResponse, RouteError>) -> RouteResponse {
    match result {
        Ok(response) => response,
        Err(err) => error_response(err),
    }
}

fn list_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let user = users::find_by_id(&claims.sub)?.ok_or(RouteError::Status(404, "user_not_found"))?;
    let mut out = Vec::new();
    if user.password_hash.is_some() {
        out.push(synthetic("password", &user));
    }
    if user.google_id.is_some() {
        out.push(synthetic("google", &user));
    }
    if user.apple_id.is_some() {
        out.push(synthetic("apple", &user));
    }
    if user.wallet_address.is_some() {
        out.push(synthetic("solana", &user));
    }
    let identities = sso_identities::find_by_user(&claims.sub)?;
    for identity in &identities {
        out.push(sso_view(identity));
    }
    for binding in legacy_sso_bindings(&user, &identities) {
        out.push(CredentialView {
            id: binding,
            credential_type: "sso_oidc".into(),
            label: Some("Single Sign-On".into()),
            created_at: user.created_at.clone(),
            last_used_at: user.last_login_at.clone(),
            is_primary: true,
        });
    }
    for passkey in credentials::find_by_user(&claims.sub)? {
        out.push(passkey_view(&passkey));
    }
    if let Some(factor) =
        crate::data::totp::find_by_user(&claims.sub)?.filter(|factor| factor.enabled)
    {
        out.push(CredentialView {
            id: "totp".into(),
            credential_type: "totp".into(),
            label: Some("Authenticator App (2FA)".into()),
            created_at: factor.created_at,
            last_used_at: None,
            is_primary: false,
        });
    }
    Ok(json(200, &to_json(&ListResponse { credentials: out })?))
}

fn update_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    let id = credential_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    // Only passkeys carry an editable label.
    let passkey = credentials::find_by_id(id)?.ok_or(RouteError::Status(404, "not_found"))?;
    if passkey.user_id != claims.sub {
        return Err(RouteError::Status(404, "not_found"));
    }
    let req: UpdateRequest =
        from_json(&request.body).map_err(|_| RouteError::Status(400, "invalid_body"))?;
    credentials::update_label(
        id,
        &claims.sub,
        req.label.filter(|label| !label.trim().is_empty()),
    )?;
    Ok(no_content())
}

fn unlink_inner(request: &RouteRequest) -> Result<RouteResponse, RouteError> {
    let claims = authenticated_user(request)?;
    require_step_up(&claims)?;
    let id = credential_id(&request.path).ok_or(RouteError::Status(404, "not_found"))?;
    let mut current = users::find_by_id_versioned(&claims.sub)?
        .ok_or(RouteError::Status(404, "user_not_found"))?;
    let passkeys = credentials::find_by_user(&claims.sub)?;
    let sso_identities = sso_identities::find_by_user(&claims.sub)?;
    let sso_bindings = all_sso_bindings(&current.value, &sso_identities);
    let total = login_method_count(&current.value, passkeys.len(), sso_bindings.len());

    let is_passkey = passkeys.iter().any(|passkey| passkey.id == id);
    let is_sso = sso_bindings.iter().any(|binding| binding == id);
    let is_durable_sso = sso_identities.iter().any(|identity| identity.id == id);
    if id == "totp" && crate::data::totp::has_mfa(&claims.sub)? {
        return Err(validation("Disable MFA through the MFA confirmation flow"));
    }
    let exists = match id {
        "password" => current.value.password_hash.is_some(),
        "google" => current.value.google_id.is_some(),
        "apple" => current.value.apple_id.is_some(),
        "solana" => current.value.wallet_address.is_some(),
        _ => is_passkey || is_sso,
    };
    if !exists {
        return Err(RouteError::Status(404, "not_found"));
    }
    // Anti-lockout: never remove the only remaining login method.
    let target_is_usable = id != "password"
        || current
            .value
            .email
            .as_deref()
            .is_some_and(|email| !email.is_empty());
    if total <= usize::from(target_is_usable) {
        return Err(validation(
            "Cannot remove your last login method. Add another method first.",
        ));
    }
    match id {
        "password" => current.value.password_hash = None,
        "google" => current.value.google_id = None,
        "apple" => current.value.apple_id = None,
        "solana" => current.value.wallet_address = None,
        _ => {}
    }
    current.value.auth_methods.retain(|method| method != id);
    if is_passkey && passkeys.len() == 1 {
        current
            .value
            .auth_methods
            .retain(|method| method != "webauthn");
    }
    if is_sso {
        remove_sso_binding(&mut current.value, id, sso_bindings.len());
    }
    current.value.updated_at = clock::now_iso();
    let operations = unlink_operations(
        &current,
        &claims.sid,
        is_passkey.then_some(id),
        is_durable_sso.then_some(id),
    );
    crate::host::db::batch_with_results(&operations)?;
    super::emit_identifier_unlinked(id, "cedros-login:credentials-unlink");
    Ok(no_content())
}

/// Count the user's distinct login methods (field-backed + passkey rows).
fn login_method_count(user: &UserEntry, passkeys: usize, sso_identities: usize) -> usize {
    (user.password_hash.is_some() && user.email.as_deref().is_some_and(|email| !email.is_empty()))
        as usize
        + user.google_id.is_some() as usize
        + user.apple_id.is_some() as usize
        + user.wallet_address.is_some() as usize
        + passkeys
        + sso_identities
}

fn unlink_operations(
    user: &VersionedUserEntry,
    current_session_id: &str,
    passkey_id: Option<&str>,
    sso_identity_id: Option<&str>,
) -> Vec<crate::host::db::AtomicBatchOp> {
    use crate::host::db::{
        BatchOp, ConditionalBatchOp, ConditionalOperation, CREDENTIALS, SSO_IDENTITIES,
    };
    let mut operations = vec![ConditionalBatchOp::new(
        ConditionalOperation::RevokeSessions,
        serde_json::json!({
            "userId": user.value.id,
            "reason": "credential_unlink",
            "exceptSessionId": current_session_id,
            "user": {
                "entryKey": user.entry_key,
                "expectedUpdatedAt": user.updated_at,
                "data": user.value,
            },
        }),
    )
    .into()];
    if let Some(id) = passkey_id {
        operations.push(BatchOp::delete(CREDENTIALS, id).into());
    }
    if let Some(id) = sso_identity_id {
        operations.push(BatchOp::delete(SSO_IDENTITIES, id).into());
    }
    operations
}

fn all_sso_bindings(user: &UserEntry, identities: &[SsoIdentityEntry]) -> Vec<String> {
    let mut bindings: std::collections::BTreeSet<String> = identities
        .iter()
        .map(|identity| identity.id.clone())
        .collect();
    bindings.extend(
        user.auth_methods
            .iter()
            .filter(|method| sso_identities::is_valid_id(method))
            .cloned(),
    );
    bindings.into_iter().collect()
}

fn legacy_sso_bindings(user: &UserEntry, identities: &[SsoIdentityEntry]) -> Vec<String> {
    let durable: std::collections::BTreeSet<&str> = identities
        .iter()
        .map(|identity| identity.id.as_str())
        .collect();
    user.auth_methods
        .iter()
        .filter(|method| sso_identities::is_valid_id(method) && !durable.contains(method.as_str()))
        .cloned()
        .collect()
}

fn remove_sso_binding(user: &mut UserEntry, binding: &str, binding_count: usize) {
    user.auth_methods.retain(|method| method != binding);
    if binding_count == 1 {
        user.auth_methods.retain(|method| method != "sso");
    }
}

fn synthetic(kind: &str, user: &UserEntry) -> CredentialView {
    let credential_type = match kind {
        "google" => "oauth_google",
        "apple" => "oauth_apple",
        other => other,
    };
    CredentialView {
        id: kind.to_string(),
        credential_type: credential_type.to_string(),
        label: None,
        created_at: user.created_at.clone(),
        last_used_at: None,
        is_primary: true,
    }
}

fn passkey_view(passkey: &CredentialEntry) -> CredentialView {
    CredentialView {
        id: passkey.id.clone(),
        credential_type: "webauthn_passkey".to_string(),
        label: passkey.label.clone(),
        created_at: passkey.created_at.clone(),
        last_used_at: passkey.last_used_at.clone(),
        is_primary: true,
    }
}

fn sso_view(identity: &SsoIdentityEntry) -> CredentialView {
    CredentialView {
        id: identity.id.clone(),
        credential_type: "sso_oidc".into(),
        label: Some("Single Sign-On".into()),
        created_at: identity.created_at.clone(),
        last_used_at: None,
        is_primary: true,
    }
}

fn no_content() -> RouteResponse {
    RouteResponse {
        status: 204,
        headers: vec![],
        body: String::new(),
    }
}

/// The credential id from `/credentials/{id}`.
fn credential_id(path: &str) -> Option<&str> {
    path.split("/credentials/")
        .nth(1)?
        .split('/')
        .next()
        .filter(|s| !s.is_empty())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn credential_id_extracts_segment() {
        assert_eq!(credential_id("/credentials/abc"), Some("abc"));
        assert_eq!(credential_id("/credentials/"), None);
    }

    #[test]
    fn login_method_count_sums_fields_and_passkeys() {
        let mut user = UserEntry {
            id: "u1".into(),
            email: None,
            email_verified: false,
            password_hash: Some("h".into()),
            name: None,
            username: None,
            picture: None,
            wallet_address: None,
            evm_wallet_address: None,
            google_id: Some("g".into()),
            apple_id: None,
            auth_methods: vec![],
            suspended_at: None,
            is_system_admin: false,
            created_at: "t".into(),
            updated_at: "t".into(),
            last_login_at: None,
            welcome_completed_at: None,
            avatar_content_type: None,
        };
        assert_eq!(login_method_count(&user, 2, 0), 3); // no email: password is unusable
        user.email = Some("owner@example.com".into());
        assert_eq!(login_method_count(&user, 2, 0), 4); // password + google + 2 passkeys
        user.password_hash = None;
        assert_eq!(login_method_count(&user, 0, 0), 1); // google only
        assert_eq!(login_method_count(&user, 0, 1), 2); // google + SSO
    }

    #[test]
    fn passkeys_are_reported_as_primary_login_methods() {
        let view = passkey_view(&CredentialEntry {
            backup_eligible: Some(false),
            id: "passkey-1".into(),
            user_id: "user-1".into(),
            public_key: "public-key".into(),
            sign_count: 0,
            label: Some("Phone".into()),
            created_at: "2026-09-16T00:00:00Z".into(),
            last_used_at: None,
        });
        assert!(view.is_primary);
        assert_eq!(view.credential_type, "webauthn_passkey");
    }

    #[test]
    fn legacy_sso_unlink_removes_the_login_marker_and_opaque_binding() {
        let binding = format!("sso:{}", "a".repeat(64));
        let mut user = UserEntry {
            id: "user-1".into(),
            email: Some("owner@example.com".into()),
            email_verified: true,
            password_hash: Some("hash".into()),
            name: None,
            username: None,
            picture: None,
            wallet_address: None,
            evm_wallet_address: None,
            google_id: None,
            apple_id: None,
            auth_methods: vec!["password".into(), "sso".into(), binding.clone()],
            suspended_at: None,
            is_system_admin: false,
            created_at: "2026-09-16T00:00:00Z".into(),
            updated_at: "2026-09-16T00:00:00Z".into(),
            last_login_at: None,
            welcome_completed_at: None,
            avatar_content_type: None,
        };
        remove_sso_binding(&mut user, &binding, 1);
        assert_eq!(user.auth_methods, vec!["password"]);
    }

    #[test]
    fn unlink_is_version_bound_and_revokes_other_sessions_atomically() {
        let current = VersionedUserEntry {
            value: UserEntry {
                id: "u1".into(),
                email: None,
                email_verified: false,
                password_hash: Some("hash".into()),
                name: None,
                username: None,
                picture: None,
                wallet_address: None,
                evm_wallet_address: None,
                google_id: None,
                apple_id: None,
                auth_methods: vec!["password".into(), "webauthn".into()],
                suspended_at: None,
                is_system_admin: false,
                created_at: "t".into(),
                updated_at: "t".into(),
                last_login_at: None,
                welcome_completed_at: None,
                avatar_content_type: None,
            },
            entry_key: "u1".into(),
            updated_at: "revision-1".into(),
        };
        let operations = unlink_operations(&current, "session-1", Some("passkey-1"), None);
        let json = serde_json::to_value(&operations).unwrap();
        assert_eq!(json[0]["operationId"], "identity.sessions.revoke");
        assert_eq!(json[0]["params"]["user"]["expectedUpdatedAt"], "revision-1");
        assert_eq!(json[0]["params"]["exceptSessionId"], "session-1");
        assert_eq!(json[1]["op"], "delete");
        assert_eq!(json[1]["entryKey"], "passkey-1");

        let binding = format!("sso:{}", "a".repeat(64));
        let operations = unlink_operations(&current, "session-1", None, Some(&binding));
        let json = serde_json::to_value(&operations).unwrap();
        assert_eq!(json[1]["contentModelId"], "cedros-login:sso-identities");
        assert_eq!(json[1]["entryKey"], binding);
    }
}
