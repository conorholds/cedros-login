//! Communications service - unified interface for queueing emails and notifications

use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{OutboxEvent, OutboxEventType, OutboxRepository};
use crate::services::NotificationSeverity;
use crate::utils::TokenCipher;

/// Service for queueing communications (emails and notifications)
pub struct CommsService {
    outbox_repo: Arc<dyn OutboxRepository>,
    base_url: String,
    token_cipher: TokenCipher,
}

impl CommsService {
    pub fn new(
        outbox_repo: Arc<dyn OutboxRepository>,
        base_url: String,
        token_cipher: TokenCipher,
    ) -> Self {
        Self {
            outbox_repo,
            base_url,
            token_cipher,
        }
    }

    // ==================== Email Methods ====================

    /// Queue a verification email
    pub async fn queue_verification_email(
        &self,
        to: &str,
        user_name: Option<&str>,
        token: &str,
        user_id: Option<Uuid>,
    ) -> Result<Uuid, AppError> {
        let token_enc = self.token_cipher.encrypt(token)?;

        let event = OutboxEvent::new(
            OutboxEventType::EmailVerification,
            serde_json::json!({
                "to": to,
                "user_name": user_name,
                "token_enc": token_enc,
                "expires_in_hours": 24
            }),
        );

        let event = if let Some(uid) = user_id {
            event.with_user_id(uid)
        } else {
            event
        };

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a password reset email
    pub async fn queue_password_reset_email(
        &self,
        to: &str,
        user_name: Option<&str>,
        token: &str,
        user_id: Option<Uuid>,
    ) -> Result<Uuid, AppError> {
        let token_enc = self.token_cipher.encrypt(token)?;

        let event = OutboxEvent::new(
            OutboxEventType::EmailPasswordReset,
            serde_json::json!({
                "to": to,
                "user_name": user_name,
                "token_enc": token_enc,
                "expires_in_minutes": 60
            }),
        );

        let event = if let Some(uid) = user_id {
            event.with_user_id(uid)
        } else {
            event
        };

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue an organization invite email
    #[allow(clippy::too_many_arguments)]
    pub async fn queue_invite_email(
        &self,
        to: &str,
        org_name: &str,
        inviter_name: Option<&str>,
        role: &str,
        token: &str,
        org_id: Uuid,
        invited_by: Uuid,
    ) -> Result<Uuid, AppError> {
        let token_enc = self.token_cipher.encrypt(token)?;

        let event = OutboxEvent::new(
            OutboxEventType::EmailInvite,
            serde_json::json!({
                "to": to,
                "org_name": org_name,
                "inviter_name": inviter_name,
                "role": role,
                "token_enc": token_enc,
                "expires_in_days": 7
            }),
        )
        .with_org_id(org_id)
        .with_user_id(invited_by);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue an instant link email
    pub async fn queue_instant_link_email(
        &self,
        to: &str,
        user_name: Option<&str>,
        token: &str,
        user_id: Option<Uuid>,
    ) -> Result<Uuid, AppError> {
        let token_enc = self.token_cipher.encrypt(token)?;

        let event = OutboxEvent::new(
            OutboxEventType::EmailInstantLink,
            serde_json::json!({
                "to": to,
                "user_name": user_name,
                "token_enc": token_enc,
                "expires_in_minutes": 15
            }),
        );

        let event = if let Some(uid) = user_id {
            event.with_user_id(uid)
        } else {
            event
        };

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a security alert email (new device login)
    #[allow(clippy::too_many_arguments)]
    pub async fn queue_security_alert_email(
        &self,
        to: &str,
        user_name: Option<&str>,
        user_id: Uuid,
        login_time: &str,
        ip_address: Option<&str>,
        device: Option<&str>,
        browser: Option<&str>,
    ) -> Result<Uuid, AppError> {
        let action_url = format!("{}/account/security", self.base_url);

        let event = OutboxEvent::new(
            OutboxEventType::EmailSecurityAlert,
            serde_json::json!({
                "to": to,
                "user_name": user_name,
                "login_time": login_time,
                "ip_address": ip_address,
                "device": device,
                "browser": browser,
                "action_url": action_url
            }),
        )
        .with_user_id(user_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    // ==================== Admin Notification Methods ====================

    /// Queue a notification for failed login threshold
    pub async fn notify_login_threshold(
        &self,
        email: &str,
        failed_count: u32,
        ip_address: Option<&str>,
    ) -> Result<Uuid, AppError> {
        let event = OutboxEvent::new(
            OutboxEventType::NotifyLoginThreshold,
            serde_json::json!({
                "severity": "warn",
                "title": "Failed Login Threshold Reached",
                "body": format!("{} failed login attempts for {}", failed_count, email),
                "metadata": {
                    "email": email,
                    "failed_count": failed_count,
                    "ip_address": ip_address
                }
            }),
        );

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification for refresh token reuse (critical security event)
    pub async fn notify_token_reuse(
        &self,
        user_id: Uuid,
        ip_address: Option<&str>,
        user_agent: Option<&str>,
    ) -> Result<Uuid, AppError> {
        let event = OutboxEvent::new(
            OutboxEventType::NotifyTokenReuse,
            serde_json::json!({
                "severity": "critical",
                "title": "Refresh Token Reuse Detected",
                "body": "A previously used refresh token was presented. This may indicate token theft.",
                "metadata": {
                    "user_id": user_id.to_string(),
                    "ip_address": ip_address,
                    "user_agent_hash": user_agent.map(|ua| {
                        use std::collections::hash_map::DefaultHasher;
                        use std::hash::{Hash, Hasher};
                        let mut hasher = DefaultHasher::new();
                        ua.hash(&mut hasher);
                        format!("{:x}", hasher.finish())
                    })
                }
            }),
        )
        .with_user_id(user_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification for role change
    pub async fn notify_role_change(
        &self,
        org_id: Uuid,
        org_slug: &str,
        target_user_id: Uuid,
        actor_user_id: Uuid,
        old_role: &str,
        new_role: &str,
    ) -> Result<Uuid, AppError> {
        let event = OutboxEvent::new(
            OutboxEventType::NotifyRoleChange,
            serde_json::json!({
                "severity": "warn",
                "title": "Member Role Changed",
                "body": format!("Role changed from {} to {}", old_role, new_role),
                "org_slug": org_slug,
                "metadata": {
                    "target_user_id": target_user_id.to_string(),
                    "actor_user_id": actor_user_id.to_string(),
                    "old_role": old_role,
                    "new_role": new_role
                }
            }),
        )
        .with_org_id(org_id)
        .with_user_id(actor_user_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification for owner transfer (critical)
    pub async fn notify_owner_transfer(
        &self,
        org_id: Uuid,
        org_slug: &str,
        old_owner_id: Uuid,
        new_owner_id: Uuid,
    ) -> Result<Uuid, AppError> {
        let event = OutboxEvent::new(
            OutboxEventType::NotifyOwnerTransfer,
            serde_json::json!({
                "severity": "critical",
                "title": "Organization Owner Transferred",
                "body": format!("Ownership of {} has been transferred", org_slug),
                "org_slug": org_slug,
                "metadata": {
                    "old_owner_id": old_owner_id.to_string(),
                    "new_owner_id": new_owner_id.to_string()
                }
            }),
        )
        .with_org_id(org_id)
        .with_user_id(old_owner_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification for system admin action
    pub async fn notify_admin_action(
        &self,
        admin_user_id: Uuid,
        action: &str,
        target_type: &str,
        target_id: Option<&str>,
        ip_address: Option<&str>,
    ) -> Result<Uuid, AppError> {
        let event = OutboxEvent::new(
            OutboxEventType::NotifyAdminAction,
            serde_json::json!({
                "severity": "info",
                "title": "System Admin Action",
                "body": format!("Admin performed: {}", action),
                "metadata": {
                    "admin_user_id": admin_user_id.to_string(),
                    "action": action,
                    "target_type": target_type,
                    "target_id": target_id,
                    "ip_address": ip_address
                }
            }),
        )
        .with_user_id(admin_user_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a generic admin notification
    pub async fn notify(
        &self,
        severity: NotificationSeverity,
        title: &str,
        body: &str,
        org_id: Option<Uuid>,
        metadata: Option<serde_json::Value>,
    ) -> Result<Uuid, AppError> {
        let severity_str = match severity {
            NotificationSeverity::Info => "info",
            NotificationSeverity::Warn => "warn",
            NotificationSeverity::Critical => "critical",
        };

        let mut payload = serde_json::json!({
            "severity": severity_str,
            "title": title,
            "body": body
        });

        if let Some(meta) = metadata {
            payload["metadata"] = meta;
        }

        let event = OutboxEvent::new(OutboxEventType::NotifyAdminAction, payload);

        let event = if let Some(oid) = org_id {
            event.with_org_id(oid)
        } else {
            event
        };

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    // ==================== Credit Event Methods ====================

    /// Queue a notification when user's balance drops below threshold
    ///
    /// Useful for alerting admins when a user may need to add credits.
    pub async fn notify_credit_low_balance(
        &self,
        user_id: Uuid,
        balance_lamports: i64,
        threshold_lamports: i64,
        currency: &str,
    ) -> Result<Uuid, AppError> {
        let balance_sol = balance_lamports as f64 / 1_000_000_000.0;
        let threshold_sol = threshold_lamports as f64 / 1_000_000_000.0;

        let event = OutboxEvent::new(
            OutboxEventType::CreditLowBalance,
            serde_json::json!({
                "severity": "warn",
                "title": "Low Credit Balance",
                "body": format!(
                    "User balance ({:.4} {}) is below threshold ({:.4} {})",
                    balance_sol, currency, threshold_sol, currency
                ),
                "metadata": {
                    "user_id": user_id.to_string(),
                    "balance_lamports": balance_lamports,
                    "threshold_lamports": threshold_lamports,
                    "currency": currency
                }
            }),
        )
        .with_user_id(user_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification for a credit spend operation
    ///
    /// Records spend events for audit trails and optional webhooks.
    #[allow(clippy::too_many_arguments)]
    pub async fn notify_credit_spend(
        &self,
        user_id: Uuid,
        transaction_id: Uuid,
        amount_lamports: i64,
        new_balance_lamports: i64,
        currency: &str,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
    ) -> Result<Uuid, AppError> {
        let amount_sol = amount_lamports as f64 / 1_000_000_000.0;

        let event = OutboxEvent::new(
            OutboxEventType::CreditSpend,
            serde_json::json!({
                "severity": "info",
                "title": "Credits Spent",
                "body": format!("User spent {:.4} {}", amount_sol, currency),
                "metadata": {
                    "user_id": user_id.to_string(),
                    "transaction_id": transaction_id.to_string(),
                    "amount_lamports": amount_lamports,
                    "new_balance_lamports": new_balance_lamports,
                    "currency": currency,
                    "reference_type": reference_type,
                    "reference_id": reference_id.map(|id| id.to_string())
                }
            }),
        )
        .with_user_id(user_id)
        .with_correlation_id(&transaction_id.to_string());

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification when a credit hold expires
    ///
    /// Alerts admins when holds time out without being captured or released.
    pub async fn notify_credit_hold_expired(
        &self,
        hold_id: Uuid,
        user_id: Uuid,
        amount_lamports: i64,
        currency: &str,
        reference_type: Option<&str>,
        reference_id: Option<Uuid>,
    ) -> Result<Uuid, AppError> {
        let amount_sol = amount_lamports as f64 / 1_000_000_000.0;

        let event = OutboxEvent::new(
            OutboxEventType::CreditHoldExpired,
            serde_json::json!({
                "severity": "warn",
                "title": "Credit Hold Expired",
                "body": format!("Hold of {:.4} {} expired without capture", amount_sol, currency),
                "metadata": {
                    "hold_id": hold_id.to_string(),
                    "user_id": user_id.to_string(),
                    "amount_lamports": amount_lamports,
                    "currency": currency,
                    "reference_type": reference_type,
                    "reference_id": reference_id.map(|id| id.to_string())
                }
            }),
        )
        .with_user_id(user_id)
        .with_correlation_id(&hold_id.to_string());

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }

    /// Queue a notification when a user requests a refund
    ///
    /// Creates an admin notification for review and processing.
    #[allow(clippy::too_many_arguments)]
    pub async fn notify_refund_requested(
        &self,
        user_id: Uuid,
        user_email: Option<&str>,
        amount_lamports: i64,
        currency: &str,
        transaction_id: Option<Uuid>,
        reason: &str,
    ) -> Result<Uuid, AppError> {
        let amount_sol = amount_lamports as f64 / 1_000_000_000.0;

        let event = OutboxEvent::new(
            OutboxEventType::CreditRefundRequested,
            serde_json::json!({
                "severity": "warn",
                "title": "Refund Request",
                "body": format!(
                    "User {} requested refund of {:.4} {}: {}",
                    user_email.unwrap_or("(unknown)"),
                    amount_sol,
                    currency,
                    reason
                ),
                "metadata": {
                    "user_id": user_id.to_string(),
                    "user_email": user_email,
                    "amount_lamports": amount_lamports,
                    "currency": currency,
                    "transaction_id": transaction_id.map(|id| id.to_string()),
                    "reason": reason
                }
            }),
        )
        .with_user_id(user_id);

        let created = self.outbox_repo.create(event).await?;
        Ok(created.id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::InMemoryOutboxRepository;

    #[tokio::test]
    async fn test_queue_verification_email() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let cipher = TokenCipher::new("test-secret");
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            cipher.clone(),
        );

        let event_id = service
            .queue_verification_email(
                "test@example.com",
                Some("Test User"),
                "abc123",
                Some(Uuid::new_v4()),
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::EmailVerification);
        let token_enc = event.payload["token_enc"].as_str().unwrap();
        assert_eq!(cipher.decrypt(token_enc).unwrap(), "abc123");
    }

    #[tokio::test]
    async fn test_queue_invite_email() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let org_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();

        let event_id = service
            .queue_invite_email(
                "invitee@example.com",
                "Acme Corp",
                Some("John Doe"),
                "member",
                "invite-token",
                org_id,
                user_id,
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::EmailInvite);
        assert_eq!(event.org_id, Some(org_id));
    }

    #[tokio::test]
    async fn test_notify_token_reuse() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let user_id = Uuid::new_v4();
        let event_id = service
            .notify_token_reuse(user_id, Some("192.168.1.1"), Some("Mozilla/5.0"))
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::NotifyTokenReuse);
        assert_eq!(event.payload["severity"].as_str(), Some("critical"));
    }

    #[tokio::test]
    async fn test_notify_role_change() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let org_id = Uuid::new_v4();
        let event_id = service
            .notify_role_change(
                org_id,
                "acme-corp",
                Uuid::new_v4(),
                Uuid::new_v4(),
                "member",
                "admin",
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::NotifyRoleChange);
        assert!(event.payload["body"]
            .as_str()
            .unwrap()
            .contains("member to admin"));
    }

    #[tokio::test]
    async fn test_queue_security_alert_email() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let user_id = Uuid::new_v4();
        let event_id = service
            .queue_security_alert_email(
                "user@example.com",
                Some("Test User"),
                user_id,
                "December 13, 2025 at 14:30 UTC",
                Some("192.168.1.1"),
                Some("Mac"),
                Some("Chrome"),
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::EmailSecurityAlert);
        assert_eq!(event.user_id, Some(user_id));
        assert_eq!(event.payload["to"].as_str(), Some("user@example.com"));
        assert_eq!(event.payload["user_name"].as_str(), Some("Test User"));
        assert_eq!(event.payload["device"].as_str(), Some("Mac"));
        assert_eq!(event.payload["browser"].as_str(), Some("Chrome"));
        assert_eq!(event.payload["ip_address"].as_str(), Some("192.168.1.1"));
        assert!(event.payload["action_url"]
            .as_str()
            .unwrap()
            .contains("/account/security"));
    }

    #[tokio::test]
    async fn test_queue_password_reset_email() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let cipher = TokenCipher::new("test-secret");
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            cipher.clone(),
        );

        let user_id = Uuid::new_v4();
        let event_id = service
            .queue_password_reset_email(
                "user@example.com",
                Some("Test User"),
                "reset-token-123",
                Some(user_id),
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::EmailPasswordReset);
        let token_enc = event.payload["token_enc"].as_str().unwrap();
        assert_eq!(cipher.decrypt(token_enc).unwrap(), "reset-token-123");
    }

    #[tokio::test]
    async fn test_queue_instant_link_email() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let cipher = TokenCipher::new("test-secret");
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            cipher.clone(),
        );

        let user_id = Uuid::new_v4();
        let event_id = service
            .queue_instant_link_email(
                "user@example.com",
                Some("Test User"),
                "instant-token-456",
                Some(user_id),
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::EmailInstantLink);
        let token_enc = event.payload["token_enc"].as_str().unwrap();
        assert_eq!(cipher.decrypt(token_enc).unwrap(), "instant-token-456");
    }

    #[tokio::test]
    async fn test_notify_credit_low_balance() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let user_id = Uuid::new_v4();
        let event_id = service
            .notify_credit_low_balance(user_id, 500_000_000, 1_000_000_000, "SOL")
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::CreditLowBalance);
        assert_eq!(event.payload["severity"].as_str(), Some("warn"));
        assert_eq!(event.user_id, Some(user_id));
        assert_eq!(
            event.payload["metadata"]["balance_lamports"].as_i64(),
            Some(500_000_000)
        );
    }

    #[tokio::test]
    async fn test_notify_credit_spend() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let user_id = Uuid::new_v4();
        let tx_id = Uuid::new_v4();
        let event_id = service
            .notify_credit_spend(
                user_id,
                tx_id,
                100_000_000,
                400_000_000,
                "SOL",
                Some("order"),
                Some(Uuid::new_v4()),
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::CreditSpend);
        assert_eq!(event.payload["severity"].as_str(), Some("info"));
        assert_eq!(event.user_id, Some(user_id));
        assert_eq!(event.correlation_id, Some(tx_id.to_string()));
        assert_eq!(
            event.payload["metadata"]["amount_lamports"].as_i64(),
            Some(100_000_000)
        );
    }

    #[tokio::test]
    async fn test_notify_credit_hold_expired() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let user_id = Uuid::new_v4();
        let hold_id = Uuid::new_v4();
        let event_id = service
            .notify_credit_hold_expired(hold_id, user_id, 250_000_000, "SOL", Some("order"), None)
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::CreditHoldExpired);
        assert_eq!(event.payload["severity"].as_str(), Some("warn"));
        assert_eq!(event.user_id, Some(user_id));
        assert_eq!(event.correlation_id, Some(hold_id.to_string()));
        assert!(event.payload["body"]
            .as_str()
            .unwrap()
            .contains("expired without capture"));
    }

    #[tokio::test]
    async fn test_notify_refund_requested() {
        let repo = Arc::new(InMemoryOutboxRepository::new());
        let service = CommsService::new(
            repo.clone(),
            "https://example.com".to_string(),
            TokenCipher::new("test-secret"),
        );

        let user_id = Uuid::new_v4();
        let tx_id = Uuid::new_v4();
        let event_id = service
            .notify_refund_requested(
                user_id,
                Some("user@example.com"),
                500_000_000,
                "SOL",
                Some(tx_id),
                "Service was not as expected",
            )
            .await
            .unwrap();

        let event = repo.find_by_id(event_id).await.unwrap().unwrap();
        assert_eq!(event.event_type, OutboxEventType::CreditRefundRequested);
        assert_eq!(event.payload["severity"].as_str(), Some("warn"));
        assert_eq!(event.user_id, Some(user_id));
        assert!(event.payload["body"]
            .as_str()
            .unwrap()
            .contains("user@example.com"));
        assert!(event.payload["body"].as_str().unwrap().contains("refund"));
        assert_eq!(
            event.payload["metadata"]["reason"].as_str(),
            Some("Service was not as expected")
        );
    }
}
