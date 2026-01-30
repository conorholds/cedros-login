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

/// LINT-03: Implement FromStr trait instead of custom from_str method
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

    /// Update last_used_at timestamp
    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError>;

    /// Update credential label
    async fn update_label(&self, id: Uuid, label: Option<String>) -> Result<(), AppError>;

    /// Soft-delete a credential (set disabled_at)
    async fn disable(&self, id: Uuid) -> Result<(), AppError>;

    /// Atomically disable a primary credential only if it's not the last one (H-01)
    ///
    /// Returns `true` if the credential was disabled, `false` if it was blocked
    /// because it's the last primary credential.
    ///
    /// This is atomic: the check and disable happen in a single database operation,
    /// preventing TOCTOU race conditions where two concurrent requests could both
    /// pass the check before either disables.
    async fn disable_if_not_last_primary(&self, id: Uuid, user_id: Uuid) -> Result<bool, AppError>;

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

    /// Count active credentials for a user
    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;
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

#[async_trait]
impl CredentialRepository for InMemoryCredentialRepository {
    async fn create(&self, credential: CredentialEntity) -> Result<CredentialEntity, AppError> {
        let mut credentials = self.credentials.write().await;
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
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
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
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(result)
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

    async fn disable_if_not_last_primary(&self, id: Uuid, user_id: Uuid) -> Result<bool, AppError> {
        let mut credentials = self.credentials.write().await;

        // Check if the credential to disable is a primary type
        let target = credentials.get(&id);
        let is_primary = target
            .map(|c| c.credential_type.is_primary())
            .unwrap_or(false);

        if !is_primary {
            // Not a primary credential, just disable it
            if let Some(cred) = credentials.get_mut(&id) {
                cred.disabled_at = Some(Utc::now());
            }
            return Ok(true);
        }

        // Count other active primary credentials for this user
        let other_primary_count = credentials
            .values()
            .filter(|c| {
                c.user_id == user_id
                    && c.id != id
                    && c.credential_type.is_primary()
                    && c.is_active()
            })
            .count();

        if other_primary_count == 0 {
            // This is the last primary credential, don't disable
            return Ok(false);
        }

        // Safe to disable
        if let Some(cred) = credentials.get_mut(&id) {
            cred.disabled_at = Some(Utc::now());
        }
        Ok(true)
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

    async fn count_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let credentials = self.credentials.read().await;
        Ok(credentials
            .values()
            .filter(|c| c.user_id == user_id && c.is_active())
            .count() as u64)
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

    #[tokio::test]
    async fn test_disable_if_not_last_primary_blocks_last() {
        // H-01: Test that we can't disable the last primary credential
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();

        // Create a single primary credential
        let cred = CredentialEntity::new(user_id, CredentialType::Password, None);
        let cred_id = cred.id;
        repo.create(cred).await.unwrap();

        // Try to disable it - should be blocked
        let result = repo
            .disable_if_not_last_primary(cred_id, user_id)
            .await
            .unwrap();
        assert!(
            !result,
            "Should not be able to disable last primary credential"
        );

        // Verify credential is still active
        let found = repo.find_by_id(cred_id).await.unwrap().unwrap();
        assert!(found.is_active());
    }

    #[tokio::test]
    async fn test_disable_if_not_last_primary_allows_with_other() {
        // H-01: Test that we CAN disable a primary credential if another exists
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();

        // Create two primary credentials
        let cred1 = CredentialEntity::new(user_id, CredentialType::Password, None);
        let cred1_id = cred1.id;
        repo.create(cred1).await.unwrap();

        let cred2 = CredentialEntity::new(user_id, CredentialType::OauthGoogle, None);
        repo.create(cred2).await.unwrap();

        // Try to disable first one - should succeed
        let result = repo
            .disable_if_not_last_primary(cred1_id, user_id)
            .await
            .unwrap();
        assert!(
            result,
            "Should be able to disable when another primary exists"
        );

        // Verify credential is now disabled
        let found = repo.find_by_id(cred1_id).await.unwrap().unwrap();
        assert!(!found.is_active());
    }

    #[tokio::test]
    async fn test_disable_if_not_last_primary_allows_secondary() {
        // H-01: Test that we can always disable secondary credentials
        let repo = InMemoryCredentialRepository::new();
        let user_id = Uuid::new_v4();

        // Create one primary and one secondary credential
        let primary = CredentialEntity::new(user_id, CredentialType::Password, None);
        repo.create(primary).await.unwrap();

        let secondary = CredentialEntity::new(user_id, CredentialType::Totp, None);
        let secondary_id = secondary.id;
        repo.create(secondary).await.unwrap();

        // Disable secondary - should always succeed
        let result = repo
            .disable_if_not_last_primary(secondary_id, user_id)
            .await
            .unwrap();
        assert!(
            result,
            "Should always be able to disable secondary credentials"
        );
    }
}
