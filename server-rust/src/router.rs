//! Router configuration

use axum::http::{header, HeaderValue, Method};
use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{AllowOrigin, Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::TraceLayer;

use crate::callback::AuthCallback;
use crate::handlers;
#[cfg(feature = "redis-rate-limit")]
use crate::middleware::rate_limit::RedisRateLimitStore;
use crate::middleware::rate_limit::{
    KeyExtractor, RateLimitBackend, RateLimitConfig as MwRateLimitConfig, RateLimitLayer,
    RateLimitStore,
};
use crate::middleware::request_id::RequestIdLayer;
use crate::middleware::CsrfLayer;
use crate::services::EmailService;
use crate::AppState;

/// Maximum request body size (1 MB should be plenty for auth requests)
const MAX_BODY_SIZE: usize = 1024 * 1024;

/// Create the authentication router
pub fn create_router<C: AuthCallback + 'static, E: EmailService + 'static>(
    state: Arc<AppState<C, E>>,
) -> Router {
    // Define allowed headers for CORS (explicit list required when credentials enabled)
    let allowed_headers = [
        header::CONTENT_TYPE,
        header::AUTHORIZATION,
        header::ACCEPT,
        header::COOKIE,
        header::HeaderName::from_static("x-csrf-token"),
    ];

    // Define allowed methods
    let allowed_methods = [
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::PATCH,
        Method::DELETE,
        Method::OPTIONS,
    ];

    // Configure CORS using allowed origins from config
    // WARNING: Empty CORS_ORIGINS enables wildcard (*) which allows any origin.
    // This is acceptable for development but MUST be configured for production.
    // Set CORS_ORIGINS to a comma-separated list of allowed origins.
    let cors = if state.config.cors.allowed_origins.is_empty() {
        // S-09: Elevate to error — wildcard CORS is a security risk in production
        tracing::error!(
            "CORS_ORIGINS not configured - allowing any origin (wildcard). \
            This is only acceptable for local development. \
            Set CORS_ORIGINS to a comma-separated list of allowed origins for production."
        );
        // If no origins configured, allow any (development mode)
        // Note: credentials cannot be used with wildcard origin in browsers
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(allowed_methods.clone())
            .allow_headers(allowed_headers.clone())
    } else {
        // Parse configured origins
        let origins: Vec<_> = state
            .config
            .cors
            .allowed_origins
            .iter()
            .filter_map(|origin| origin.parse().ok())
            .collect();

        CorsLayer::new()
            .allow_origin(AllowOrigin::list(origins))
            .allow_methods(allowed_methods)
            .allow_headers(allowed_headers)
            .allow_credentials(true)
    };

    // Create rate limit backend (shared across all endpoints)
    let rate_limit_backend: RateLimitBackend = create_rate_limit_backend(&state.config.rate_limit);

    // Read rate limit settings from database (via SettingsService cache)
    // Falls back to env config values if not found in DB
    let db_auth_limit = state
        .settings_service
        .get_cached_u32_sync("rate_limit_auth")
        .unwrap_or(state.config.rate_limit.auth_limit);
    let db_general_limit = state
        .settings_service
        .get_cached_u32_sync("rate_limit_general")
        .unwrap_or(state.config.rate_limit.general_limit);
    let db_credit_limit = state
        .settings_service
        .get_cached_u32_sync("rate_limit_credit")
        .unwrap_or(state.config.rate_limit.credit_limit);
    let db_window_secs = state
        .settings_service
        .get_cached_u64_sync("rate_limit_window")
        .unwrap_or(state.config.rate_limit.window_secs);

    let replicas_hint = RateLimitStore::replicas_hint();
    let auth_limit = if replicas_hint > 1 {
        let adjusted = std::cmp::max(1, db_auth_limit / replicas_hint);
        // S-27: Warn when the floor is applied (replicas > configured limit)
        if db_auth_limit < replicas_hint {
            tracing::warn!(
                configured = db_auth_limit,
                effective_per_instance = adjusted,
                replicas = replicas_hint,
                "Rate limit per replica is less than 1; floored to 1 (higher than configured)"
            );
        } else if adjusted != db_auth_limit {
            tracing::warn!(
                configured = db_auth_limit,
                effective_per_instance = adjusted,
                replicas = replicas_hint,
                "Rate limit adjusted per instance due to multi-instance deployment"
            );
        }
        adjusted
    } else {
        db_auth_limit
    };

    let general_limit = if replicas_hint > 1 {
        let adjusted = std::cmp::max(1, db_general_limit / replicas_hint);
        if adjusted != db_general_limit {
            tracing::warn!(
                configured = db_general_limit,
                effective_per_instance = adjusted,
                replicas = replicas_hint,
                "Rate limit adjusted per instance due to multi-instance deployment"
            );
        }
        adjusted
    } else {
        db_general_limit
    };

    let credit_limit = if replicas_hint > 1 {
        std::cmp::max(1, db_credit_limit / replicas_hint)
    } else {
        db_credit_limit
    };

    // Auth endpoints rate limit (stricter for brute force protection)
    let auth_rate_limit = RateLimitLayer::new(
        rate_limit_backend.clone(),
        MwRateLimitConfig {
            limit: auth_limit,
            window_secs: db_window_secs,
        },
    )
    .with_key_extractor(KeyExtractor::IpAndPath)
    .with_trust_proxy(state.config.server.trust_proxy);

    // General endpoints rate limit
    let general_rate_limit = RateLimitLayer::new(
        rate_limit_backend.clone(),
        MwRateLimitConfig {
            limit: general_limit,
            window_secs: db_window_secs,
        },
    )
    .with_key_extractor(KeyExtractor::IpOnly)
    .with_trust_proxy(state.config.server.trust_proxy);

    // Credit operations rate limit (prevents rapid-fire spend attacks)
    let credit_rate_limit = RateLimitLayer::new(
        rate_limit_backend,
        MwRateLimitConfig {
            limit: credit_limit,
            window_secs: db_window_secs,
        },
    )
    .with_key_extractor(KeyExtractor::IpAndPath)
    .with_trust_proxy(state.config.server.trust_proxy);

    let auth_routes = auth_sensitive_routes::<C, E>();
    let general_routes = general_routes::<C, E>();
    let credit_routes = credit_operations_routes::<C, E>();

    let base_router = if state.config.rate_limit.enabled {
        auth_routes
            .layer(auth_rate_limit)
            .merge(general_routes.layer(general_rate_limit))
            .merge(credit_routes.layer(credit_rate_limit))
    } else {
        auth_routes.merge(general_routes).merge(credit_routes)
    };

    let base_path = state.config.server.auth_base_path.trim_end_matches('/');
    let base_path = if base_path.is_empty() { "/" } else { base_path };

    let root_routes = Router::new()
        .route("/health", get(handlers::health_check::<C, E>))
        .route("/metrics", get(handlers::prometheus_metrics::<C, E>))
        .route("/.well-known/jwks.json", get(handlers::jwks::<C, E>))
        // Setup routes (unauthenticated - for first-run configuration)
        .route("/setup/status", get(handlers::setup_status::<C, E>))
        .route("/setup/admin", post(handlers::create_first_admin::<C, E>));
    let routed = if base_path == "/" {
        base_router.merge(root_routes)
    } else {
        root_routes.merge(Router::new().nest(base_path, base_router))
    };

    // Apply common middleware layers
    let router = routed
        .layer(CsrfLayer::new(state.config.cookie.clone()))
        .layer(RequestIdLayer::new())
        .layer(TraceLayer::new_for_http());

    // Only apply the internal CORS layer when not disabled.
    // Embedded apps should set cors.disabled = true and manage CORS themselves.
    let router = if state.config.cors.disabled {
        router
    } else {
        router.layer(cors)
    };

    // Security headers
    router
        .layer(SetResponseHeaderLayer::overriding(
            header::X_FRAME_OPTIONS,
            HeaderValue::from_static("DENY"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::REFERRER_POLICY,
            HeaderValue::from_static("no-referrer"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::HeaderName::from_static("permissions-policy"),
            HeaderValue::from_static("geolocation=(), microphone=(), camera=()"),
        ))
        // S-10: HSTS — enforce HTTPS for all future connections
        .layer(SetResponseHeaderLayer::if_not_present(
            header::STRICT_TRANSPORT_SECURITY,
            HeaderValue::from_static("max-age=31536000; includeSubDomains"),
        ))
        // Request body size limit to prevent DoS
        .layer(RequestBodyLimitLayer::new(MAX_BODY_SIZE))
        .with_state(state)
}

fn auth_sensitive_routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    // Auth-sensitive routes with stricter rate limiting
    // Includes /refresh endpoint as stolen refresh tokens could be brute-forced
    Router::new()
        .route("/register", post(handlers::register::<C, E>))
        .route("/login", post(handlers::login::<C, E>))
        .route("/login/mfa", post(handlers::complete_mfa_login::<C, E>))
        .route("/refresh", post(handlers::refresh::<C, E>))
        .route("/google", post(handlers::google_auth::<C, E>))
        .route("/apple", post(handlers::apple_auth::<C, E>))
        .route(
            "/solana/challenge",
            post(handlers::solana_challenge::<C, E>),
        )
        .route("/solana", post(handlers::solana_auth::<C, E>))
        .route("/forgot-password", post(handlers::forgot_password::<C, E>))
        .route("/reset-password", post(handlers::reset_password::<C, E>))
        .route("/change-password", post(handlers::change_password::<C, E>))
        .route("/instant-link", post(handlers::send_instant_link::<C, E>))
        .route(
            "/instant-link/verify",
            post(handlers::verify_instant_link::<C, E>),
        )
        // API key validation (public endpoint)
        .route(
            "/api-key/validate",
            post(handlers::validate_api_key::<C, E>),
        )
        // S-08: MFA code verification endpoints need strict rate limiting
        // to prevent brute-force attacks on TOTP codes
        .route("/mfa/verify", post(handlers::verify_mfa::<C, E>))
        .route("/mfa/recovery", post(handlers::use_recovery_code::<C, E>))
        // Wallet rotation endpoints need strict rate limiting
        // These are sensitive operations that modify wallet encryption
        .route(
            "/wallet/rotate-user-secret",
            post(handlers::rotate_user_secret::<C, E>),
        )
        // WebAuthn routes (passkey authentication)
        .route(
            "/webauthn/auth/options",
            post(handlers::webauthn_auth_options::<C, E>),
        )
        .route(
            "/webauthn/auth/verify",
            post(handlers::webauthn_auth_verify::<C, E>),
        )
        // SEC-11: WebAuthn registration also needs stricter rate limiting
        // These are authenticated endpoints but registration can be abused
        // to enumerate users or exhaust passkey slots
        .route(
            "/webauthn/register/options",
            post(handlers::webauthn_register_options::<C, E>),
        )
        .route(
            "/webauthn/register/verify",
            post(handlers::webauthn_register_verify::<C, E>),
        )
        // Wallet signing, unlock, and rotation need strict rate limiting to prevent abuse
        .route("/wallet/sign", post(handlers::sign_transaction::<C, E>))
        .route("/wallet/unlock", post(handlers::wallet_unlock::<C, E>))
        .route("/wallet/rotate", post(handlers::wallet_rotate::<C, E>))
        // User withdrawal routes — strict rate limiting for financial operations
        .route(
            "/wallet/withdraw/balances",
            get(handlers::withdraw_balances::<C, E>),
        )
        .route("/wallet/withdraw/sol", post(handlers::withdraw_sol::<C, E>))
        .route("/wallet/withdraw/spl", post(handlers::withdraw_spl::<C, E>))
        .route(
            "/wallet/withdraw/history",
            get(handlers::withdraw_history::<C, E>),
        )
        // Enterprise SSO routes
        .route("/sso/start", post(handlers::start_sso::<C, E>))
}

fn general_routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        // Discovery endpoints (no auth required)
        .route("/discovery", get(handlers::auth_config::<C, E>))
        .route("/openapi.json", get(handlers::openapi_spec))
        // AI-friendly discovery endpoints
        .route("/ai.txt", get(handlers::ai_txt::<C, E>))
        .route("/llms.txt", get(handlers::llms_txt::<C, E>))
        .route("/llms-full.txt", get(handlers::llms_full_txt::<C, E>))
        .route("/llms-admin.txt", get(handlers::llms_admin_txt::<C, E>))
        .route("/agent.md", get(handlers::agent_md::<C, E>))
        .route("/skill.md", get(handlers::skill_md::<C, E>))
        .route("/skill.json", get(handlers::skill_json::<C, E>))
        .route("/heartbeat.md", get(handlers::heartbeat_md::<C, E>))
        .route("/heartbeat.json", get(handlers::heartbeat_json::<C, E>))
        // Individual skill files
        .route("/skills/auth.md", get(handlers::skill_auth_md::<C, E>))
        .route(
            "/skills/profile.md",
            get(handlers::skill_profile_md::<C, E>),
        )
        .route("/skills/orgs.md", get(handlers::skill_orgs_md::<C, E>))
        .route("/skills/mfa.md", get(handlers::skill_mfa_md::<C, E>))
        .route("/skills/wallet.md", get(handlers::skill_wallet_md::<C, E>))
        .route("/skills/admin.md", get(handlers::skill_admin_md::<C, E>))
        // Standard AI manifests
        .route(
            "/.well-known/ai-discovery.json",
            get(handlers::ai_discovery_index::<C, E>),
        )
        .route(
            "/.well-known/ai-plugin.json",
            get(handlers::ai_plugin_json::<C, E>),
        )
        .route("/.well-known/agent.json", get(handlers::agent_json::<C, E>))
        .route("/.well-known/mcp", get(handlers::mcp_discovery::<C, E>))
        .route(
            "/.well-known/skills.zip",
            get(handlers::skills_bundle_zip::<C, E>),
        )
        .route("/logout", post(handlers::logout::<C, E>))
        // M-02: Granular logout - revoke all sessions at once
        .route("/logout-all", post(handlers::logout_all::<C, E>))
        .route("/user", get(handlers::get_user::<C, E>))
        .route("/me", patch(handlers::update_profile::<C, E>))
        .route(
            "/send-verification",
            post(handlers::send_verification::<C, E>),
        )
        .route("/verify-email", post(handlers::verify_email::<C, E>))
        // API key management (authenticated)
        .route("/user/api-key", get(handlers::get_api_key::<C, E>))
        .route(
            "/user/api-key/regenerate",
            post(handlers::regenerate_api_key::<C, E>),
        )
        // Multi-API-key management
        .route(
            "/user/api-keys",
            get(handlers::list_api_keys::<C, E>).post(handlers::create_api_key::<C, E>),
        )
        .route(
            "/user/api-keys/{id}",
            delete(handlers::delete_api_key::<C, E>),
        )
        // Organization routes
        .route(
            "/orgs",
            get(handlers::list_orgs::<C, E>).post(handlers::create_org::<C, E>),
        )
        .route(
            "/orgs/{org_id}",
            get(handlers::get_org::<C, E>)
                .patch(handlers::update_org::<C, E>)
                .delete(handlers::delete_org::<C, E>),
        )
        .route("/orgs/{org_id}/switch", post(handlers::switch_org::<C, E>))
        // Member routes
        .route(
            "/orgs/{org_id}/members",
            get(handlers::list_members::<C, E>),
        )
        .route(
            "/orgs/{org_id}/members/{user_id}",
            patch(handlers::update_member_role::<C, E>).delete(handlers::remove_member::<C, E>),
        )
        // Custom role routes
        .route(
            "/orgs/{org_id}/roles",
            get(handlers::list_custom_roles::<C, E>).post(handlers::create_custom_role::<C, E>),
        )
        .route(
            "/orgs/{org_id}/roles/{role_id}",
            get(handlers::get_custom_role::<C, E>)
                .patch(handlers::update_custom_role::<C, E>)
                .delete(handlers::delete_custom_role::<C, E>),
        )
        .route(
            "/orgs/{org_id}/roles/{role_id}/default",
            post(handlers::set_default_role::<C, E>),
        )
        // ABAC Policy routes
        .route(
            "/orgs/{org_id}/policies",
            get(handlers::list_policies::<C, E>).post(handlers::create_policy::<C, E>),
        )
        .route(
            "/orgs/{org_id}/policies/{policy_id}",
            get(handlers::get_policy::<C, E>)
                .patch(handlers::update_policy::<C, E>)
                .delete(handlers::delete_policy::<C, E>),
        )
        // Invite routes
        .route(
            "/orgs/{org_id}/invites",
            get(handlers::list_invites::<C, E>).post(handlers::create_invite::<C, E>),
        )
        .route(
            "/orgs/{org_id}/invites/{invite_id}",
            delete(handlers::cancel_invite::<C, E>),
        )
        .route(
            "/orgs/{org_id}/invites/{invite_id}/resend",
            post(handlers::resend_invite::<C, E>),
        )
        .route("/invites/accept", post(handlers::accept_invite::<C, E>))
        // Authorization routes
        .route("/authorize", post(handlers::authorize::<C, E>))
        .route("/permissions", post(handlers::get_permissions::<C, E>))
        // Session management routes
        .route(
            "/sessions",
            get(handlers::list_sessions::<C, E>).delete(handlers::revoke_all_sessions::<C, E>),
        )
        // MFA routes (management only - verify/recovery in auth routes for stricter rate limiting)
        .route("/mfa/setup", post(handlers::setup_mfa::<C, E>))
        .route("/mfa/enable", post(handlers::enable_mfa::<C, E>))
        .route("/mfa/disable", post(handlers::disable_mfa::<C, E>))
        .route("/mfa/status", get(handlers::mfa_status::<C, E>))
        .route(
            "/mfa/recovery-codes/regenerate",
            post(handlers::regenerate_recovery_codes::<C, E>),
        )
        // Audit log routes
        .route(
            "/orgs/{org_id}/audit",
            get(handlers::get_org_audit_logs::<C, E>),
        )
        .route("/admin/audit", get(handlers::get_system_audit_logs::<C, E>))
        // Admin management routes
        .route("/admin/users", get(handlers::list_users::<C, E>))
        .route("/admin/users/stats", get(handlers::get_user_stats::<C, E>))
        .route(
            "/admin/users/{user_id}",
            get(handlers::get_admin_user::<C, E>)
                .patch(handlers::update_user::<C, E>)
                .delete(handlers::delete_user::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/system-admin",
            patch(handlers::set_system_admin::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/force-password-reset",
            post(handlers::force_password_reset::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/credits",
            get(handlers::get_user_credits::<C, E>).post(handlers::adjust_credits::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/deposits",
            get(handlers::get_user_deposits::<C, E>),
        )
        .route(
            "/admin/users/{user_id}/withdrawal-history",
            get(handlers::get_user_withdrawal_history::<C, E>),
        )
        .route("/admin/orgs", get(handlers::list_admin_orgs::<C, E>))
        .route("/admin/orgs/{org_id}", get(handlers::get_admin_org::<C, E>))
        // SSO provider management routes (system admin)
        .route(
            "/admin/sso-providers",
            get(handlers::list_sso_providers::<C, E>).post(handlers::create_sso_provider::<C, E>),
        )
        .route(
            "/admin/sso-providers/{id}",
            get(handlers::get_sso_provider::<C, E>)
                .put(handlers::update_sso_provider::<C, E>)
                .delete(handlers::delete_sso_provider::<C, E>),
        )
        // Admin system settings routes (system admin)
        .route(
            "/admin/settings",
            get(handlers::list_settings::<C, E>).patch(handlers::update_settings::<C, E>),
        )
        // Admin dashboard permissions routes (system admin)
        .route(
            "/admin/dashboard-permissions",
            get(handlers::get_dashboard_permissions::<C, E>)
                .put(handlers::update_dashboard_permissions::<C, E>),
        )
        // Admin deposit routes (system admin)
        .route(
            "/admin/deposits",
            get(handlers::list_admin_deposits::<C, E>),
        )
        .route(
            "/admin/deposits/stats",
            get(handlers::get_deposit_stats::<C, E>),
        )
        .route(
            "/admin/deposits/in-privacy-period",
            get(handlers::list_in_privacy_period::<C, E>),
        )
        .route(
            "/admin/withdrawals/pending",
            get(handlers::list_pending_withdrawals::<C, E>),
        )
        .route(
            "/admin/withdrawals/{id}/process",
            post(handlers::process_withdrawal::<C, E>),
        )
        .route(
            "/admin/withdrawals/process-all",
            post(handlers::process_all_withdrawals::<C, E>),
        )
        // Admin credit routes (system admin)
        .route(
            "/admin/credits/stats",
            get(handlers::get_credit_stats::<C, E>),
        )
        .route(
            "/admin/credits/refund-requests",
            get(handlers::list_credit_refund_requests::<C, E>),
        )
        .route(
            "/admin/credits/refund-requests/{id}/process",
            post(handlers::process_credit_refund_request::<C, E>),
        )
        .route(
            "/admin/credits/refund-requests/{id}/reject",
            post(handlers::reject_credit_refund_request::<C, E>),
        )
        // Admin privacy status route (system admin)
        .route(
            "/admin/privacy/status",
            get(handlers::get_privacy_status::<C, E>),
        )
        // Admin treasury configuration routes (system admin)
        .route(
            "/admin/treasury/authorize",
            post(handlers::authorize_treasury::<C, E>),
        )
        .route(
            "/admin/treasury",
            get(handlers::get_treasury::<C, E>).delete(handlers::revoke_treasury::<C, E>),
        )
        // Wallet routes (server-side signing Solana wallet)
        // Note: rotation and signing endpoints are in auth_sensitive_routes for stricter rate limiting
        .route("/wallet/enroll", post(handlers::wallet_enroll::<C, E>))
        .route(
            "/wallet/material",
            get(handlers::get_wallet_material::<C, E>),
        )
        .route("/wallet/status", get(handlers::wallet_status::<C, E>))
        .route("/wallet/lock", post(handlers::wallet_lock::<C, E>))
        .route("/wallet/recover", post(handlers::wallet_recover::<C, E>))
        .route("/wallet/list", get(handlers::list_wallets::<C, E>))
        // Share C recovery: get Share B after proving ownership via Share C
        .route(
            "/wallet/share-b",
            post(handlers::get_share_b_for_recovery::<C, E>),
        )
        // Pending recovery: retrieve and acknowledge recovery phrase after enrollment
        .route(
            "/wallet/pending-recovery",
            get(handlers::get_pending_recovery::<C, E>),
        )
        .route(
            "/wallet/acknowledge-recovery",
            post(handlers::acknowledge_recovery::<C, E>),
        )
        // Credential management routes
        .route("/credentials", get(handlers::list_credentials::<C, E>))
        .route(
            "/credentials/{credential_id}",
            patch(handlers::update_credential::<C, E>).delete(handlers::unlink_credential::<C, E>),
        )
        // Note: WebAuthn registration routes moved to auth_sensitive_routes (SEC-11)
        // SSO callback (handles redirect from identity provider)
        .route("/sso/callback", get(handlers::sso_callback::<C, E>))
        // Privacy Cash deposit routes (SSS wallets only)
        .route("/deposit/config", get(handlers::deposit_config::<C, E>))
        .route("/deposit/quote", get(handlers::deposit_quote::<C, E>))
        .route("/deposit", post(handlers::execute_deposit::<C, E>))
        .route(
            "/deposit/pending-spl",
            get(handlers::list_pending_spl_deposits::<C, E>),
        )
        .route(
            "/deposit/confirm-spl",
            post(handlers::confirm_spl_deposit::<C, E>),
        )
        .route("/prices", get(handlers::token_prices))
        .route(
            "/deposit/public",
            post(handlers::execute_public_deposit::<C, E>),
        )
        .route(
            "/deposit/micro",
            post(handlers::execute_micro_deposit::<C, E>),
        )
        .route(
            "/deposit/status/{session_id}",
            get(handlers::deposit_status::<C, E>),
        )
        .route(
            "/deposit/{session_id}",
            delete(handlers::cancel_deposit::<C, E>),
        )
        .route("/deposits", get(handlers::list_deposits::<C, E>))
        // Credit balance and history routes (user JWT)
        .route("/credits/balance", get(handlers::get_balance::<C, E>))
        .route(
            "/credits/balance/sol",
            get(handlers::get_sol_balance::<C, E>),
        )
        .route("/credits/history", get(handlers::get_history::<C, E>))
        .route("/credits/holds", get(handlers::get_pending_holds::<C, E>))
        .route("/credits/usage", get(handlers::get_usage::<C, E>))
        .route(
            "/credits/refund-request",
            post(handlers::request_refund::<C, E>),
        )
        // User lookup routes (admin API key)
        .route(
            "/users/by-wallet/{wallet_address}",
            get(handlers::lookup_by_wallet::<C, E>),
        )
        .route(
            "/users/by-stripe-customer/{stripe_customer_id}",
            get(handlers::lookup_by_stripe_customer::<C, E>),
        )
        .route(
            "/users/by-stripe-customer/{stripe_customer_id}/link",
            post(handlers::link_stripe_customer::<C, E>),
        )
        // Webhook routes (external service callbacks)
        .route(
            "/webhook/deposit",
            post(handlers::handle_deposit_webhook::<C, E>),
        )
}

/// Credit operations routes with dedicated rate limiting
///
/// These endpoints allow service-to-service credit spending and require
/// stricter rate limits to prevent rapid-fire spend attacks or fraud.
fn credit_operations_routes<C: AuthCallback + 'static, E: EmailService + 'static>(
) -> Router<Arc<AppState<C, E>>> {
    Router::new()
        .route(
            "/credits/spend/{user_id}",
            post(handlers::spend_credits::<C, E>),
        )
        .route(
            "/credits/hold/{user_id}",
            post(handlers::create_hold::<C, E>),
        )
        .route(
            "/credits/capture/{hold_id}",
            post(handlers::capture_hold::<C, E>),
        )
        .route(
            "/credits/release/{hold_id}",
            post(handlers::release_hold::<C, E>),
        )
}

/// Create the appropriate rate limit backend based on configuration
fn create_rate_limit_backend(config: &crate::config::RateLimitConfig) -> RateLimitBackend {
    match config.store.as_str() {
        #[cfg(feature = "redis-rate-limit")]
        "redis" => {
            let redis_url = match config.redis_url.as_deref() {
                Some(url) => url,
                None => {
                    tracing::error!(
                        "RATE_LIMIT_STORE=redis but REDIS_URL is missing; falling back to in-memory"
                    );
                    return RateLimitBackend::Memory(RateLimitStore::new());
                }
            };

            match RedisRateLimitStore::new(redis_url) {
                Ok(store) => RateLimitBackend::Redis(store),
                Err(e) => {
                    tracing::error!(
                        error = %e,
                        "Failed to create Redis rate limit store, falling back to in-memory"
                    );
                    RateLimitBackend::Memory(RateLimitStore::new())
                }
            }
        }
        _ => RateLimitBackend::Memory(RateLimitStore::new()),
    }
}

#[cfg(all(test, feature = "redis-rate-limit"))]
mod tests {
    #[test]
    fn test_create_rate_limit_backend_redis_missing_url_falls_back() {
        let config = crate::config::RateLimitConfig {
            enabled: true,
            auth_limit: 1,
            general_limit: 1,
            credit_limit: 1,
            window_secs: 60,
            store: "redis".to_string(),
            redis_url: None,
        };

        let backend = super::create_rate_limit_backend(&config);
        match backend {
            super::RateLimitBackend::Memory(_) => {}
            _ => panic!("expected in-memory backend fallback"),
        }
    }
}
