//! Authoritative credential inventory and removal boundary.
//!
//! `user_credentials` is authoritative only for enterprise SSO bindings. The
//! remaining login methods live on `users`, `webauthn_credentials`, or
//! `totp_secrets`; this boundary presents one inventory and removes credentials
//! from their actual store while protecting the final usable login method.

use async_trait::async_trait;
use chrono::Utc;
use sha2::{Digest, Sha256};
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::errors::AppError;
use crate::models::AuthMethod;

use super::{
    CredentialEntity, CredentialRepository, CredentialType, InMemorySessionRepository,
    InMemoryUserRepository, SessionRepository, TotpRepository, UserRepository, WebAuthnRepository,
};

#[derive(Debug, Clone)]
pub enum CredentialUnlinkOutcome {
    Removed(CredentialEntity),
    LastPrimary,
    RequiresDedicatedMfaFlow,
    NotFound,
}

#[async_trait]
pub trait CredentialLifecycleRepository: Send + Sync {
    /// Issue a primary-only login against the exact verified account revision.
    /// Concurrent account changes or MFA enablement must fail closed; completed
    /// MFA logins use AtomicMfaRepository instead.
    async fn create_session_if_current(
        &self,
        user: &super::UserEntity,
        session: super::SessionEntity,
    ) -> Result<(), AppError> {
        let _ = (user, session);
        Err(AppError::Config(
            "Conditional session issuance is not implemented".into(),
        ))
    }

    /// Persist primary-authentication proof only while its account revision is current.
    async fn create_mfa_challenge_if_current(
        &self,
        user: &super::UserEntity,
        token_hash: &str,
        expires_at: chrono::DateTime<Utc>,
    ) -> Result<(), AppError> {
        let _ = (user, token_hash, expires_at);
        Err(AppError::Config(
            "Conditional MFA issuance is not implemented".into(),
        ))
    }

    /// Commit a password CAS, pending-MFA invalidation, and revocation together.
    /// `None` means the
    /// precondition was no password; reset callers pass the observed hash too.
    async fn change_password(
        &self,
        user_id: Uuid,
        expected_hash: Option<&str>,
        new_hash: &str,
        keep_session: Option<Uuid>,
    ) -> Result<(), AppError> {
        let _ = (user_id, expected_hash, new_hash, keep_session);
        Err(AppError::Config(
            "Atomic password change is not implemented".into(),
        ))
    }

    /// Commit enrollment against the proven account and a still-live session.
    async fn enroll_passkey_if_current(
        &self,
        expected: &super::UserEntity,
        session_id: Uuid,
        credential: super::WebAuthnCredential,
    ) -> Result<super::WebAuthnCredential, AppError> {
        let _ = (expected, session_id, credential);
        Err(AppError::Config(
            "Conditional passkey enrollment is not implemented".into(),
        ))
    }

    /// Bind persistent key issuance to a live session and account revision.
    async fn create_api_key_if_current(
        &self,
        expected: &super::UserEntity,
        session_id: Uuid,
        key: super::ApiKeyEntity,
    ) -> Result<super::ApiKeyEntity, AppError> {
        let _ = (expected, session_id, key);
        Err(AppError::Config(
            "Conditional API key issuance is not implemented".into(),
        ))
    }

    /// Tombstone an unchanged identity and remove all login authority atomically.
    async fn delete_identity_if_current(
        &self,
        expected: &super::UserEntity,
        replacement_referral_code: &str,
    ) -> Result<(), AppError> {
        let _ = (expected, replacement_referral_code);
        Err(AppError::Config(
            "Atomic identity deletion is not implemented".into(),
        ))
    }

