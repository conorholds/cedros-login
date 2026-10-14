//! Immutable per-enrollment encrypted seed references; the factor row selects
//! the active seed with database CAS. Failed metadata writes never overwrite a
//! concurrently enabled seed. Legacy encrypted rows remain readable.
use super::RouteError;
use crate::data::totp::TotpEntry;
use crate::host::secrets;
use crate::services::encryption::EncryptionService;

const TOTP_SECRET_PREFIX: &str = "totp-secret:";
const LEGACY_ENCRYPTION_SECRET: &str = "totp-encryption";

pub(super) fn get(entry: &mut TotpEntry) -> Result<String, RouteError> {
    validate_reference(entry)?;
    let key = entry
        .secret_key
        .as_deref()
        .map(str::to_string)
        .unwrap_or_else(|| legacy_key(&entry.user_id));
    if let Some(secret) = secrets::get(&key)?.filter(|value| !value.is_empty()) {
        return Ok(secret);
    }
    if entry.secret_key.is_some() {
        return Err(RouteError::Status(503, "mfa_seed_unavailable"));
    }
    let encrypted = entry
        .secret
        .as_deref()
        .filter(|value| !value.is_empty())
        .ok_or(RouteError::Status(400, "mfa_not_configured"))?;
    let key = secrets::get(LEGACY_ENCRYPTION_SECRET)?
        .ok_or(RouteError::Status(503, "mfa_seed_unavailable"))?;
    Ok(EncryptionService::from_secret(&key).decrypt(encrypted)?)
}

pub(super) fn create(user_id: &str, value: &str) -> Result<String, RouteError> {
    let key = format!("{TOTP_SECRET_PREFIX}{user_id}:{}", uuid::Uuid::new_v4());
    secrets::set(&key, value)?;
    Ok(key)
}

pub(super) fn delete_enrollment(entry: &TotpEntry) -> Result<bool, RouteError> {
    validate_reference(entry)?;
    let Some(key) = entry.secret_key.as_deref() else {
        // Never delete a shared legacy key after reading it: concurrent recovery
        // could still reference it. Account deletion owns legacy cleanup.
        return Ok(false);
    };
    Ok(secrets::delete(key)?)
}

pub(super) fn delete(user_id: &str, enrollment: Option<&TotpEntry>) -> Result<bool, RouteError> {
    if let Some(entry) = enrollment {
        if entry.user_id != user_id {
            return Err(RouteError::Status(500, "mfa_owner_mismatch"));
        }
        delete_enrollment(entry)?;
    }
    Ok(secrets::delete(&legacy_key(user_id))?)
}

fn validate_reference(entry: &TotpEntry) -> Result<(), RouteError> {
    if let Some(key) = &entry.secret_key {
        let prefix = format!("{TOTP_SECRET_PREFIX}{}:", entry.user_id);
        if !key
            .strip_prefix(&prefix)
            .is_some_and(|suffix| uuid::Uuid::parse_str(suffix).is_ok())
        {
            return Err(RouteError::Status(503, "mfa_seed_unavailable"));
        }
    }
    Ok(())
}

fn legacy_key(user_id: &str) -> String {
    format!("{TOTP_SECRET_PREFIX}{user_id}")
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn factor_credentials_are_namespaced_by_user() {
        assert_eq!(legacy_key("user-1"), "totp-secret:user-1");
        assert_ne!(legacy_key("user-1"), legacy_key("user-2"));
    }
    #[test]
    fn enrollment_secret_references_cannot_cross_user_or_fall_back_to_old_seed() {
        let mut entry: TotpEntry = serde_json::from_value(serde_json::json!({
            "userId":"user-1","secret":"legacy-ciphertext","enabled":true,
            "createdAt":"2026-01-01T00:00:00Z","enabledAt":null,"lastUsedTimeStep":null,
            "secretKey":"totp-secret:user-1:00000000-0000-0000-0000-000000000001"
        }))
        .unwrap();
        crate::host::key_value_test_support::with_values(
            |_, _| Ok(Some("current-seed".into())),
            || {
                assert_eq!(get(&mut entry).unwrap(), "current-seed");
            },
        );
        crate::host::key_value_test_support::with_values(
            |_, _| Ok(None),
            || {
                assert!(get(&mut entry).is_err());
            },
        );
        for key in [
            "jwt-signing",
            "totp-secret:user-2:00000000-0000-0000-0000-000000000001",
            "totp-secret:user-1:invalid",
        ] {
            entry.secret_key = Some(key.into());
            assert!(validate_reference(&entry).is_err());
        }
    }
}
