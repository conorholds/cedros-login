//! Repository adapters: each logical table is a dedicated content model over the
//! host DB seam ([`crate::host::db`]) — auto-provisioned at install, no `migrate`.
//! No pool, no SQL: relational reads, atomic `batch` writes, and expiry sweeps
//! via the seam. Ids and timestamps are strings (see `host::db`).
pub mod account;
pub mod api_keys;
pub mod audit;
pub mod canonical_email;
pub mod cleanup;
pub mod credentials;
pub mod custom_roles;
pub mod invite_codes;
pub mod invites;
pub mod login_attempts;
pub mod memberships;
pub mod mfa_challenges;
pub mod nonces;
pub mod oauth;
pub mod organization_lifecycle;
pub mod orgs;
pub mod outbox;
pub mod policies;
pub mod registration_account;
mod session_mutations;
pub mod sessions;
pub mod signup_limit;
pub mod sso_identities;
pub mod sso_providers;
pub mod totp;
pub mod user_emails;
pub mod users;
pub mod verifications;

#[cfg(test)]
mod serialization_shape_tests;

