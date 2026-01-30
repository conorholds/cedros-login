//! Audit service for logging events

use axum::http::HeaderMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories::{AuditEventType, AuditLogBuilder, AuditLogEntry, AuditLogRepository};
use crate::utils::extract_client_ip;

/// Service for audit logging
pub struct AuditService {
    repo: Arc<dyn AuditLogRepository>,
    trust_proxy: bool,
}

impl AuditService {
    pub fn new(repo: Arc<dyn AuditLogRepository>, trust_proxy: bool) -> Self {
        Self { repo, trust_proxy }
    }

    /// Log an event with full details
    pub async fn log(&self, entry: AuditLogEntry) -> Result<(), AppError> {
        self.repo.create(entry).await?;
        Ok(())
    }

    /// M-01: Fire-and-forget log helper that logs warnings on failure.
    /// Use when audit logging failures should not block the main operation.
    pub async fn log_or_warn(&self, entry: AuditLogEntry) {
        if let Err(e) = self.repo.create(entry).await {
            tracing::warn!(error = %e, "Audit log write failed (non-fatal)");
        }
    }

    /// Log a user event
    pub async fn log_user_event(
        &self,
        event_type: AuditEventType,
        user_id: Uuid,
        headers: Option<&HeaderMap>,
    ) -> Result<(), AppError> {
        let entry = self.build_user_event(event_type, user_id, headers);
        self.log(entry).await
    }

    /// M-01: Fire-and-forget user event logger with warning on failure.
    pub async fn log_user_event_or_warn(
        &self,
        event_type: AuditEventType,
        user_id: Uuid,
        headers: Option<&HeaderMap>,
    ) {
        let entry = self.build_user_event(event_type, user_id, headers);
        self.log_or_warn(entry).await;
    }

    fn build_user_event(
        &self,
        event_type: AuditEventType,
        user_id: Uuid,
        headers: Option<&HeaderMap>,
    ) -> AuditLogEntry {
        let (ip, ua) = extract_request_info(headers, self.trust_proxy);
        let mut builder = AuditLogBuilder::new(event_type).actor(user_id);
        if let Some(ip) = ip {
            builder = builder.ip(&ip);
        }
        if let Some(ua) = ua {
            builder = builder.user_agent(&ua);
        }
        builder.build()
    }

    /// Log an organization event
    pub async fn log_org_event(
        &self,
        event_type: AuditEventType,
        actor_id: Uuid,
        org_id: Uuid,
        headers: Option<&HeaderMap>,
    ) -> Result<(), AppError> {
        let (ip, ua) = extract_request_info(headers, self.trust_proxy);
        let mut builder = AuditLogBuilder::new(event_type)
            .actor(actor_id)
            .org(org_id)
            .target("organization", org_id);
        if let Some(ip) = ip {
            builder = builder.ip(&ip);
        }
        if let Some(ua) = ua {
            builder = builder.user_agent(&ua);
        }
        self.log(builder.build()).await
    }

    /// Log a membership event
    pub async fn log_member_event(
        &self,
        event_type: AuditEventType,
        actor_id: Uuid,
        org_id: Uuid,
        target_user_id: Uuid,
        metadata: Option<serde_json::Value>,
        headers: Option<&HeaderMap>,
    ) -> Result<(), AppError> {
        let (ip, ua) = extract_request_info(headers, self.trust_proxy);
        let mut builder = AuditLogBuilder::new(event_type)
            .actor(actor_id)
            .org(org_id)
            .target("user", target_user_id);
        if let Some(ip) = ip {
            builder = builder.ip(&ip);
        }
        if let Some(ua) = ua {
            builder = builder.user_agent(&ua);
        }
        if let Some(meta) = metadata {
            builder = builder.metadata(meta);
        }
        self.log(builder.build()).await
    }

    /// Log an invite event
    pub async fn log_invite_event(
        &self,
        event_type: AuditEventType,
        actor_id: Uuid,
        org_id: Uuid,
        invite_id: Uuid,
        metadata: Option<serde_json::Value>,
        headers: Option<&HeaderMap>,
    ) -> Result<(), AppError> {
        let (ip, ua) = extract_request_info(headers, self.trust_proxy);
        let mut builder = AuditLogBuilder::new(event_type)
            .actor(actor_id)
            .org(org_id)
            .target("invite", invite_id);
        if let Some(ip) = ip {
            builder = builder.ip(&ip);
        }
        if let Some(ua) = ua {
            builder = builder.user_agent(&ua);
        }
        if let Some(meta) = metadata {
            builder = builder.metadata(meta);
        }
        self.log(builder.build()).await
    }

