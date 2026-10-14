# Settings Reference

This reference describes the settings that Cedros Login actually loads today. It covers static environment configuration, runtime `system_settings`, secret handling, and the embedded Axum usage pattern.

## Configuration Layers

| Layer | Source | Read timing | How to change |
| --- | --- | --- | --- |
| Static config | Environment variables loaded by `Config::from_env()` | Server startup | Change env and restart |
| Runtime settings | `system_settings` rows seeded by migrations or in-memory defaults | At standalone startup for `restart` settings; per request through `SettingsService` for `hot` settings | `PATCH /auth/admin/settings`, setup import, or repository writes |
| Admin-only records | Tables such as SSO providers, invite codes, roles, policies | Per request | Their dedicated admin endpoints |

Handlers that support runtime settings read those keys through `SettingsService` and fall back to static config when the setting is absent, empty, or invalid. Standalone startup loads one complete settings snapshot, calls `Config::apply_db_settings`, validates the merged configuration, and only then constructs dependent services and the router. The admin API labels every key with its executable application mode instead of implying that every persisted row is live.

Standalone email registration, login, invite redemption, API-key authentication, OAuth account linking, and bootstrap-admin eligibility resolve `auth_email_require_verification` once per operation. The cached runtime boolean takes precedence over `EMAIL_REQUIRE_VERIFICATION`; a missing or invalid legacy row falls back to the static value and is returned with a validation diagnostic. Invalid known rows remain visible to admin diagnostics but are never returned to executable consumers. Normal settings PATCH and autosave accept only strict `true` or `false` values. Autosave atomically commits its revision-checked settings rows and completed idempotency replay payload; a completion failure rolls back both. Only a newly committed result is published into the complete cache snapshot, without a fallible storage reread. PostgreSQL provides the boundary with one transaction and in-memory storage with one repository critical section; custom repositories that do not implement the atomic operation fail closed.

Each `SettingsService` owns its own cache. A write is immediately visible through the service instance used by the handler; separate router, worker, or embedder instances observe it only after an explicit `refresh()` or their 60-second TTL expires. This is deliberate bounded-staleness behavior, not cross-instance cache invalidation.

## Static Environment Variables

`JWT_SECRET` is required and must be at least 32 characters. It is strictly
environment/host-owned and is not present in the runtime settings registry or
admin API. Standalone uses it to bootstrap JWT, token, and settings-encryption
services before any persisted secret can be read, so a database-managed JWT
root key would create a circular trust dependency. The rest are optional unless
the enabled feature validates them at startup.

