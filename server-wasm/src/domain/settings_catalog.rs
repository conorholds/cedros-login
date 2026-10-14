//! Cedros Wasm system-settings allowlist: (key, category, default).
//! This overlaps the standalone server's migration-seeded `system_settings`,
//! but it is intentionally scoped to settings the host runtime exposes to the
//! Wasm extension. It drives GET /admin/settings and PATCH key validation in
//! the Wasm adapter.

/// One catalog entry: stable key, UI category, seed default, and whether the
/// value is secret (redacted on read).
pub struct SettingDef {
    pub key: &'static str,
    pub category: &'static str,
    pub default: &'static str,
    pub is_secret: bool,
}

/// The runtime-configurable system settings the admin UI renders. Operational
/// knobs that the host owns or that the wasm never reads were dropped — notifications
/// (webhooks), logging/metrics, object storage, CORS, session timeout, cookie
/// domain/secure/same-site, JWT issuer/audience, and rate limits — leaving the
/// settings an operator actually configures (auth providers, branding, post-login,
/// social-button order, 2FA policy). `feature_mfa` is grouped under `security` so the
/// 2FA toggle renders in the Auth → Security sub-tab.
pub const SETTINGS: &[SettingDef] = &[
    SettingDef {
        key: "auth_apple_client_id",
        category: "auth.apple",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "auth_apple_enabled",
        category: "auth.apple",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "auth_apple_team_id",
        category: "auth.apple",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "auth_email_block_disposable",
        category: "auth.email",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "auth_email_enabled",
        category: "auth.email",
        default: "true",
        is_secret: false,
    },
    SettingDef {
        key: "auth_email_require_verification",
        category: "auth.email",
        default: "true",
        is_secret: false,
    },
    SettingDef {
        key: "auth_google_client_id",
        category: "auth.google",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "auth_google_enabled",
        category: "auth.google",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "auth_instantlink_enabled",
        category: "auth.instantlink",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "auth_new_device_alert_enabled",
        category: "security",
        default: "true",
        is_secret: false,
    },
    SettingDef {
        key: "auth_instantlink_expiry",
        category: "auth.instantlink",
        default: "900",
        is_secret: false,
    },
    SettingDef {
        key: "auth_instantlink_rate_limit",
        category: "auth.instantlink",
        default: "5",
        is_secret: false,
    },
    SettingDef {
        key: "auth_solana_challenge_expiry",
        category: "auth.solana",
        default: "300",
        is_secret: false,
    },
    SettingDef {
        key: "auth_solana_enabled",
        category: "auth.solana",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "auth_webauthn_enabled",
        category: "auth.webauthn",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "auth_webauthn_rp_id",
        category: "auth.webauthn",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "auth_webauthn_rp_name",
        category: "auth.webauthn",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "auth_webauthn_rp_origin",
        category: "auth.webauthn",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "email_subject_instant_link",
        category: "email",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "email_subject_invite",
        category: "email",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "email_subject_password_reset",
        category: "email",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "email_subject_security_alert",
        category: "email",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "email_subject_verification",
        category: "email",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "feature_instant_link",
        category: "features",
        default: "true",
        is_secret: false,
    },
    SettingDef {
        key: "feature_mfa",
        category: "security",
        default: "true",
        is_secret: false,
    },
    SettingDef {
        key: "feature_organizations",
        category: "features",
        default: "true",
        is_secret: false,
    },
    SettingDef {
        key: "feature_sso",
        category: "features",
        default: "false",
        is_secret: false,
    },
    // Invite-code registration gate + user-issued codes. Bound in the wasm
    // runtime (routes::invite_codes + the register/login gate); defaults mirror
    // the standalone `invite_codes` migration.
    SettingDef {
        key: "invite_codes_enabled",
        category: "auth.invite_codes",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "invite_codes_users_can_issue",
        category: "auth.invite_codes",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "invite_codes_per_user",
        category: "auth.invite_codes",
        default: "0",
        is_secret: false,
    },
    SettingDef {
        key: "invite_codes_reset_interval_days",
        category: "auth.invite_codes",
        default: "30",
        is_secret: false,
    },
    SettingDef {
        key: "signup_limit_enabled",
        category: "auth.signup_limits",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "signup_limit_period",
        category: "auth.signup_limits",
        default: "monthly",
        is_secret: false,
    },
    SettingDef {
        key: "signup_limit_max",
        category: "auth.signup_limits",
        default: "100",
        is_secret: false,
    },
    SettingDef {
        key: "signup_limit_show_remaining",
        category: "auth.signup_limits",
        default: "false",
        is_secret: false,
    },
    // Read by the runtime but previously absent from the catalog — uneditable via
    // the admin settings API (PATCH validates against this list) and never
    // surfaced on GET. Added with fail-closed defaults.
    SettingDef {
        key: "auth_avatar_upload_enabled",
        category: "features",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "signup_access_code_enabled",
        category: "security",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "signup_access_code",
        category: "security",
        default: "",
        is_secret: true,
    },
    SettingDef {
        key: "sso_callback_url",
        category: "features",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "postlogin_complete_enabled",
        category: "postlogin.complete",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "postlogin_redirect_url",
        category: "postlogin",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "postlogin_username_enabled",
        category: "postlogin.username",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "postlogin_welcome_enabled",
        category: "postlogin.welcome",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "postlogin_welcome_route",
        category: "postlogin.welcome",
        default: "/welcome",
        is_secret: false,
    },
    // Required subscription-plan selection gate (post-login). Surfaces the
    // "Subscription selection" box on the admin Auth → Behavior tab; the React
    // `SubscriptionSelectionSettings` panel hides itself unless these keys are
    // returned by GET /admin/settings. Defaults mirror the standalone server's
    // `default_settings()` / `subscription_selection_gate` migration.
    SettingDef {
        key: "subscription_selection_required",
        category: "postlogin.subscription",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "subscription_selection_route",
        category: "postlogin.subscription",
        default: "/subscribe",
        is_secret: false,
    },
    SettingDef {
        key: "security_require_mfa",
        category: "security",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "server_base_path",
        category: "server",
        default: "/auth",
        is_secret: false,
    },
    SettingDef {
        key: "server_environment",
        category: "server",
        default: "development",
        is_secret: false,
    },
    SettingDef {
        key: "server_frontend_url",
        category: "server",
        default: "",
        is_secret: false,
    },
    SettingDef {
        key: "server_log_format",
        category: "server",
        default: "json",
        is_secret: false,
    },
    SettingDef {
        key: "server_trust_proxy",
        category: "server",
        default: "false",
        is_secret: false,
    },
    SettingDef {
        key: "ui_social_button_order",
        category: "ui",
        default: "webauthn,google,apple,solana",
        is_secret: false,
    },
];

