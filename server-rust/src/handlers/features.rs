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
///
/// Optional `google_client_id` and `apple_client_id` are included when the
/// respective provider is enabled, so the frontend can auto-configure OAuth
/// buttons without the embedder duplicating credentials in UI config.
/// These are public values (embedded in HTML by Google/Apple SDKs).
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthFeaturesResponse {
    pub email: bool,
    pub google: bool,
    pub apple: bool,
    pub solana: bool,
    pub webauthn: bool,
    pub instant_link: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub google_client_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub apple_client_id: Option<String>,
    /// Whether post-login username selection is enabled.
    pub username_enabled: bool,
    /// Whether post-login wallet enrollment is enabled.
    pub wallet_enroll_enabled: bool,
    /// Whether to show recovery info screen after wallet enrollment.
    pub show_recovery_enabled: bool,
    /// Display order for social login buttons (e.g. `["webauthn","google","apple","solana"]`).
    pub social_button_order: Vec<String>,
    /// Whether KYC identity verification is enabled.
    pub kyc_enabled: bool,
    /// Current KYC enforcement mode: `"none"`, `"optional"`, `"withdrawals"`, `"deposits"`, `"all"`.
    pub kyc_enforcement_mode: String,
    /// Whether accredited investor verification is enabled.
    pub accreditation_enabled: bool,
    /// Accreditation enforcement: `"none"`, `"optional"`, `"required"`.
    pub accreditation_enforcement_mode: String,
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

    // Resolve client IDs only when the provider is enabled.
    // Pattern matches google.rs:140 / apple.rs:140 — runtime setting > static config.
    let google_client_id = if google {
        ss.get("auth_google_client_id")
            .await
            .ok()
            .flatten()
            .filter(|s| !s.is_empty())
            .or_else(|| cfg.google.client_id.clone())
    } else {
        None
    };

    let apple_client_id = if apple {
        ss.get("auth_apple_client_id")
            .await
            .ok()
            .flatten()
            .filter(|s| !s.is_empty())
            .or_else(|| cfg.apple.client_id.clone())
    } else {
        None
    };

    let username_enabled = ss
        .get_bool("postlogin_username_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);

    let wallet_enroll_enabled = ss
        .get_bool("postlogin_wallet_enroll_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);

    let show_recovery_enabled = ss
        .get_bool("postlogin_show_recovery_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);

    let default_order: Vec<String> = vec![
        "webauthn".into(),
        "google".into(),
        "apple".into(),
        "solana".into(),
    ];
    let social_button_order = ss
        .get("ui_social_button_order")
        .await
        .ok()
        .flatten()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|p| p.trim().to_string()).collect::<Vec<_>>())
        .unwrap_or(default_order);

    let kyc_enabled = ss
        .get_bool("kyc_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);

    let kyc_enforcement_mode = ss
        .get("kyc_enforcement_mode")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "none".to_string());

    let accreditation_enabled = ss
        .get_bool("accreditation_enabled")
        .await
        .ok()
        .flatten()
        .unwrap_or(false);

    let accreditation_enforcement_mode = ss
        .get("accreditation_enforcement_mode")
        .await
        .ok()
        .flatten()
        .unwrap_or_else(|| "none".to_string());

    Json(AuthFeaturesResponse {
        email,
        google,
        apple,
        solana,
        webauthn,
        instant_link,
        google_client_id,
        apple_client_id,
        username_enabled,
        wallet_enroll_enabled,
        show_recovery_enabled,
        social_button_order,
        kyc_enabled,
        kyc_enforcement_mode,
        accreditation_enabled,
        accreditation_enforcement_mode,
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
            google_client_id: None,
            apple_client_id: None,
            username_enabled: false,
            wallet_enroll_enabled: false,
            show_recovery_enabled: false,
            social_button_order: vec!["webauthn".into(), "google".into()],
            kyc_enabled: false,
            kyc_enforcement_mode: "none".to_string(),
            accreditation_enabled: false,
            accreditation_enforcement_mode: "none".to_string(),
        };

        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("\"instantLink\":false"));
        assert!(json.contains("\"webauthn\":true"));
        assert!(!json.contains("instant_link"));
        // None values are omitted via skip_serializing_if
        assert!(!json.contains("googleClientId"));
        assert!(!json.contains("appleClientId"));
        assert!(json.contains("\"socialButtonOrder\":[\"webauthn\",\"google\"]"));
        assert!(json.contains("\"kycEnabled\":false"));
        assert!(json.contains("\"kycEnforcementMode\":\"none\""));
    }

    #[test]
    fn response_includes_client_ids_when_present() {
        let resp = AuthFeaturesResponse {
            email: true,
            google: true,
            apple: true,
            solana: false,
            webauthn: false,
            instant_link: false,
            google_client_id: Some("goog-123.apps.googleusercontent.com".into()),
            apple_client_id: Some("com.example.auth".into()),
            username_enabled: false,
            wallet_enroll_enabled: false,
            show_recovery_enabled: false,
            social_button_order: vec![
                "webauthn".into(),
                "google".into(),
                "apple".into(),
                "solana".into(),
            ],
            kyc_enabled: false,
            kyc_enforcement_mode: "none".to_string(),
            accreditation_enabled: false,
            accreditation_enforcement_mode: "none".to_string(),
        };

        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("\"googleClientId\":\"goog-123.apps.googleusercontent.com\""));
        assert!(json.contains("\"appleClientId\":\"com.example.auth\""));
    }
}
