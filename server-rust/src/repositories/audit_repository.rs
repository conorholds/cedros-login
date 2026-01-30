//! Audit log repository trait and implementations

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Audit event types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuditEventType {
    // User events
    UserLogin,
    UserLogout,
    UserLogoutAll, // M-02: Logout from all devices
    UserRegister,
    UserPasswordChanged,
    UserEmailVerified,

    // Session events
    SessionCreated,
    SessionRevoked,
    SessionRevokedAll,

    // Organization events
    OrgCreated,
    OrgUpdated,
    OrgDeleted,

    // Membership events
    MemberJoined,
    MemberRoleChanged,
    MemberRemoved,

    // Invite events
    InviteCreated,
    InviteAccepted,
    InviteCanceled,
    InviteResent,
    /// H-03: Data inconsistency - invite marked accepted but membership creation failed
    InviteRollbackFailed,

    // Password reset events
    PasswordResetRequested,
    PasswordResetCompleted,

    // Instant link events
    InstantLinkRequested,

    // MFA events
    MfaSetupStarted,
    MfaEnabled,
    MfaDisabled,
    MfaRecoveryCodeUsed,
    MfaRecoveryCodesRegenerated,
    MfaChallengeIssued,
    MfaLoginCompleted,

    // Custom role events
    CustomRoleCreated,
    CustomRoleUpdated,
    CustomRoleDeleted,

    // Wallet events
    WalletEnrolled,
    WalletRecovered,
    WalletRecoveryAcknowledged,
    WalletDeviceShareRotated,
    WalletUserSecretRotated,
    WalletTransactionSigned,
    WalletUnlocked,
    WalletLocked,
}

