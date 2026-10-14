//! Storage layer with support for multiple backends.

mod cleanup;
mod constructors;

use std::sync::Arc;

use crate::repositories::{
    ApiKeyRepository, AtomicMfaRepository, AuditLogRepository, CanonicalEmailRepository,
    CredentialLifecycleRepository, CredentialRepository, CustomRoleRepository,
    EmailVerificationRepository, InviteCodeRepository, InviteRepository, LoginAttemptRepository,
    MembershipRepository, NonceRepository, OrgRepository, OutboxRepository,
    PendingInviteRedemptionRepository, PolicyRepository, SessionRepository, SsoRepository,
    SystemSettingsRepository, TotpRepository, UserEmailRepository, UserRepository,
    VerificationRepository, WebAuthnRepository,
};

#[cfg(feature = "postgres")]
use sqlx::PgPool;

/// Storage backend containing all repository boundaries.
#[derive(Clone)]
pub struct Storage {
    pub user_repo: Arc<dyn UserRepository>,
    pub user_email_repo: Arc<dyn UserEmailRepository>,
    /// Atomic persistence boundary for denormalized canonical-email state.
    pub canonical_email_repo: Arc<dyn CanonicalEmailRepository>,
    /// Atomic token consumption plus canonical email-ledger verification.
    pub email_verification_repo: Arc<dyn EmailVerificationRepository>,
    pub session_repo: Arc<dyn SessionRepository>,
    pub nonce_repo: Arc<dyn NonceRepository>,
    pub verification_repo: Arc<dyn VerificationRepository>,
    /// Atomic MFA challenge, replay state, and session persistence boundary.
    pub atomic_mfa_repo: Arc<dyn AtomicMfaRepository>,
    pub org_repo: Arc<dyn OrgRepository>,
    pub membership_repo: Arc<dyn MembershipRepository>,
    pub invite_repo: Arc<dyn InviteRepository>,
    pub invite_code_repo: Arc<dyn InviteCodeRepository>,
    pub pending_invite_redemption_repo: Arc<dyn PendingInviteRedemptionRepository>,
    pub audit_repo: Arc<dyn AuditLogRepository>,
    pub login_attempt_repo: Arc<dyn LoginAttemptRepository>,
    pub totp_repo: Arc<dyn TotpRepository>,
    pub custom_role_repo: Arc<dyn CustomRoleRepository>,
    pub policy_repo: Arc<dyn PolicyRepository>,
    pub outbox_repo: Arc<dyn OutboxRepository>,
    pub api_key_repo: Arc<dyn ApiKeyRepository>,
    pub credential_repo: Arc<dyn CredentialRepository>,
    pub credential_lifecycle_repo: Arc<dyn CredentialLifecycleRepository>,
    pub webauthn_repo: Arc<dyn WebAuthnRepository>,
    pub sso_repo: Arc<dyn SsoRepository>,
    pub system_settings_repo: Arc<dyn SystemSettingsRepository>,
    #[cfg(feature = "postgres")]
    pub pg_pool: Option<PgPool>,
}

impl Storage {
    /// Return the credential repository adapter.
    pub fn credential_repository(&self) -> &dyn CredentialRepository {
        self.credential_repo.as_ref()
    }

    /// Return the WebAuthn repository adapter.
    pub fn webauthn_repository(&self) -> &Arc<dyn WebAuthnRepository> {
        &self.webauthn_repo
    }

    /// Return the SSO repository adapter.
    pub fn sso_repository(&self) -> &Arc<dyn SsoRepository> {
        &self.sso_repo
    }
}

#[cfg(test)]
mod tests;
