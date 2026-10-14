//! Type conversion utilities

use uuid::Uuid;

use crate::models::{
    AdminOrgResponse, AdminUserResponse, ApiKeyResponse, AuditLogQueryParams, AuditLogResponse,
    AuthUser, AuthUserEmail, InviteResponse, MemberResponse, OrgResponse, SessionResponse,
};
use crate::repositories::{
    ApiKeyEntity, AuditEventType, AuditLogEntry, AuditLogQuery, InviteEntity, MembershipEntity,
    OrgEntity, OrgRole, SessionEntity, UserEntity,
};

/// Convert a UserEntity from the repository to an AuthUser for API responses.
pub fn user_entity_to_auth_user(entity: &UserEntity) -> AuthUser {
    let emails = entity
        .email
        .as_ref()
        .map(|email| {
            vec![AuthUserEmail {
                email: email.clone(),
                verified: entity.email_verified,
                primary: true,
            }]
        })
        .unwrap_or_default();
    AuthUser {
        id: entity.id,
        email: entity.email.clone(),
        emails,
        name: entity.name.clone(),
        username: entity.username.clone(),
        picture: entity.picture.clone(),
        wallet_address: entity.wallet_address.clone(),
        auth_methods: entity.auth_methods.clone(),
        email_verified: entity.email_verified,
        created_at: entity.created_at,
        updated_at: entity.updated_at,
        welcome_completed_at: entity.welcome_completed_at,
        referral_code: Some(entity.referral_code.clone()),
    }
}

impl From<&UserEntity> for AdminUserResponse {
    fn from(entity: &UserEntity) -> Self {
        Self {
            id: entity.id,
            email: entity.email.clone(),
            email_verified: entity.email_verified,
            name: entity.name.clone(),
            username: entity.username.clone(),
            picture: entity.picture.clone(),
            wallet_address: entity.wallet_address.clone(),
            google_id: entity.google_id.clone(),
            auth_methods: entity.auth_methods.clone(),
            is_system_admin: entity.is_system_admin,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            last_login_at: entity.last_login_at,
            referral_code: Some(entity.referral_code.clone()),
            referred_by: entity.referred_by,
            referral_count: None,
        }
    }
}

