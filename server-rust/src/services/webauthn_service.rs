//! WebAuthn service for passkeys and security keys
//!
//! Handles WebAuthn credential registration and authentication ceremonies.

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use uuid::Uuid;
use webauthn_rs::prelude::{
    AuthenticatorAttachment, CreationChallengeResponse, CredentialID, DiscoverableAuthentication,
    Passkey, PasskeyAuthentication, PasskeyRegistration, PublicKeyCredential,
    RegisterPublicKeyCredential, RequestChallengeResponse, Webauthn, WebauthnBuilder,
};
use webauthn_rs_proto::UserVerificationPolicy;

use crate::config::WebAuthnConfig;
use crate::errors::AppError;
use crate::repositories::{WebAuthnChallenge, WebAuthnCredential, WebAuthnRepository};

/// WebAuthn service for managing passkeys and security keys
pub struct WebAuthnService {
    webauthn: Option<Webauthn>,
    config: WebAuthnConfig,
}

/// Options returned to client for starting registration
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegistrationOptionsResponse {
    pub challenge_id: Uuid,
    pub options: CreationChallengeResponse,
}

/// Options returned to client for starting authentication
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthenticationOptionsResponse {
    pub challenge_id: Uuid,
    pub options: RequestChallengeResponse,
}

/// Request to verify registration
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyRegistrationRequest {
    pub challenge_id: Uuid,
    pub credential: RegisterPublicKeyCredential,
    pub label: Option<String>,
}

/// Request to verify authentication
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyAuthenticationRequest {
    pub challenge_id: Uuid,
    pub credential: PublicKeyCredential,
}

impl WebAuthnService {
    /// Create a new WebAuthn service
    pub fn new(config: &WebAuthnConfig) -> Self {
        let webauthn = if config.enabled {
            match Self::build_webauthn(config) {
                Ok(w) => Some(w),
                Err(e) => {
                    tracing::error!("Failed to initialize WebAuthn: {}", e);
                    None
                }
            }
        } else {
            None
        };

        Self {
            webauthn,
            config: config.clone(),
        }
    }

    fn build_webauthn(config: &WebAuthnConfig) -> Result<Webauthn, AppError> {
        let rp_id = config.rp_id.as_ref().ok_or_else(|| {
            AppError::Config("WEBAUTHN_RP_ID is required when WebAuthn is enabled".into())
        })?;

        let rp_origin = config.rp_origin.as_ref().ok_or_else(|| {
            AppError::Config("WEBAUTHN_RP_ORIGIN is required when WebAuthn is enabled".into())
        })?;

        let rp_name = config.rp_name.as_deref().unwrap_or("Cedros Login");

        let rp_origin_url = url::Url::parse(rp_origin)
            .map_err(|e| AppError::Config(format!("Invalid WEBAUTHN_RP_ORIGIN: {}", e)))?;

        let builder = WebauthnBuilder::new(rp_id, &rp_origin_url)
            .map_err(|e| AppError::Config(format!("Failed to create WebAuthn builder: {:?}", e)))?
            .rp_name(rp_name);

        builder
            .build()
            .map_err(|e| AppError::Config(format!("Failed to build WebAuthn instance: {:?}", e)))
    }

    fn get_webauthn(&self) -> Result<&Webauthn, AppError> {
        self.webauthn
            .as_ref()
            .ok_or_else(|| AppError::ServiceUnavailable("WebAuthn is not configured".into()))
    }

    fn user_verification_policy(&self) -> UserVerificationPolicy {
        if self.config.require_user_verification {
            UserVerificationPolicy::Required
        } else {
            UserVerificationPolicy::Preferred
        }
    }

    fn authenticator_attachment(&self) -> Result<Option<AuthenticatorAttachment>, AppError> {
        match (self.config.allow_platform, self.config.allow_cross_platform) {
            (true, true) => Ok(None),
            (true, false) => Ok(Some(AuthenticatorAttachment::Platform)),
            (false, true) => Ok(Some(AuthenticatorAttachment::CrossPlatform)),
            (false, false) => Err(AppError::Config(
                "WebAuthn requires at least one authenticator type (platform or cross-platform)"
                    .into(),
            )),
        }
    }

    fn apply_registration_options(
        &self,
        options: &mut CreationChallengeResponse,
        attachment: Option<AuthenticatorAttachment>,
        policy: UserVerificationPolicy,
    ) -> Result<(), AppError> {
        if let Some(selection) = options.public_key.authenticator_selection.as_mut() {
            selection.authenticator_attachment = attachment;
            selection.user_verification = policy;
            Ok(())
        } else {
            Err(AppError::Internal(anyhow::anyhow!(
                "WebAuthn registration options missing authenticator selection",
            )))
        }
    }