    /// Log a session event
    pub async fn log_session_event(
        &self,
        event_type: AuditEventType,
        user_id: Uuid,
        session_id: Option<Uuid>,
        metadata: Option<serde_json::Value>,
        headers: Option<&HeaderMap>,
    ) -> Result<(), AppError> {
        let (ip, ua) = extract_request_info(headers, self.trust_proxy);
        let mut builder = AuditLogBuilder::new(event_type).actor(user_id);
        if let Some(sid) = session_id {
            builder = builder.target("session", sid);
        }
        if let Some(ip) = ip {
            builder = builder.ip(&ip);
        }
        if let Some(ua) = ua {
            builder = builder.user_agent(&ua);
        }
        if let Some(meta) = metadata {
            builder = builder.metadata(meta);
        }
        self.log(builder.build()).await
    }

    /// Log a password event
    pub async fn log_password_event(
        &self,
        event_type: AuditEventType,
        user_id: Uuid,
        headers: Option<&HeaderMap>,
    ) -> Result<(), AppError> {
        let (ip, ua) = extract_request_info(headers, self.trust_proxy);
        let mut builder = AuditLogBuilder::new(event_type)
            .actor(user_id)
            .target("user", user_id);
        if let Some(ip) = ip {
            builder = builder.ip(&ip);
        }
        if let Some(ua) = ua {
            builder = builder.user_agent(&ua);
        }
        self.log(builder.build()).await
    }
}

/// Extract IP address and User-Agent from request headers
fn extract_request_info(
    headers: Option<&HeaderMap>,
    trust_proxy: bool,
) -> (Option<String>, Option<String>) {
    let headers = match headers {
        Some(h) => h,
        None => return (None, None),
    };

    let ip = extract_client_ip(headers, trust_proxy).or_else(|| {
        if !trust_proxy {
            return None;
        }

        headers.get("x-real-ip").and_then(|v| {
            let ip_str = v.to_str().ok()?.trim();
            // S-07: Return parsed IP's canonical form for consistent storage
            let parsed = ip_str.parse::<std::net::IpAddr>().ok()?;
            Some(parsed.to_string())
        })
    });

    let user_agent = headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    (ip, user_agent)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::InMemoryAuditLogRepository;
    use axum::http::HeaderValue;

    #[tokio::test]
    async fn test_log_user_event() {
        let repo = Arc::new(InMemoryAuditLogRepository::new());
        let service = AuditService::new(repo.clone(), false);

        let user_id = Uuid::new_v4();
        service
            .log_user_event(AuditEventType::UserLogin, user_id, None)
            .await
            .unwrap();

        let query = crate::repositories::AuditLogQuery {
            actor_user_id: Some(user_id),
            ..Default::default()
        };
        let entries = repo.query(query).await.unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].event_type, AuditEventType::UserLogin);
    }

    #[tokio::test]
    async fn test_log_org_event() {
        let repo = Arc::new(InMemoryAuditLogRepository::new());
        let service = AuditService::new(repo.clone(), false);

        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();
        service
            .log_org_event(AuditEventType::OrgCreated, user_id, org_id, None)
            .await
            .unwrap();

        let query = crate::repositories::AuditLogQuery {
            org_id: Some(org_id),
            ..Default::default()
        };
        let entries = repo.query(query).await.unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].event_type, AuditEventType::OrgCreated);
        assert_eq!(entries[0].org_id, Some(org_id));
    }

    #[tokio::test]
    async fn test_log_user_event_respects_trust_proxy() {
        let repo = Arc::new(InMemoryAuditLogRepository::new());
        let service = AuditService::new(repo.clone(), false);
        let user_id = Uuid::new_v4();

        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("192.168.1.1"));
        headers.insert("user-agent", HeaderValue::from_static("test-agent"));

        service
            .log_user_event(AuditEventType::UserLogin, user_id, Some(&headers))
            .await
            .unwrap();

        let entries = repo
            .query(crate::repositories::AuditLogQuery {
                actor_user_id: Some(user_id),
                ..Default::default()
            })
            .await
            .unwrap();

        assert_eq!(entries[0].ip_address, None);
        assert_eq!(entries[0].user_agent.as_deref(), Some("test-agent"));
    }

    #[tokio::test]
    async fn test_log_user_event_records_proxy_ip_when_trusted() {
        let repo = Arc::new(InMemoryAuditLogRepository::new());
        let service = AuditService::new(repo.clone(), true);
        let user_id = Uuid::new_v4();

        let mut headers = HeaderMap::new();
        headers.insert("x-forwarded-for", HeaderValue::from_static("192.168.1.1"));

        service
            .log_user_event(AuditEventType::UserLogin, user_id, Some(&headers))
            .await
            .unwrap();

        let entries = repo
            .query(crate::repositories::AuditLogQuery {
                actor_user_id: Some(user_id),
                ..Default::default()
            })
            .await
            .unwrap();

        assert_eq!(entries[0].ip_address.as_deref(), Some("192.168.1.1"));
    }
}
