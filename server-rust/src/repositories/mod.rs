//! Data access layer
//!
//! # Database Index Requirements
//!
//! For optimal query performance, ensure the following indexes exist in PostgreSQL:
//!
//! ## User Repository
//! - `users(email)` - UNIQUE, for login and registration lookups
//! - `users(wallet_address)` - for Solana wallet authentication
//! - `users(google_id)` - for Google OAuth lookups
//! - `users(apple_id)` - for Apple Sign-In lookups
//!
//! ## Session Repository
//! - `sessions(user_id)` - for listing user sessions
//! - `sessions(user_id, revoked_at)` - for active session counts
//! - `sessions(refresh_token_hash)` - UNIQUE, for token refresh
//! - `sessions(expires_at)` - for cleanup job expiration queries
//!
//! ## Membership Repository
//! - `memberships(user_id)` - for listing user's organizations
//! - `memberships(org_id)` - for listing organization members
//! - `memberships(user_id, org_id)` - UNIQUE, prevents duplicates
//!
//! ## Invite Repository
//! - `invites(org_id)` - for listing organization invites
//! - `invites(email)` - for finding invites by email
//! - `invites(token_hash)` - UNIQUE, for invite acceptance
//! - `invites(expires_at)` - for cleanup job
//!
//! ## TOTP Repository
//! - `totp_secrets(user_id)` - UNIQUE, one TOTP per user
//!
//! ## Audit Repository
//! - `audit_logs(user_id, created_at)` - for user activity queries
//! - `audit_logs(org_id, created_at)` - for org activity queries
//! - `audit_logs(event_type, created_at)` - for event type filtering
//!
//! ## Outbox Repository
//! - `outbox(status, next_attempt_at)` - for worker polling
//! - `outbox(created_at)` - for cleanup job
//!
//! ## Login Attempt Repository
//! - `login_attempts(email, created_at)` - for rate limiting lookups
//! - `login_attempts(ip_address, created_at)` - for IP-based limiting
//!
//! ## Verification Repository
//! - `verification_tokens(token_hash)` - UNIQUE, for token lookup
//! - `verification_tokens(user_id, token_type)` - for cleanup/resend
//!
//! ## Wallet Material Repository
//! - `wallet_materials(user_id)` - UNIQUE, one wallet per user
//! - `wallet_materials(solana_pubkey)` - for recovery lookups
//!
//! # Transaction Support (BUG-003)
//!
//! ## Current Limitation
//!
//! Individual repository methods do **not** support multi-step transactions
//! across different entities. Each method operates independently, which means:
//!
//! - Creating a user and their membership are separate operations
//! - Invite acceptance and membership creation are not atomic
//! - Failures mid-operation may leave data in inconsistent states
//!
//! ## Known Multi-Step Operations and Failure Scenarios
//!
//! | Operation | Steps | Failure Impact | Mitigation |
//! |-----------|-------|----------------|------------|
//! | User registration | 1. Create user 2. Create membership (if org invite) | Orphan user without membership | Cleanup job removes orphan users after 24h |
//! | Invite acceptance | 1. Mark invite accepted 2. Create membership | Invite consumed but no membership | `unmark_accepted()` on failure; cleanup job |
//! | Org deletion | 1. Delete memberships 2. Delete invites 3. Delete org | Partial deletion | Retry-safe: deletions are idempotent |
//! | User deletion | 1. Revoke sessions 2. Delete TOTP 3. Delete memberships 4. Delete user | Orphan sessions/memberships | Cleanup job handles orphans |
//!
//! ## Mitigation Strategies
//!
//! ### 1. Idempotent Operations
//! Design operations to be safely re-runnable:
//! - Use `INSERT ... ON CONFLICT DO NOTHING` for creates
//! - Check existence before updates
//! - Use atomic `mark_accepted_if_valid()` patterns
//!
//! ### 2. Compensation on Failure
//! When a multi-step operation fails, undo completed steps:
//! ```text
//! // Example: Safe invite acceptance pattern
//! let invite = invite_repo.mark_accepted_if_valid(invite_id).await?;
//! match membership_repo.create(membership).await {
//!     Ok(m) => Ok(m),
//!     Err(e) => {
//!         // Compensate: undo invite acceptance
//!         let _ = invite_repo.unmark_accepted(invite_id).await;
//!         Err(e)
//!     }
//! }
//! ```
//!
//! ### 3. Cleanup Jobs
//! Background processes (in `Storage::start_cleanup_task`) fix inconsistencies:
//! - Remove expired sessions, nonces, invites
//! - Clear old outbox events and login attempts
//!
//! ### 4. Soft Deletes
//! Mark as deleted rather than hard delete where possible:
//! - Sessions use `revoked_at` timestamp
//! - Invites use `accepted_at` timestamp
//!
//! ### 5. Retry Logic
//! For transient failures, retry at the handler level:
//! - Network timeouts
//! - Connection pool exhaustion
//! - Deadlock retries (Postgres handles automatically)
//!
//! ## Future Improvement
//!
//! A full fix requires adding transaction support to the trait layer:
//! ```text
//! async fn begin_transaction(&self) -> Result<Transaction, AppError>;
//! async fn create_in_tx(&self, tx: &mut Transaction, entity: T) -> Result<T, AppError>;
//! ```
//!
//! This is a significant architectural change tracked for future work.

