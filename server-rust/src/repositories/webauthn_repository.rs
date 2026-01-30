//! WebAuthn credential repository
//!
//! Storage for WebAuthn passkeys and security keys.

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::errors::AppError;

/// WebAuthn credential entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebAuthnCredential {
    pub id: Uuid,
    pub user_id: Uuid,
    /// Base64URL-encoded credential ID from authenticator
    pub credential_id: String,
    /// Base64URL-encoded public key (COSE format)
    pub public_key: String,
    /// Signature counter for replay attack prevention
    pub sign_count: u32,
    /// Transport hints (usb, nfc, ble, internal, hybrid)
    pub transports: Option<Vec<String>>,
    /// Authenticator AAGUID (identifies authenticator model)
    pub aaguid: Option<String>,
    /// Whether this is a discoverable/resident credential (passkey)
    pub is_discoverable: bool,
    /// Whether the credential is backup eligible
    pub backup_eligible: bool,
    /// Whether the credential is currently backed up
    pub backup_state: bool,
    /// User-friendly label (e.g., "MacBook Pro", "YubiKey")
    pub label: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

impl WebAuthnCredential {
    /// Create a new WebAuthn credential
    pub fn new(
        user_id: Uuid,
        credential_id: String,
        public_key: String,
        sign_count: u32,
        is_discoverable: bool,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            credential_id,
            public_key,
            sign_count,
            transports: None,
            aaguid: None,
            is_discoverable,
            backup_eligible: false,
            backup_state: false,
            label: None,
            created_at: Utc::now(),
            last_used_at: None,
        }
    }
}

