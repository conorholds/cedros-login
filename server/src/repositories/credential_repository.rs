//! Unified credential repository for tracking all authentication methods
//!
//! This provides a normalized view of user credentials across all auth methods:
//! - Password
//! - WebAuthn (passkeys and security keys)
//! - TOTP
//! - OAuth providers (Google, Apple)
//! - SSO (OIDC)

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// Type of credential
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CredentialType {
    /// Email/password authentication
    Password,
    /// WebAuthn passkey (discoverable credential)
    WebauthnPasskey,
    /// WebAuthn security key (cross-platform authenticator)
    WebauthnSecurityKey,
    /// TOTP authenticator app
    Totp,
    /// Google OAuth
    OauthGoogle,
    /// Apple Sign-In
    OauthApple,
    /// Solana wallet
    Solana,
    /// Enterprise SSO (OIDC)
    SsoOidc,
}

impl CredentialType {
    /// Get the string representation
    pub fn as_str(&self) -> &'static str {
        match self {
            CredentialType::Password => "password",
            CredentialType::WebauthnPasskey => "webauthn_passkey",
            CredentialType::WebauthnSecurityKey => "webauthn_security_key",
            CredentialType::Totp => "totp",
            CredentialType::OauthGoogle => "oauth_google",
            CredentialType::OauthApple => "oauth_apple",
            CredentialType::Solana => "solana",
            CredentialType::SsoOidc => "sso_oidc",
        }
    }

    /// Check if this is a primary authentication method (can be used to sign in)
    pub fn is_primary(&self) -> bool {
        matches!(
            self,
            CredentialType::Password
                | CredentialType::WebauthnPasskey
                | CredentialType::OauthGoogle
                | CredentialType::OauthApple
                | CredentialType::Solana
                | CredentialType::SsoOidc
        )
    }

    /// Check if this is a second factor (MFA)
    pub fn is_second_factor(&self) -> bool {
        matches!(
            self,
            CredentialType::Totp | CredentialType::WebauthnSecurityKey
        )
    }
}

impl std::fmt::Display for CredentialType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Implement FromStr trait instead of custom from_str method
impl FromStr for CredentialType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "password" => Ok(CredentialType::Password),
            "webauthn_passkey" => Ok(CredentialType::WebauthnPasskey),
            "webauthn_security_key" => Ok(CredentialType::WebauthnSecurityKey),
            "totp" => Ok(CredentialType::Totp),
            "oauth_google" => Ok(CredentialType::OauthGoogle),
            "oauth_apple" => Ok(CredentialType::OauthApple),
            "solana" => Ok(CredentialType::Solana),
            "sso_oidc" => Ok(CredentialType::SsoOidc),
            _ => Err(()),
        }
    }
}

/// Unified credential entity
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialEntity {
    pub id: Uuid,
    pub user_id: Uuid,
    pub credential_type: CredentialType,
    /// User-friendly label (e.g., "Work laptop", "YubiKey")
    pub label: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
    /// When the credential was disabled (soft delete)
    pub disabled_at: Option<DateTime<Utc>>,
    /// Additional metadata specific to credential type (JSON)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

impl CredentialEntity {
    /// Create a new credential
    pub fn new(user_id: Uuid, credential_type: CredentialType, label: Option<String>) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            credential_type,
            label,
            created_at: Utc::now(),
            last_used_at: None,
            disabled_at: None,
            metadata: None,
        }
    }

    /// Check if credential is active (not disabled)
    pub fn is_active(&self) -> bool {
        self.disabled_at.is_none()
    }
}

/// Credential repository trait
#[async_trait]
pub trait CredentialRepository: Send + Sync {
    /// Create a new credential
    async fn create(&self, credential: CredentialEntity) -> Result<CredentialEntity, AppError>;

    /// Find credential by ID
    async fn find_by_id(&self, id: Uuid) -> Result<Option<CredentialEntity>, AppError>;

    /// Find all credentials for a user
    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError>;

