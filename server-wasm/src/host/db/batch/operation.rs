#[cfg(test)]
use super::super::ORG_DB;
use super::super::{ACCOUNT_LIFECYCLE_DB, IDENTITY_DB, ORGANIZATION_LIFECYCLE_DB, REGISTRATION_DB};

/// A host-owned mutation from Login's declared Cedros Data capabilities.
/// This enum is closed so callers cannot pair an operation with a wrong grant.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ConditionalOperation {
    RotateSession,
    RevokeSessions,
    ConsumeLivePurposeBoundVerification,
    ClaimFirstAdmin,
    DemoteSystemAdmin,
    // Preserve the immutable v2 wire fixture; live membership changes use CAS.
    #[cfg(test)]
    ChangeMembershipRole,
    TransitionCanonicalEmail,
    ClaimOutboxDelivery,
    EnqueueTokenEmail,
    CompleteOutboxDelivery,
    ReleaseOutboxDelivery,
    CompletePasswordReset,
    CompleteInstantLink,
    CompleteSsoAuthentication,
    CompleteSolanaProof,
    CompleteWebauthnAuthentication,
    CompleteWebauthnRegistration,
    GetSignupLimitStatus,
    CreateRegistrationAccount,
    CompleteRegistrationAccount,
    RedeemInviteCode,
    ReleaseInviteGate,
    DeleteAccount,
    DeleteOrganization,
}

impl ConditionalOperation {
    #[cfg(test)]
    pub const DATABASE_CONCURRENCY_V2: [Self; 22] = [
        Self::ConsumeLivePurposeBoundVerification,
        Self::ClaimFirstAdmin,
        Self::DemoteSystemAdmin,
        Self::ChangeMembershipRole,
        Self::TransitionCanonicalEmail,
        Self::ClaimOutboxDelivery,
        Self::EnqueueTokenEmail,
        Self::CompleteOutboxDelivery,
        Self::ReleaseOutboxDelivery,
        Self::CompletePasswordReset,
        Self::CompleteInstantLink,
        Self::CompleteSsoAuthentication,
        Self::CompleteSolanaProof,
        Self::CompleteWebauthnAuthentication,
        Self::CompleteWebauthnRegistration,
        Self::GetSignupLimitStatus,
        Self::CreateRegistrationAccount,
        Self::CompleteRegistrationAccount,
        Self::RedeemInviteCode,
        Self::ReleaseInviteGate,
        Self::DeleteAccount,
        Self::DeleteOrganization,
    ];

    pub const fn id(self) -> &'static str {
        match self {
            Self::RotateSession => "identity.sessions.rotate",
            Self::RevokeSessions => "identity.sessions.revoke",
            Self::ConsumeLivePurposeBoundVerification => {
                "identity.verifications.consume-live-purpose-bound"
            }
            Self::ClaimFirstAdmin => "identity.setup.claim-first-admin",
            Self::DemoteSystemAdmin => "identity.system-admin.demote",
            #[cfg(test)]
            Self::ChangeMembershipRole => "organization.membership.change-role",
            Self::TransitionCanonicalEmail => "identity.canonical-email.transition",
            Self::ClaimOutboxDelivery => "identity.outbox.claim-delivery",
            Self::EnqueueTokenEmail => "identity.outbox.enqueue-token-email",
            Self::CompleteOutboxDelivery => "identity.outbox.complete-delivery",
            Self::ReleaseOutboxDelivery => "identity.outbox.release-delivery",
            Self::CompletePasswordReset => "identity.password-reset.complete",
            Self::CompleteInstantLink => "identity.instant-link.complete",
            Self::CompleteSsoAuthentication => "identity.sso-auth.complete",
            Self::CompleteSolanaProof => "identity.solana-proof.complete",
            Self::CompleteWebauthnAuthentication => "identity.webauthn-auth.complete",
            Self::CompleteWebauthnRegistration => "identity.webauthn-registration.complete",
            Self::GetSignupLimitStatus => "registration.signup-limit.status",
            Self::CreateRegistrationAccount => "registration.account.create",
            Self::CompleteRegistrationAccount => "registration.account.complete",
            Self::RedeemInviteCode => "registration.invite-code.redeem",
            Self::ReleaseInviteGate => "registration.invite-gate.release",
            Self::DeleteAccount => "identity.account.delete",
            Self::DeleteOrganization => "organization.delete",
        }
    }

    pub(super) const fn access(self) -> &'static str {
        match self {
            #[cfg(test)]
            Self::ChangeMembershipRole => ORG_DB,
            Self::RedeemInviteCode
            | Self::GetSignupLimitStatus
            | Self::CreateRegistrationAccount
            | Self::CompleteRegistrationAccount
            | Self::ReleaseInviteGate => REGISTRATION_DB,
            Self::DeleteAccount => ACCOUNT_LIFECYCLE_DB,
            Self::DeleteOrganization => ORGANIZATION_LIFECYCLE_DB,
            Self::EnqueueTokenEmail => IDENTITY_DB,
            _ => IDENTITY_DB,
        }
    }
}
