type SettingSeed = readonly [key: string, value: string, description: string];

const SETTINGS_SEEDS = {
  rate_limit: [
    ['rate_limit_auth', '10', 'Auth attempts per window'],
    ['rate_limit_general', '60', 'General requests per window'],
    ['rate_limit_window', '60', 'Window size (seconds)'],
  ],
  'auth.email': [
    ['auth_email_enabled', 'true', 'Enable email/password authentication'],
    ['auth_email_require_verification', 'true', 'Require email verification'],
    ['auth_email_block_disposable', 'true', 'Block disposable email domains'],
  ],
  'auth.google': [
    ['auth_google_enabled', 'true', 'Enable Google OAuth'],
    [
      'auth_google_client_id',
      'demo-google-client-id.apps.googleusercontent.com',
      'Google Client ID',
    ],
  ],
  'auth.apple': [
    ['auth_apple_enabled', 'false', 'Enable Apple Sign In'],
    ['auth_apple_client_id', '', 'Apple Services ID'],
    ['auth_apple_team_id', '', 'Apple Team ID'],
  ],
  'auth.solana': [
    ['auth_solana_enabled', 'true', 'Enable Solana wallet auth'],
    ['auth_solana_challenge_expiry', '300', 'Challenge expiry time (seconds)'],
  ],
  'auth.webauthn': [
    ['auth_webauthn_enabled', 'true', 'Enable WebAuthn/Passkey'],
    ['auth_webauthn_rp_id', 'localhost', 'Relying Party ID'],
    ['auth_webauthn_rp_name', 'Cedros Login', 'Relying Party name'],
    ['auth_webauthn_rp_origin', 'http://localhost:3000', 'Allowed origin'],
  ],
  'auth.instantlink': [
    ['auth_instantlink_enabled', 'true', 'Enable magic link login'],
    ['auth_instantlink_expiry', '900', 'Link expiry time (seconds)'],
    ['auth_instantlink_rate_limit', '5', 'Max requests per email per hour'],
  ],
  postlogin: [['postlogin_redirect_url', '', 'URL to redirect to after login']],
  'postlogin.welcome': [
    ['postlogin_welcome_enabled', 'false', 'Show a one-time welcome page to new users'],
    ['postlogin_welcome_route', '/welcome', 'Route for the welcome/onboarding page'],
  ],
  'postlogin.username': [
    ['postlogin_username_enabled', 'false', 'Prompt new users to choose a username'],
  ],
  'postlogin.complete': [
    [
      'postlogin_complete_enabled',
      'false',
      'Prompt users to fill in missing profile info after login',
    ],
  ],
  'postlogin.subscription': [
    [
      'subscription_selection_required',
      'false',
      'Require users to choose a Cedros Pay subscription plan',
    ],
    [
      'subscription_selection_route',
      '/subscribe',
      'App route that renders the subscription-plan chooser',
    ],
    [
      'subscription_selection_pay_base_url',
      '',
      'Base URL for Cedros Pay subscription-selection endpoints',
    ],
  ],
  features: [
    ['feature_organizations', 'true', 'Enable multi-tenant orgs'],
    ['feature_sso', 'false', 'Enable SSO for organizations'],
    ['feature_mfa', 'true', 'Enable two-factor authentication'],
  ],
  security: [
    ['security_cors_origins', 'http://localhost:3000,http://localhost:5173', 'CORS origins'],
    ['security_cookie_domain', 'localhost', 'Cookie domain'],
    ['security_cookie_secure', 'false', 'Require HTTPS for cookies'],
    ['security_cookie_same_site', 'lax', 'SameSite cookie policy'],
    ['security_session_timeout', '604800', 'Session timeout (seconds)'],
    ['security_jwt_issuer', '', 'JWT issuer claim'],
    ['security_jwt_audience', '', 'JWT audience claim'],
  ],
  email: [
    ['email_provider', 'sendgrid', 'Email service provider'],
    ['email_smtp_host', 'smtp.sendgrid.net', 'SMTP server hostname'],
    ['email_smtp_port', '587', 'SMTP server port'],
    ['email_smtp_user', 'apikey', 'SMTP username'],
    ['email_smtp_password', '', 'SMTP password / API key'],
    ['email_smtp_tls', 'true', 'Use TLS for SMTP'],
    ['email_from_address', 'noreply@example.com', 'From email address'],
    ['email_from_name', 'Cedros Login', 'From display name'],
  ],
  webhook: [
    ['webhook_enabled', 'false', 'Enable webhook notifications'],
    ['webhook_url', '', 'Discord or Slack webhook URL'],
    ['webhook_notify_registrations', 'true', 'Notify on new registrations'],
    ['webhook_notify_signins', 'false', 'Notify on sign-ins'],
  ],
  server: [
    ['server_frontend_url', 'http://localhost:3000', 'Frontend URL'],
    ['server_base_path', '/auth', 'Base path for auth endpoints'],
    ['server_trust_proxy', 'false', 'Trust X-Forwarded-For headers'],
    ['server_metrics_api_key', 'metrics_sk_test_prometheus_key', 'API key for Prometheus metrics'],
    ['server_log_level', 'info', 'Log level'],
    ['server_log_format', 'json', 'Log format'],
    ['server_environment', 'development', 'Environment'],
  ],
} satisfies Record<string, readonly SettingSeed[]>;

const SECRET_KEYS = new Set([
  'email_smtp_password',
  'image_storage_access_key',
  'image_storage_secret_key',
  'server_metrics_api_key',
  'webhook_secret',
]);

function buildSettings(now: string) {
  return Object.fromEntries(
    Object.entries(SETTINGS_SEEDS).map(([category, seeds]) => [
      category,
      seeds.map(([key, value, description]) => ({
        key,
        value,
        description,
        updatedAt: now,
        updatedBy: null,
        isSecret: SECRET_KEYS.has(key),
      })),
    ])
  );
}

/** Returns the complete system-settings fixture using one consistent timestamp. */
export function getMockSettingsResponse() {
  const now = new Date().toISOString();
  return {
    settings: buildSettings(now),
    revision: 1,
    etag: '"cedros.system_settings:1"',
    updatedAt: now,
  };
}

export function mockSettingsMutationResponse(settings: Array<{ key: string; value: string }>) {
  const revision = 2;
  const updated = settings.map((setting) => ({
    key: setting.key,
    value: setting.value,
    description: `Updated ${setting.key}`,
    isSecret: false,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin-user-id',
  }));
  return {
    updated,
    revision,
    etag: `"cedros.system_settings:${revision}"`,
  };
}