    async fn list(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError>;

    async fn update_label(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        label: Option<String>,
    ) -> Result<bool, AppError>;

    async fn unlink(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        current_session_id: Uuid,
    ) -> Result<CredentialUnlinkOutcome, AppError>;
}

pub fn synthetic_credential_id(user_id: Uuid, credential_type: CredentialType) -> Uuid {
    let mut digest = Sha256::new();
    digest.update(b"cedros-login:credential:v1");
    digest.update(user_id.as_bytes());
    digest.update([0]);
    digest.update(credential_type.as_str().as_bytes());
    let digest = digest.finalize();
    let mut bytes = [0_u8; 16];
    bytes.copy_from_slice(&digest[..16]);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    Uuid::from_bytes(bytes)
}

pub struct InMemoryCredentialStores {
    pub credentials: Arc<dyn CredentialRepository>,
    pub webauthn: Arc<dyn WebAuthnRepository>,
    pub totp: Arc<dyn TotpRepository>,
    pub api_keys: Arc<dyn super::ApiKeyRepository>,
}

pub struct InMemoryCredentialLifecycleRepository {
    emails: Arc<super::InMemoryUserEmailRepository>,
    verification: Arc<super::InMemoryVerificationRepository>,
    users: Arc<InMemoryUserRepository>,
    sessions: Arc<InMemorySessionRepository>,
    credentials: Arc<dyn CredentialRepository>,
    webauthn: Arc<dyn WebAuthnRepository>,
    totp: Arc<dyn TotpRepository>,
    api_keys: Arc<dyn super::ApiKeyRepository>,
    mutation_lock: Mutex<()>,
}

impl InMemoryCredentialLifecycleRepository {
    pub fn new(
        verification: Arc<super::InMemoryVerificationRepository>,
        users: Arc<InMemoryUserRepository>,
        sessions: Arc<InMemorySessionRepository>,
        emails: Arc<super::InMemoryUserEmailRepository>,
        stores: InMemoryCredentialStores,
    ) -> Self {
        Self {
            verification,
            users,
            sessions,
            emails,
            credentials: stores.credentials,
            webauthn: stores.webauthn,
            totp: stores.totp,
            api_keys: stores.api_keys,
            mutation_lock: Mutex::new(()),
        }
    }

    /// Caller holds the account and verification-token locks. Remove all
    /// pre-registration authority before publishing mailbox ownership.
    pub(super) async fn discard_pre_registration_authority(
        &self,
        user_id: Uuid,
    ) -> Result<(), AppError> {
        self.api_keys.delete_for_user(user_id).await?;
        self.webauthn.delete_by_user(user_id).await?;
        for credential in self.credentials.find_by_user(user_id).await? {
            self.credentials.delete(credential.id).await?;
        }
        self.totp.disable_mfa(user_id).await?;
        self.sessions
            .revoke_all_for_user_with_reason(user_id, "email_ownership_claim")
            .await?;
        Ok(())
    }