    /// Find credentials by user and type
    async fn find_by_user_and_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<Vec<CredentialEntity>, AppError>;

    /// Resolve an enterprise identity by its immutable provider/subject pair.
    async fn find_sso_identity(
        &self,
        provider_id: Uuid,
        subject: &str,
    ) -> Result<Option<CredentialEntity>, AppError>;

    /// Update last_used_at timestamp
    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError>;

    /// Update credential label
    async fn update_label(&self, id: Uuid, label: Option<String>) -> Result<(), AppError>;

    /// Soft-delete a credential (set disabled_at)
    async fn disable(&self, id: Uuid) -> Result<(), AppError>;

    /// Hard-delete a credential
    async fn delete(&self, id: Uuid) -> Result<(), AppError>;

    /// Delete all credentials of a type for a user
    async fn delete_by_user_and_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<u64, AppError>;

    /// Check if user has any active credential of a type
    async fn has_credential_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<bool, AppError>;
}

/// In-memory credential repository for development/testing
pub struct InMemoryCredentialRepository {
    credentials: RwLock<HashMap<Uuid, CredentialEntity>>,
}

impl InMemoryCredentialRepository {
    pub fn new() -> Self {
        Self {
            credentials: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryCredentialRepository {
    fn default() -> Self {
        Self::new()
    }
}

fn sso_identity_key(credential: &CredentialEntity) -> Option<(&str, &str)> {
    if credential.credential_type != CredentialType::SsoOidc || !credential.is_active() {
        return None;
    }
    let metadata = credential.metadata.as_ref()?;
    Some((
        metadata.get("providerId")?.as_str()?,
        metadata.get("subject")?.as_str()?,
    ))
}

#[async_trait]
impl CredentialRepository for InMemoryCredentialRepository {
    async fn create(&self, credential: CredentialEntity) -> Result<CredentialEntity, AppError> {
        let mut credentials = self.credentials.write().await;
        if let Some(binding) = sso_identity_key(&credential) {
            if credentials
                .values()
                .filter_map(sso_identity_key)
                .any(|existing| existing == binding)
            {
                return Err(AppError::Validation(
                    "SSO identity is already linked".into(),
                ));
            }
        }
        credentials.insert(credential.id, credential.clone());
        Ok(credential)
    }

    async fn find_by_id(&self, id: Uuid) -> Result<Option<CredentialEntity>, AppError> {
        let credentials = self.credentials.read().await;
        Ok(credentials.get(&id).cloned())
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError> {
        let credentials = self.credentials.read().await;
        let mut result: Vec<_> = credentials
            .values()
            .filter(|c| c.user_id == user_id && c.is_active())
            .cloned()
            .collect();
        result.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(result)
    }

    async fn find_by_user_and_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<Vec<CredentialEntity>, AppError> {
        let credentials = self.credentials.read().await;
        let mut result: Vec<_> = credentials
            .values()
            .filter(|c| {
                c.user_id == user_id && c.credential_type == credential_type && c.is_active()
            })
            .cloned()
            .collect();
        result.sort_by_key(|b| std::cmp::Reverse(b.created_at));
        Ok(result)
    }

    async fn find_sso_identity(
        &self,
        provider_id: Uuid,
        subject: &str,
    ) -> Result<Option<CredentialEntity>, AppError> {
        let provider_id = provider_id.to_string();
        let credentials = self.credentials.read().await;
        Ok(credentials
            .values()
            .find(|credential| {
                sso_identity_key(credential) == Some((provider_id.as_str(), subject))
            })
            .cloned())
    }

    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        if let Some(cred) = credentials.get_mut(&id) {
            cred.last_used_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn update_label(&self, id: Uuid, label: Option<String>) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        if let Some(cred) = credentials.get_mut(&id) {
            cred.label = label;
        }
        Ok(())
    }

    async fn disable(&self, id: Uuid) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        if let Some(cred) = credentials.get_mut(&id) {
            cred.disabled_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn delete(&self, id: Uuid) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        credentials.remove(&id);
        Ok(())
    }

    async fn delete_by_user_and_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<u64, AppError> {
        let mut credentials = self.credentials.write().await;
        let to_remove: Vec<Uuid> = credentials
            .values()
            .filter(|c| c.user_id == user_id && c.credential_type == credential_type)
            .map(|c| c.id)
            .collect();
        let count = to_remove.len() as u64;
        for id in to_remove {
            credentials.remove(&id);
        }
        Ok(count)
    }

    async fn has_credential_type(
        &self,
        user_id: Uuid,
        credential_type: CredentialType,
    ) -> Result<bool, AppError> {
        let credentials = self.credentials.read().await;
        Ok(credentials
            .values()
            .any(|c| c.user_id == user_id && c.credential_type == credential_type && c.is_active()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_and_find_credential() {
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();
        let cred = CredentialEntity::new(user_id, CredentialType::Password, None);
        let cred_id = cred.id;

        repo.create(cred).await.unwrap();

        let found = repo.find_by_id(cred_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().credential_type, CredentialType::Password);
    }

    #[tokio::test]
    async fn test_find_by_user() {
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();

        repo.create(CredentialEntity::new(
            user_id,
            CredentialType::Password,
            None,
        ))
        .await
        .unwrap();
        repo.create(CredentialEntity::new(
            user_id,
            CredentialType::OauthGoogle,
            None,
        ))
        .await
        .unwrap();
        repo.create(CredentialEntity::new(
            Uuid::new_v4(),
            CredentialType::Password,
            None,
        ))
        .await
        .unwrap();

        let creds = repo.find_by_user(user_id).await.unwrap();
        assert_eq!(creds.len(), 2);
    }

    #[tokio::test]
    async fn sso_identity_uses_provider_and_subject_not_email() {
        let repo = InMemoryCredentialRepository::new();
        let provider_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();
        let mut credential =
            CredentialEntity::new(user_id, CredentialType::SsoOidc, Some("Work".into()));
        credential.metadata = Some(serde_json::json!({
            "providerId": provider_id,
            "subject": "immutable-subject",
        }));
        repo.create(credential).await.unwrap();

        assert_eq!(
            repo.find_sso_identity(provider_id, "immutable-subject")
                .await
                .unwrap()
                .unwrap()
                .user_id,
            user_id
        );
        assert!(repo
            .find_sso_identity(provider_id, "other-subject")
            .await
            .unwrap()
            .is_none());

        let mut duplicate = CredentialEntity::new(Uuid::new_v4(), CredentialType::SsoOidc, None);
        duplicate.metadata = Some(serde_json::json!({
            "providerId": provider_id,
            "subject": "immutable-subject",
        }));
        assert!(repo.create(duplicate).await.is_err());
    }

    #[tokio::test]
    async fn test_disable_credential() {
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();
        let cred = CredentialEntity::new(user_id, CredentialType::Totp, None);
        let cred_id = cred.id;

        repo.create(cred).await.unwrap();
        assert!(repo
            .has_credential_type(user_id, CredentialType::Totp)
            .await
            .unwrap());

        repo.disable(cred_id).await.unwrap();
        assert!(!repo
            .has_credential_type(user_id, CredentialType::Totp)
            .await
            .unwrap());
    }

    #[tokio::test]
    async fn test_credential_type_properties() {
        assert!(CredentialType::Password.is_primary());
        assert!(!CredentialType::Password.is_second_factor());

        assert!(!CredentialType::Totp.is_primary());
        assert!(CredentialType::Totp.is_second_factor());

        assert!(CredentialType::WebauthnPasskey.is_primary());
        assert!(!CredentialType::WebauthnPasskey.is_second_factor());

        assert!(!CredentialType::WebauthnSecurityKey.is_primary());
        assert!(CredentialType::WebauthnSecurityKey.is_second_factor());
    }
}
