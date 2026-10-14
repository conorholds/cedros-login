//! Authoritative system-setting capability and validation registry.
//!
//! The standalone server imports this module directly. The Wasm adapter imports
//! the same source file so both runtimes enforce identical value semantics while
//! selecting runtime-specific application modes.

use serde::{Deserialize, Serialize};
#[path = "settings_registry/specs.rs"]
mod specs;
#[path = "settings_registry/validation.rs"]
mod validation;

use specs::standalone_spec;
pub use validation::validate_setting_value;

const BOOL: SettingValueKind = SettingValueKind::Boolean;
const TEXT: SettingValueKind = SettingValueKind::Text {
    allow_empty: true,
    max_len: 1_024,
};
const SECRET: SettingValueKind = SettingValueKind::Text {
    allow_empty: true,
    max_len: 16_384,
};

/// Runtime whose executable capabilities are being described.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SettingsRuntime {
    // This shared source is compiled independently into the Wasm crate, where
    // only the `Wasm` variant is constructed. The standalone crate constructs
    // both variants in parity tests.
    #[allow(dead_code)]
    Standalone,
    Wasm,
}

/// When a validated setting takes effect in the selected runtime.
#[derive(Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ApplicationMode {
    #[default]
    Hot,
    Restart,
    HostOwned,
    Unsupported,
}

impl ApplicationMode {
    pub fn is_writable(self) -> bool {
        matches!(self, Self::Hot | Self::Restart)
    }
}

/// Typed validation constraints for a persisted string setting.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SettingValueKind {
    Boolean,
    Integer { min: u64, max: u64 },
    Text { allow_empty: bool, max_len: usize },
    Enum(&'static [&'static str]),
    HttpUrl { allow_empty: bool },
    Origin { allow_empty: bool },
    OriginList,
    Host { allow_empty: bool },
    Email { allow_empty: bool },
    InternalPath { allow_empty: bool },
    UrlOrPath { allow_empty: bool },
    CsvPermutation(&'static [&'static str]),
    CsvUnique(&'static [&'static str]),
}

/// Executable contract for one known setting in one runtime.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct SettingSpec {
    pub kind: SettingValueKind,
    pub application_mode: ApplicationMode,
}

/// Return the typed specification for a persisted setting key.
pub fn setting_spec(key: &str, runtime: SettingsRuntime) -> Option<SettingSpec> {
    let (kind, standalone_mode) = standalone_spec(key)?;
    let application_mode = match runtime {
        SettingsRuntime::Standalone => standalone_mode,
        SettingsRuntime::Wasm => wasm_mode(key),
    };
    Some(SettingSpec {
        kind,
        application_mode,
    })
}

fn wasm_mode(key: &str) -> ApplicationMode {
    use ApplicationMode::{HostOwned, Hot, Unsupported};
    match key {
        "server_base_path" | "server_environment" | "server_log_format" | "server_trust_proxy" => {
            HostOwned
        }
        "auth_apple_client_id"
        | "auth_apple_enabled"
        | "auth_email_block_disposable"
        | "auth_email_enabled"
        | "auth_email_require_verification"
        | "auth_google_client_id"
        | "auth_google_enabled"
        | "auth_instantlink_enabled"
        | "auth_new_device_alert_enabled"
        | "auth_instantlink_expiry"
        | "auth_solana_challenge_expiry"
        | "auth_solana_enabled"
        | "auth_webauthn_enabled"
        | "auth_webauthn_rp_id"
        | "auth_webauthn_rp_name"
        | "auth_webauthn_rp_origin"
        | "email_subject_instant_link"
        | "email_subject_invite"
        | "email_subject_password_reset"
        | "email_subject_security_alert"
        | "email_subject_verification"
        | "feature_sso"
        | "invite_codes_enabled"
        | "invite_codes_per_user"
        | "invite_codes_reset_interval_days"
        | "invite_codes_users_can_issue"
        | "auth_avatar_upload_enabled"
        | "signup_limit_enabled"
        | "signup_limit_max"
        | "signup_limit_period"
        | "signup_limit_show_remaining"
        | "signup_access_code_enabled"
        | "signup_access_code"
        | "sso_callback_url"
        | "postlogin_redirect_url"
        | "postlogin_username_enabled"
        | "subscription_selection_required"
        | "subscription_selection_route"
        | "subscription_selection_pay_base_url"
        | "security_require_mfa"
        | "server_frontend_url"
        | "ui_social_button_order" => Hot,
        _ => Unsupported,
    }
}

#[cfg(test)]
#[path = "settings_registry/tests.rs"]
mod tests;
