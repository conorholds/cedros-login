//! WebAuthn service for passkeys and security keys
//!
//! Handles WebAuthn credential registration and authentication ceremonies.
//!
//! Split into submodules:
//! - `registration` — start/finish registration (authenticated + signup)
//! - `authentication` — start/finish authentication (email-first + discoverable)

mod authentication;
mod registration;
#[cfg(test)]
mod tests;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use webauthn_rs::prelude::{
    AuthenticatorAttachment, CreationChallengeResponse, PublicKeyCredential,
    RegisterPublicKeyCredential, RequestChallengeResponse, Webauthn, WebauthnBuilder,
};
use webauthn_rs_proto::UserVerificationPolicy;

use crate::config::WebAuthnConfig;
use crate::errors::AppError;
use crate::services::SettingsService;

/// Cached Webauthn instance with the RP config it was built from
struct CachedWebauthn {
    webauthn: Option<Arc<Webauthn>>,
    rp_id: String,
    rp_origin: String,
    rp_name: String,
}

/// WebAuthn service for managing passkeys and security keys
pub struct WebAuthnService {
    cached_webauthn: RwLock<CachedWebauthn>,
    pub(crate) config: WebAuthnConfig,
    settings_service: Arc<SettingsService>,
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
    pub fn new(config: &WebAuthnConfig, settings_service: Arc<SettingsService>) -> Self {
        let rp_id = config.rp_id.clone().unwrap_or_default();
        let rp_origin = config.rp_origin.clone().unwrap_or_default();
        let rp_name = config
            .rp_name
            .clone()
            .unwrap_or_else(|| "Cedros Login".to_string());

        let webauthn = if config.enabled {
            match Self::build_webauthn(&rp_id, &rp_origin, &rp_name) {
                Ok(w) => Some(Arc::new(w)),
                Err(e) => {
                    tracing::error!("Failed to initialize WebAuthn: {}", e);
                    None
                }
            }
        } else {
            None
        };

        Self {
            cached_webauthn: RwLock::new(CachedWebauthn {
                webauthn,
                rp_id,
                rp_origin,
                rp_name,
            }),
            config: config.clone(),
            settings_service,
        }
    }

    fn build_webauthn(rp_id: &str, rp_origin: &str, rp_name: &str) -> Result<Webauthn, AppError> {
        if rp_id.is_empty() {
            return Err(AppError::Config(
                "WEBAUTHN_RP_ID is required when WebAuthn is enabled".into(),
            ));
        }
        if rp_origin.is_empty() {
            return Err(AppError::Config(
                "WEBAUTHN_RP_ORIGIN is required when WebAuthn is enabled".into(),
            ));
        }

        let rp_origin_url = url::Url::parse(rp_origin)
            .map_err(|e| AppError::Config(format!("Invalid WEBAUTHN_RP_ORIGIN: {}", e)))?;

        let builder = WebauthnBuilder::new(rp_id, &rp_origin_url)
            .map_err(|e| AppError::Config(format!("Failed to create WebAuthn builder: {:?}", e)))?
            .rp_name(rp_name);

        builder
            .build()
            .map_err(|e| AppError::Config(format!("Failed to build WebAuthn instance: {:?}", e)))
    }

    /// Resolve current RP config from SettingsService, falling back to static config
    async fn resolve_rp_config(&self) -> (String, String, String) {
        let rp_id = self
            .settings_service
            .get("auth_webauthn_rp_id")
            .await
            .ok()
            .flatten()
            .or_else(|| self.config.rp_id.clone())
            .unwrap_or_default();

        let rp_origin = self
            .settings_service
            .get("auth_webauthn_rp_origin")
            .await
            .ok()
            .flatten()
            .or_else(|| self.config.rp_origin.clone())
            .unwrap_or_default();

        let rp_name = self
            .settings_service
            .get("auth_webauthn_rp_name")
            .await
            .ok()
            .flatten()
            .or_else(|| self.config.rp_name.clone())
            .unwrap_or_else(|| "Cedros Login".to_string());

        (rp_id, rp_origin, rp_name)
    }

    /// Get or rebuild the cached Webauthn instance if RP config has changed
    pub(crate) async fn get_webauthn(&self) -> Result<Arc<Webauthn>, AppError> {
        let (rp_id, rp_origin, rp_name) = self.resolve_rp_config().await;

        // Fast path: read lock, check if cached instance matches
        {
            let cache = self.cached_webauthn.read().await;
            if cache.rp_id == rp_id
                && cache.rp_origin == rp_origin
                && cache.rp_name == rp_name
            {
                if let Some(ref w) = cache.webauthn {
                    return Ok(Arc::clone(w));
                }
            }
        }

        // Slow path: write lock, rebuild
        let mut cache = self.cached_webauthn.write().await;
        // Double-check after acquiring write lock
        if cache.rp_id == rp_id && cache.rp_origin == rp_origin && cache.rp_name == rp_name {
            if let Some(ref w) = cache.webauthn {
                return Ok(Arc::clone(w));
            }
        }

        let webauthn = Arc::new(Self::build_webauthn(&rp_id, &rp_origin, &rp_name)?);
        cache.webauthn = Some(Arc::clone(&webauthn));
        cache.rp_id = rp_id;
        cache.rp_origin = rp_origin;
        cache.rp_name = rp_name;
        Ok(webauthn)
    }

    pub(crate) fn user_verification_policy(&self) -> UserVerificationPolicy {
        if self.config.require_user_verification {
            UserVerificationPolicy::Required
        } else {
            UserVerificationPolicy::Preferred
        }
    }

    pub(crate) fn authenticator_attachment(
        &self,
    ) -> Result<Option<AuthenticatorAttachment>, AppError> {
        match (self.config.allow_platform, self.config.allow_cross_platform) {
            // When both are allowed, prefer platform (Touch ID / Windows Hello) so the
            // browser doesn't confuse users by defaulting to cross-device QR scan.
            // Set allow_cross_platform=false explicitly if you only want platform auth.
            (true, true) | (true, false) => Ok(Some(AuthenticatorAttachment::Platform)),
            (false, true) => Ok(Some(AuthenticatorAttachment::CrossPlatform)),
            (false, false) => Err(AppError::Config(
                "WebAuthn requires at least one authenticator type (platform or cross-platform)"
                    .into(),
            )),
        }
    }

    pub(crate) fn apply_registration_options(
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

    pub(crate) fn apply_authentication_options(
        &self,
        options: &mut RequestChallengeResponse,
        policy: UserVerificationPolicy,
    ) {
        options.public_key.user_verification = policy;
    }

    pub(crate) fn serialize_registration_state(
        &self,
        reg_state: &webauthn_rs::prelude::PasskeyRegistration,
        attachment: Option<AuthenticatorAttachment>,
        policy: UserVerificationPolicy,
    ) -> Result<String, AppError> {
        let mut value =
            serde_json::to_value(reg_state).map_err(|e| AppError::Internal(e.into()))?;
        self.update_state_policy(&mut value, "rs", policy)?;
        self.update_state_authenticator_attachment(&mut value, attachment)?;
        serde_json::to_string(&value).map_err(|e| AppError::Internal(e.into()))
    }

    pub(crate) fn serialize_authentication_state<T: Serialize>(
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

    /// Check if WebAuthn is enabled (based on static config)
    pub fn is_enabled(&self) -> bool {
        self.config.enabled
    }
}