Persisted secret settings are encrypted with a key derived from `JWT_SECRET`.
Rotating `JWT_SECRET` therefore requires decrypting and re-encrypting every
non-empty secret setting under controlled maintenance before the old key is
removed; changing only the environment value makes existing ciphertext
unreadable. The current runtime does not claim automatic multi-key rotation.

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `57165` | Bind port |
| `AUTH_BASE_PATH` | `/auth` | Base path for auth/API routes and cookie path fallback |
| `FRONTEND_URL` | unset | Verification, reset, SSO, and app redirect base URL |
| `SSO_CALLBACK_URL` | unset | Absolute SSO callback override |
| `BOOTSTRAP_ADMIN_EMAIL` | unset | Bootstrap system-admin email when no admins exist |
| `TRUST_PROXY` | `false` | Use `X-Forwarded-For` for client IP features |
| `JWT_RSA_PRIVATE_KEY` | unset | Optional PKCS#1 RSA key for stable JWT signing |
| `JWT_ISSUER` | `cedros-login` | JWT issuer |
| `JWT_AUDIENCE` | `cedros-app` | JWT audience |
| `JWT_ACCESS_EXPIRY` | `900` | Access token lifetime in seconds |
| `JWT_REFRESH_EXPIRY` | `604800` | Refresh token lifetime in seconds |
| `DATABASE_URL` | unset | PostgreSQL URL; unset uses in-memory storage |
| `DATABASE_MAX_CONNECTIONS` | `20` | Postgres pool maximum |
| `DATABASE_MIN_CONNECTIONS` | `2` | Postgres pool minimum |
| `DATABASE_CONNECT_TIMEOUT` | `30` | Postgres connect timeout in seconds |
| `DATABASE_IDLE_TIMEOUT` | `600` | Postgres idle timeout in seconds |
| `CORS_ORIGINS` | empty | Comma-separated allowed origins; required in production-like envs |
| `CORS_DISABLED` | `false` | Disable internal CORS when a host app owns CORS |
| `COOKIE_ENABLED` | `true` | Enable HTTP-only cookie transport |
| `COOKIE_DOMAIN` | unset | Cookie domain |
| `COOKIE_SECURE` | `true` in production, else `false` | Cookie `Secure` flag |
| `COOKIE_SAME_SITE` | `lax` | Cookie SameSite policy |
| `COOKIE_ACCESS_NAME` | `cedros_access` | Access cookie name |
| `COOKIE_REFRESH_NAME` | `cedros_refresh` | Refresh cookie name |
| `COOKIE_PATH_PREFIX` | `AUTH_BASE_PATH` or empty | Cookie path |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_STORE` | `memory` | `memory` or `redis` |
| `REDIS_URL` | unset | Required for `RATE_LIMIT_STORE=redis` |
| `ENVIRONMENT` | `development` | Production-like validation and notification context |
| `DISCORD_WEBHOOK_URL` | unset | Admin notification webhook |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | unset | Telegram admin notifications |
| `SSO_ENABLED` | `false` | Enable SSO flow validation |

## Provider Static Config

| Provider | Env variables | Runtime keys |
| --- | --- | --- |
| Email/password | `EMAIL_ENABLED`, `EMAIL_REQUIRE_VERIFICATION`, `EMAIL_BLOCK_DISPOSABLE`, `EMAIL_CUSTOM_BLOCKED_DOMAINS` | `auth_email_enabled`, `auth_email_require_verification`, `auth_email_block_disposable` |
| Google | `GOOGLE_ENABLED`, `GOOGLE_CLIENT_ID` | `auth_google_enabled`, `auth_google_client_id` |
| Apple | `APPLE_ENABLED`, `APPLE_CLIENT_ID`, `APPLE_ALLOWED_CLIENT_IDS`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY_PEM` | `auth_apple_enabled`, `auth_apple_client_id`, `auth_apple_team_id` |
| Solana | `SOLANA_ENABLED`, `SOLANA_CHALLENGE_EXPIRY` | `auth_solana_enabled`, `auth_solana_challenge_expiry` |
| WebAuthn | `WEBAUTHN_ENABLED`, `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_RP_ORIGIN`, `WEBAUTHN_CHALLENGE_TTL`, `WEBAUTHN_ALLOW_PLATFORM`, `WEBAUTHN_ALLOW_CROSS_PLATFORM`, `WEBAUTHN_REQUIRE_UV`, `WEBAUTHN_REJECT_CLONED` | `auth_webauthn_enabled`, `auth_webauthn_rp_id`, `auth_webauthn_rp_name`, `auth_webauthn_rp_origin` |
| Webhook callback | `WEBHOOK_ENABLED`, `WEBHOOK_URL`, `WEBHOOK_SECRET`, `WEBHOOK_TIMEOUT`, `WEBHOOK_RETRIES` | none; legacy `webhook_*` rows are unsupported |

Google and Apple sign-in use ID token verification against provider public keys. Google does not need a client secret. Apple REST token exchange/revocation can use `APPLE_KEY_ID` and `APPLE_PRIVATE_KEY_PEM`, but those are not seeded runtime settings.

## Runtime Setting Keys

Runtime settings are seeded by `server/migrations/*system_settings*.sql` for Postgres and by `InMemorySystemSettingsRepository::with_defaults()` for in-memory mode.

### Auth And Features

| Category | Keys |
| --- | --- |
| `auth.email` | `auth_email_enabled`, `auth_email_require_verification`, `auth_email_block_disposable` |
| `auth.google` | `auth_google_enabled`, `auth_google_client_id` |
| `auth.apple` | `auth_apple_enabled`, `auth_apple_client_id`, `auth_apple_team_id` |
| `auth.solana` | `auth_solana_enabled`, `auth_solana_challenge_expiry` |
| `auth.webauthn` | `auth_webauthn_enabled`, `auth_webauthn_rp_id`, `auth_webauthn_rp_name`, `auth_webauthn_rp_origin` |
| `auth.instantlink` | `auth_instantlink_enabled`, `auth_instantlink_expiry`, `auth_instantlink_rate_limit` |
| `features` | `feature_sso`, `feature_organizations`, `feature_mfa`, `feature_instant_link` |