/// Whether `key` is a known system setting (PATCH validation; fail closed).
pub fn is_known(key: &str) -> bool {
    SETTINGS.iter().any(|s| s.key == key)
}

#[cfg(test)]
mod tests {
    use super::*;

    const SETTINGS_CATALOG_CONTRACT: &str =
        include_str!("../../../contracts/src/settings-catalog.json");

    fn settings_catalog_contract_json() -> String {
        use std::fmt::Write as _;

        let mut json = String::from("{\n  \"settings\": [\n");
        for (index, setting) in SETTINGS.iter().enumerate() {
            let comma = if index + 1 == SETTINGS.len() { "" } else { "," };
            writeln!(
                json,
                "    {{\"key\":{},\"category\":{},\"isSecret\": {}}}{}",
                serde_json::to_string(setting.key).expect("setting key serializes"),
                serde_json::to_string(setting.category).expect("setting category serializes"),
                setting.is_secret,
                comma
            )
            .expect("settings catalog contract renders");
        }
        json.push_str("  ]\n}\n");
        json
    }

    #[test]
    fn settings_catalog_contract_matches_settings() {
        assert_eq!(
            SETTINGS_CATALOG_CONTRACT,
            settings_catalog_contract_json(),
            "contracts/src/settings-catalog.json drifted from server-wasm SETTINGS; update the contract from the rendered value"
        );
    }

    #[test]
    fn catalog_unique_and_known() {
        let mut k: Vec<_> = SETTINGS.iter().map(|s| s.key).collect();
        let n = k.len();
        k.sort_unstable();
        k.dedup();
        assert_eq!(k.len(), n, "duplicate setting key");
        assert!(SETTINGS.len() >= 40);
        assert!(is_known("auth_email_enabled") && !is_known("bogus"));
    }

    #[test]
    fn catalog_defaults_have_authoritative_wasm_specs() {
        use super::super::settings_registry::{
            setting_spec, validate_setting_value, SettingsRuntime,
        };

        for setting in SETTINGS {
            let spec = setting_spec(setting.key, SettingsRuntime::Wasm)
                .unwrap_or_else(|| panic!("missing setting specification for {}", setting.key));
            assert!(
                validate_setting_value(spec, setting.default).is_ok(),
                "catalog default is invalid for {}",
                setting.key
            );
        }
    }

    #[test]
    fn catalog_exposes_subscription_selection_gate() {
        // Regression guard: the admin Auth → Behavior "Subscription selection"
        // box renders only when these keys are returned by GET /admin/settings,
        // which is driven by this catalog. They previously drifted out of sync
        // with the standalone server's `default_settings()`, hiding the box in
        // the extension runtime.
        for key in [
            "subscription_selection_required",
            "subscription_selection_route",
        ] {
            assert!(is_known(key), "{key} must be in the wasm settings catalog");
        }
    }

    #[test]
    fn catalog_does_not_expose_pay_location_or_pay_owned_seat_limits() {
        assert!(!is_known("subscription_selection_pay_base_url"));
        assert!(!is_known("team_plan_seat_limits"));
    }

    #[test]
    fn catalog_exposes_invite_code_settings() {
        // The invite-codes admin tab + registration gate are bound in the wasm
        // runtime, so their settings must be configurable via /admin/settings.
        for key in [
            "invite_codes_enabled",
            "invite_codes_users_can_issue",
            "invite_codes_per_user",
            "invite_codes_reset_interval_days",
        ] {
            assert!(is_known(key), "{key} must be in the wasm settings catalog");
        }
    }

    #[test]
    fn email_password_reset_subject_is_not_secret() {
        let setting = SETTINGS
            .iter()
            .find(|s| s.key == "email_subject_password_reset")
            .expect("password reset subject must stay configurable");

        assert!(!setting.is_secret);
    }

    #[test]
    fn catalog_excludes_email_sender_controls_owned_by_the_host() {
        for key in [
            "email_from_address",
            "email_from_name",
            "email_provider",
            "email_smtp_host",
            "email_smtp_password",
            "email_smtp_port",
            "email_smtp_tls",
            "email_smtp_user",
        ] {
            assert!(!is_known(key), "{key} is configured by the host provider");
        }

        assert!(is_known("email_subject_verification"));
        assert!(is_known("email_subject_password_reset"));
    }
}
