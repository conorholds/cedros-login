use super::{ApplicationMode, SettingValueKind, BOOL, SECRET, TEXT};

pub(super) fn standalone_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    boolean_spec(key)
        .or_else(|| integer_spec(key))
        .or_else(|| enum_spec(key))
        .or_else(|| boundary_spec(key))
        .or_else(|| ordered_spec(key))
        .or_else(|| delivery_spec(key))
        .or_else(|| text_spec(key))
}

fn boolean_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::{Hot, Restart, Unsupported};
    let mode = match key {
        "auth_email_enabled"
        | "auth_email_require_verification"
        | "auth_email_block_disposable"
        | "auth_google_enabled"
        | "auth_apple_enabled"
        | "auth_solana_enabled"
        | "auth_webauthn_enabled"
        | "auth_instantlink_enabled"
        | "feature_sso"
        | "security_require_mfa"
        | "auth_new_device_alert_enabled"
        | "postlogin_welcome_enabled"
        | "postlogin_complete_enabled"
        | "postlogin_username_enabled"
        | "image_storage_enabled"
        | "invite_codes_enabled"
        | "invite_codes_users_can_issue"
        | "subscription_selection_required"
        | "auth_avatar_upload_enabled"
        | "signup_limit_enabled"
        | "signup_limit_show_remaining"
        | "signup_access_code_enabled" => Hot,
        "security_cookie_secure" | "server_trust_proxy" => Restart,
        "feature_organizations" | "feature_mfa" | "feature_instant_link" | "webhook_enabled" => {
            Unsupported
        }
        _ => return None,
    };
    Some((BOOL, mode))
}

fn integer_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::{Hot, Restart, Unsupported};
    let (min, max, mode) = match key {
        "rate_limit_auth" | "rate_limit_general" => (1, 1_000_000, Restart),
        "rate_limit_window" => (1, 86_400, Restart),
        "security_session_timeout" => (60, 31_536_000, Restart),
        "auth_solana_challenge_expiry" | "auth_instantlink_expiry" => (1, 86_400, Hot),
        "invite_codes_per_user" => (0, 100, Hot),
        "invite_codes_reset_interval_days" => (0, 3_650, Hot),
        "signup_limit_max" => (1, 1_000_000, Hot),
        "auth_instantlink_rate_limit" => (1, 10_000, Unsupported),
        "webhook_timeout" => (1, 300, Unsupported),
        "webhook_retries" => (0, 20, Unsupported),
        "email_smtp_port" => (1, 65_535, Unsupported),
        _ => return None,
    };
    Some((SettingValueKind::Integer { min, max }, mode))
}

fn enum_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::{HostOwned, Hot, Restart, Unsupported};
    let spec = match key {
        "server_log_level" => (
            SettingValueKind::Enum(&["trace", "debug", "info", "warn", "error"]),
            Restart,
        ),
        "security_cookie_same_site" => {
            (SettingValueKind::Enum(&["strict", "lax", "none"]), Restart)
        }
        "signup_limit_period" => (SettingValueKind::Enum(&["daily", "weekly", "monthly"]), Hot),
        "server_environment" => (
            SettingValueKind::Enum(&[
                "dev",
                "development",
                "local",
                "test",
                "staging",
                "prod",
                "production",
            ]),
            HostOwned,
        ),
        "server_log_format" => (SettingValueKind::Enum(&["text", "json"]), Unsupported),
        "image_storage_provider" => (SettingValueKind::Enum(&["s3"]), Unsupported),
        "email_provider" => (
            SettingValueKind::Enum(&["custom", "mailgun", "sendgrid", "postmark", "ses", "resend"]),
            Unsupported,
        ),
        _ => return None,
    };
    Some(spec)
}

fn boundary_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::{Hot, Restart, Unsupported};
    let spec = match key {
        "auth_webauthn_rp_origin" => (SettingValueKind::Origin { allow_empty: true }, Hot),
        "security_cors_origins" => (SettingValueKind::OriginList, Restart),
        "auth_webauthn_rp_id" => (SettingValueKind::Host { allow_empty: true }, Hot),
        "security_cookie_domain" => (SettingValueKind::Host { allow_empty: true }, Restart),
        "server_frontend_url" | "sso_callback_url" => {
            (SettingValueKind::HttpUrl { allow_empty: true }, Restart)
        }
        "webhook_url" => (SettingValueKind::HttpUrl { allow_empty: true }, Unsupported),
        "image_storage_endpoint"
        | "image_storage_cdn_url"
        | "subscription_selection_pay_base_url" => {
            (SettingValueKind::HttpUrl { allow_empty: true }, Hot)
        }
        "server_base_path" => (
            SettingValueKind::InternalPath { allow_empty: false },
            Restart,
        ),
        "postlogin_welcome_route" | "subscription_selection_route" => {
            (SettingValueKind::InternalPath { allow_empty: false }, Hot)
        }
        "postlogin_redirect_url" => (SettingValueKind::UrlOrPath { allow_empty: true }, Hot),
        "email_smtp_host" => (SettingValueKind::Host { allow_empty: true }, Unsupported),
        "email_from_address" => (SettingValueKind::Email { allow_empty: true }, Unsupported),
        _ => return None,
    };
    Some(spec)
}

fn ordered_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::Hot;
    match key {
        "team_plan_seat_limits" => Some((
            SettingValueKind::Text {
                allow_empty: true,
                max_len: 4_096,
            },
            ApplicationMode::Unsupported,
        )),
        "postlogin_flow_order" => Some((
            SettingValueKind::CsvPermutation(&["subscription", "username", "welcome", "profile"]),
            Hot,
        )),
        "ui_social_button_order" => Some((
            SettingValueKind::CsvUnique(&["webauthn", "google", "apple", "solana"]),
            Hot,
        )),
        _ => None,
    }
}

fn delivery_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::Unsupported;
    match key {
        "email_smtp_tls" => Some((BOOL, Unsupported)),
        "email_smtp_user" | "email_from_name" => Some((TEXT, Unsupported)),
        "email_smtp_password" | "webhook_secret" => Some((SECRET, Unsupported)),
        _ => None,
    }
}

fn text_spec(key: &str) -> Option<(SettingValueKind, ApplicationMode)> {
    use ApplicationMode::{Hot, Restart};
    let spec = match key {
        "server_metrics_api_key"
        | "image_storage_access_key"
        | "image_storage_secret_key"
        | "signup_access_code" => (SECRET, Hot),
        "auth_google_client_id"
        | "auth_apple_client_id"
        | "auth_apple_team_id"
        | "auth_webauthn_rp_name"
        | "email_subject_verification"
        | "email_subject_password_reset"
        | "email_subject_instant_link"
        | "email_subject_invite"
        | "email_subject_security_alert"
        | "image_storage_bucket"
        | "image_storage_region" => (TEXT, Hot),
        "security_jwt_issuer" | "security_jwt_audience" => (TEXT, Restart),
        _ => return None,
    };
    Some(spec)
}