`feature_sso` gates standalone and Wasm SSO execution; actual SSO provider records are managed through `/auth/admin/sso-providers`. The legacy `feature_organizations`, `feature_mfa`, and `feature_instant_link` rows have no server-side execution path and are reported as `unsupported` rather than accepting ineffective writes.

### Security, Server, Rate Limits

| Category | Keys |
| --- | --- |
| `security` | `security_cors_origins`, `security_cookie_domain`, `security_cookie_secure`, `security_cookie_same_site`, `security_session_timeout`, `security_jwt_issuer`, `security_jwt_audience`, `security_require_mfa`, `auth_new_device_alert_enabled` |
| `server` | `server_frontend_url`, `server_base_path`, `server_trust_proxy`, `server_log_level`, `server_log_format`, `server_environment`, `server_metrics_api_key` |
| `rate_limit` | `rate_limit_auth`, `rate_limit_general`, `rate_limit_window` |
| `ui` | `ui_social_button_order` |

`security_require_mfa` returns a post-login `setup_mfa` action for email/password users who have not enrolled TOTP. `auth_new_device_alert_enabled` defaults on and queues a best-effort email when a successful sign-in uses a browser and operating system not found in recent sessions. Rate-limit backend selection remains static in `RATE_LIMIT_STORE`; the runtime keys hold numeric limits that are bound when the router is built. `server_log_format` is retained for compatibility but reported as `unsupported`; the current process log formatter is host-owned.

### Email, Webhook, Images

| Category | Keys |
| --- | --- |
| `email` | `email_provider`, `email_smtp_host`, `email_smtp_port`, `email_smtp_user`, `email_smtp_password`, `email_smtp_tls`, `email_from_address`, `email_from_name`, `email_subject_verification`, `email_subject_password_reset`, `email_subject_instant_link`, `email_subject_invite`, `email_subject_security_alert` |
| `webhook` | `webhook_enabled`, `webhook_url`, `webhook_secret`, `webhook_timeout`, `webhook_retries` |
| `image_storage` | `image_storage_enabled`, `image_storage_provider`, `image_storage_bucket`, `image_storage_region`, `image_storage_endpoint`, `image_storage_access_key`, `image_storage_secret_key`, `image_storage_cdn_url` |

Image storage is S3-compatible and is used by `/auth/upload/avatar` when enabled.
`image_storage_provider` is retained but unsupported because S3 is the only executable provider; changing that row previously had no effect.

Only the `email_subject_*` values are executable email runtime settings. Standalone
delivery is configured with `POSTMARK_API_TOKEN` and `POSTMARK_FROM_EMAIL`; both
must be non-blank and configured together. Production-like standalone startup
requires the provider even when `auth_email_enabled=false`, because invitations,
password resets, account deletion confirmations, and security alerts are
independent transactional workflows. `/health` and `/ready` expose the
credential-free `emailDelivery` diagnostic (`provider`, `development_log`, or
`unavailable`). The legacy `email_provider`,
`email_smtp_*`, `email_from_address`, and `email_from_name` rows remain in the
standalone API for storage compatibility but are not rendered or consumed. The
Wasm runtime omits those sender controls because delivery identity is host-owned.

### Post-login And Invite Gates

| Category | Keys |
| --- | --- |
| `postlogin` | `postlogin_redirect_url`, `postlogin_flow_order` |
| `postlogin.welcome` | `postlogin_welcome_enabled`, `postlogin_welcome_route` |
| `postlogin.complete` | `postlogin_complete_enabled` |
| `postlogin.username` | `postlogin_username_enabled` |
| `auth.invite_codes` | `invite_codes_enabled`, `invite_codes_users_can_issue`, `invite_codes_per_user`, `invite_codes_reset_interval_days` |
| `postlogin.subscription` | `subscription_selection_required`, `subscription_selection_route`, `subscription_selection_pay_base_url` |

