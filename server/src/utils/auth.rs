//! Authentication utilities for JWT and API key authentication

use axum::http::HeaderMap;
use std::sync::Arc;
use uuid::Uuid;

use crate::callback::AuthCallback;
use crate::errors::AppError;
use crate::repositories::{MembershipEntity, API_KEY_PREFIX};
use crate::services::{EmailService, TokenContext};
use crate::AppState;

use super::extract_access_token;

/// Represents an authenticated user from either JWT or API key
#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    /// User ID
    pub user_id: Uuid,
    /// Session ID (None for API key auth)
    pub session_id: Option<Uuid>,
    /// Current organization ID (from JWT claims or None for API key)
    pub org_id: Option<Uuid>,
    /// Current role in organization (from JWT claims or None for API key)
    pub role: Option<String>,
    /// Whether this auth came from an API key (vs JWT)
    pub is_api_key_auth: bool,
    /// ID of the API key used for authentication (None for JWT auth)
    pub api_key_id: Option<Uuid>,
    /// Raw API key string (needed for Argon2id derivation when using API key wallet auth).
    /// Lives only in memory for the request lifetime, same as password in login flow.
    pub raw_api_key: Option<String>,
    /// Whether user is a system admin (from JWT claims). Avoids DB lookup in admin handlers.
    pub is_system_admin: Option<bool>,
    /// Whether user's email address has been verified (from JWT claims)
    pub email_verified: Option<bool>,
}

/// Get the default organization context for a user from their memberships.
///
/// Returns the first membership's org_id and role as the default context.
///
/// # Arguments
/// * `memberships` - User's organization memberships
/// * `is_system_admin` - Whether the user is a system-wide admin
/// * `email_verified` - Whether the user's email is verified
pub fn get_default_org_context(
    memberships: &[MembershipEntity],
    is_system_admin: bool,
    email_verified: bool,
) -> TokenContext {
    let admin_flag = if is_system_admin { Some(true) } else { None };

    if let Some(membership) = memberships.first() {
        return TokenContext {
            org_id: Some(membership.org_id),
            role: Some(membership.role.as_str().to_string()),
            is_system_admin: admin_flag,
            email_verified: Some(email_verified),
        };
    }

    TokenContext {
        is_system_admin: admin_flag,
        email_verified: Some(email_verified),
        ..Default::default()
    }
}

/// Authenticate a request using either JWT or API key
///
/// Checks the Authorization header (and optionally cookies) for:
/// 1. API key (starts with `ck_`) - validates against api_key_repo
/// 2. JWT token - validates against jwt_service
///
/// Returns an `AuthenticatedUser` on success.
pub async fn authenticate<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<AuthenticatedUser, AppError> {
    // Extract token from Authorization header or cookie
    let token = extract_access_token(headers, &state.config.cookie.access_cookie_name)
        .ok_or(AppError::InvalidToken)?;

    // Check if it's an API key
    if token.starts_with(API_KEY_PREFIX) {
        authenticate_api_key(state, &token).await
    } else {
        authenticate_jwt(state, &token).await
    }
}

/// Apply current organization policy in addition to endpoint-specific role and
/// object constraints. A Login system-admin flag does not bypass org-route gates.
pub async fn require_org_permission<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    auth: &AuthenticatedUser,
    org_id: Uuid,
    permission: crate::domain::Permission,
) -> Result<(), AppError> {
    let service = crate::services::PolicyService::new(
        state.policy_repo.clone(),
        state.user_repo.clone(),
        state.org_repo.clone(),
        state.membership_repo.clone(),
    );
    if !service
        .evaluate(auth.user_id, org_id, permission.as_str(), None, false)
        .await?
        .allowed
    {
        return Err(AppError::Forbidden("Organization permission denied".into()));
    }
    Ok(())
}

/// Authenticate an interactive JWT-backed session. API keys prove the user's
/// identity but cannot authorize credential management or system administration.
pub async fn authenticate_session<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    headers: &HeaderMap,
) -> Result<AuthenticatedUser, AppError> {
    let auth = authenticate(state, headers).await?;
    if auth.is_api_key_auth {
        return Err(AppError::Forbidden(
            "Interactive session required".to_string(),
        ));
    }
    Ok(auth)
}

/// Authenticate using an API key
///
/// # Security
///
/// While we use constant-time comparison for API key hashes, there's inherent
/// timing variability from the database lookup. This is mitigated by:
/// 1. Rate limiting on authentication endpoints
/// 2. API keys being high-entropy (hard to enumerate)
/// 3. Network jitter masking small timing differences
///
/// For environments requiring stricter timing guarantees, consider implementing
/// a dummy database lookup on invalid keys to normalize response time.
async fn authenticate_api_key<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    api_key: &str,
) -> Result<AuthenticatedUser, AppError> {
    // Use find_by_key which performs constant-time hash comparison
    let api_key_entity = state
        .api_key_repo
        .find_by_key(api_key)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Update last_used_at
    let _ = state.api_key_repo.update_last_used(api_key_entity.id).await;

    // Verify the user exists
    let user = state
        .user_repo
        .find_by_id(api_key_entity.user_id)
        .await?
        .ok_or(AppError::InvalidToken)?;

    if user.is_deleted() {
        return Err(AppError::InvalidToken);
    }

    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;
    if verification_required && user.email.is_some() && !user.email_verified {
        return Err(AppError::Forbidden("Email not verified".into()));
    }

    if state.invite_code_service.is_user_blocked(user.id).await? {
        return Err(AppError::Forbidden("Invite code required".into()));
    }

    Ok(AuthenticatedUser {
        user_id: user.id,
        session_id: None,
        org_id: None,
        role: None,
        is_api_key_auth: true,
        api_key_id: Some(api_key_entity.id),
        raw_api_key: Some(api_key.to_string()),
        // API keys prove the user identity only and never carry Login's global
        // system-administrator authority.
        is_system_admin: None,
        email_verified: Some(user.email_verified),
    })
}