    fn apply_authentication_options(
        &self,
        options: &mut RequestChallengeResponse,
        policy: UserVerificationPolicy,
    ) {
        options.public_key.user_verification = policy;
    }

    fn serialize_registration_state(
        &self,
        reg_state: &PasskeyRegistration,
        attachment: Option<AuthenticatorAttachment>,
        policy: UserVerificationPolicy,
    ) -> Result<String, AppError> {
        let mut value =
            serde_json::to_value(reg_state).map_err(|e| AppError::Internal(e.into()))?;
        self.update_state_policy(&mut value, "rs", policy)?;
        self.update_state_authenticator_attachment(&mut value, attachment)?;
        serde_json::to_string(&value).map_err(|e| AppError::Internal(e.into()))
    }

    fn serialize_authentication_state<T: Serialize>(
        &self,
        auth_state: &T,
        policy: UserVerificationPolicy,
    ) -> Result<String, AppError> {
        let mut value =
            serde_json::to_value(auth_state).map_err(|e| AppError::Internal(e.into()))?;
        self.update_state_policy(&mut value, "ast", policy)?;
        serde_json::to_string(&value).map_err(|e| AppError::Internal(e.into()))
    }

    fn update_state_policy(
        &self,
        value: &mut Value,
        state_key: &str,
        policy: UserVerificationPolicy,
    ) -> Result<(), AppError> {
        let state = self.get_state_object_mut(value, state_key)?;
        state.insert(
            "policy".to_string(),
            serde_json::to_value(policy).map_err(|e| AppError::Internal(e.into()))?,
        );
        Ok(())
    }

    fn update_state_authenticator_attachment(
        &self,
        value: &mut Value,
        attachment: Option<AuthenticatorAttachment>,
    ) -> Result<(), AppError> {
        let state = self.get_state_object_mut(value, "rs")?;
        state.insert(
            "authenticator_attachment".to_string(),
            serde_json::to_value(attachment).map_err(|e| AppError::Internal(e.into()))?,
        );
        Ok(())
    }