impl AuditEventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::UserLogin => "user.login",
            Self::UserLogout => "user.logout",
            Self::UserLogoutAll => "user.logout_all",
            Self::UserRegister => "user.register",
            Self::UserPasswordChanged => "user.password_changed",
            Self::UserEmailVerified => "user.email_verified",
            Self::SessionCreated => "session.created",
            Self::SessionRevoked => "session.revoked",
            Self::SessionRevokedAll => "session.revoked_all",
            Self::OrgCreated => "org.created",
            Self::OrgUpdated => "org.updated",
            Self::OrgDeleted => "org.deleted",
            Self::MemberJoined => "member.joined",
            Self::MemberRoleChanged => "member.role_changed",
            Self::MemberRemoved => "member.removed",
            Self::InviteCreated => "invite.created",
            Self::InviteAccepted => "invite.accepted",
            Self::InviteCanceled => "invite.canceled",
            Self::InviteResent => "invite.resent",
            Self::InviteRollbackFailed => "invite.rollback_failed",
            Self::PasswordResetRequested => "password.reset_requested",
            Self::PasswordResetCompleted => "password.reset_completed",
            Self::InstantLinkRequested => "instant_link.requested",
            Self::MfaSetupStarted => "mfa.setup_started",
            Self::MfaEnabled => "mfa.enabled",
            Self::MfaDisabled => "mfa.disabled",
            Self::MfaRecoveryCodeUsed => "mfa.recovery_code_used",
            Self::MfaRecoveryCodesRegenerated => "mfa.recovery_codes_regenerated",
            Self::MfaChallengeIssued => "mfa.challenge_issued",
            Self::MfaLoginCompleted => "mfa.login_completed",
            Self::CustomRoleCreated => "custom_role.created",
            Self::CustomRoleUpdated => "custom_role.updated",
            Self::CustomRoleDeleted => "custom_role.deleted",
            Self::WalletEnrolled => "wallet.enrolled",
            Self::WalletRecovered => "wallet.recovered",
            Self::WalletRecoveryAcknowledged => "wallet.recovery_acknowledged",
            Self::WalletDeviceShareRotated => "wallet.device_share_rotated",
            Self::WalletUserSecretRotated => "wallet.user_secret_rotated",
            Self::WalletTransactionSigned => "wallet.transaction_signed",
            Self::WalletUnlocked => "wallet.unlocked",
            Self::WalletLocked => "wallet.locked",
        }
    }

    /// Parse audit event type from string (returns None for invalid values)
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "user.login" => Some(Self::UserLogin),
            "user.logout" => Some(Self::UserLogout),
            "user.logout_all" => Some(Self::UserLogoutAll),
            "user.register" => Some(Self::UserRegister),
            "user.password_changed" => Some(Self::UserPasswordChanged),
            "user.email_verified" => Some(Self::UserEmailVerified),
            "session.created" => Some(Self::SessionCreated),
            "session.revoked" => Some(Self::SessionRevoked),
            "session.revoked_all" => Some(Self::SessionRevokedAll),
            "org.created" => Some(Self::OrgCreated),
            "org.updated" => Some(Self::OrgUpdated),
            "org.deleted" => Some(Self::OrgDeleted),
            "member.joined" => Some(Self::MemberJoined),
            "member.role_changed" => Some(Self::MemberRoleChanged),
            "member.removed" => Some(Self::MemberRemoved),
            "invite.created" => Some(Self::InviteCreated),
            "invite.accepted" => Some(Self::InviteAccepted),
            "invite.canceled" => Some(Self::InviteCanceled),
            "invite.resent" => Some(Self::InviteResent),
            "invite.rollback_failed" => Some(Self::InviteRollbackFailed),
            "password.reset_requested" => Some(Self::PasswordResetRequested),
            "password.reset_completed" => Some(Self::PasswordResetCompleted),
            "instant_link.requested" => Some(Self::InstantLinkRequested),
            "mfa.setup_started" => Some(Self::MfaSetupStarted),
            "mfa.enabled" => Some(Self::MfaEnabled),
            "mfa.disabled" => Some(Self::MfaDisabled),
            "mfa.recovery_code_used" => Some(Self::MfaRecoveryCodeUsed),
            "mfa.recovery_codes_regenerated" => Some(Self::MfaRecoveryCodesRegenerated),
            "mfa.challenge_issued" => Some(Self::MfaChallengeIssued),
            "mfa.login_completed" => Some(Self::MfaLoginCompleted),
            "custom_role.created" => Some(Self::CustomRoleCreated),
            "custom_role.updated" => Some(Self::CustomRoleUpdated),
            "custom_role.deleted" => Some(Self::CustomRoleDeleted),
            "wallet.enrolled" => Some(Self::WalletEnrolled),
            "wallet.recovered" => Some(Self::WalletRecovered),
            "wallet.recovery_acknowledged" => Some(Self::WalletRecoveryAcknowledged),
            "wallet.device_share_rotated" => Some(Self::WalletDeviceShareRotated),
            "wallet.user_secret_rotated" => Some(Self::WalletUserSecretRotated),
            "wallet.transaction_signed" => Some(Self::WalletTransactionSigned),
            "wallet.unlocked" => Some(Self::WalletUnlocked),
            "wallet.locked" => Some(Self::WalletLocked),
            _ => None,
        }
    }
}

impl std::fmt::Display for AuditEventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Audit log entry entity
#[derive(Debug, Clone)]
pub struct AuditLogEntry {
    pub id: Uuid,
    pub event_type: AuditEventType,
    pub actor_user_id: Option<Uuid>,
    /// S-23: Session ID in which the action was performed (for forensic correlation)
    pub session_id: Option<Uuid>,
    pub org_id: Option<Uuid>,
    pub target_type: Option<String>,
    pub target_id: Option<Uuid>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub metadata: Value,
    pub created_at: DateTime<Utc>,
}

/// Builder for creating audit log entries
pub struct AuditLogBuilder {
    event_type: AuditEventType,
    actor_user_id: Option<Uuid>,
    session_id: Option<Uuid>,
    org_id: Option<Uuid>,
    target_type: Option<String>,
    target_id: Option<Uuid>,
    ip_address: Option<String>,
    user_agent: Option<String>,
    metadata: Value,
}

