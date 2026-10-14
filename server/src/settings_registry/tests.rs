use super::*;

#[test]
fn validation_is_strict_at_external_boundaries() {
    let bool_spec = setting_spec("auth_email_enabled", SettingsRuntime::Standalone).unwrap();
    assert!(validate_setting_value(bool_spec, "true").is_ok());
    assert!(validate_setting_value(bool_spec, "yes").is_err());

    let origin_spec = setting_spec("security_cors_origins", SettingsRuntime::Standalone).unwrap();
    assert!(
        validate_setting_value(origin_spec, "https://one.example,http://localhost:3000").is_ok()
    );
    assert!(validate_setting_value(origin_spec, "https://one.example/path").is_err());

    let path_spec = setting_spec("postlogin_welcome_route", SettingsRuntime::Standalone).unwrap();
    assert!(validate_setting_value(path_spec, "/welcome").is_ok());
    assert!(validate_setting_value(path_spec, "/../admin").is_err());
}

#[test]
fn runtime_modes_preserve_host_ownership() {
    let standalone = setting_spec("server_base_path", SettingsRuntime::Standalone).unwrap();
    let wasm = setting_spec("server_base_path", SettingsRuntime::Wasm).unwrap();
    assert_eq!(standalone.application_mode, ApplicationMode::Restart);
    assert_eq!(wasm.application_mode, ApplicationMode::HostOwned);
}

#[test]
fn unbound_settings_are_not_reported_as_writable() {
    for key in [
        "feature_organizations",
        "feature_mfa",
        "feature_instant_link",
        "server_log_format",
        "webhook_enabled",
        "webhook_url",
        "webhook_secret",
    ] {
        let standalone = setting_spec(key, SettingsRuntime::Standalone).unwrap();
        assert_eq!(
            standalone.application_mode,
            ApplicationMode::Unsupported,
            "{key} has no standalone execution path"
        );
    }

    for key in [
        "auth_apple_team_id",
        "auth_instantlink_rate_limit",
        "postlogin_welcome_enabled",
    ] {
        let wasm = setting_spec(key, SettingsRuntime::Wasm).unwrap();
        assert_eq!(
            wasm.application_mode,
            ApplicationMode::Unsupported,
            "{key} has no Wasm execution path"
        );
    }
}

#[test]
fn executable_runtime_settings_keep_truthful_modes() {
    for key in [
        "auth_email_enabled",
        "auth_instantlink_expiry",
        "auth_webauthn_rp_origin",
        "postlogin_redirect_url",
        "subscription_selection_required",
    ] {
        assert_eq!(
            setting_spec(key, SettingsRuntime::Standalone)
                .unwrap()
                .application_mode,
            ApplicationMode::Hot
        );
    }
    for key in [
        "security_cookie_secure",
        "security_cors_origins",
        "security_jwt_issuer",
        "server_base_path",
    ] {
        assert_eq!(
            setting_spec(key, SettingsRuntime::Standalone)
                .unwrap()
                .application_mode,
            ApplicationMode::Restart
        );
    }
}

#[test]
fn root_cryptographic_keys_are_not_database_managed_settings() {
    for key in [
        "JWT_SECRET",
        "jwt-secret",
        "auth.jwtSecret",
        "security_jwt_secret",
        "settings_encryption_secret",
    ] {
        assert_eq!(
            setting_spec(key, SettingsRuntime::Standalone),
            None,
            "{key} must remain host/environment-owned to avoid circular bootstrap"
        );
    }
}

#[test]
fn team_seat_policy_is_no_longer_writable_in_login() {
    for runtime in [SettingsRuntime::Standalone, SettingsRuntime::Wasm] {
        assert_eq!(
            setting_spec("team_plan_seat_limits", runtime)
                .unwrap()
                .application_mode,
            ApplicationMode::Unsupported
        );
    }
}
