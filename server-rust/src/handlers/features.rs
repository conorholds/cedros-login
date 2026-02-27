//! Public auth feature discovery endpoint
//!
//! Returns which authentication methods are enabled, merging static `Config`
//! defaults with runtime `SettingsService` overrides (60 s DB cache).

use axum::extract::State;
use axum::Json;
use serde::Serialize;
use std::sync::Arc;

use crate::callback::AuthCallback;
use crate::services::EmailService;
use crate::AppState;

/// Response for `GET /features` — which auth methods the server allows.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthFeaturesResponse {
    pub email: bool,
    pub google: bool,
    pub apple: bool,
    pub solana: bool,
    pub webauthn: bool,
    pub instant_link: bool,
}

/// GET /features — lightweight public endpoint for UI feature discovery.
///
/// Reads each `auth_*_enabled` key from `SettingsService` (cached) and falls
/// back to the static `Config` value when the key is absent or unparseable.
pub async fn auth_features<C: AuthCallback + 'static, E: EmailService + 'static>(
    State(state): State<Arc<AppState<C, E>>>,
) -> Json<AuthFeaturesResponse> {
    let ss = &state.settings_service;
    let cfg = &state.config;

    let email = ss
        .get_bool("auth_email_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(cfg.email.enabled);

    let google = ss
        .get_bool("auth_google_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(cfg.google.enabled);

    let apple = ss
        .get_bool("auth_apple_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(cfg.apple.enabled);

    let solana = ss
        .get_bool("auth_solana_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(cfg.solana.enabled);

    let webauthn = ss
        .get_bool("auth_webauthn_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(cfg.webauthn.enabled);

    let instant_link = ss
        .get_bool("auth_instantlink_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(cfg.email.enabled);

    Json(AuthFeaturesResponse {
        email,
        google,
        apple,
        solana,
        webauthn,
        instant_link,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn response_serializes_as_camel_case() {
        let resp = AuthFeaturesResponse {
            email: true,
            google: false,
            apple: true,
            solana: false,
            webauthn: true,
            instant_link: false,
        };

        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("\"instantLink\":false"));
        assert!(json.contains("\"webauthn\":true"));
        assert!(!json.contains("instant_link"));
    }
}