impl From<&OrgEntity> for AdminOrgResponse {
    fn from(entity: &OrgEntity) -> Self {
        Self {
            id: entity.id,
            name: entity.name.clone(),
            slug: entity.slug.clone(),
            logo_url: entity.logo_url.clone(),
            is_personal: entity.is_personal,
            owner_id: entity.owner_id,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
}

impl From<&ApiKeyEntity> for ApiKeyResponse {
    fn from(entity: &ApiKeyEntity) -> Self {
        Self {
            id: entity.id,
            key_prefix: entity.key_prefix.clone(),
            label: entity.label.clone(),
            created_at: entity.created_at,
            last_used_at: entity.last_used_at,
        }
    }
}

impl From<&AuditLogEntry> for AuditLogResponse {
    fn from(entry: &AuditLogEntry) -> Self {
        Self {
            id: entry.id,
            event_type: entry.event_type.as_str().to_string(),
            actor_user_id: entry.actor_user_id,
            session_id: entry.session_id,
            org_id: entry.org_id,
            target_type: entry.target_type.clone(),
            target_id: entry.target_id,
            ip_address: entry.ip_address.clone(),
            user_agent: entry.user_agent.clone(),
            metadata: entry.metadata.clone(),
            created_at: entry.created_at,
        }
    }
}

impl AuditLogQueryParams {
    pub fn to_query(&self, org_id: Option<Uuid>) -> AuditLogQuery {
        AuditLogQuery {
            org_id,
            event_type: self
                .event_type
                .as_ref()
                .and_then(|event_type| AuditEventType::from_str(event_type)),
            actor_user_id: self.actor_user_id,
            session_id: self.session_id,
            target_type: self.target_type.clone(),
            target_id: self.target_id,
            limit: self.limit,
            offset: self.offset,
        }
    }
}

impl InviteResponse {
    /// Create from entity.
    pub fn from_entity(invite: &InviteEntity) -> Self {
        Self {
            id: invite.id,
            org_id: invite.org_id,
            email: invite.email.clone(),
            wallet_address: invite.wallet_address.clone(),
            role: invite.role.as_str().to_string(),
            invited_by: invite.invited_by,
            created_at: invite.created_at,
            expires_at: invite.expires_at,
            accepted_at: invite.accepted_at,
        }
    }
}

impl OrgResponse {
    /// Create from entity with role.
    pub fn from_entity(org: &OrgEntity, role: OrgRole) -> Self {
        Self {
            id: org.id,
            name: org.name.clone(),
            slug: org.slug.clone(),
            logo_url: org.logo_url.clone(),
            is_personal: org.is_personal,
            role: role.as_str().to_string(),
            created_at: org.created_at,
            updated_at: org.updated_at,
        }
    }
}

impl MemberResponse {
    /// Create from membership entity with optional user details.
    pub fn from_membership(
        membership: &MembershipEntity,
        email: Option<String>,
        name: Option<String>,
    ) -> Self {
        Self {
            id: membership.id,
            user_id: membership.user_id,
            role: membership.role.as_str().to_string(),
            joined_at: membership.joined_at,
            email,
            name,
        }
    }
}

impl SessionResponse {
    pub fn from_entity(entity: &SessionEntity, current_session_id: Uuid) -> Self {
        Self {
            id: entity.id,
            ip_address: entity.ip_address.clone(),
            user_agent: entity.user_agent.clone(),
            created_at: entity.created_at,
            expires_at: entity.expires_at,
            is_current: entity.id == current_session_id,
        }
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;

    use super::*;
    use crate::models::AuthMethod;

    #[test]
    fn admin_user_response_from_entity_preserves_fields() {
        let now = Utc::now();
        let entity = UserEntity {
            id: Uuid::new_v4(),
            email: Some("user@example.com".to_string()),
            email_verified: true,
            password_hash: None,
            name: Some("User".to_string()),
            username: Some("cedros-user".to_string()),
            picture: Some("https://example.com/avatar.png".to_string()),
            wallet_address: Some("wallet".to_string()),
            google_id: Some("google-id".to_string()),
            apple_id: None,
            auth_methods: vec![AuthMethod::Email, AuthMethod::Google],
            is_system_admin: true,
            created_at: now,
            updated_at: now,
            last_login_at: Some(now),
            welcome_completed_at: Some(now),
            referral_code: "referral".to_string(),
            referred_by: Some(Uuid::new_v4()),
        };

        let response = AdminUserResponse::from(&entity);

        assert_eq!(response.id, entity.id);
        assert_eq!(response.email, entity.email);
        assert_eq!(response.auth_methods, entity.auth_methods);
        assert_eq!(response.referral_code.as_deref(), Some("referral"));
        assert_eq!(response.referral_count, None);
    }

    #[test]
    fn audit_query_params_to_query_rejects_unknown_event_type() {
        let org_id = Uuid::new_v4();
        let actor_user_id = Uuid::new_v4();
        let params = AuditLogQueryParams {
            event_type: Some("unknown.event".to_string()),
            actor_user_id: Some(actor_user_id),
            session_id: None,
            target_type: Some("user".to_string()),
            target_id: None,
            limit: Some(25),
            offset: Some(50),
        };

        let query = params.to_query(Some(org_id));

        assert_eq!(query.org_id, Some(org_id));
        assert_eq!(query.actor_user_id, Some(actor_user_id));
        assert_eq!(query.event_type, None);
        assert_eq!(query.target_type.as_deref(), Some("user"));
        assert_eq!(query.limit, Some(25));
        assert_eq!(query.offset, Some(50));
    }
}