    async fn authoritative_list(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError> {
        let user = self
            .users
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        let tracked = self.credentials.find_by_user(user_id).await?;
        let mut result = Vec::new();

        for (kind, present, label) in [
            (
                CredentialType::Password,
                user.password_hash.is_some(),
                Some("Email & Password"),
            ),
            (
                CredentialType::OauthGoogle,
                user.google_id.is_some(),
                Some("Google"),
            ),
            (
                CredentialType::OauthApple,
                user.apple_id.is_some(),
                Some("Sign in with Apple"),
            ),
            (
                CredentialType::Solana,
                user.wallet_address.is_some(),
                Some("Solana Wallet"),
            ),
        ] {
            if present {
                let mut credential =
                    CredentialEntity::new(user_id, kind, label.map(ToString::to_string));
                credential.id = synthetic_credential_id(user_id, kind);
                credential.created_at = user.created_at;
                credential.metadata = tracked
                    .iter()
                    .find(|entry| entry.credential_type == kind)
                    .and_then(|entry| entry.metadata.clone());
                result.push(credential);
            }
        }

        result.extend(
            self.webauthn
                .find_by_user(user_id)
                .await?
                .into_iter()
                .map(|passkey| CredentialEntity {
                    id: passkey.id,
                    user_id,
                    credential_type: CredentialType::WebauthnPasskey,
                    label: passkey.label,
                    created_at: passkey.created_at,
                    last_used_at: passkey.last_used_at,
                    disabled_at: None,
                    metadata: None,
                }),
        );

        if let Some(secret) = self
            .totp
            .find_by_user(user_id)
            .await?
            .filter(|row| row.enabled)
        {
            result.push(CredentialEntity {
                id: secret.id,
                user_id,
                credential_type: CredentialType::Totp,
                label: Some("Authenticator App (2FA)".into()),
                created_at: secret.created_at,
                last_used_at: None,
                disabled_at: None,
                metadata: None,
            });
        }

        result.extend(
            tracked
                .into_iter()
                .filter(|entry| entry.credential_type == CredentialType::SsoOidc),
        );
        result.sort_by_key(|entry| std::cmp::Reverse(entry.created_at));
        Ok(result)
    }
}

#[async_trait]
impl CredentialLifecycleRepository for InMemoryCredentialLifecycleRepository {
    async fn delete_identity_if_current(
        &self,
        expected: &super::UserEntity,
        replacement_referral_code: &str,
    ) -> Result<(), AppError> {
        let _mutation = self.mutation_lock.lock().await;
        let mut users = self.users.users.write().await;
        super::user_repository::guard_admin_removal(&users, expected.id)?;
        let user = users.get_mut(&expected.id).ok_or(AppError::InvalidToken)?;
        if user.updated_at != expected.updated_at || user.is_deleted() {
            return Err(AppError::InvalidToken);
        }
        let mut emails = self.emails.emails.write().await;
        let mut tokens = self.verification.tokens.write().await;
        self.api_keys.delete_for_user(user.id).await?;
        self.webauthn.delete_by_user(user.id).await?;
        for credential in self.credentials.find_by_user(user.id).await? {
            self.credentials.delete(credential.id).await?;
        }
        self.totp.disable_mfa(user.id).await?;
        self.sessions
            .revoke_all_for_user_with_reason(user.id, "account_deleted")
            .await?;
        emails.retain(|_, row| row.user_id != user.id);
        tokens.retain(|_, row| row.user_id != user.id);
        self.users
            .anonymize_locked_user(user, replacement_referral_code)
            .await;
        Ok(())
    }

    async fn create_session_if_current(
        &self,
        expected: &super::UserEntity,
        session: super::SessionEntity,
    ) -> Result<(), AppError> {
        let users = self.users.users.read().await;
        let user = users.get(&expected.id).ok_or(AppError::InvalidToken)?;
        if user.updated_at != expected.updated_at || user.is_deleted() || session.user_id != user.id
        {
            return Err(AppError::InvalidToken);
        }
        let session_id = session.id;
        self.sessions.create(session).await?;
        // Recheck after insertion: enablement either precedes this check, or
        // its subsequent revocation sees the already-persisted session.
        if self.totp.has_mfa_enabled(user.id).await? {
            self.sessions
                .revoke_with_reason(session_id, "mfa_required")
                .await?;
            return Err(AppError::InvalidToken);
        }
        Ok(())
    }

    async fn create_mfa_challenge_if_current(
        &self,
        expected: &super::UserEntity,
        token_hash: &str,
        expires_at: chrono::DateTime<Utc>,
    ) -> Result<(), AppError> {
        let users = self.users.users.read().await;
        let user = users.get(&expected.id).ok_or(AppError::InvalidToken)?;
        if user.updated_at != expected.updated_at || user.is_deleted() {
            return Err(AppError::InvalidToken);
        }
        let mut pending = self.verification.tokens.write().await;
        pending.retain(|_, token| {
            token.user_id != user.id || token.token_type != super::TokenType::MfaPending
        });
        let token = super::VerificationToken {
            id: Uuid::new_v4(),
            user_id: user.id,
            token_hash: token_hash.into(),
            token_type: super::TokenType::MfaPending,
            subject_id: None,
            created_at: Utc::now(),
            expires_at,
            used_at: None,
        };
        pending.insert(token.id, token);
        Ok(())
    }

