//! WebAuthn authentication ceremony methods (email-first + discoverable flows)

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{Duration, Utc};
use std::sync::Arc;
use uuid::Uuid;
use webauthn_rs::prelude::{DiscoverableAuthentication, Passkey, PasskeyAuthentication};

use crate::errors::AppError;
use crate::repositories::{WebAuthnChallenge, WebAuthnCredential, WebAuthnRepository};

use super::{AuthenticationOptionsResponse, VerifyAuthenticationRequest, WebAuthnService};

impl WebAuthnService {
    /// Start passkey authentication ceremony (email-first flow)
    pub async fn start_authentication(
        &self,
        user_id: Option<Uuid>,
        credentials: &[WebAuthnCredential],
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<AuthenticationOptionsResponse, AppError> {
        let webauthn = self.get_webauthn().await?;
        let policy = self.user_verification_policy();

        // Convert stored credentials to Passkey objects
        let passkeys: Vec<Passkey> = credentials
            .iter()
            .filter_map(|c| serde_json::from_str(&c.public_key).ok())
            .collect();

        if passkeys.is_empty() {
            return Err(AppError::NotFound("No passkeys registered for user".into()));
        }

        let (mut rcr, auth_state) =
            webauthn
                .start_passkey_authentication(&passkeys)
                .map_err(|e| {
                    AppError::Internal(anyhow::anyhow!(
                        "WebAuthn authentication start failed: {:?}",
                        e
                    ))
                })?;

        self.apply_authentication_options(&mut rcr, policy);

        let state_json = self.serialize_authentication_state(&auth_state, policy)?;

        let challenge_id = Uuid::new_v4();
        let challenge = WebAuthnChallenge {
            challenge_id,
            user_id,
            state: state_json,
            challenge_type: "authenticate".to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::seconds(self.config.challenge_ttl_seconds as i64),
        };

        repo.store_challenge(challenge).await?;

        Ok(AuthenticationOptionsResponse {
            challenge_id,
            options: rcr,
        })
    }

    /// S-16: Start discoverable (username-less) passkey authentication ceremony
    ///
    /// This allows users to authenticate without providing their username first.
    /// The authenticator will prompt the user to select a passkey, which contains
    /// the user's identity.
    pub async fn start_discoverable_authentication(
        &self,
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<AuthenticationOptionsResponse, AppError> {
        let webauthn = self.get_webauthn().await?;
        let policy = self.user_verification_policy();

        // Start discoverable authentication (no allowCredentials list)
        let (mut rcr, auth_state) = webauthn.start_discoverable_authentication().map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "WebAuthn discoverable auth start failed: {:?}",
                e
            ))
        })?;

        self.apply_authentication_options(&mut rcr, policy);

        let state_json = self.serialize_authentication_state(&auth_state, policy)?;

        let challenge_id = Uuid::new_v4();
        let challenge = WebAuthnChallenge {
            challenge_id,
            user_id: None, // No user known yet - will be determined from credential
            state: state_json,
            challenge_type: "discoverable".to_string(),
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::seconds(self.config.challenge_ttl_seconds as i64),
        };

        repo.store_challenge(challenge).await?;

        Ok(AuthenticationOptionsResponse {
            challenge_id,
            options: rcr,
        })
    }

    /// S-16: Complete discoverable (username-less) passkey authentication ceremony
    ///
    /// Returns the user ID and credential after successful authentication.
    pub async fn finish_discoverable_authentication(
        &self,
        request: VerifyAuthenticationRequest,
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<(Uuid, WebAuthnCredential), AppError> {
        let webauthn = self.get_webauthn().await?;

        let challenge = repo
            .consume_challenge(request.challenge_id)
            .await?
            .ok_or_else(|| AppError::Validation("Challenge expired or not found".into()))?;

        if challenge.challenge_type != "discoverable" {
            return Err(AppError::Validation(
                "Invalid challenge type for discoverable auth".into(),
            ));
        }

        // Deserialize the authentication state
        let auth_state: DiscoverableAuthentication =
            serde_json::from_str(&challenge.state).map_err(|e| AppError::Internal(e.into()))?;

        // Get the credential ID from the response to look up the user
        let cred_id_bytes: &[u8] = request.credential.id.as_ref();
        let cred_id = URL_SAFE_NO_PAD.encode(cred_id_bytes);

        // Find the credential and user
        let stored_credential = repo
            .find_by_credential_id(&cred_id)
            .await?
            .ok_or_else(|| AppError::InvalidCredentials)?;

        // Deserialize the stored passkey
        let passkey: Passkey = serde_json::from_str(&stored_credential.public_key)
            .map_err(|e| AppError::Internal(e.into()))?;

        // Verify the authentication response with discoverable flow
        let auth_result = webauthn
            .finish_discoverable_authentication(&request.credential, auth_state, &[passkey.into()])
            .map_err(|_| AppError::InvalidCredentials)?;

        // M-02: Validate sign count increased (detects cloned authenticators)
        let new_counter = auth_result.counter();
        let old_counter = stored_credential.sign_count;
        if new_counter <= old_counter && old_counter > 0 {
            tracing::warn!(
                credential_id = %stored_credential.credential_id,
                user_id = %stored_credential.user_id,
                old_counter = old_counter,
                new_counter = new_counter,
                "M-02: WebAuthn sign count did not increase - possible cloned authenticator"
            );
        }

        // SEC-05: Atomically update sign count and last_used_at
        repo.record_successful_auth(stored_credential.id, new_counter)
            .await?;

        Ok((stored_credential.user_id, stored_credential))
    }

    /// Complete passkey authentication ceremony
    pub async fn finish_authentication(
        &self,
        request: VerifyAuthenticationRequest,
        credentials: &[WebAuthnCredential],
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<(Uuid, WebAuthnCredential), AppError> {
        let webauthn = self.get_webauthn().await?;

        let challenge = repo
            .consume_challenge(request.challenge_id)
            .await?
            .ok_or_else(|| AppError::Validation("Challenge expired or not found".into()))?;

        if challenge.challenge_type != "authenticate" {
            return Err(AppError::Validation("Invalid challenge type".into()));
        }

        // Deserialize the authentication state
        let auth_state: PasskeyAuthentication =
            serde_json::from_str(&challenge.state).map_err(|e| AppError::Internal(e.into()))?;

        // Verify the authentication response
        let auth_result = webauthn
            .finish_passkey_authentication(&request.credential, &auth_state)
            .map_err(|_| AppError::InvalidCredentials)?;

        // Find the matching credential by credential ID
        let used_cred_id = URL_SAFE_NO_PAD.encode(auth_result.cred_id());
        let credential = credentials
            .iter()
            .find(|c| c.credential_id == used_cred_id)
            .ok_or_else(|| {
                AppError::Internal(anyhow::anyhow!(
                    "Credential not found after successful auth"
                ))
            })?;

        // M-02: Validate sign count increased (detects cloned authenticators)
        let new_counter = auth_result.counter();
        let old_counter = credential.sign_count;
        if new_counter <= old_counter && old_counter > 0 {
            tracing::warn!(
                credential_id = %credential.credential_id,
                user_id = %credential.user_id,
                old_counter = old_counter,
                new_counter = new_counter,
                "M-02: WebAuthn sign count did not increase - possible cloned authenticator"
            );
        }

        // SEC-05: Atomically update sign count and last_used_at
        repo.record_successful_auth(credential.id, new_counter)
            .await?;

        Ok((credential.user_id, credential.clone()))
    }
}