impl AuditLogBuilder {
    pub fn new(event_type: AuditEventType) -> Self {
        Self {
            event_type,
            actor_user_id: None,
            session_id: None,
            org_id: None,
            target_type: None,
            target_id: None,
            ip_address: None,
            user_agent: None,
            metadata: Value::Object(serde_json::Map::new()),
        }
    }

    pub fn actor(mut self, user_id: Uuid) -> Self {
        self.actor_user_id = Some(user_id);
        self
    }

    /// S-23: Set the session ID for forensic correlation
    pub fn session(mut self, session_id: Uuid) -> Self {
        self.session_id = Some(session_id);
        self
    }

    pub fn org(mut self, org_id: Uuid) -> Self {
        self.org_id = Some(org_id);
        self
    }

    pub fn target(mut self, target_type: &str, target_id: Uuid) -> Self {
        self.target_type = Some(target_type.to_string());
        self.target_id = Some(target_id);
        self
    }

    pub fn ip(mut self, ip: &str) -> Self {
        self.ip_address = Some(ip.to_string());
        self
    }

    pub fn user_agent(mut self, ua: &str) -> Self {
        self.user_agent = Some(ua.to_string());
        self
    }

    pub fn metadata(mut self, metadata: Value) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn build(self) -> AuditLogEntry {
        AuditLogEntry {
            id: Uuid::new_v4(),
            event_type: self.event_type,
            actor_user_id: self.actor_user_id,
            session_id: self.session_id,
            org_id: self.org_id,
            target_type: self.target_type,
            target_id: self.target_id,
            ip_address: self.ip_address,
            user_agent: self.user_agent,
            metadata: self.metadata,
            created_at: Utc::now(),
        }
    }
}

/// Query options for audit logs
#[derive(Debug, Clone, Default)]
pub struct AuditLogQuery {
    pub org_id: Option<Uuid>,
    pub actor_user_id: Option<Uuid>,
    /// S-23: Filter by session ID for forensic correlation
    pub session_id: Option<Uuid>,
    pub event_type: Option<AuditEventType>,
    /// Filter by target type (e.g., "user", "org", "session")
    pub target_type: Option<String>,
    /// Filter by target ID (entity being acted upon)
    pub target_id: Option<Uuid>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

/// Audit log repository trait
#[async_trait]
pub trait AuditLogRepository: Send + Sync {
    /// Create a new audit log entry
    async fn create(&self, entry: AuditLogEntry) -> Result<AuditLogEntry, AppError>;

    /// Find audit log entry by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<AuditLogEntry>, AppError>;

    /// Query audit logs with filters
    async fn query(&self, query: AuditLogQuery) -> Result<Vec<AuditLogEntry>, AppError>;

    /// Count audit logs matching query
    async fn count(&self, query: AuditLogQuery) -> Result<u64, AppError>;

    /// P-02: Query audit logs and count in a single operation
    /// Returns (logs, total_count) to avoid double database roundtrip
    async fn query_with_count(
        &self,
        query: AuditLogQuery,
    ) -> Result<(Vec<AuditLogEntry>, u64), AppError>;

    /// Delete audit logs older than a given date
    async fn delete_older_than(&self, date: DateTime<Utc>) -> Result<u64, AppError>;