/// WebAuthn challenge state for registration/authentication
/// This is stored temporarily during the ceremony
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebAuthnChallenge {
    pub challenge_id: Uuid,
    pub user_id: Option<Uuid>,
    /// The serialized passkey registration/authentication state
    pub state: String,
    /// Challenge type: "register" or "authenticate"
    pub challenge_type: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

/// WebAuthn repository trait
#[async_trait]
pub trait WebAuthnRepository: Send + Sync {
    // Credential operations

    /// Create a new WebAuthn credential
    async fn create_credential(
        &self,
        credential: WebAuthnCredential,
    ) -> Result<WebAuthnCredential, AppError>;

    /// Find credential by ID
    async fn find_credential_by_id(&self, id: Uuid)
        -> Result<Option<WebAuthnCredential>, AppError>;

    /// Find credential by credential_id (from authenticator)
    async fn find_by_credential_id(
        &self,
        credential_id: &str,
    ) -> Result<Option<WebAuthnCredential>, AppError>;

    /// Find all credentials for a user
    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<WebAuthnCredential>, AppError>;

    /// Find discoverable credentials for a user (passkeys that can be used for username-less auth)
    async fn find_discoverable_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WebAuthnCredential>, AppError>;

    /// Update sign count after successful authentication
    async fn update_sign_count(&self, id: Uuid, sign_count: u32) -> Result<(), AppError>;

    /// Update last_used_at timestamp
    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError>;

    /// SEC-05: Atomically record successful authentication
    ///
    /// Updates both sign_count and last_used_at in a single atomic operation.
    /// This prevents race conditions where counter update might succeed but
    /// timestamp update fails (or vice versa).
    async fn record_successful_auth(&self, id: Uuid, sign_count: u32) -> Result<(), AppError>;

    /// Update credential label
    async fn update_label(&self, id: Uuid, label: Option<String>) -> Result<(), AppError>;

    /// Delete a credential
    async fn delete_credential(&self, id: Uuid) -> Result<(), AppError>;

    /// Delete all credentials for a user
    async fn delete_by_user(&self, user_id: Uuid) -> Result<u64, AppError>;

    // Challenge operations

    /// Store a challenge for registration/authentication ceremony
    async fn store_challenge(&self, challenge: WebAuthnChallenge) -> Result<(), AppError>;

    /// S-16: Find a challenge without consuming it (for checking challenge type)
    async fn find_challenge(
        &self,
        challenge_id: Uuid,
    ) -> Result<Option<WebAuthnChallenge>, AppError>;

    /// Get and consume a challenge (returns None if expired or not found)
    async fn consume_challenge(
        &self,
        challenge_id: Uuid,
    ) -> Result<Option<WebAuthnChallenge>, AppError>;

    /// Delete expired challenges
    async fn delete_expired_challenges(&self) -> Result<u64, AppError>;
}

/// In-memory WebAuthn repository for development/testing
pub struct InMemoryWebAuthnRepository {
    credentials: RwLock<HashMap<Uuid, WebAuthnCredential>>,
    challenges: RwLock<HashMap<Uuid, WebAuthnChallenge>>,
}

impl InMemoryWebAuthnRepository {
    pub fn new() -> Self {
        Self {
            credentials: RwLock::new(HashMap::new()),
            challenges: RwLock::new(HashMap::new()),
        }
    }
}

impl Default for InMemoryWebAuthnRepository {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl WebAuthnRepository for InMemoryWebAuthnRepository {
    async fn create_credential(
        &self,
        credential: WebAuthnCredential,
    ) -> Result<WebAuthnCredential, AppError> {
        let mut credentials = self.credentials.write().await;

        // Check for duplicate credential_id
        for existing in credentials.values() {
            if existing.credential_id == credential.credential_id {
                return Err(AppError::Validation("Credential already registered".into()));
            }
        }

        credentials.insert(credential.id, credential.clone());
        Ok(credential)
    }

    async fn find_credential_by_id(
        &self,
        id: Uuid,
    ) -> Result<Option<WebAuthnCredential>, AppError> {
        let credentials = self.credentials.read().await;
        Ok(credentials.get(&id).cloned())
    }

    async fn find_by_credential_id(
        &self,
        credential_id: &str,
    ) -> Result<Option<WebAuthnCredential>, AppError> {
        let credentials = self.credentials.read().await;
        Ok(credentials
            .values()
            .find(|c| c.credential_id == credential_id)
            .cloned())
    }

    async fn find_by_user(&self, user_id: Uuid) -> Result<Vec<WebAuthnCredential>, AppError> {
        let credentials = self.credentials.read().await;
        let mut result: Vec<_> = credentials
            .values()
            .filter(|c| c.user_id == user_id)
            .cloned()
            .collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(result)
    }

    async fn find_discoverable_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<WebAuthnCredential>, AppError> {
        let credentials = self.credentials.read().await;
        let mut result: Vec<_> = credentials
            .values()
            .filter(|c| c.user_id == user_id && c.is_discoverable)
            .cloned()
            .collect();
        result.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(result)
    }

    async fn update_sign_count(&self, id: Uuid, sign_count: u32) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        if let Some(cred) = credentials.get_mut(&id) {
            cred.sign_count = sign_count;
        }
        Ok(())
    }

    async fn update_last_used(&self, id: Uuid) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        if let Some(cred) = credentials.get_mut(&id) {
            cred.last_used_at = Some(Utc::now());
        }
        Ok(())
    }

    async fn record_successful_auth(&self, id: Uuid, sign_count: u32) -> Result<(), AppError> {
        // SEC-05: Atomic update of both sign_count and last_used_at
        let mut credentials = self.credentials.write().await;
        if let Some(cred) = credentials.get_mut(&id) {
            cred.sign_count = sign_count;
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

    async fn delete_credential(&self, id: Uuid) -> Result<(), AppError> {
        let mut credentials = self.credentials.write().await;
        credentials.remove(&id);
        Ok(())
    }

    async fn delete_by_user(&self, user_id: Uuid) -> Result<u64, AppError> {
        let mut credentials = self.credentials.write().await;
        let to_remove: Vec<Uuid> = credentials
            .values()
            .filter(|c| c.user_id == user_id)
            .map(|c| c.id)
            .collect();
        let count = to_remove.len() as u64;
        for id in to_remove {
            credentials.remove(&id);
        }
        Ok(count)
    }

    async fn store_challenge(&self, challenge: WebAuthnChallenge) -> Result<(), AppError> {
        let mut challenges = self.challenges.write().await;
        challenges.insert(challenge.challenge_id, challenge);
        Ok(())
    }

    async fn find_challenge(
        &self,
        challenge_id: Uuid,
    ) -> Result<Option<WebAuthnChallenge>, AppError> {
        let challenges = self.challenges.read().await;
        let challenge = challenges.get(&challenge_id).cloned();

        // Check expiration
        if let Some(ref c) = challenge {
            if c.expires_at < Utc::now() {
                return Ok(None);
            }
        }

        Ok(challenge)
    }

    async fn consume_challenge(
        &self,
        challenge_id: Uuid,
    ) -> Result<Option<WebAuthnChallenge>, AppError> {
        let mut challenges = self.challenges.write().await;
        let challenge = challenges.remove(&challenge_id);

        // Check expiration
        if let Some(ref c) = challenge {
            if c.expires_at < Utc::now() {
                return Ok(None);
            }
        }

        Ok(challenge)
    }

    async fn delete_expired_challenges(&self) -> Result<u64, AppError> {
        let mut challenges = self.challenges.write().await;
        let now = Utc::now();
        let to_remove: Vec<Uuid> = challenges
            .values()
            .filter(|c| c.expires_at < now)
            .map(|c| c.challenge_id)
            .collect();
        let count = to_remove.len() as u64;
        for id in to_remove {
            challenges.remove(&id);
        }
        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    #[tokio::test]
    async fn test_create_and_find_credential() {
        let repo = InMemoryWebAuthnRepository::new();
        let user_id = Uuid::new_v4();

        let cred = WebAuthnCredential::new(
            user_id,
            "cred_id_123".to_string(),
            "public_key_data".to_string(),
            0,
            true,
        );
        let cred_id = cred.id;

        repo.create_credential(cred).await.unwrap();

        let found = repo.find_credential_by_id(cred_id).await.unwrap();
        assert!(found.is_some());
        assert_eq!(found.unwrap().credential_id, "cred_id_123");
    }

    #[tokio::test]
    async fn test_find_by_user() {
        let repo = InMemoryWebAuthnRepository::new();
        let user_id = Uuid::new_v4();

        repo.create_credential(WebAuthnCredential::new(
            user_id,
            "cred_1".to_string(),
            "pk1".to_string(),
            0,
            true,
        ))
        .await
        .unwrap();

        repo.create_credential(WebAuthnCredential::new(
            user_id,
            "cred_2".to_string(),
            "pk2".to_string(),
            0,
            false,
        ))
        .await
        .unwrap();

        let creds = repo.find_by_user(user_id).await.unwrap();
        assert_eq!(creds.len(), 2);

        let discoverable = repo.find_discoverable_by_user(user_id).await.unwrap();
        assert_eq!(discoverable.len(), 1);
    }

    #[tokio::test]
    async fn test_challenge_expiration() {
        let repo = InMemoryWebAuthnRepository::new();
        let challenge_id = Uuid::new_v4();

        let challenge = WebAuthnChallenge {
            challenge_id,
            user_id: Some(Uuid::new_v4()),
            state: "state_data".to_string(),
            challenge_type: "register".to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() - Duration::seconds(10), // Already expired
        };

        repo.store_challenge(challenge).await.unwrap();

        // Expired challenge should not be returned
        let result = repo.consume_challenge(challenge_id).await.unwrap();
        assert!(result.is_none());
    }
}
