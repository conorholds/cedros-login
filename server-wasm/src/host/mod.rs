//! Typed, fail-closed wrappers over the `cedros:extension` host capabilities.
//!
//! Every host seam returns its own `host-error`; these modules normalize them to
//! one [`SeamError`] so callers (routes/jobs) get a uniform [`Result`] and a
//! stable, client-safe [`SeamError::code`]. Clients receive only the code; the
//! raw host detail (carried by [`SeamError`]'s `Display`) is for in-process
//! handling and must NOT be logged — log [`SeamError::code`] via the redacted
//! [`log::op_error`]/[`log::op_warn`] helpers (see `docs/cedros-site-brain-logging.md`).
pub mod crm_source_events;
pub mod db;
pub mod extension_services;
pub mod http;
#[cfg(test)]
pub(crate) mod key_value_test_support;
pub mod log;
pub mod providers;
pub mod secret_versions;
pub mod secrets;
pub mod settings;
pub mod storage;
pub mod telemetry;

use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fmt;

/// Uniform error across every host seam.
#[derive(Debug)]
pub enum SeamError {
    Db(String),
    /// A host-enforced uniqueness or conditional-write conflict. The current
    /// database WIT has a message-only error, so `db` recognizes only the
    /// versioned, PII-free marker defined by the host concurrency contract.
    DbConflict {
        category: DbConflictCategory,
        operation: String,
    },
    SignupLimitReached {
        resets_at: String,
    },
    Settings(String),
    Secrets(String),
    Provider(String),
    CrmSource(String),
    Http(String),
    Telemetry(String),
    Encoding(String),
    ExtensionService(String),
}

/// Stable conflict classes from the Cedros database concurrency contract v1.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DbConflictCategory {
    Unique,
    Precondition,
    Lease,
}

impl DbConflictCategory {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Unique => "unique",
            Self::Precondition => "precondition",
            Self::Lease => "lease",
        }
    }
}

pub type Result<T> = core::result::Result<T, SeamError>;

impl SeamError {
    /// Stable, client-safe error code carrying no host detail.
    pub fn code(&self) -> &'static str {
        match self {
            SeamError::Db(_) => "db_error",
            SeamError::DbConflict { .. } => "db_conflict",
            SeamError::SignupLimitReached { .. } => "signup_limit_reached",
            SeamError::Settings(_) => "settings_error",
            SeamError::Secrets(_) => "secrets_error",
            SeamError::Provider(_) => "provider_error",
            SeamError::CrmSource(_) => "crm_source_error",
            SeamError::Http(_) => "http_error",
            SeamError::Telemetry(_) => "telemetry_error",
            SeamError::Encoding(_) => "encoding_error",
            SeamError::ExtensionService(_) => "extension_service_error",
        }
    }

    /// True only for the exact versioned host conflict marker. Arbitrary host
    /// messages remain generic database failures and are never exposed.
    pub fn is_db_conflict(&self) -> bool {
        matches!(self, SeamError::DbConflict { .. })
    }

    fn detail(&self) -> &str {
        match self {
            SeamError::Db(m)
            | SeamError::Settings(m)
            | SeamError::Secrets(m)
            | SeamError::Provider(m)
            | SeamError::CrmSource(m)
            | SeamError::Http(m)
            | SeamError::Telemetry(m)
            | SeamError::Encoding(m) => m,
            SeamError::ExtensionService(m) => m,
            SeamError::DbConflict { operation, .. } => operation,
            SeamError::SignupLimitReached { resets_at } => resets_at,
        }
    }
}

impl fmt::Display for SeamError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let SeamError::DbConflict {
            category,
            operation,
        } = self
        {
            return write!(f, "{}: {}:{}", self.code(), category.as_str(), operation);
        }
        write!(f, "{}: {}", self.code(), self.detail())
    }
}

/// Serialize to a JSON string, mapping failures to [`SeamError::Encoding`].
pub fn to_json<T: Serialize>(value: &T) -> Result<String> {
    serde_json::to_string(value).map_err(|e| SeamError::Encoding(e.to_string()))
}

/// Parse a JSON string, mapping failures to [`SeamError::Encoding`].
pub fn from_json<T: DeserializeOwned>(raw: &str) -> Result<T> {
    serde_json::from_str(raw).map_err(|e| SeamError::Encoding(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn code_is_stable_and_display_includes_detail() {
        let e = SeamError::Db("connection reset".into());
        assert_eq!(e.code(), "db_error");
        assert_eq!(e.to_string(), "db_error: connection reset");
    }

    #[test]
    fn database_conflict_has_a_stable_redacted_code() {
        let error = SeamError::DbConflict {
            category: DbConflictCategory::Unique,
            operation: "identity.users.email".into(),
        };
        assert_eq!(error.code(), "db_conflict");
        assert!(error.is_db_conflict());
        assert_eq!(
            error.to_string(),
            "db_conflict: unique:identity.users.email"
        );
    }
}