    async fn change_password(
        &self,
        user_id: Uuid,
        expected_hash: Option<&str>,
        new_hash: &str,
        keep_session: Option<Uuid>,
    ) -> Result<(), AppError> {
        let _guard = self.mutation_lock.lock().await;
        // Account -> challenge -> session agrees with email ownership changes
        // and with MFA completion's challenge -> session subset.
        let mut users = self.users.users.write().await;
        let mut pending = self.verification.tokens.write().await;
        let user = users.get_mut(&user_id).ok_or(AppError::InvalidToken)?;
        if user.password_hash.as_deref() != expected_hash {
            return Err(AppError::InvalidCredentials);
        }
        let mut sessions = self.sessions.sessions.write().await;
        if let Some(id) = keep_session {
            if !sessions
                .get(&id)
                .is_some_and(|s| s.user_id == user_id && s.is_valid())
            {
                return Err(AppError::InvalidToken);
            }
        }
        pending.retain(|_, token| {
            token.user_id != user_id || token.token_type != super::TokenType::MfaPending
        });
        user.password_hash = Some(new_hash.into());
        if !user.auth_methods.contains(&AuthMethod::Email) {
            user.auth_methods.push(AuthMethod::Email);
        }
        user.updated_at = Utc::now();
        for session in sessions.values_mut() {
            if session.user_id == user_id && Some(session.id) != keep_session {
                session.revoked_at = Some(user.updated_at);
                session.revoked_reason = Some("password_change".into());
            }
        }
        Ok(())
    }

    async fn enroll_passkey_if_current(
        &self,
        expected: &super::UserEntity,
        session_id: Uuid,
        credential: super::WebAuthnCredential,
    ) -> Result<super::WebAuthnCredential, AppError> {
        let _guard = self.mutation_lock.lock().await;
        let mut users = self.users.users.write().await;
        let user = users.get_mut(&expected.id).ok_or(AppError::InvalidToken)?;
        let mut pending = self.verification.tokens.write().await;
        let mut sessions = self.sessions.sessions.write().await;
        if user.updated_at != expected.updated_at
            || user.is_deleted()
            || credential.user_id != user.id
            || !sessions
                .get(&session_id)
                .is_some_and(|s| s.user_id == user.id && s.is_valid())
        {
            return Err(AppError::InvalidToken);
        }
        let credential = self.webauthn.create_credential(credential).await?;
        if !user.auth_methods.contains(&AuthMethod::WebAuthn) {
            user.auth_methods.push(AuthMethod::WebAuthn);
        }
        user.updated_at = Utc::now();
        pending.retain(|_, token| {
            token.user_id != user.id || token.token_type != super::TokenType::MfaPending
        });
        for session in sessions.values_mut() {
            if session.user_id == user.id && session.id != session_id {
                session.revoked_at = Some(user.updated_at);
                session.revoked_reason = Some("passkey_credential_linked".into());
            }
        }
        Ok(credential)
    }

    async fn create_api_key_if_current(
        &self,
        expected: &super::UserEntity,
        session_id: Uuid,
        key: super::ApiKeyEntity,
    ) -> Result<super::ApiKeyEntity, AppError> {
        let users = self.users.users.read().await;
        let user = users.get(&expected.id).ok_or(AppError::InvalidToken)?;
        let sessions = self.sessions.sessions.read().await;
        if user.updated_at != expected.updated_at
            || user.is_deleted()
            || key.user_id != user.id
            || !sessions
                .get(&session_id)
                .is_some_and(|s| s.user_id == user.id && s.is_valid())
        {
            return Err(AppError::InvalidToken);
        }
        self.api_keys.create(key).await
    }

    async fn list(&self, user_id: Uuid) -> Result<Vec<CredentialEntity>, AppError> {
        self.authoritative_list(user_id).await
    }

    async fn update_label(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        label: Option<String>,
    ) -> Result<bool, AppError> {
        if self
            .webauthn
            .find_credential_by_id(credential_id)
            .await?
            .is_some_and(|entry| entry.user_id == user_id)
        {
            self.webauthn.update_label(credential_id, label).await?;
            return Ok(true);
        }
        if self
            .credentials
            .find_by_id(credential_id)
            .await?
            .is_some_and(|entry| {
                entry.user_id == user_id && entry.credential_type == CredentialType::SsoOidc
            })
        {
            self.credentials.update_label(credential_id, label).await?;
            return Ok(true);
        }
        Ok(false)
    }