    /// Delete audit logs for an organization
    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError>;
}

/// In-memory audit log repository for development/testing
pub struct InMemoryAuditLogRepository {
    entries: RwLock<HashMap<Uuid, AuditLogEntry>>,
}

impl InMemoryAuditLogRepository {
    pub fn new() -> Self {
        Self {
            entries: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryAuditLogRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl AuditLogRepository for InMemoryAuditLogRepository {
    async fn create(&self, entry: AuditLogEntry) -> Result<AuditLogEntry, AppError> {
        let mut entries = self.entries.write().await;
        entries.insert(entry.id, entry.clone());
        Ok(entry)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<AuditLogEntry>, AppError> {
        let entries = self.entries.read().await;
        Ok(entries.get(&id).cloned())
    }

    async fn query(&self, query: AuditLogQuery) -> Result<Vec<AuditLogEntry>, AppError> {
        let entries = self.entries.read().await;

        let mut results: Vec<_> = entries
            .values()
            .filter(|e| {
                if let Some(org_id) = query.org_id {
                    if e.org_id != Some(org_id) {
                        return false;
                    }
                }
                if let Some(actor_id) = query.actor_user_id {
                    if e.actor_user_id != Some(actor_id) {
                        return false;
                    }
                }
                if let Some(event_type) = query.event_type {
                    if e.event_type != event_type {
                        return false;
                    }
                }
                if let Some(ref target_type) = query.target_type {
                    if e.target_type.as_ref() != Some(target_type) {
                        return false;
                    }
                }
                if let Some(target_id) = query.target_id {
                    if e.target_id != Some(target_id) {
                        return false;
                    }
                }
                // S-23: Filter by session_id
                if let Some(session_id) = query.session_id {
                    if e.session_id != Some(session_id) {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        // Sort by created_at descending
        results.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        // Apply pagination
        let offset = query.offset.unwrap_or(0) as usize;
        let limit = query.limit.unwrap_or(100) as usize;

        Ok(results.into_iter().skip(offset).take(limit).collect())
    }

    async fn count(&self, query: AuditLogQuery) -> Result<u64, AppError> {
        let entries = self.entries.read().await;

        let count = entries
            .values()
            .filter(|e| {
                if let Some(org_id) = query.org_id {
                    if e.org_id != Some(org_id) {
                        return false;
                    }
                }
                if let Some(actor_id) = query.actor_user_id {
                    if e.actor_user_id != Some(actor_id) {
                        return false;
                    }
                }
                if let Some(event_type) = query.event_type {
                    if e.event_type != event_type {
                        return false;
                    }
                }
                if let Some(ref target_type) = query.target_type {
                    if e.target_type.as_ref() != Some(target_type) {
                        return false;
                    }
                }
                if let Some(target_id) = query.target_id {
                    if e.target_id != Some(target_id) {
                        return false;
                    }
                }
                // S-23: Filter by session_id
                if let Some(session_id) = query.session_id {
                    if e.session_id != Some(session_id) {
                        return false;
                    }
                }
                true
            })
            .count();

        Ok(count as u64)
    }

    async fn query_with_count(
        &self,
        query: AuditLogQuery,
    ) -> Result<(Vec<AuditLogEntry>, u64), AppError> {
        // P-02: For in-memory, we can efficiently do both in one pass
        let entries = self.entries.read().await;

        let mut filtered: Vec<_> = entries
            .values()
            .filter(|e| {
                if let Some(org_id) = query.org_id {
                    if e.org_id != Some(org_id) {
                        return false;
                    }
                }
                if let Some(actor_id) = query.actor_user_id {
                    if e.actor_user_id != Some(actor_id) {
                        return false;
                    }
                }
                if let Some(event_type) = query.event_type {
                    if e.event_type != event_type {
                        return false;
                    }
                }
                if let Some(ref target_type) = query.target_type {
                    if e.target_type.as_ref() != Some(target_type) {
                        return false;
                    }
                }
                if let Some(target_id) = query.target_id {
                    if e.target_id != Some(target_id) {
                        return false;
                    }
                }
                if let Some(session_id) = query.session_id {
                    if e.session_id != Some(session_id) {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        // Total count before pagination
        let total = filtered.len() as u64;

        // Sort by created_at descending
        filtered.sort_by(|a, b| b.created_at.cmp(&a.created_at));

        // Apply pagination
        let offset = query.offset.unwrap_or(0) as usize;
        let limit = query.limit.unwrap_or(100) as usize;
        let results: Vec<_> = filtered.into_iter().skip(offset).take(limit).collect();

        Ok((results, total))
    }

    async fn delete_older_than(&self, date: DateTime<Utc>) -> Result<u64, AppError> {
        let mut entries = self.entries.write().await;

        let ids_to_remove: Vec<Uuid> = entries
            .values()
            .filter(|e| e.created_at < date)
            .map(|e| e.id)
            .collect();

        let count = ids_to_remove.len() as u64;
        for id in ids_to_remove {
            entries.remove(&id);
        }

        Ok(count)
    }

    async fn delete_by_org(&self, org_id: Uuid) -> Result<u64, AppError> {
        let mut entries = self.entries.write().await;

        let before = entries.len();
        entries.retain(|_, entry| entry.org_id != Some(org_id));
        Ok((before - entries.len()) as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_audit_log() {
        let repo = InMemoryAuditLogRepository::new();
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let entry = AuditLogBuilder::new(AuditEventType::UserLogin)
            .actor(user_id)
            .org(org_id)
            .ip("127.0.0.1")
            .build();

        let created = repo.create(entry).await.unwrap();
        assert_eq!(created.event_type, AuditEventType::UserLogin);
        assert_eq!(created.actor_user_id, Some(user_id));
    }

    #[tokio::test]
    async fn test_query_by_org() {
        let repo = InMemoryAuditLogRepository::new();
        let org_id = Uuid::new_v4();
        let other_org_id = Uuid::new_v4();

        let entry1 = AuditLogBuilder::new(AuditEventType::UserLogin)
            .org(org_id)
            .build();
        let entry2 = AuditLogBuilder::new(AuditEventType::UserLogout)
            .org(org_id)
            .build();
        let entry3 = AuditLogBuilder::new(AuditEventType::UserLogin)
            .org(other_org_id)
            .build();

        repo.create(entry1).await.unwrap();
        repo.create(entry2).await.unwrap();
        repo.create(entry3).await.unwrap();

        let results = repo
            .query(AuditLogQuery {
                org_id: Some(org_id),
                ..Default::default()
            })
            .await
            .unwrap();

        assert_eq!(results.len(), 2);
    }

    #[tokio::test]
    async fn test_query_pagination() {
        let repo = InMemoryAuditLogRepository::new();
        let org_id = Uuid::new_v4();

        for _ in 0..10 {
            let entry = AuditLogBuilder::new(AuditEventType::UserLogin)
                .org(org_id)
                .build();
            repo.create(entry).await.unwrap();
        }

        let results = repo
            .query(AuditLogQuery {
                org_id: Some(org_id),
                limit: Some(5),
                offset: Some(2),
                ..Default::default()
            })
            .await
            .unwrap();

        assert_eq!(results.len(), 5);
    }

    #[tokio::test]
    async fn test_count_ignores_pagination() {
        let repo = InMemoryAuditLogRepository::new();
        let org_id = Uuid::new_v4();
        let other_org_id = Uuid::new_v4();

        for _ in 0..3 {
            let entry = AuditLogBuilder::new(AuditEventType::UserLogin)
                .org(org_id)
                .build();
            repo.create(entry).await.unwrap();
        }
        let other_entry = AuditLogBuilder::new(AuditEventType::UserLogout)
            .org(other_org_id)
            .build();
        repo.create(other_entry).await.unwrap();

        let count = repo
            .count(AuditLogQuery {
                org_id: Some(org_id),
                limit: Some(1),
                offset: Some(1),
                ..Default::default()
            })
            .await
            .unwrap();

        assert_eq!(count, 3);
    }

    #[tokio::test]
    async fn test_audit_event_type_serialization() {
        let event = AuditEventType::UserLogin;
        assert_eq!(event.as_str(), "user.login");
        assert_eq!(
            AuditEventType::from_str("user.login"),
            Some(AuditEventType::UserLogin)
        );
    }

    #[tokio::test]
    async fn test_audit_log_builder() {
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();
        let target_id = Uuid::new_v4();

        let entry = AuditLogBuilder::new(AuditEventType::MemberRoleChanged)
            .actor(user_id)
            .org(org_id)
            .target("membership", target_id)
            .ip("192.168.1.1")
            .user_agent("Mozilla/5.0")
            .metadata(serde_json::json!({"old_role": "member", "new_role": "admin"}))
            .build();

        assert_eq!(entry.event_type, AuditEventType::MemberRoleChanged);
        assert_eq!(entry.actor_user_id, Some(user_id));
        assert_eq!(entry.org_id, Some(org_id));
        assert_eq!(entry.target_type, Some("membership".to_string()));
        assert_eq!(entry.target_id, Some(target_id));
        assert_eq!(entry.ip_address, Some("192.168.1.1".to_string()));
    }

    #[tokio::test]
    async fn test_query_by_target() {
        let repo = InMemoryAuditLogRepository::new();
        let user_id = Uuid::new_v4();
        let target_user_id = Uuid::new_v4();
        let other_target_id = Uuid::new_v4();

        // Entry targeting a specific user
        let entry1 = AuditLogBuilder::new(AuditEventType::MemberRoleChanged)
            .actor(user_id)
            .target("user", target_user_id)
            .build();
        // Entry targeting a different entity
        let entry2 = AuditLogBuilder::new(AuditEventType::MemberRoleChanged)
            .actor(user_id)
            .target("org", other_target_id)
            .build();
        // Entry targeting same user
        let entry3 = AuditLogBuilder::new(AuditEventType::UserLogin)
            .actor(target_user_id)
            .target("user", target_user_id)
            .build();

        repo.create(entry1).await.unwrap();
        repo.create(entry2).await.unwrap();
        repo.create(entry3).await.unwrap();

        // Query by target_type only
        let results = repo
            .query(AuditLogQuery {
                target_type: Some("user".to_string()),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(results.len(), 2);

        // Query by target_id only
        let results = repo
            .query(AuditLogQuery {
                target_id: Some(target_user_id),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(results.len(), 2);

        // Query by both target_type and target_id
        let results = repo
            .query(AuditLogQuery {
                target_type: Some("user".to_string()),
                target_id: Some(target_user_id),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(results.len(), 2);

        // Verify count also works with target filters
        let count = repo
            .count(AuditLogQuery {
                target_type: Some("org".to_string()),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(count, 1);
    }

    /// S-23: Test session_id filtering for forensic correlation
    #[tokio::test]
    async fn test_query_by_session_id() {
        let repo = InMemoryAuditLogRepository::new();
        let user_id = Uuid::new_v4();
        let session_id_1 = Uuid::new_v4();
        let session_id_2 = Uuid::new_v4();

        // Create entries in session 1
        let entry1 = AuditLogBuilder::new(AuditEventType::UserLogin)
            .actor(user_id)
            .session(session_id_1)
            .build();
        let entry2 = AuditLogBuilder::new(AuditEventType::MfaEnabled)
            .actor(user_id)
            .session(session_id_1)
            .build();

        // Create entry in session 2
        let entry3 = AuditLogBuilder::new(AuditEventType::UserLogout)
            .actor(user_id)
            .session(session_id_2)
            .build();

        // Create entry with no session
        let entry4 = AuditLogBuilder::new(AuditEventType::UserRegister)
            .actor(user_id)
            .build();

        repo.create(entry1).await.unwrap();
        repo.create(entry2).await.unwrap();
        repo.create(entry3).await.unwrap();
        repo.create(entry4).await.unwrap();

        // Query by session_id_1 should return 2 entries
        let results = repo
            .query(AuditLogQuery {
                session_id: Some(session_id_1),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(results.len(), 2);
        assert!(results.iter().all(|e| e.session_id == Some(session_id_1)));

        // Query by session_id_2 should return 1 entry
        let results = repo
            .query(AuditLogQuery {
                session_id: Some(session_id_2),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].event_type, AuditEventType::UserLogout);

        // Count should also work with session_id filter
        let count = repo
            .count(AuditLogQuery {
                session_id: Some(session_id_1),
                ..Default::default()
            })
            .await
            .unwrap();
        assert_eq!(count, 2);
    }
}
