//! OIDC client-secret ownership and legacy migration.
//!
//! Provider metadata belongs in `cedros-login:sso-providers`; credential values
//! belong only in the host's encrypted, per-extension secret seam.
use super::RouteError;
use crate::data::sso_providers::{self, SsoProviderEntry};
use crate::host::secrets;
use crate::services::encryption::EncryptionService;

const CLIENT_SECRET_PREFIX: &str = "sso-client-secret:";
const LEGACY_ENCRYPTION_SECRET: &str = "sso-encryption";

pub(super) fn get(provider: &mut SsoProviderEntry) -> Result<String, RouteError> {
    let key = key(&provider.id);
    if let Some(secret) = secrets::get(&key)?.filter(|value| !value.is_empty()) {
        return Ok(secret);
    }

    let encrypted = provider
        .client_secret_encrypted
        .as_deref()
        .filter(|value| !value.is_empty())
        .ok_or(RouteError::Status(501, "sso_not_configured"))?;
    let secret = legacy_cipher()?.decrypt(encrypted)?;

    // Existing installations are migrated on first successful use. Store the
    // secret before clearing the legacy field; if the metadata write fails,
    // remove the new copy so the durable row remains the authority on retry.
    secrets::set(&key, &secret)?;
    provider.client_secret_encrypted = None;
    if let Err(error) = sso_providers::update(provider) {
        let _ = secrets::delete(&key);
        return Err(error.into());
    }
    Ok(secret)
}

pub(super) fn current(provider_id: &str) -> Result<Option<String>, RouteError> {
    Ok(secrets::get(&key(provider_id))?)
}

pub(super) fn set(provider_id: &str, value: &str) -> Result<(), RouteError> {
    Ok(secrets::set(&key(provider_id), value)?)
}

pub(super) fn delete(provider_id: &str) -> Result<bool, RouteError> {
    Ok(secrets::delete(&key(provider_id))?)
}

pub(super) fn restore_after_failed_write(provider_id: &str, previous: Option<&str>) {
    let restored = match previous {
        Some(value) => secrets::set(&key(provider_id), value).map(|_| ()),
        None => secrets::delete(&key(provider_id)).map(|_| ()),
    };
    if restored.is_err() {
        crate::host::log::op_warn("sso", "client-secret-rollback", "secrets_error");
    }
}

fn legacy_cipher() -> Result<EncryptionService, RouteError> {
    Ok(EncryptionService::from_secret(&secrets::get_or_create(
        LEGACY_ENCRYPTION_SECRET,
        || Ok(crate::services::tokens::generate_secret_key()),
    )?))
}

fn key(provider_id: &str) -> String {
    format!("{CLIENT_SECRET_PREFIX}{provider_id}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn provider_credentials_are_namespaced_by_provider() {
        assert_eq!(key("provider-1"), "sso-client-secret:provider-1");
        assert_ne!(key("provider-1"), key("provider-2"));
    }
}