mod api_key_repository;
mod audit_repository;
mod credential_repository;
mod credit_hold_repository;
mod credit_refund_request_repository;
mod credit_repository;
mod custom_role_repository;
mod deposit_repository;
mod invite_repository;
mod login_attempt_repository;
mod membership_repository;
mod nonce_repository;
mod org_repository;
mod outbox_repository;
mod pending_wallet_recovery_repository;
mod policy_repository;
mod privacy_note_repository;
mod session_repository;
mod sso_repository;
mod system_settings_repository;
mod totp_repository;
mod transactional_ops;
mod treasury_config_repository;
mod user_repository;
mod user_withdrawal_log_repository;
mod verification_repository;
mod wallet_material_repository;
mod webauthn_repository;
mod withdrawal_history_repository;

// R-08: Shared pagination constants
pub mod pagination;

#[cfg(feature = "postgres")]
pub mod postgres;

#[cfg(test)]
mod tests;

pub use api_key_repository::{
    generate_api_key, hash_api_key, ApiKeyEntity, ApiKeyRepository, InMemoryApiKeyRepository,
    API_KEY_PREFIX,
};
pub use audit_repository::{
    AuditEventType, AuditLogBuilder, AuditLogEntry, AuditLogQuery, AuditLogRepository,
    InMemoryAuditLogRepository,
};
pub use credential_repository::{
    CredentialEntity, CredentialRepository, CredentialType, InMemoryCredentialRepository,
};
pub use credit_hold_repository::{
    CreateHoldResult, CreditHoldEntity, CreditHoldRepository, HoldStatus,
    InMemoryCreditHoldRepository,
};
pub use credit_refund_request_repository::{
    CreditRefundRequestEntity, CreditRefundRequestRepository, CreditRefundRequestStatus,
    InMemoryCreditRefundRequestRepository,
};
pub use credit_repository::{
    CreditBalanceEntity, CreditRepository, CreditStats, CreditTransactionEntity, CreditTxType,
    CurrencyCreditStats, InMemoryCreditRepository, UserCreditStats,
};
pub use custom_role_repository::{CustomRole, CustomRoleRepository, InMemoryCustomRoleRepository};
pub use deposit_repository::{
    DepositRepository, DepositSessionEntity, DepositStats, DepositStatus, DepositType,
    InMemoryDepositRepository, WalletType,
};
pub use invite_repository::{
    default_invite_expiry, generate_invite_token, hash_invite_token, InMemoryInviteRepository,
    InviteEntity, InviteRepository, INVITE_EXPIRY_DAYS,
};
pub use login_attempt_repository::{
    InMemoryLoginAttemptRepository, LockoutStatus, LoginAttemptConfig, LoginAttemptRecord,
    LoginAttemptRepository,
};
pub use membership_repository::{
    InMemoryMembershipRepository, MemberWithUser, MembershipEntity, MembershipRepository, OrgRole,
};
pub use nonce_repository::{InMemoryNonceRepository, NonceEntity, NonceRepository};
pub use org_repository::{generate_slug, InMemoryOrgRepository, OrgEntity, OrgRepository};
pub use outbox_repository::{
    InMemoryOutboxRepository, OutboxEvent, OutboxEventType, OutboxRepository, OutboxStatus,
};
pub use pending_wallet_recovery_repository::{
    InMemoryPendingWalletRecoveryRepository, PendingWalletRecoveryEntity,
    PendingWalletRecoveryRepository, RecoveryType,
};
pub use policy_repository::{
    AbacPolicy, AttributeMatcher, InMemoryPolicyRepository, PolicyConditions, PolicyEffect,
    PolicyRepository,
};
pub use privacy_note_repository::{
    InMemoryPrivacyNoteRepository, NoteStatus, PrivacyNoteEntity, PrivacyNoteRepository,
};
pub use session_repository::{InMemorySessionRepository, SessionEntity, SessionRepository};
pub use sso_repository::{InMemorySsoRepository, SsoRepository};
pub use system_settings_repository::{
    InMemorySystemSettingsRepository, SystemSetting, SystemSettingsRepository,
};
pub use totp_repository::{InMemoryTotpRepository, RecoveryCode, TotpRepository, TotpSecret};
pub use transactional_ops::TransactionalOps;
pub use treasury_config_repository::{
    InMemoryTreasuryConfigRepository, TreasuryConfigEntity, TreasuryConfigRepository,
};
pub use user_repository::{
    normalize_email, validate_email_ascii_local, InMemoryUserRepository, UserEntity, UserRepository,
};
pub use user_withdrawal_log_repository::{
    InMemoryUserWithdrawalLogRepository, UserWithdrawalLogEntry, UserWithdrawalLogRepository,
};
pub use verification_repository::{
    default_expiry, generate_verification_token, hash_verification_token,
    InMemoryVerificationRepository, RepositoryError, TokenType, VerificationRepository,
    VerificationToken,
};
pub use wallet_material_repository::{
    CreateWalletMaterial, InMemoryWalletMaterialRepository, KdfParams, RotateUserSecret,
    ShareAAuthMethod, WalletMaterialEntity, WalletMaterialRepository,
};
pub use webauthn_repository::{
    InMemoryWebAuthnRepository, WebAuthnChallenge, WebAuthnCredential, WebAuthnRepository,
};
pub use withdrawal_history_repository::{
    InMemoryWithdrawalHistoryRepository, WithdrawalHistoryEntry, WithdrawalHistoryRepository,
};

#[cfg(feature = "postgres")]
pub use postgres::{
    PostgresApiKeyRepository, PostgresAuditLogRepository, PostgresCredentialRepository,
    PostgresCreditHoldRepository, PostgresCreditRefundRequestRepository, PostgresCreditRepository,
    PostgresCustomRoleRepository, PostgresDepositRepository, PostgresInviteRepository,
    PostgresLoginAttemptRepository, PostgresMembershipRepository, PostgresNonceRepository,
    PostgresOrgRepository, PostgresOutboxRepository, PostgresPendingWalletRecoveryRepository,
    PostgresPolicyRepository, PostgresPrivacyNoteRepository, PostgresSessionRepository,
    PostgresSsoRepository, PostgresSystemSettingsRepository, PostgresTotpRepository,
    PostgresTreasuryConfigRepository, PostgresUserRepository, PostgresUserWithdrawalLogRepository,
    PostgresVerificationRepository, PostgresWalletMaterialRepository, PostgresWebAuthnRepository,
    PostgresWithdrawalHistoryRepository,
};
