//! Per-extension, encrypted-at-rest secret store (host `secrets` seam, always
//! granted). Isolated from other extensions. Inert unless the host is configured
//! with `CEDROS_EXTENSION_SECRETS_PASSPHRASE` (calls fail closed without it).
//!
//! Holds cedros-login's signing and credential material: JWT signing key,
//! refresh HMAC, TOTP seeds, SSO client secrets, legacy migration keys, and
//! per-relying-party service tokens.
//!
//! The seam is **guest-writable only** — there is no operator/host path to
//! populate a per-extension secret (the host's `set_wasm_extension_secret` has a
//! single caller: this seam). So the extension must seed its OWN signing material
//! via [`get_or_create`]; externally-owned secrets (SSO client secrets,
//! relying-party tokens) are still operator-provided and fail closed when absent.
use super::{Result, SeamError};
use crate::cedros::extension::secrets;

fn map_err(e: secrets::HostError) -> SeamError {
    SeamError::Secrets(e.message)
}

pub fn get(key: &str) -> Result<Option<String>> {
    #[cfg(test)]
    if let Some(result) = super::key_value_test_support::get("secrets", key) {
        return result;
    }
    secrets::get(key).map_err(map_err)
}

pub fn set(key: &str, value: &str) -> Result<()> {
    #[cfg(test)]
    if let Some(result) = super::key_value_test_support::set(key, value) {
        return result;
    }
    secrets::set(key, value).map_err(map_err)
}

pub fn delete(key: &str) -> Result<bool> {
    secrets::delete(key).map_err(map_err)
}

/// Read a secret, generating and persisting it on first use. For the extension's
/// OWN signing/encryption material (JWT key, refresh HMAC, encryption keys),
/// which has no operator-provisioning path in wasm mode. `generate` runs only
/// when the key is absent; the value is then sealed and persisted, so it is
/// stable across the per-request component instances. Still fails closed if the
/// secret seam itself is unconfigured (the `set` returns an error).
pub fn get_or_create<F>(key: &str, generate: F) -> Result<String>
where
    F: FnOnce() -> Result<String>,
{
    super::secret_versions::get_or_create(key, generate).map(|secret| secret.value)
}