`postlogin_flow_order` is a comma-separated permutation of `subscription`, `username`, `welcome`, and `profile`. Required MFA always runs before those reorderable steps, invite-code gates run before post-login, and `postlogin_redirect_url` remains the final fallback.

When `subscription_selection_required=true`, Login calls Cedros Pay at `{subscription_selection_pay_base_url}/paywall/v1/subscription/selection-status?userId={login_user_id}`. A non-complete response returns `postLogin.action = "choose_subscription"` and the configured route. If the Pay base URL is empty or unreachable while the gate is enabled, Login fails closed by returning the chooser action.

## Secrets

Secret settings are marked with `is_secret=true`: `email_smtp_password`, `webhook_secret`, `server_metrics_api_key`, `image_storage_access_key`, and `image_storage_secret_key`.

`SettingsService::get_secret()` decrypts non-empty encrypted values when the service was created with an `EncryptionService`. Empty secret values mean "not configured". Admin list and update responses always redact secret values to an empty string; neither plaintext nor ciphertext is returned to the UI. The separate `hasValue` boolean lets the UI show that a secret is configured without exposing it. Do not log or return plaintext secret values from new handlers.

## Admin API

Runtime settings are exposed under the auth base path:

```http
GET /auth/admin/settings
PATCH /auth/admin/settings
Content-Type: application/json

{"settings":[{"key":"auth_google_enabled","value":"true"}]}
```

The settings write boundary uses the authoritative typed registry in `server/src/settings_registry.rs`. Known values are validated as strict booleans, bounded integers, enums, HTTP(S) URLs/origins, hostnames, internal paths, or constrained lists as appropriate. The registry also reports one of these application modes:

- `hot`: writable and applied by request-time consumers.
- `restart`: writable and applied by composition/startup consumers after restart.
- `host-owned`: visible for diagnostics but configured outside this API.
- `unsupported`: retained for storage compatibility but has no executable consumer.

Writes to `host-owned` or `unsupported` keys fail closed. Existing invalid rows are not rewritten or silently replaced: GET returns their stored non-secret value plus `validationError`, allowing an operator to diagnose and deliberately correct the row. Each setting response includes `applicationMode` and nullable `validationError` fields.

Standalone legacy `webhook_*`, `feature_organizations`, `feature_mfa`, `feature_instant_link`, `image_storage_provider`, `auth_instantlink_rate_limit`, and `server_log_format` rows are `unsupported`. Wasm additionally reports catalog rows without a guest execution path (including Apple team ID and unused welcome/profile controls) as `unsupported`. A new key must not be marked `hot` until a request-time consumer and behavior test exist.

The Wasm runtime imports the same typed registry. Its host settings seam exposes only a single-key `set`, so Wasm `PATCH /admin/settings` requires exactly one setting per request; it never acknowledges a sequential multi-key write as atomic. Host-owned Wasm settings are read-only.

## Embedded Axum Usage

```rust
use cedros_login::services::{EncryptionService, SettingsService};
use cedros_login::{
    router_with_preloaded_settings_and_email_delivery, Config, NoopCallback, Storage,
};
use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let mut config = Config::from_env_for_settings_merge()?;
    let storage = Storage::from_config(&config.database).await?;
    let settings = Arc::new(SettingsService::with_encryption(
        storage.system_settings_repo.clone(),
        EncryptionService::from_secret(&config.jwt.secret),
    ));
    settings.refresh().await?;
    config.apply_db_settings(&settings).await?;
    let callback = Arc::new(NoopCallback);

    let auth_router = router_with_preloaded_settings_and_email_delivery(
        config,
        callback,
        storage,
        settings,
        cedros_login::services::EmailDeliveryCapability::Delivering,
    );
    let app = axum::Router::new().nest("/auth", auth_router);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:57165").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
```

The `Delivering` capability in this example is a host assertion: use it only
when a real provider is configured and an active worker drains this storage's
outbox. The simpler `router_with_storage` cannot verify that lifecycle, reports
delivery as `unavailable`, and therefore fails production readiness closed.
Custom storage implementations must also preserve the atomic repository
contracts documented by the public traits; prefer the provided constructors.

Postgres storage runs pending Login migrations in `Storage::postgres_with_pool` and seeds `system_settings`. In-memory storage now seeds the same runtime setting surface for local development and tests.
