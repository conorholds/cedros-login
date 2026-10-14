use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

/// Status of an outbox event
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutboxStatus {
    Pending,
    Processing,
    Done,
    Failed,
}

impl OutboxStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Processing => "processing",
            Self::Done => "done",
            Self::Failed => "failed",
        }
    }
}

/// Type of outbox event
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OutboxEventType {
    // Email events
    EmailVerification,
    EmailPasswordReset,
    EmailInvite,
    EmailInstantLink,
    EmailSecurityAlert,
    EmailAccountDeletion,
    // Admin notification events
    NotifyLoginThreshold,
    NotifyTokenReuse,
    NotifyRoleChange,
    NotifyOwnerTransfer,
    NotifyAdminAction,
}

impl OutboxEventType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::EmailVerification => "email.verification",
            Self::EmailPasswordReset => "email.password_reset",
            Self::EmailInvite => "email.invite",
            Self::EmailInstantLink => "email.instant_link",
            Self::EmailSecurityAlert => "email.security_alert",
            Self::EmailAccountDeletion => "email.account_deletion",
            Self::NotifyLoginThreshold => "notify.login_threshold",
            Self::NotifyTokenReuse => "notify.token_reuse",
            Self::NotifyRoleChange => "notify.role_change",
            Self::NotifyOwnerTransfer => "notify.owner_transfer",
            Self::NotifyAdminAction => "notify.admin_action",
        }
    }

    pub fn is_email(&self) -> bool {
        matches!(
            self,
            Self::EmailVerification
                | Self::EmailPasswordReset
                | Self::EmailInvite
                | Self::EmailInstantLink
                | Self::EmailSecurityAlert
                | Self::EmailAccountDeletion
        )
    }

    pub fn is_notification(&self) -> bool {
        matches!(
            self,
            Self::NotifyLoginThreshold
                | Self::NotifyTokenReuse
                | Self::NotifyRoleChange
                | Self::NotifyOwnerTransfer
                | Self::NotifyAdminAction
        )
    }
}

/// Outbox event entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutboxEvent {
    pub id: Uuid,
    pub event_type: OutboxEventType,
    pub payload: Value,
    pub status: OutboxStatus,
    pub attempts: u32,
    pub max_attempts: u32,
    pub next_attempt_at: DateTime<Utc>,
    pub locked_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    /// Timestamp when the message was actually delivered (email sent, notification pushed).
    /// Set only after the provider response is acknowledged in local storage.
    pub delivered_at: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
    pub correlation_id: Option<String>,
    pub org_id: Option<Uuid>,
    pub user_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

impl OutboxEvent {
    pub fn new(event_type: OutboxEventType, payload: Value) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            event_type,
            payload,
            status: OutboxStatus::Pending,
            attempts: 0,
            max_attempts: 10,
            next_attempt_at: now,
            locked_at: None,
            completed_at: None,
            delivered_at: None,
            last_error: None,
            correlation_id: None,
            org_id: None,
            user_id: None,
            created_at: now,
        }
    }

    pub fn with_correlation_id(mut self, id: &str) -> Self {
        self.correlation_id = Some(id.to_string());
        self
    }

    pub fn with_org_id(mut self, org_id: Uuid) -> Self {
        self.org_id = Some(org_id);
        self
    }

    pub fn with_user_id(mut self, user_id: Uuid) -> Self {
        self.user_id = Some(user_id);
        self
    }

    /// Calculate next retry delay using exponential backoff
    pub fn calculate_next_attempt(&self) -> DateTime<Utc> {
        // Backoff: 30s, 2m, 10m, 30m, 1h, 2h, 4h, 8h, 16h, 24h
        let attempt_index = self.attempts.saturating_sub(1);
        let delay_secs = match attempt_index {
            0 => 30,
            1 => 120,
            2 => 600,
            3 => 1800,
            4 => 3600,
            5 => 7200,
            6 => 14400,
            7 => 28800,
            8 => 57600,
            _ => 86400,
        };
        Utc::now() + Duration::seconds(delay_secs)
    }
}