    fn get_state_object_mut<'a>(
        &self,
        value: &'a mut Value,
        state_key: &str,
    ) -> Result<&'a mut serde_json::Map<String, Value>, AppError> {
        let obj = value.as_object_mut().ok_or_else(|| {
            AppError::Internal(anyhow::anyhow!(
                "WebAuthn state serialization expected object root",
            ))
        })?;
        obj.get_mut(state_key)
            .and_then(|state| state.as_object_mut())
            .ok_or_else(|| {
                AppError::Internal(anyhow::anyhow!(
                    "WebAuthn state serialization missing {} object",
                    state_key,
                ))
            })
    }

    /// Start passkey registration ceremony
    pub async fn start_registration(
        &self,
        user_id: Uuid,
        user_email: Option<&str>,
        user_name: Option<&str>,
        existing_credentials: &[WebAuthnCredential],
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<RegistrationOptionsResponse, AppError> {
        let webauthn = self.get_webauthn()?;
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
        // user_id.as_bytes() returns &[u8; 16] which is exactly what we need
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

        // Serialize and store the registration state
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
        let webauthn = self.get_webauthn()?;

        // Retrieve and consume the challenge
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

        // Deserialize the registration state
        let reg_state: PasskeyRegistration =
            serde_json::from_str(&challenge.state).map_err(|e| AppError::Internal(e.into()))?;

        // Verify the registration response
        let passkey = webauthn
            .finish_passkey_registration(&request.credential, &reg_state)
            .map_err(|e| {
                AppError::Validation(format!("Registration verification failed: {:?}", e))
            })?;

        // Extract credential data
        let cred_id = URL_SAFE_NO_PAD.encode(passkey.cred_id());

        // Serialize the passkey for storage
        let passkey_json =
            serde_json::to_string(&passkey).map_err(|e| AppError::Internal(e.into()))?;

        // Create and store the credential
        let mut credential = WebAuthnCredential::new(
            user_id,
            cred_id,
            passkey_json,
            0,    // Initial sign count
            true, // Passkeys are discoverable by default
        );

        // Set additional properties
        credential.label = request.label;

        let stored = repo.create_credential(credential).await?;
        Ok(stored)
    }

    /// Start passkey authentication ceremony (email-first flow)
    pub async fn start_authentication(
        &self,
        user_id: Option<Uuid>,
        credentials: &[WebAuthnCredential],
        repo: &Arc<dyn WebAuthnRepository>,
    ) -> Result<AuthenticationOptionsResponse, AppError> {
        let webauthn = self.get_webauthn()?;
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

        // Serialize and store the authentication state
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
        let webauthn = self.get_webauthn()?;
        let policy = self.user_verification_policy();

        // Start discoverable authentication (no allowCredentials list)
        let (mut rcr, auth_state) = webauthn.start_discoverable_authentication().map_err(|e| {
            AppError::Internal(anyhow::anyhow!(
                "WebAuthn discoverable auth start failed: {:?}",
                e
            ))
        })?;

        self.apply_authentication_options(&mut rcr, policy);

        // Serialize and store the authentication state
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
        let webauthn = self.get_webauthn()?;

        // Retrieve and consume the challenge
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
            // Counter didn't increase - potential cloned authenticator
            // Per WebAuthn spec, we log a warning but still allow authentication
            // (some authenticators don't increment counter properly)
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
        let webauthn = self.get_webauthn()?;

        // Retrieve and consume the challenge
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
            // Counter didn't increase - potential cloned authenticator
            // Per WebAuthn spec, we log a warning but still allow authentication
            // (some authenticators don't increment counter properly)
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

    /// Check if WebAuthn is enabled
    pub fn is_enabled(&self) -> bool {
        self.webauthn.is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::repositories::{InMemoryWebAuthnRepository, WebAuthnRepository};

    #[test]
    fn test_webauthn_service_disabled() {
        let config = WebAuthnConfig::default();
        let service = WebAuthnService::new(&config);
        assert!(!service.is_enabled());
    }

    #[test]
    fn test_webauthn_service_enabled_requires_config() {
        let config = WebAuthnConfig {
            enabled: true,
            rp_id: None, // Missing required config
            rp_name: None,
            rp_origin: None,
            ..Default::default()
        };
        let service = WebAuthnService::new(&config);
        // Should fail gracefully
        assert!(!service.is_enabled());
    }

    #[tokio::test]
    async fn test_webauthn_registration_applies_config_options() {
        let config = WebAuthnConfig {
            enabled: true,
            rp_id: Some("example.com".to_string()),
            rp_name: None,
            rp_origin: Some("https://login.example.com".to_string()),
            allow_platform: true,
            allow_cross_platform: false,
            require_user_verification: false,
            ..Default::default()
        };
        let service = WebAuthnService::new(&config);
        let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());
        let user_id = Uuid::new_v4();

        let response = service
            .start_registration(user_id, Some("user@example.com"), Some("User"), &[], &repo)
            .await
            .expect("registration start");

        let selection = response
            .options
            .public_key
            .authenticator_selection
            .as_ref()
            .expect("authenticator selection");
        assert_eq!(
            selection.authenticator_attachment,
            Some(AuthenticatorAttachment::Platform)
        );
        assert_eq!(
            selection.user_verification,
            UserVerificationPolicy::Preferred
        );

        let challenge = repo
            .find_challenge(response.challenge_id)
            .await
            .expect("find challenge")
            .expect("challenge present");
        let state: Value = serde_json::from_str(&challenge.state).expect("state json");
        assert_eq!(state["rs"]["policy"], "preferred");
        assert_eq!(state["rs"]["authenticator_attachment"], "platform");
    }

    #[tokio::test]
    async fn test_webauthn_discoverable_auth_applies_policy() {
        let config = WebAuthnConfig {
            enabled: true,
            rp_id: Some("example.com".to_string()),
            rp_name: None,
            rp_origin: Some("https://login.example.com".to_string()),
            require_user_verification: false,
            ..Default::default()
        };
        let service = WebAuthnService::new(&config);
        let repo: Arc<dyn WebAuthnRepository> = Arc::new(InMemoryWebAuthnRepository::new());

        let response = service
            .start_discoverable_authentication(&repo)
            .await
            .expect("discoverable start");

        assert_eq!(
            response.options.public_key.user_verification,
            UserVerificationPolicy::Preferred
        );

        let challenge = repo
            .find_challenge(response.challenge_id)
            .await
            .expect("find challenge")
            .expect("challenge present");
        let state: Value = serde_json::from_str(&challenge.state).expect("state json");
        assert_eq!(state["ast"]["policy"], "preferred");
    }
}
