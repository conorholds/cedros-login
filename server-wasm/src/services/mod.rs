//! Auth domain services ported from `server/src/services`, made synchronous for
//! the wasm component (host exports are called synchronously; no tokio). Pure
//! logic/crypto — no IO — so they unit-test on the host and compile to wasip2.
pub mod abac;
pub mod api_key;
pub mod common_passwords;
pub mod device;
pub mod email;
pub mod email_design;
pub mod email_layout;
pub mod email_templates;
pub mod encryption;
pub mod image_processing;
pub mod jwt;
pub mod oidc;
pub mod password;
pub mod solana;
pub mod sso;
pub mod tokens;
pub mod totp;
pub mod webauthn;

use std::fmt;

/// Auth service errors, mapped to an HTTP status by the route layer.
#[derive(Debug, PartialEq)]
pub enum AuthError {
    /// Input failed validation (e.g. a weak password) — 422.
    Validation(Vec<String>),
    /// Bad/expired credentials or token — 401.
    Unauthorized(String),
    /// Internal crypto/encoding failure — 500.
    Crypto(String),
}

impl AuthError {
    /// Stable, client-safe code carrying no raw detail — safe to log (the
    /// `Display` impl interpolates the raw inner message, which must not reach
    /// the host tracing pipeline; see `docs/cedros-site-brain-logging.md`).
    pub fn code(&self) -> &'static str {
        match self {
            AuthError::Validation(_) => "validation",
            AuthError::Unauthorized(_) => "unauthorized",
            AuthError::Crypto(_) => "crypto_error",
        }
    }
}

impl fmt::Display for AuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AuthError::Validation(errors) => write!(f, "validation: {}", errors.join("; ")),
            AuthError::Unauthorized(m) => write!(f, "unauthorized: {m}"),
            AuthError::Crypto(m) => write!(f, "crypto: {m}"),
        }
    }
}
