//! WebAuthn registration ceremony methods (authenticated + signup flows)

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{Duration, Utc};
use std::sync::Arc;
use uuid::Uuid;
use webauthn_rs::prelude::{CredentialID, PasskeyRegistration};

use crate::errors::AppError;
use crate::repositories::{WebAuthnChallenge, WebAuthnCredential, WebAuthnRepository};

use super::{RegistrationOptionsResponse, VerifyRegistrationRequest, WebAuthnService};

impl WebAuthnService {
    /// Start passkey registration ceremony
    pub async fn start_registration(
        &self,
        user_id: Uuid,
        user_email: Option<&str>,
        user_name: Option<&str>,
        existing_credentials: &[WebAuthnCredential],
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<RegistrationOptionsResponse, AppError> {
        let webauthn = self.get_webauthn().await?;
        let attachment = self.authenticator_attachment()?;
        let policy = self.user_verification_policy();

        // Convert existing credentials to exclude list
        let exclude_credentials: Vec<CredentialID> = existing_credentials
            .iter()
            .filter_map(|c| {
                URL_SAFE_NO_PAD
                    .decode(&c.credential_id)
                    .ok()
                    .map(CredentialID::from)
            })
            .collect();

        // L-02: Use UUID bytes directly (no fallible conversion or silent zeros)
        let display_name = user_name.unwrap_or(user_email.unwrap_or("User"));
        let user_id_string = user_id.to_string();
        let user_name_for_webauthn = user_email.unwrap_or(&user_id_string);

        let (mut ccr, reg_state) = webauthn
            .start_passkey_registration(
                Uuid::from_bytes(*user_id.as_bytes()),
                user_name_for_webauthn,
                display_name,
                Some(exclude_credentials),
            )
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!(
                    "WebAuthn registration start failed: {:?}",
                    e
                ))
            })?;

        self.apply_registration_options(&mut ccr, attachment, policy)?;

        let state_json = self.serialize_registration_state(&reg_state, attachment, policy)?;

        let challenge_id = Uuid::new_v4();
        let challenge = WebAuthnChallenge {
            challenge_id,
            user_id: Some(user_id),
            state: state_json,
            challenge_type: "register".to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::seconds(self.config.challenge_ttl_seconds as i64),
        };

        repo.store_challenge(challenge).await?;

        Ok(RegistrationOptionsResponse {
            challenge_id,
            options: ccr,
        })
    }

    /// Complete passkey registration ceremony
    pub async fn finish_registration(
        &self,
        request: VerifyRegistrationRequest,
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<WebAuthnCredential, AppError> {
        let webauthn = self.get_webauthn().await?;

        let challenge = repo
            .consume_challenge(request.challenge_id)
            .await?
            .ok_or_else(|| AppError::Validation("Challenge expired or not found".into()))?;

        if challenge.challenge_type != "register" {
            return Err(AppError::Validation("Invalid challenge type".into()));
        }

        let user_id = challenge
            .user_id
            .ok_or_else(|| AppError::Internal(anyhow::anyhow!("Missing user_id in challenge")))?;

        let reg_state: PasskeyRegistration =
            serde_json::from_str(&challenge.state).map_err(|e| AppError::Internal(e.into()))?;

        let passkey = webauthn
            .finish_passkey_registration(&request.credential, &reg_state)
            .map_err(|e| {
                AppError::Validation(format!("Registration verification failed: {:?}", e))
            })?;

        let cred_id = URL_SAFE_NO_PAD.encode(passkey.cred_id());
        let passkey_json =
            serde_json::to_string(&passkey).map_err(|e| AppError::Internal(e.into()))?;

        let mut credential = WebAuthnCredential::new(
            user_id,
            cred_id,
            passkey_json,
            0,    // Initial sign count
            true, // Passkeys are discoverable by default
        );
        credential.label = request.label;

        let stored = repo.create_credential(credential).await?;
        Ok(stored)
    }

    /// Start passkey registration ceremony for a new (unauthenticated) signup.
    ///
    /// Unlike `start_registration`, this creates a challenge with type `register_new`
    /// and does not require an existing user or credentials. The ephemeral `user_id`
    /// will become the new user's ID after verification.
    ///
    /// `exclude_credential_ids` contains base64url-encoded credential IDs of ALL
    /// known passkeys. The browser checks these against the platform authenticator
    /// and throws `InvalidStateError` silently (no dialog) if the user already has
    /// a passkey, allowing the client to fall back to authentication.
    pub async fn start_registration_for_signup(
        &self,
        ephemeral_user_id: Uuid,
        exclude_credential_ids: &[String],
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<RegistrationOptionsResponse, AppError> {
        let webauthn = self.get_webauthn().await?;
        let attachment = self.authenticator_attachment()?;
        let policy = self.user_verification_policy();

        let exclude_credentials: Vec<CredentialID> = exclude_credential_ids
            .iter()
            .filter_map(|id| URL_SAFE_NO_PAD.decode(id).ok().map(CredentialID::from))
            .collect();

        let exclude = if exclude_credentials.is_empty() {
            None
        } else {
            Some(exclude_credentials)
        };

        let user_id_string = ephemeral_user_id.to_string();
        let (mut ccr, reg_state) = webauthn
            .start_passkey_registration(
                Uuid::from_bytes(*ephemeral_user_id.as_bytes()),
                &user_id_string,
                "User",
                exclude,
            )
            .map_err(|e| {
                AppError::Internal(anyhow::anyhow!(
                    "WebAuthn signup registration start failed: {:?}",
                    e
                ))
            })?;

        self.apply_registration_options(&mut ccr, attachment, policy)?;

        let state_json = self.serialize_registration_state(&reg_state, attachment, policy)?;

        let challenge_id = Uuid::new_v4();
        let challenge = WebAuthnChallenge {
            challenge_id,
            user_id: None, // no user row exists yet; avoids FK violation
            state: state_json,
            challenge_type: "register_new".to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::seconds(self.config.challenge_ttl_seconds as i64),
        };

        repo.store_challenge(challenge).await?;

        Ok(RegistrationOptionsResponse {
            challenge_id,
            options: ccr,
        })
    }

    /// Complete passkey registration ceremony for a new signup.
    ///
    /// Verifies the credential but does NOT persist it — the handler's atomic
    /// transaction must insert user + credential together (FK constraint).
    /// Returns the credential data needed for insertion.
    pub async fn finish_registration_for_signup(
        &self,
        request: VerifyRegistrationRequest,
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<WebAuthnCredential, AppError> {
        let webauthn = self.get_webauthn().await?;

        let challenge = repo
            .consume_challenge(request.challenge_id)
            .await?
            .ok_or_else(|| AppError::Validation("Challenge expired or not found".into()))?;

        if challenge.challenge_type != "register_new" {
            return Err(AppError::Validation("Invalid challenge type".into()));
        }

        let reg_state: PasskeyRegistration =
            serde_json::from_str(&challenge.state).map_err(|e| AppError::Internal(e.into()))?;

        let passkey = webauthn
            .finish_passkey_registration(&request.credential, &reg_state)
            .map_err(|e| {
                AppError::Validation(format!("Registration verification failed: {:?}", e))
            })?;

        let cred_id = URL_SAFE_NO_PAD.encode(passkey.cred_id());
        let passkey_json =
            serde_json::to_string(&passkey).map_err(|e| AppError::Internal(e.into()))?;

        // Build credential entity but do NOT persist — caller handles atomic insert
        let mut credential = WebAuthnCredential::new(
            Uuid::nil(), // placeholder; handler sets real user_id in the transaction
            cred_id,
            passkey_json,
            0,
            true,
        );
        credential.label = request.label;

        Ok(credential)
    }
}