/// Authenticate using a JWT token
async fn authenticate_jwt<C: AuthCallback, E: EmailService>(
    state: &Arc<AppState<C, E>>,
    token: &str,
) -> Result<AuthenticatedUser, AppError> {
    // Validate the JWT
    let claims = state.jwt_service.validate_access_token(token)?;

    // Verify the session exists and is valid
    let session = state
        .session_repo
        .find_by_id(claims.sid)
        .await?
        .ok_or(AppError::InvalidToken)?;

    // Check expiration separately to return appropriate error
    // This allows clients to distinguish between expired tokens (which can be
    // refreshed) and invalid tokens (which require re-authentication).
    //
    // Trade-off: This does reveal whether a session was revoked vs expired.
    // Accepted because: (1) clients need this to choose refresh vs re-login,
    // (2) attacker would discover same info via refresh attempt anyway,
    // (3) minimal information disclosure (no user data leaked).
    if session.expires_at <= chrono::Utc::now() {
        return Err(AppError::TokenExpired);
    }

    if session.user_id != claims.sub || session.is_revoked() {
        return Err(AppError::InvalidToken);
    }

    let user = state
        .user_repo
        .find_by_id(claims.sub)
        .await?
        .ok_or(AppError::InvalidToken)?;
    if user.is_deleted() {
        return Err(AppError::InvalidToken);
    }

    // JWTs prove provenance and have a short lifetime, but authorization and
    // account-security state can change before they expire. Fail closed on
    // privilege-bearing claim changes so a refresh must mint current context.
    if claims.is_system_admin == Some(true) && !user.is_system_admin {
        return Err(AppError::InvalidToken);
    }
    if claims
        .email_verified
        .is_some_and(|verified| verified != user.email_verified)
    {
        return Err(AppError::InvalidToken);
    }

    let verification_required = state
        .settings_service
        .email_verification_required(state.config.email.require_verification)
        .await?;
    if verification_required && user.email.is_some() && !user.email_verified {
        return Err(AppError::Forbidden("Email not verified".into()));
    }

    match claims.org_id {
        Some(org_id) => {
            if state.org_repo.find_by_id(org_id).await?.is_none() {
                return Err(AppError::InvalidToken);
            }
            let membership = state
                .membership_repo
                .find_by_user_and_org(claims.sub, org_id)
                .await?
                .ok_or(AppError::InvalidToken)?;
            if claims.role.as_deref() != Some(membership.role.as_str()) {
                return Err(AppError::InvalidToken);
            }
        }
        None if claims.role.is_some() => return Err(AppError::InvalidToken),
        None => {}
    }

    if state.invite_code_service.is_user_blocked(user.id).await? {
        return Err(AppError::InvalidToken);
    }

    Ok(AuthenticatedUser {
        user_id: claims.sub,
        session_id: Some(claims.sid),
        org_id: claims.org_id,
        role: claims.role,
        is_api_key_auth: false,
        api_key_id: None,
        raw_api_key: None,
        is_system_admin: claims.is_system_admin,
        email_verified: claims.email_verified,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{MembershipEntity, OrgRole};
    use chrono::Utc;

    #[test]
    fn test_authenticated_user_fields() {
        let user = AuthenticatedUser {
            user_id: Uuid::new_v4(),
            session_id: Some(Uuid::new_v4()),
            org_id: Some(Uuid::new_v4()),
            role: Some("owner".to_string()),
            is_api_key_auth: false,
            api_key_id: None,
            raw_api_key: None,
            is_system_admin: None,
            email_verified: None,
        };
        assert!(!user.is_api_key_auth);
        assert!(user.session_id.is_some());
    }

    #[test]
    fn test_authenticated_user_api_key_auth() {
        let key_id = Uuid::new_v4();
        let user = AuthenticatedUser {
            user_id: Uuid::new_v4(),
            session_id: None,
            org_id: Some(Uuid::new_v4()),
            role: Some("owner".to_string()),
            is_api_key_auth: true,
            api_key_id: Some(key_id),
            raw_api_key: Some("ck_test123".to_string()),
            is_system_admin: None,
            email_verified: None,
        };
        assert!(user.is_api_key_auth);
        assert!(user.session_id.is_none());
        assert_eq!(user.api_key_id, Some(key_id));
        assert!(user.raw_api_key.is_some());
    }

    #[test]
    fn test_get_default_org_context_uses_first_membership() {
        let user_id = Uuid::new_v4();
        let org_id = Uuid::new_v4();

        let memberships = vec![MembershipEntity {
            id: Uuid::new_v4(),
            user_id,
            org_id,
            role: OrgRole::Member,
            joined_at: Utc::now(),
        }];

        let context = get_default_org_context(&memberships, false, true);
        assert_eq!(context.org_id, Some(org_id));
        assert_eq!(context.role.as_deref(), Some("member"));
        assert_eq!(context.is_system_admin, None);
        assert_eq!(context.email_verified, Some(true));

        // Test with system admin
        let admin_context = get_default_org_context(&memberships, true, false);
        assert_eq!(admin_context.is_system_admin, Some(true));
        assert_eq!(admin_context.email_verified, Some(false));
    }

    #[test]
    fn test_get_default_org_context_empty_memberships() {
        let context = get_default_org_context(&[], false, false);
        assert_eq!(context.org_id, None);
        assert_eq!(context.role, None);
    }
}