    async fn unlink(
        &self,
        user_id: Uuid,
        credential_id: Uuid,
        current_session_id: Uuid,
    ) -> Result<CredentialUnlinkOutcome, AppError> {
        let _guard = self.mutation_lock.lock().await;
        let inventory = self.authoritative_list(user_id).await?;
        let Some(target) = inventory
            .iter()
            .find(|entry| entry.id == credential_id)
            .cloned()
        else {
            return Ok(CredentialUnlinkOutcome::NotFound);
        };
        if target.credential_type == CredentialType::Totp {
            return Ok(CredentialUnlinkOutcome::RequiresDedicatedMfaFlow);
        }
        let user = self
            .users
            .find_by_id(user_id)
            .await?
            .ok_or(AppError::InvalidToken)?;
        if target.credential_type.is_primary()
            && !inventory.iter().any(|entry| {
                entry.id != target.id
                    && entry.credential_type.is_primary()
                    && (entry.credential_type != CredentialType::Password
                        || user.email.as_deref().is_some_and(|email| !email.is_empty()))
            })
        {
            return Ok(CredentialUnlinkOutcome::LastPrimary);
        }

        let mut user = self
            .users
            .find_by_id(user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".into()))?;
        match target.credential_type {
            CredentialType::Password => {
                user.password_hash = None;
                user.auth_methods
                    .retain(|method| method != &AuthMethod::Email);
            }
            CredentialType::OauthGoogle => {
                user.google_id = None;
                user.auth_methods
                    .retain(|method| method != &AuthMethod::Google);
            }
            CredentialType::OauthApple => {
                user.apple_id = None;
                user.auth_methods
                    .retain(|method| method != &AuthMethod::Apple);
            }
            CredentialType::Solana => {
                user.wallet_address = None;
                user.auth_methods
                    .retain(|method| method != &AuthMethod::Solana);
            }
            CredentialType::WebauthnPasskey | CredentialType::WebauthnSecurityKey => {
                self.webauthn.delete_credential(target.id).await?;
                if self.webauthn.find_by_user(user_id).await?.is_empty() {
                    user.auth_methods
                        .retain(|method| method != &AuthMethod::WebAuthn);
                }
            }
            CredentialType::SsoOidc => {
                self.credentials.disable(target.id).await?;
                if self
                    .credentials
                    .find_by_user_and_type(user_id, CredentialType::SsoOidc)
                    .await?
                    .is_empty()
                {
                    user.auth_methods
                        .retain(|method| method != &AuthMethod::Sso);
                }
            }
            CredentialType::Totp => unreachable!("handled above"),
        }
        let user_revision = user.updated_at;
        user.updated_at = Utc::now();
        self.users.update_if_current(user, user_revision).await?;
        if matches!(
            target.credential_type,
            CredentialType::Password
                | CredentialType::OauthGoogle
                | CredentialType::OauthApple
                | CredentialType::Solana
        ) {
            self.credentials
                .delete_by_user_and_type(user_id, target.credential_type)
                .await?;
        }
        self.verification.tokens.write().await.retain(|_, token| {
            token.user_id != user_id || token.token_type != super::TokenType::MfaPending
        });
        self.sessions
            .revoke_all_except(user_id, current_session_id)
            .await?;
        Ok(CredentialUnlinkOutcome::Removed(target))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{SessionEntity, UserEntity, WebAuthnCredential};
    use crate::Storage;
    use chrono::Duration;

    async fn user_with_password_and_google(storage: &Storage) -> UserEntity {
        let mut user =
            UserEntity::new_email_user("owner@example.com".into(), "password-hash".into(), None);
        user.email_verified = true;
        user.google_id = Some("google-subject".into());
        user.auth_methods.push(AuthMethod::Google);
        storage.user_repo.create(user).await.unwrap()
    }

    #[tokio::test]
    async fn stale_account_writes_and_primary_proofs_cannot_survive_password_change() {
        let storage = Storage::in_memory();
        let user = user_with_password_and_google(&storage).await;
        let expires = Utc::now() + Duration::minutes(5);
        storage
            .credential_lifecycle_repo
            .create_mfa_challenge_if_current(&user, "before", expires)
            .await
            .unwrap();
        storage
            .credential_lifecycle_repo
            .change_password(user.id, user.password_hash.as_deref(), "new", None)
            .await
            .unwrap();
        assert!(storage
            .verification_repo
            .find_by_hash("before")
            .await
            .unwrap()
            .is_none());
        assert!(storage
            .credential_lifecycle_repo
            .create_mfa_challenge_if_current(&user, "stale", expires)
            .await
            .is_err());
        let mut stale = user.clone();
        stale.name = Some("stale profile".into());
        assert!(storage
            .user_repo
            .update_if_current(stale, user.updated_at)
            .await
            .is_err());
        let fresh = storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(fresh.password_hash.as_deref(), Some("new"));
        storage
            .credential_lifecycle_repo
            .create_mfa_challenge_if_current(&fresh, "fresh", expires)
            .await
            .unwrap();
        assert!(storage
            .verification_repo
            .find_by_hash("fresh")
            .await
            .unwrap()
            .is_some());
        let mut profile = fresh.clone();
        profile.name = Some("current profile".into());
        storage
            .user_repo
            .update_if_current(profile, fresh.updated_at)
            .await
            .unwrap();
    }

    #[tokio::test]
    async fn primary_only_issuance_cannot_escape_mfa_enablement() {
        let storage = Storage::in_memory();
        let user = user_with_password_and_google(&storage).await;
        storage
            .totp_repo
            .upsert_secret(user.id, "secret")
            .await
            .unwrap();
        storage.totp_repo.enable_mfa(user.id).await.unwrap();
        let session = SessionEntity::new(
            user.id,
            "hash".into(),
            Utc::now() + Duration::days(1),
            None,
            None,
        );
        assert!(storage
            .credential_lifecycle_repo
            .create_session_if_current(&user, session)
            .await
            .is_err());
        assert_eq!(
            storage
                .session_repo
                .count_active_by_user_id(user.id)
                .await
                .unwrap(),
            0
        );
    }

    #[tokio::test]
    async fn session_issuance_cannot_escape_a_credential_change() {
        let storage = Storage::in_memory();
        let user = user_with_password_and_google(&storage).await;
        let make = |hash: &str| {
            SessionEntity::new(
                user.id,
                hash.into(),
                Utc::now() + Duration::days(1),
                None,
                None,
            )
        };
        storage
            .credential_lifecycle_repo
            .create_session_if_current(&user, make("first"))
            .await
            .unwrap();
        storage
            .credential_lifecycle_repo
            .change_password(user.id, user.password_hash.as_deref(), "new-hash", None)
            .await
            .unwrap();
        assert!(storage
            .credential_lifecycle_repo
            .create_session_if_current(&user, make("stale"))
            .await
            .is_err());
        assert_eq!(
            storage
                .session_repo
                .count_active_by_user_id(user.id)
                .await
                .unwrap(),
            0
        );
        let fresh = storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap();
        storage
            .credential_lifecycle_repo
            .create_session_if_current(&fresh, make("fresh"))
            .await
            .unwrap();
        assert_eq!(
            storage
                .session_repo
                .count_active_by_user_id(user.id)
                .await
                .unwrap(),
            1
        );
    }

    #[tokio::test]
    async fn password_change_is_conditional_and_revokes_other_devices() {
        let storage = Storage::in_memory();
        let user = user_with_password_and_google(&storage).await;
        storage
            .verification_repo
            .create(
                user.id,
                "pending-proof",
                super::super::TokenType::MfaPending,
                Utc::now() + Duration::minutes(5),
            )
            .await
            .unwrap();
        let make = |hash: &str| {
            SessionEntity::new(
                user.id,
                hash.into(),
                Utc::now() + Duration::days(1),
                None,
                None,
            )
        };
        let current = storage.session_repo.create(make("current")).await.unwrap();
        let other = storage.session_repo.create(make("other")).await.unwrap();
        storage
            .credential_lifecycle_repo
            .change_password(user.id, Some("password-hash"), "new-hash", Some(current.id))
            .await
            .unwrap();
        assert!(storage
            .verification_repo
            .find_valid("pending-proof", &[super::super::TokenType::MfaPending])
            .await
            .unwrap()
            .is_none());
        assert!(!storage.session_repo.is_revoked(current.id).await.unwrap());
        assert!(storage.session_repo.is_revoked(other.id).await.unwrap());
        assert!(storage
            .credential_lifecycle_repo
            .change_password(
                user.id,
                Some("password-hash"),
                "stale-write",
                Some(current.id)
            )
            .await
            .is_err());
        assert_eq!(
            storage
                .user_repo
                .find_by_id(user.id)
                .await
                .unwrap()
                .unwrap()
                .password_hash
                .as_deref(),
            Some("new-hash")
        );
        storage.session_repo.revoke(current.id).await.unwrap();
        assert!(storage
            .credential_lifecycle_repo
            .change_password(
                user.id,
                Some("new-hash"),
                "revoked-session-write",
                Some(current.id)
            )
            .await
            .is_err());
    }

    #[tokio::test]
    async fn inventory_reads_authoritative_stores_and_removes_real_passkey() {
        let storage = Storage::in_memory();
        let mut user = user_with_password_and_google(&storage).await;
        user.auth_methods.push(AuthMethod::WebAuthn);
        storage.user_repo.update(user.clone()).await.unwrap();
        let passkey = storage
            .webauthn_repo
            .create_credential(WebAuthnCredential::new(
                user.id,
                "credential-id".into(),
                "public-key".into(),
                0,
                true,
            ))
            .await
            .unwrap();
        let current_session_id = Uuid::new_v4();
        storage
            .session_repo
            .create(SessionEntity::new_with_id(
                current_session_id,
                user.id,
                "current".into(),
                Utc::now() + Duration::hours(1),
                None,
                None,
            ))
            .await
            .unwrap();
        let other = storage
            .session_repo
            .create(SessionEntity::new(
                user.id,
                "other".into(),
                Utc::now() + Duration::hours(1),
                None,
                None,
            ))
            .await
            .unwrap();

        let listed = storage
            .credential_lifecycle_repo
            .list(user.id)
            .await
            .unwrap();
        assert!(listed.iter().any(|entry| entry.id == passkey.id));
        assert!(matches!(
            storage
                .credential_lifecycle_repo
                .unlink(user.id, passkey.id, current_session_id)
                .await
                .unwrap(),
            CredentialUnlinkOutcome::Removed(_)
        ));
        assert!(storage
            .webauthn_repo
            .find_credential_by_id(passkey.id)
            .await
            .unwrap()
            .is_none());
        assert!(storage
            .session_repo
            .find_by_id(other.id)
            .await
            .unwrap()
            .unwrap()
            .revoked_at
            .is_some());
    }

    #[tokio::test]
    async fn concurrent_removals_cannot_remove_both_primary_methods() {
        let storage = Storage::in_memory();
        let user = user_with_password_and_google(&storage).await;
        let password = synthetic_credential_id(user.id, CredentialType::Password);
        let google = synthetic_credential_id(user.id, CredentialType::OauthGoogle);
        let repo = storage.credential_lifecycle_repo.clone();
        let (one, two) = tokio::join!(
            repo.unlink(user.id, password, Uuid::new_v4()),
            repo.unlink(user.id, google, Uuid::new_v4())
        );
        let outcomes = [one.unwrap(), two.unwrap()];
        assert_eq!(
            outcomes
                .iter()
                .filter(|outcome| matches!(outcome, CredentialUnlinkOutcome::Removed(_)))
                .count(),
            1
        );
        assert_eq!(
            outcomes
                .iter()
                .filter(|outcome| matches!(outcome, CredentialUnlinkOutcome::LastPrimary))
                .count(),
            1
        );
        let remaining = storage
            .credential_lifecycle_repo
            .list(user.id)
            .await
            .unwrap();
        assert_eq!(
            remaining
                .iter()
                .filter(|entry| entry.credential_type.is_primary())
                .count(),
            1
        );
        let current = storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap();
        assert_eq!(
            current.password_hash.is_some(),
            current.auth_methods.contains(&AuthMethod::Email)
        );
        assert_eq!(
            current.google_id.is_some(),
            current.auth_methods.contains(&AuthMethod::Google)
        );
    }

    #[tokio::test]
    async fn totp_requires_its_factor_confirming_disable_flow() {
        let storage = Storage::in_memory();
        let user = user_with_password_and_google(&storage).await;
        let secret = storage
            .totp_repo
            .upsert_secret(user.id, "secret")
            .await
            .unwrap();
        storage.totp_repo.enable_mfa(user.id).await.unwrap();
        assert!(matches!(
            storage
                .credential_lifecycle_repo
                .unlink(user.id, secret.id, Uuid::new_v4())
                .await
                .unwrap(),
            CredentialUnlinkOutcome::RequiresDedicatedMfaFlow
        ));
        assert!(storage.totp_repo.has_mfa_enabled(user.id).await.unwrap());
    }
    #[tokio::test]
    async fn enrollment_and_api_keys_reject_stale_accounts_and_revoked_sessions() {
        let storage = Storage::in_memory();

        let mut user = UserEntity::new_email_user(
            format!("enroll-{}@example.com", Uuid::new_v4()),
            "hash".into(),
            None,
        );
        user.email_verified = true;
        let user = storage.user_repo.create(user).await.unwrap();
        let session = storage
            .session_repo
            .create(SessionEntity::new(
                user.id,
                format!("refresh-{}", Uuid::new_v4()),
                Utc::now() + Duration::hours(1),
                None,
                None,
            ))
            .await
            .unwrap();
        let other = storage
            .session_repo
            .create(SessionEntity::new(
                user.id,
                format!("other-{}", Uuid::new_v4()),
                Utc::now() + Duration::hours(1),
                None,
                None,
            ))
            .await
            .unwrap();
        let credential = WebAuthnCredential::new(
            user.id,
            format!("credential-{}", Uuid::new_v4()),
            "public-key".into(),
            0,
            true,
        );
        let saved = storage
            .credential_lifecycle_repo
            .enroll_passkey_if_current(&user, session.id, credential)
            .await
            .unwrap();
        assert!(storage
            .webauthn_repo
            .find_credential_by_id(saved.id)
            .await
            .unwrap()
            .is_some());
        assert!(storage
            .session_repo
            .find_by_id(other.id)
            .await
            .unwrap()
            .unwrap()
            .is_revoked());
        let current = storage
            .user_repo
            .find_by_id(user.id)
            .await
            .unwrap()
            .unwrap();
        assert!(current.auth_methods.contains(&AuthMethod::WebAuthn));
        let stale = WebAuthnCredential::new(
            user.id,
            format!("stale-{}", Uuid::new_v4()),
            "key".into(),
            0,
            true,
        );
        assert!(storage
            .credential_lifecycle_repo
            .enroll_passkey_if_current(&user, session.id, stale)
            .await
            .is_err());
        let key = crate::repositories::ApiKeyEntity::new(user.id, "ck_test", "conditional");
        assert!(storage
            .credential_lifecycle_repo
            .create_api_key_if_current(&user, session.id, key.clone())
            .await
            .is_err());
        storage
            .credential_lifecycle_repo
            .create_api_key_if_current(&current, session.id, key.clone())
            .await
            .unwrap();
        storage.session_repo.revoke(session.id).await.unwrap();
        let revoked = WebAuthnCredential::new(
            user.id,
            format!("revoked-{}", Uuid::new_v4()),
            "key".into(),
            0,
            true,
        );
        assert!(storage
            .credential_lifecycle_repo
            .enroll_passkey_if_current(&current, session.id, revoked)
            .await
            .is_err());
        assert!(storage
            .credential_lifecycle_repo
            .create_api_key_if_current(&current, session.id, key)
            .await
            .is_err());
        assert_eq!(
            storage
                .webauthn_repo
                .find_by_user(user.id)
                .await
                .unwrap()
                .len(),
            1
        );
    }
}
