import { useState as k, useRef as T, useEffect as O, useCallback as d, useMemo as S } from "react";
import { u as E } from "./useSystemSettings-DBlAMjFi.js";
import { jsx as t, jsxs as u, Fragment as f } from "react/jsx-runtime";
const U = 800, I = 2e3;
function X() {
  const { settings: e, isLoading: l, error: a, fetchSettings: n, updateSettings: s } = E(), [i, p] = k({}), [r, o] = k("idle"), [c, m] = k(null), h = T(null), y = T(null), w = T({});
  O(() => () => {
    h.current && clearTimeout(h.current), y.current && clearTimeout(y.current);
  }, []);
  const N = d(async () => {
    const _ = { ...w.current };
    if (Object.keys(_).length === 0) {
      o("idle");
      return;
    }
    o("saving"), m(null);
    const v = Object.entries(_).map(([b, g]) => ({
      key: b,
      value: g
    }));
    try {
      await s(v), p((b) => {
        const g = { ...b };
        for (const C of Object.keys(_))
          delete g[C];
        return g;
      });
      for (const b of Object.keys(_))
        delete w.current[b];
      o("saved"), y.current && clearTimeout(y.current), y.current = setTimeout(() => {
        o("idle");
      }, I);
    } catch (b) {
      o("error"), m(b instanceof Error ? b.message : "Failed to save");
    }
  }, [s]), D = d(
    (_, v) => {
      p((b) => ({ ...b, [_]: v })), w.current[_] = v, m(null), o("pending"), h.current && clearTimeout(h.current), h.current = setTimeout(() => {
        N();
      }, U);
    },
    [N]
  ), A = d(
    (_) => {
      if (i[_] !== void 0) return i[_];
      for (const v of Object.values(e)) {
        const b = v.find((g) => g.key === _);
        if (b) return b.value;
      }
      return "";
    },
    [i, e]
  );
  return {
    settings: e,
    edits: i,
    isLoading: l,
    autosaveStatus: r,
    autosaveError: c,
    error: a,
    fetchSettings: n,
    handleChange: D,
    getEffectiveValue: A
  };
}
function M(e) {
  const l = Math.floor(e / 86400), a = Math.floor(e % 86400 / 3600), n = Math.floor(e % 3600 / 60), s = e % 60;
  return { days: l, hours: a, minutes: n, seconds: s };
}
function R(e) {
  const { days: l, hours: a, minutes: n } = M(e), s = [];
  return l > 0 && s.push(`${l}d`), a > 0 && s.push(`${a}h`), n > 0 && s.push(`${n}m`), s.length === 0 && s.push(`${e}s`), s.join(" ");
}
const q = {
  // ============= Authentication Providers =============
  // Email auth
  auth_email_enabled: {
    key: "auth_email_enabled",
    label: "Enable Email Authentication",
    description: "Allow users to sign up and log in with email/password.",
    inputType: "boolean"
  },
  auth_email_require_verification: {
    key: "auth_email_require_verification",
    label: "Require Email Verification",
    description: "Users must verify their email address before they can log in.",
    inputType: "boolean"
  },
  auth_email_block_disposable: {
    key: "auth_email_block_disposable",
    label: "Block Disposable Emails",
    description: "Reject registrations from known disposable email providers.",
    inputType: "boolean"
  },
  // Google OAuth
  auth_google_enabled: {
    key: "auth_google_enabled",
    label: "Enable Google Sign-In",
    description: "Allow users to authenticate with their Google account.",
    inputType: "boolean"
  },
  auth_google_client_id: {
    key: "auth_google_client_id",
    label: "Google Client ID",
    description: "OAuth 2.0 client ID from Google Cloud Console.",
    inputType: "text"
  },
  auth_google_client_secret: {
    key: "auth_google_client_secret",
    label: "Google Client Secret",
    description: "OAuth 2.0 client secret from Google Cloud Console.",
    inputType: "secret"
  },
  // Apple OAuth
  auth_apple_enabled: {
    key: "auth_apple_enabled",
    label: "Enable Sign in with Apple",
    description: "Allow users to authenticate with their Apple ID.",
    inputType: "boolean"
  },
  auth_apple_client_id: {
    key: "auth_apple_client_id",
    label: "Apple Services ID",
    description: "The Services ID configured in your Apple Developer account.",
    inputType: "text"
  },
  auth_apple_team_id: {
    key: "auth_apple_team_id",
    label: "Apple Team ID",
    description: "Your Apple Developer Team ID.",
    inputType: "text"
  },
  auth_apple_key_id: {
    key: "auth_apple_key_id",
    label: "Apple Key ID",
    description: "The Key ID for your Sign in with Apple private key.",
    inputType: "text"
  },
  auth_apple_private_key: {
    key: "auth_apple_private_key",
    label: "Apple Private Key",
    description: "The private key file contents (PEM format) for Sign in with Apple.",
    inputType: "secret",
    multiline: !0
  },
  // Solana auth
  auth_solana_enabled: {
    key: "auth_solana_enabled",
    label: "Enable Solana Wallet Auth",
    description: "Allow users to authenticate by signing with their Solana wallet.",
    inputType: "boolean"
  },
  auth_solana_challenge_expiry: {
    key: "auth_solana_challenge_expiry",
    label: "Challenge Expiry",
    description: "How long a wallet signature challenge is valid.",
    inputType: "duration",
    min: 60,
    presets: [
      { label: "1 minute", value: "60" },
      { label: "5 minutes", value: "300" },
      { label: "10 minutes", value: "600" }
    ]
  },
  // WebAuthn/Passkeys
  auth_webauthn_enabled: {
    key: "auth_webauthn_enabled",
    label: "Enable WebAuthn/Passkeys",
    description: "Allow passwordless authentication with FIDO2/WebAuthn credentials.",
    inputType: "boolean"
  },
  auth_webauthn_rp_id: {
    key: "auth_webauthn_rp_id",
    label: "Relying Party ID",
    description: "Usually your domain (e.g., example.com). Passkeys are bound to this.",
    inputType: "text"
  },
  auth_webauthn_rp_name: {
    key: "auth_webauthn_rp_name",
    label: "Relying Party Name",
    description: "Display name shown to users during passkey registration.",
    inputType: "text"
  },
  auth_webauthn_rp_origin: {
    key: "auth_webauthn_rp_origin",
    label: "Allowed Origins",
    description: "Comma-separated origins allowed for WebAuthn (e.g., https://example.com).",
    inputType: "text"
  },
  // Instant Link (Magic Link)
  auth_instantlink_enabled: {
    key: "auth_instantlink_enabled",
    label: "Enable Instant Link",
    description: "Allow passwordless login via magic link sent to email.",
    inputType: "boolean"
  },
  auth_instantlink_expiry: {
    key: "auth_instantlink_expiry",
    label: "Link Expiry",
    description: "How long the magic link remains valid.",
    inputType: "duration",
    min: 60,
    presets: [
      { label: "5 minutes", value: "300" },
      { label: "15 minutes", value: "900" },
      { label: "30 minutes", value: "1800" },
      { label: "1 hour", value: "3600" }
    ]
  },
  auth_instantlink_rate_limit: {
    key: "auth_instantlink_rate_limit",
    label: "Rate Limit",
    description: "Maximum instant link requests per email per hour.",
    inputType: "select",
    presets: [
      { label: "3 per hour", value: "3" },
      { label: "5 per hour", value: "5" },
      { label: "10 per hour", value: "10" }
    ]
  },
  // ============= Feature Flags =============
  // Order: organizations, enterprise SSO, 2fa, embedded wallets, credit system
  feature_organizations: {
    key: "feature_organizations",
    label: "Organizations",
    description: "Enable multi-user organizations with role-based access.",
    inputType: "boolean"
  },
  feature_sso: {
    key: "feature_sso",
    label: "Enterprise SSO",
    description: "Enable SAML/OIDC single sign-on for enterprise customers.",
    inputType: "boolean"
  },
  feature_mfa: {
    key: "feature_mfa",
    label: "Two-Factor Authentication",
    description: "Allow users to enable TOTP-based two-factor authentication.",
    inputType: "boolean"
  },
  feature_wallet_signing: {
    key: "feature_wallet_signing",
    label: "Enable Embedded Wallet",
    description: "Enable the embedded wallet for transaction signing.",
    inputType: "boolean"
  },
  wallet_recovery_mode: {
    key: "wallet_recovery_mode",
    label: "Recovery Mode",
    description: "How users can recover their wallet if they lose access.",
    inputType: "select",
    presets: [
      { label: "Share C Only (Recommended)", value: "share_c_only" },
      { label: "Full Seed Phrase", value: "full_seed" },
      { label: "No Recovery", value: "none" }
    ]
  },
  feature_credits: {
    key: "feature_credits",
    label: "Credit System",
    description: "Enable the deposits and credits system. Users can deposit tokens to receive platform credits.",
    inputType: "boolean"
  },
  feature_user_withdrawals: {
    key: "feature_user_withdrawals",
    label: "User Withdrawals",
    description: "Allow users to withdraw SOL/SPL tokens from their embedded wallet to external addresses.",
    inputType: "boolean"
  },
  // ============= Security Settings =============
  security_cors_origins: {
    key: "security_cors_origins",
    label: "CORS Origins",
    description: "Allowed origins for cross-origin requests (comma-separated). Empty = same origin only.",
    inputType: "text"
  },
  security_cookie_domain: {
    key: "security_cookie_domain",
    label: "Cookie Domain",
    description: "Domain for auth cookies. Empty uses the request origin.",
    inputType: "text"
  },
  security_cookie_secure: {
    key: "security_cookie_secure",
    label: "Secure Cookies",
    description: "Require HTTPS for cookies. Disable only for local development.",
    inputType: "boolean"
  },
  security_cookie_same_site: {
    key: "security_cookie_same_site",
    label: "Cookie SameSite",
    description: 'SameSite policy for cookies. Use "none" only if needed for cross-site embeds.',
    inputType: "select",
    presets: [
      { label: "Strict", value: "strict" },
      { label: "Lax (Recommended)", value: "lax" },
      { label: "None (cross-site)", value: "none" }
    ]
  },
  security_session_timeout: {
    key: "security_session_timeout",
    label: "Session Timeout",
    description: "How long sessions remain valid before requiring re-authentication.",
    inputType: "duration",
    min: 300,
    presets: [
      { label: "1 hour", value: "3600" },
      { label: "24 hours", value: "86400" },
      { label: "7 days", value: "604800" },
      { label: "30 days", value: "2592000" }
    ]
  },
  security_jwt_issuer: {
    key: "security_jwt_issuer",
    label: "JWT Issuer",
    description: "Issuer claim for JWTs. Empty uses the server URL.",
    inputType: "text"
  },
  security_jwt_audience: {
    key: "security_jwt_audience",
    label: "JWT Audience",
    description: "Audience claim for JWTs. Empty uses default.",
    inputType: "text"
  },
  // ============= Email/SMTP Settings =============
  email_provider: {
    key: "email_provider",
    label: "Email Provider",
    description: "Select your email service provider for automatic configuration.",
    inputType: "select",
    presets: [
      { label: "Mailgun", value: "mailgun" },
      { label: "SendGrid", value: "sendgrid" },
      { label: "Postmark", value: "postmark" },
      { label: "AWS SES", value: "ses" },
      { label: "Resend", value: "resend" },
      { label: "Custom SMTP", value: "custom" }
    ]
  },
  email_smtp_host: {
    key: "email_smtp_host",
    label: "SMTP Host",
    description: "SMTP server hostname (e.g., smtp.sendgrid.net).",
    inputType: "text"
  },
  email_smtp_port: {
    key: "email_smtp_port",
    label: "SMTP Port",
    description: "SMTP server port. Common: 587 (TLS), 465 (SSL), 25 (unencrypted).",
    inputType: "select",
    presets: [
      { label: "587 (TLS)", value: "587" },
      { label: "465 (SSL)", value: "465" },
      { label: "25 (Plain)", value: "25" }
    ]
  },
  email_smtp_user: {
    key: "email_smtp_user",
    label: "SMTP Username",
    description: "Username for SMTP authentication.",
    inputType: "text"
  },
  email_smtp_password: {
    key: "email_smtp_password",
    label: "API Key",
    description: "API key or password for your email provider.",
    inputType: "secret"
  },
  email_smtp_tls: {
    key: "email_smtp_tls",
    label: "Use TLS",
    description: "Enable TLS encryption for SMTP connections.",
    inputType: "boolean"
  },
  email_from_address: {
    key: "email_from_address",
    label: "From Address",
    description: "Default sender email address (e.g., noreply@example.com).",
    inputType: "text"
  },
  email_from_name: {
    key: "email_from_name",
    label: "From Name",
    description: 'Default sender display name (e.g., "My App").',
    inputType: "text"
  },
  // ============= Webhook Settings =============
  webhook_enabled: {
    key: "webhook_enabled",
    label: "Enable Webhooks",
    description: "Send notifications to a Discord or Slack webhook URL.",
    inputType: "boolean"
  },
  webhook_url: {
    key: "webhook_url",
    label: "Webhook URL",
    description: "Discord or Slack webhook URL to receive notifications.",
    inputType: "text",
    placeholder: "https://discord.com/api/webhooks/..."
  },
  webhook_notify_registrations: {
    key: "webhook_notify_registrations",
    label: "New Registrations",
    description: "Notify when a new user registers.",
    inputType: "boolean"
  },
  webhook_notify_signins: {
    key: "webhook_notify_signins",
    label: "Sign-Ins",
    description: "Notify when a user signs in.",
    inputType: "boolean"
  },
  webhook_notify_deposits: {
    key: "webhook_notify_deposits",
    label: "Deposits",
    description: "Notify when a user makes a deposit.",
    inputType: "boolean"
  },
  // ============= Server Settings =============
  server_frontend_url: {
    key: "server_frontend_url",
    label: "Frontend URL",
    description: "URL of your frontend app (for redirects and email links).",
    inputType: "text"
  },
  server_base_path: {
    key: "server_base_path",
    label: "Base Path",
    description: "Base path for auth endpoints (e.g., /auth).",
    inputType: "text"
  },
  server_trust_proxy: {
    key: "server_trust_proxy",
    label: "Trust Proxy",
    description: "Trust X-Forwarded-For headers. Enable if behind a reverse proxy.",
    inputType: "boolean"
  },
  server_cedros_pay_api_key: {
    key: "server_cedros_pay_api_key",
    label: "Cedros Pay API Key",
    description: "API key for Cedros Pay to authenticate with this server. Copy this into your Cedros Pay settings.",
    inputType: "secret"
  },
  jupiter_api_key: {
    key: "jupiter_api_key",
    label: "Jupiter API Key",
    description: 'API key for Jupiter Ultra API (gasless swaps). Get a free key at <a href="https://portal.jup.ag" target="_blank" rel="noopener">portal.jup.ag</a>.',
    inputType: "secret"
  },
  server_metrics_api_key: {
    key: "server_metrics_api_key",
    label: "Metrics API Key",
    description: "API key for Prometheus/Grafana to scrape the /metrics endpoint. Use with Authorization: Bearer header.",
    inputType: "secret"
  },
  server_log_level: {
    key: "server_log_level",
    label: "Log Level",
    description: "Minimum severity level for log output. Lower levels are more verbose.",
    inputType: "select",
    presets: [
      { label: "Trace (most verbose)", value: "trace" },
      { label: "Debug", value: "debug" },
      { label: "Info", value: "info" },
      { label: "Warn", value: "warn" },
      { label: "Error (least verbose)", value: "error" }
    ]
  },
  server_log_format: {
    key: "server_log_format",
    label: "Log Format",
    description: "Output format for log messages.",
    inputType: "select",
    presets: [
      { label: "JSON (structured)", value: "json" },
      { label: "Pretty (human-readable)", value: "pretty" }
    ]
  },
  server_environment: {
    key: "server_environment",
    label: "Environment",
    description: "Deployment environment. Affects default behaviors and log verbosity.",
    inputType: "select",
    presets: [
      { label: "Development", value: "development" },
      { label: "Staging", value: "staging" },
      { label: "Production", value: "production" }
    ]
  },
  // ============= Privacy Settings (existing) =============
  privacy_period_secs: {
    key: "privacy_period_secs",
    label: "Privacy Period",
    description: "How long deposits are held before withdrawal to provide timing privacy. Longer periods provide better privacy but delay user access to funds.",
    inputType: "duration",
    min: 0,
    presets: [
      { label: "Disabled", value: "0" },
      { label: "1 hour", value: "3600" },
      { label: "6 hours", value: "21600" },
      { label: "24 hours", value: "86400" },
      { label: "7 days", value: "604800" },
      { label: "14 days", value: "1209600" },
      { label: "30 days", value: "2592000" }
    ],
    warningThreshold: {
      below: 3600,
      message: "Very short privacy periods may not provide adequate timing protection."
    }
  },
  // Treasury settings
  treasury_wallet_address: {
    key: "treasury_wallet_address",
    label: "Treasury Wallet Address",
    description: "Solana wallet address where funds are sent. Used for privacy cash withdrawals, micro payment batches, and direct payments.",
    inputType: "text",
    placeholder: "e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  },
  // Withdrawal worker settings
  withdrawal_poll_interval_secs: {
    key: "withdrawal_poll_interval_secs",
    label: "Worker Poll Interval",
    description: "How often the withdrawal worker checks for deposits ready to process. Lower values process faster but increase server load.",
    inputType: "duration",
    min: 60,
    presets: [
      { label: "1 minute", value: "60" },
      { label: "5 minutes", value: "300" },
      { label: "15 minutes", value: "900" },
      { label: "1 hour", value: "3600" },
      { label: "6 hours", value: "21600" }
    ],
    warningThreshold: {
      below: 60,
      message: "Polling more than once per minute may cause excessive load."
    }
  },
  withdrawal_batch_size: {
    key: "withdrawal_batch_size",
    label: "Batch Size",
    description: "Maximum number of withdrawals to process in a single batch. Higher values improve throughput but may cause timeouts.",
    inputType: "select",
    min: 1,
    max: 100,
    presets: [
      { label: "1 (Sequential)", value: "1" },
      { label: "5", value: "5" },
      { label: "10 (Recommended)", value: "10" },
      { label: "25", value: "25" },
      { label: "50", value: "50" },
      { label: "100 (Max)", value: "100" }
    ]
  },
  withdrawal_timeout_secs: {
    key: "withdrawal_timeout_secs",
    label: "Transaction Timeout",
    description: "How long to wait for a withdrawal transaction to confirm before considering it failed.",
    inputType: "duration",
    min: 30,
    presets: [
      { label: "30 seconds", value: "30" },
      { label: "1 minute", value: "60" },
      { label: "2 minutes", value: "120" },
      { label: "5 minutes", value: "300" }
    ],
    warningThreshold: {
      below: 30,
      message: "Very short timeouts may cause premature failure on slow networks."
    }
  },
  withdrawal_max_retries: {
    key: "withdrawal_max_retries",
    label: "Max Retries",
    description: "Number of times to retry a failed withdrawal before marking it as permanently failed.",
    inputType: "select",
    min: 0,
    max: 10,
    presets: [
      { label: "0 (No retries)", value: "0" },
      { label: "1", value: "1" },
      { label: "3 (Recommended)", value: "3" },
      { label: "5", value: "5" },
      { label: "10", value: "10" }
    ]
  },
  withdrawal_percentage: {
    key: "withdrawal_percentage",
    label: "Withdrawal Percentage",
    description: "Percentage of ready funds to withdraw each cycle. Lower values spread withdrawals over time for better privacy.",
    inputType: "percentage",
    min: 1,
    max: 100,
    step: 5,
    presets: [
      { label: "25%", value: "25" },
      { label: "50%", value: "50" },
      { label: "75%", value: "75" },
      { label: "100% (All at once)", value: "100" }
    ],
    warningThreshold: {
      above: 75,
      message: "High percentages may reduce timing privacy by processing most withdrawals together."
    }
  },
  partial_withdrawal_count: {
    key: "partial_withdrawal_count",
    label: "Partial Withdrawals",
    description: "Maximum partial withdrawals per batch. Partial withdrawals add noise to timing analysis. Set to 0 to disable.",
    inputType: "select",
    min: 0,
    presets: [
      { label: "Disabled", value: "0" },
      { label: "1", value: "1" },
      { label: "3", value: "3" },
      { label: "5", value: "5" },
      { label: "10", value: "10" }
    ]
  },
  partial_withdrawal_min_lamports: {
    key: "partial_withdrawal_min_lamports",
    label: "Min Balance for Partial",
    description: "Minimum account balance (in lamports) required before partial withdrawals are considered. 1 SOL = 1,000,000,000 lamports.",
    inputType: "select",
    min: 0,
    presets: [
      { label: "0.1 SOL", value: "100000000" },
      { label: "0.5 SOL", value: "500000000" },
      { label: "1 SOL", value: "1000000000" },
      { label: "5 SOL", value: "5000000000" },
      { label: "10 SOL", value: "10000000000" }
    ]
  },
  // Rate limit settings
  rate_limit_auth: {
    key: "rate_limit_auth",
    label: "Auth Request Limit",
    description: "Maximum authentication attempts (login, register, password reset) per IP per window. Protects against brute force attacks.",
    inputType: "select",
    min: 1,
    unit: "requests",
    presets: [
      { label: "5 (Strict)", value: "5" },
      { label: "10 (Recommended)", value: "10" },
      { label: "20", value: "20" },
      { label: "50 (Permissive)", value: "50" }
    ],
    warningThreshold: {
      above: 20,
      message: "High auth limits may allow brute force attempts."
    }
  },
  rate_limit_general: {
    key: "rate_limit_general",
    label: "General Request Limit",
    description: "Maximum general API requests per IP per window. Affects all non-auth endpoints.",
    inputType: "select",
    min: 1,
    unit: "requests",
    presets: [
      { label: "30", value: "30" },
      { label: "60 (Recommended)", value: "60" },
      { label: "120", value: "120" },
      { label: "300", value: "300" }
    ]
  },
  rate_limit_credit: {
    key: "rate_limit_credit",
    label: "Credit Request Limit",
    description: "Maximum credit/balance check requests per IP per window. Higher for apps that poll balance frequently.",
    inputType: "select",
    min: 1,
    unit: "requests",
    presets: [
      { label: "10", value: "10" },
      { label: "30 (Recommended)", value: "30" },
      { label: "60", value: "60" },
      { label: "120", value: "120" }
    ]
  },
  rate_limit_window: {
    key: "rate_limit_window",
    label: "Rate Limit Window",
    description: 'Time window for rate limiting. All limits above are "per window". Shorter windows are stricter.',
    inputType: "duration",
    min: 1,
    presets: [
      { label: "30 seconds", value: "30" },
      { label: "1 minute", value: "60" },
      { label: "5 minutes", value: "300" },
      { label: "15 minutes", value: "900" }
    ]
  },
  // ============= Deposit General Settings =============
  solana_rpc_url: {
    key: "solana_rpc_url",
    label: "Solana RPC URL",
    description: 'Get a fast RPC endpoint from <a href="https://helius.dev" target="_blank" rel="noopener">Helius</a> or <a href="https://quicknode.com" target="_blank" rel="noopener">QuickNode</a>.',
    inputType: "text",
    placeholder: "https://api.mainnet-beta.solana.com"
  },
  solana_network: {
    key: "solana_network",
    label: "Solana Network",
    description: "The Solana network to use for deposits and withdrawals.",
    inputType: "select",
    presets: [
      { label: "Mainnet", value: "mainnet-beta" },
      { label: "Devnet", value: "devnet" }
    ]
  },
  deposit_privacy_enabled: {
    key: "deposit_privacy_enabled",
    label: "Enable Private Deposits",
    description: "When enabled, deposits are held for a privacy period before withdrawal. Provides timing privacy but delays fund availability.",
    inputType: "boolean"
  },
  deposit_company_token: {
    key: "deposit_company_token",
    label: "Platform Token",
    description: "The token that represents platform credits. Deposits are converted to this token. Common choices: USDC, SOL.",
    inputType: "select",
    presets: [
      { label: "USDC", value: "USDC" },
      { label: "USDT", value: "USDT" },
      { label: "SOL", value: "SOL" },
      { label: "EURC", value: "EURC" }
    ]
  },
  deposit_micro_enabled: {
    key: "deposit_micro_enabled",
    label: "SOL Micro Payments",
    description: "Allow small SOL deposits (under $10) that are batched together for efficiency.",
    inputType: "boolean"
  },
  deposit_gasless_swap_enabled: {
    key: "deposit_gasless_swap_enabled",
    label: "Gasless Swap Payments",
    description: "Allow deposits via Jupiter swaps.",
    inputType: "boolean"
  },
  deposit_min_usd: {
    key: "deposit_min_usd",
    label: "Minimum Deposit",
    description: "Minimum deposit amount in USD equivalent.",
    inputType: "select",
    unit: "USD",
    presets: [
      { label: "$1", value: "1" },
      { label: "$5", value: "5" },
      { label: "$10", value: "10" },
      { label: "$25", value: "25" }
    ]
  },
  deposit_max_usd: {
    key: "deposit_max_usd",
    label: "Maximum Deposit",
    description: "Maximum deposit amount per transaction in USD equivalent. Set to 0 for unlimited.",
    inputType: "select",
    unit: "USD",
    presets: [
      { label: "Unlimited", value: "0" },
      { label: "$1,000", value: "1000" },
      { label: "$10,000", value: "10000" },
      { label: "$100,000", value: "100000" }
    ]
  },
  // Deposit component settings
  deposit_show_explainer: {
    key: "deposit_show_explainer",
    label: "Show Explainer Screen",
    description: "Show the introductory explainer screen at the start of the deposit flow.",
    inputType: "boolean"
  },
  // Deposit token settings
  deposit_quick_action_tokens: {
    key: "deposit_quick_action_tokens",
    label: "Quick Action Tokens",
    description: "Comma-separated token symbols shown as quick action buttons. First token is the default.",
    inputType: "tokenSymbolList"
  },
  deposit_custom_tokens: {
    key: "deposit_custom_tokens",
    label: "Custom Dropdown Tokens",
    description: 'Comma-separated token symbols shown in the "Custom" dropdown. Leave empty to show all.',
    inputType: "tokenSymbolList"
  },
  deposit_custom_tokens_json: {
    key: "deposit_custom_tokens_json",
    label: "Custom Token Definitions",
    description: "Add tokens beyond the built-in list. Define symbol, mint address, decimals, and logo URL.",
    inputType: "tokenList"
  },
  // Deposit fee settings
  deposit_fee_policy: {
    key: "deposit_fee_policy",
    label: "Fee Policy",
    description: "Who pays deposit fees: company absorbs all, or user pays swap/privacy/all fees.",
    inputType: "select",
    presets: [
      { label: "Company Pays All", value: "company_pays_all" },
      { label: "User Pays Swap Fees", value: "user_pays_swap" },
      { label: "User Pays Privacy Fees", value: "user_pays_privacy" },
      { label: "User Pays All Fees", value: "user_pays_all" }
    ]
  },
  privacy_fee_fixed_lamports: {
    key: "privacy_fee_fixed_lamports",
    label: "Privacy Fixed Fee",
    description: "Fixed fee for Privacy Cash deposits in lamports. 1 SOL = 1,000,000,000 lamports.",
    inputType: "select",
    unit: "lamports",
    presets: [
      { label: "0 SOL", value: "0" },
      { label: "0.001 SOL", value: "1000000" },
      { label: "0.005 SOL", value: "5000000" },
      { label: "0.006 SOL (Default)", value: "6000000" },
      { label: "0.01 SOL", value: "10000000" }
    ]
  },
  privacy_fee_percent_bps: {
    key: "privacy_fee_percent_bps",
    label: "Privacy Percentage Fee",
    description: "Percentage fee for Privacy Cash deposits in basis points. 100 bps = 1%.",
    inputType: "select",
    unit: "bps",
    presets: [
      { label: "0%", value: "0" },
      { label: "0.25%", value: "25" },
      { label: "0.35% (Default)", value: "35" },
      { label: "0.5%", value: "50" },
      { label: "1%", value: "100" }
    ]
  },
  swap_fee_fixed_lamports: {
    key: "swap_fee_fixed_lamports",
    label: "Swap Fixed Fee",
    description: "Fixed fee for Jupiter swaps in lamports. Covers transaction costs.",
    inputType: "select",
    unit: "lamports",
    presets: [
      { label: "0 SOL", value: "0" },
      { label: "0.001 SOL (Default)", value: "1000000" },
      { label: "0.002 SOL", value: "2000000" },
      { label: "0.005 SOL", value: "5000000" }
    ]
  },
  swap_fee_percent_bps: {
    key: "swap_fee_percent_bps",
    label: "Swap Percentage Fee",
    description: "Percentage fee for Jupiter swaps in basis points. 100 bps = 1%.",
    inputType: "select",
    unit: "bps",
    presets: [
      { label: "0%", value: "0" },
      { label: "0.1% (Default)", value: "10" },
      { label: "0.25%", value: "25" },
      { label: "0.5%", value: "50" }
    ]
  },
  company_fee_fixed_lamports: {
    key: "company_fee_fixed_lamports",
    label: "Company Fixed Fee",
    description: "Additional fixed processing fee in lamports. Set to 0 to disable.",
    inputType: "select",
    unit: "lamports",
    presets: [
      { label: "Disabled", value: "0" },
      { label: "0.001 SOL", value: "1000000" },
      { label: "0.005 SOL", value: "5000000" },
      { label: "0.01 SOL", value: "10000000" }
    ]
  },
  company_fee_percent_bps: {
    key: "company_fee_percent_bps",
    label: "Company Percentage Fee",
    description: "Additional percentage processing fee in basis points. 100 bps = 1%.",
    inputType: "select",
    unit: "bps",
    presets: [
      { label: "Disabled", value: "0" },
      { label: "0.1%", value: "10" },
      { label: "0.25%", value: "25" },
      { label: "0.5%", value: "50" },
      { label: "1%", value: "100" }
    ]
  },
  micro_batch_threshold_usd: {
    key: "micro_batch_threshold_usd",
    label: "Batch Threshold",
    description: "Minimum accumulated USD value before triggering a batch swap. Jupiter requires ~$10 minimum.",
    inputType: "select",
    unit: "USD",
    presets: [
      { label: "$10 (Minimum)", value: "10" },
      { label: "$25", value: "25" },
      { label: "$50", value: "50" },
      { label: "$100", value: "100" }
    ]
  },
  micro_batch_poll_secs: {
    key: "micro_batch_poll_secs",
    label: "Batch Poll Interval",
    description: "How often to check for batchable micro deposits. Lower values process faster but increase load.",
    inputType: "duration",
    min: 60,
    presets: [
      { label: "1 minute", value: "60" },
      { label: "5 minutes (Default)", value: "300" },
      { label: "15 minutes", value: "900" },
      { label: "1 hour", value: "3600" }
    ]
  },
  private_deposit_min_lamports: {
    key: "private_deposit_min_lamports",
    label: "Min Private Deposit",
    description: "Minimum amount for Privacy Cash deposits in lamports. Smaller deposits use micro batching.",
    inputType: "select",
    unit: "lamports",
    presets: [
      { label: "0.1 SOL", value: "100000000" },
      { label: "0.25 SOL (Default)", value: "250000000" },
      { label: "0.5 SOL", value: "500000000" },
      { label: "1 SOL", value: "1000000000" }
    ]
  },
  withdrawal_min_lamports: {
    key: "withdrawal_min_lamports",
    label: "Min Withdrawal Amount",
    description: "Minimum amount to withdraw in lamports. Deposits below this remain pending. Fees are ~0.006 SOL + 0.35% + Jupiter.",
    inputType: "select",
    unit: "lamports",
    presets: [
      { label: "0.5 SOL", value: "500000000" },
      { label: "1 SOL (Default)", value: "1000000000" },
      { label: "2 SOL", value: "2000000000" },
      { label: "5 SOL", value: "5000000000" }
    ],
    warningThreshold: {
      below: 5e8,
      message: "Very small withdrawals may lose significant value to fees."
    }
  }
}, L = [
  "SOL",
  "USDC",
  "USDT",
  "EURC",
  "USD1",
  "PYUSD",
  "USDH",
  "CASH",
  "BONK",
  "ORE"
];
function x(e) {
  const l = e.split(/(<a\s[^>]*>.*?<\/a>)/g);
  return l.length === 1 ? e : l.map((a, n) => {
    const s = a.match(/^<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>$/);
    return s ? /* @__PURE__ */ t("a", { href: s[1], target: "_blank", rel: "noopener noreferrer", children: s[2] }, n) : a;
  });
}
function Q({
  settings: e,
  edits: l,
  onChange: a,
  externalWarnings: n
}) {
  return /* @__PURE__ */ t("div", { className: "cedros-settings-grid", children: e.map((s) => /* @__PURE__ */ t(
    F,
    {
      setting: s,
      editValue: l[s.key],
      onChange: a,
      externalWarning: n?.[s.key]
    },
    s.key
  )) });
}
function F({ setting: e, editValue: l, onChange: a, externalWarning: n }) {
  const s = q[e.key], i = l ?? e.value, p = l !== void 0 && l !== e.value, r = s?.inputType === "boolean", o = S(() => {
    if (n) return n;
    if (!s?.warningThreshold) return null;
    const c = parseInt(i, 10);
    if (isNaN(c)) return null;
    const { above: m, below: h, message: y } = s.warningThreshold;
    return m !== void 0 && c > m || h !== void 0 && c < h ? y : null;
  }, [i, s?.warningThreshold, n]);
  return s ? /* @__PURE__ */ t(
    "div",
    {
      className: `cedros-setting-row ${p ? "cedros-setting-row-changed" : ""} ${o ? "cedros-setting-row-warning" : ""} ${r ? "cedros-setting-row-toggle" : ""}`,
      children: r ? /* @__PURE__ */ u(f, { children: [
        /* @__PURE__ */ u("div", { className: "cedros-setting-control cedros-setting-control-toggle", children: [
          /* @__PURE__ */ t(
            P,
            {
              meta: s,
              value: i,
              onChange: (c) => a(e.key, c)
            }
          ),
          o && /* @__PURE__ */ t("div", { className: "cedros-setting-warning", children: o })
        ] }),
        /* @__PURE__ */ u("div", { className: "cedros-setting-label", children: [
          /* @__PURE__ */ t("span", { className: "cedros-setting-name", children: s.label }),
          /* @__PURE__ */ t("span", { className: "cedros-setting-description", children: x(s.description) })
        ] })
      ] }) : /* @__PURE__ */ u(f, { children: [
        /* @__PURE__ */ u("div", { className: "cedros-setting-label", children: [
          /* @__PURE__ */ t("span", { className: "cedros-setting-name", children: s.label }),
          /* @__PURE__ */ t("span", { className: "cedros-setting-description", children: x(s.description) })
        ] }),
        /* @__PURE__ */ u("div", { className: "cedros-setting-control", children: [
          /* @__PURE__ */ t(
            P,
            {
              meta: s,
              value: i,
              onChange: (c) => a(e.key, c)
            }
          ),
          o && /* @__PURE__ */ t("div", { className: "cedros-setting-warning", children: o })
        ] })
      ] })
    }
  ) : /* @__PURE__ */ u("div", { className: `cedros-setting-row ${p ? "cedros-setting-row-changed" : ""}`, children: [
    /* @__PURE__ */ u("div", { className: "cedros-setting-label", children: [
      /* @__PURE__ */ t("span", { className: "cedros-setting-name", children: e.key }),
      e.description && /* @__PURE__ */ t("span", { className: "cedros-setting-description", children: e.description })
    ] }),
    /* @__PURE__ */ t("div", { className: "cedros-setting-input-wrapper", children: /* @__PURE__ */ t(
      "input",
      {
        type: "text",
        value: i,
        onChange: (c) => a(e.key, c.target.value),
        className: "cedros-setting-input"
      }
    ) })
  ] });
}
function P({ meta: e, value: l, onChange: a }) {
  switch (e.inputType) {
    case "duration":
      return /* @__PURE__ */ t($, { value: l, onChange: a, presets: e.presets, min: e.min });
    case "percentage":
      return /* @__PURE__ */ t(
        j,
        {
          value: l,
          onChange: a,
          min: e.min ?? 1,
          max: e.max ?? 100,
          step: e.step ?? 5,
          presets: e.presets
        }
      );
    case "select":
      return /* @__PURE__ */ t(
        W,
        {
          value: l,
          onChange: a,
          presets: e.presets ?? [],
          unit: e.unit
        }
      );
    case "number":
      return /* @__PURE__ */ t(
        H,
        {
          value: l,
          onChange: a,
          min: e.min,
          max: e.max,
          unit: e.unit
        }
      );
    case "tokenList":
      return /* @__PURE__ */ t(V, { value: l, onChange: a });
    case "text":
      return /* @__PURE__ */ t(
        "input",
        {
          type: "text",
          value: l,
          onChange: (n) => a(n.target.value),
          className: "cedros-setting-input",
          placeholder: e.label
        }
      );
    case "boolean":
      return /* @__PURE__ */ t(B, { value: l, onChange: a });
    case "secret":
      return /* @__PURE__ */ t(J, { value: l, onChange: a, multiline: e.multiline });
    case "tokenSymbolList":
      return /* @__PURE__ */ t(G, { value: l, onChange: a });
    default:
      return /* @__PURE__ */ t(
        "input",
        {
          type: "text",
          value: l,
          onChange: (n) => a(n.target.value),
          className: "cedros-setting-input"
        }
      );
  }
}
function $({ value: e, onChange: l, presets: a, min: n = 0 }) {
  const s = parseInt(e, 10) || 0, i = R(s), p = d(
    (o) => {
      o.target.value && l(o.target.value);
    },
    [l]
  ), r = d(
    (o) => {
      const c = Math.max(n, parseInt(o.target.value, 10) || 0);
      l(String(c));
    },
    [l, n]
  );
  return /* @__PURE__ */ u("div", { className: "cedros-duration-input", children: [
    a && a.length > 0 && /* @__PURE__ */ u(
      "select",
      {
        value: a.find((o) => o.value === e)?.value ?? "",
        onChange: p,
        className: "cedros-setting-select",
        children: [
          /* @__PURE__ */ t("option", { value: "", children: "Custom..." }),
          a.map((o) => /* @__PURE__ */ t("option", { value: o.value, children: o.label }, o.value))
        ]
      }
    ),
    /* @__PURE__ */ u("div", { className: "cedros-duration-custom", children: [
      /* @__PURE__ */ t(
        "input",
        {
          type: "number",
          value: s,
          onChange: r,
          min: n,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      /* @__PURE__ */ t("span", { className: "cedros-setting-unit", children: "seconds" }),
      /* @__PURE__ */ u("span", { className: "cedros-duration-display", children: [
        "= ",
        i
      ] })
    ] })
  ] });
}
function j({
  value: e,
  onChange: l,
  min: a,
  max: n,
  step: s,
  presets: i
}) {
  const p = parseInt(e, 10) || a, r = d(
    (c) => {
      l(c.target.value);
    },
    [l]
  ), o = d(
    (c) => {
      l(c);
    },
    [l]
  );
  return /* @__PURE__ */ u("div", { className: "cedros-percentage-input", children: [
    /* @__PURE__ */ u("div", { className: "cedros-percentage-slider-row", children: [
      /* @__PURE__ */ t(
        "input",
        {
          type: "range",
          value: p,
          onChange: r,
          min: a,
          max: n,
          step: s,
          className: "cedros-percentage-slider"
        }
      ),
      /* @__PURE__ */ u("span", { className: "cedros-percentage-value", children: [
        p,
        "%"
      ] })
    ] }),
    i && i.length > 0 && /* @__PURE__ */ t("div", { className: "cedros-preset-buttons", children: i.map((c) => /* @__PURE__ */ t(
      "button",
      {
        type: "button",
        className: `cedros-preset-button ${c.value === e ? "cedros-preset-button-active" : ""}`,
        onClick: () => o(c.value),
        children: c.label
      },
      c.value
    )) })
  ] });
}
function W({ value: e, onChange: l, presets: a, unit: n }) {
  const s = !a.some((r) => r.value === e), i = d(
    (r) => {
      r.target.value !== "__custom__" && l(r.target.value);
    },
    [l]
  ), p = d(
    (r) => {
      l(r.target.value);
    },
    [l]
  );
  return /* @__PURE__ */ u("div", { className: "cedros-select-input", children: [
    /* @__PURE__ */ u(
      "select",
      {
        value: s ? "__custom__" : e,
        onChange: i,
        className: "cedros-setting-select",
        children: [
          a.map((r) => /* @__PURE__ */ t("option", { value: r.value, children: r.label }, r.value)),
          /* @__PURE__ */ t("option", { value: "__custom__", children: "Custom..." })
        ]
      }
    ),
    s && /* @__PURE__ */ u("div", { className: "cedros-select-custom", children: [
      /* @__PURE__ */ t(
        "input",
        {
          type: "number",
          value: e,
          onChange: p,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      n && /* @__PURE__ */ t("span", { className: "cedros-setting-unit", children: n })
    ] })
  ] });
}
function H({ value: e, onChange: l, min: a, max: n, unit: s }) {
  const i = d(
    (p) => {
      l(p.target.value);
    },
    [l]
  );
  return /* @__PURE__ */ u("div", { className: "cedros-number-input", children: [
    /* @__PURE__ */ t(
      "input",
      {
        type: "number",
        value: e,
        onChange: i,
        min: a,
        max: n,
        className: "cedros-setting-input"
      }
    ),
    s && /* @__PURE__ */ t("span", { className: "cedros-setting-unit", children: s })
  ] });
}
function B({ value: e, onChange: l }) {
  const a = e === "true", n = d(() => {
    l(a ? "false" : "true");
  }, [a, l]);
  return /* @__PURE__ */ u(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": a,
      className: `cedros-toggle ${a ? "cedros-toggle-on" : "cedros-toggle-off"}`,
      onClick: n,
      children: [
        /* @__PURE__ */ t("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ t("span", { className: "cedros-toggle-thumb" }) }),
        /* @__PURE__ */ t("span", { className: "cedros-toggle-label", children: a ? "Enabled" : "Disabled" })
      ]
    }
  );
}
function J({ value: e, onChange: l, multiline: a }) {
  const [n, s] = k(!1), [i, p] = k(!1), r = e && e.length > 0, o = d(() => {
    s(!0), p(!0);
  }, []), c = d(() => {
    s(!1), p(!1);
  }, []), m = d(
    (h) => {
      l(h.target.value);
    },
    [l]
  );
  return !n && r ? /* @__PURE__ */ u("div", { className: "cedros-secret-input cedros-secret-input-masked", children: [
    /* @__PURE__ */ t("span", { className: "cedros-secret-masked", children: "•".repeat(Math.min(e.length, 20)) }),
    /* @__PURE__ */ t("button", { type: "button", className: "cedros-secret-edit-btn", onClick: o, children: "Edit" })
  ] }) : /* @__PURE__ */ u("div", { className: "cedros-secret-input", children: [
    a ? /* @__PURE__ */ t(
      "textarea",
      {
        value: e,
        onChange: m,
        className: "cedros-setting-input cedros-setting-textarea",
        placeholder: "Enter secret value...",
        rows: 4
      }
    ) : /* @__PURE__ */ t(
      "input",
      {
        type: i ? "text" : "password",
        value: e,
        onChange: m,
        className: "cedros-setting-input",
        placeholder: "Enter secret value..."
      }
    ),
    /* @__PURE__ */ u("div", { className: "cedros-secret-actions", children: [
      !a && /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-secret-toggle-btn",
          onClick: () => p(!i),
          children: i ? "Hide" : "Show"
        }
      ),
      n && /* @__PURE__ */ t("button", { type: "button", className: "cedros-secret-done-btn", onClick: c, children: "Done" })
    ] })
  ] });
}
function V({ value: e, onChange: l }) {
  const a = S(() => {
    try {
      return JSON.parse(e || "[]");
    } catch {
      return [];
    }
  }, [e]), n = d(
    (r) => {
      l(JSON.stringify(r));
    },
    [l]
  ), s = d(() => {
    n([...a, { symbol: "", mint: "", decimals: 6 }]);
  }, [a, n]), i = d(
    (r, o, c) => {
      const m = [...a];
      m[r] = { ...m[r], [o]: c }, n(m);
    },
    [a, n]
  ), p = d(
    (r) => {
      n(a.filter((o, c) => c !== r));
    },
    [a, n]
  );
  return /* @__PURE__ */ u("div", { className: "cedros-token-list-input", children: [
    /* @__PURE__ */ u("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ t("span", { className: "cedros-token-presets-label", children: "Built-in tokens:" }),
      /* @__PURE__ */ t("div", { className: "cedros-token-presets-list", children: L.map((r) => /* @__PURE__ */ t("span", { className: "cedros-token-preset-chip", children: r }, r)) })
    ] }),
    a.length === 0 && /* @__PURE__ */ t("p", { className: "cedros-token-list-empty", children: "No custom tokens added. Use the built-in tokens above or add your own." }),
    a.map((r, o) => /* @__PURE__ */ u("div", { className: "cedros-token-row", children: [
      /* @__PURE__ */ u("div", { className: "cedros-token-row-fields", children: [
        /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            placeholder: "Symbol",
            value: r.symbol,
            onChange: (c) => i(o, "symbol", c.target.value.toUpperCase()),
            className: "cedros-setting-input cedros-token-input-symbol",
            maxLength: 10
          }
        ),
        /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            placeholder: "Mint address",
            value: r.mint,
            onChange: (c) => i(o, "mint", c.target.value),
            className: "cedros-setting-input cedros-token-input-mint"
          }
        ),
        /* @__PURE__ */ t(
          "input",
          {
            type: "number",
            placeholder: "Decimals",
            value: r.decimals,
            onChange: (c) => i(o, "decimals", parseInt(c.target.value, 10) || 0),
            className: "cedros-setting-input cedros-token-input-decimals",
            min: 0,
            max: 18
          }
        ),
        /* @__PURE__ */ t(
          "input",
          {
            type: "text",
            placeholder: "Logo URL (optional)",
            value: r.logoUrl || "",
            onChange: (c) => i(o, "logoUrl", c.target.value || void 0),
            className: "cedros-setting-input cedros-token-input-logo"
          }
        )
      ] }),
      /* @__PURE__ */ t(
        "button",
        {
          type: "button",
          className: "cedros-token-remove-btn",
          onClick: () => p(o),
          title: "Remove token",
          children: "×"
        }
      )
    ] }, o)),
    /* @__PURE__ */ t("button", { type: "button", className: "cedros-token-add-btn", onClick: s, children: "+ Add Token" })
  ] });
}
function G({ value: e, onChange: l }) {
  const a = S(() => e.split(",").map((i) => i.trim()).filter(Boolean), [e]), n = d(
    (i) => {
      if (!i || a.includes(i)) return;
      const p = [...a, i].join(", ");
      l(p);
    },
    [a, l]
  ), s = d(
    (i) => {
      const p = a.filter((r) => r !== i).join(", ");
      l(p);
    },
    [a, l]
  );
  return /* @__PURE__ */ u("div", { className: "cedros-token-symbol-list-input", children: [
    /* @__PURE__ */ u("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ t("span", { className: "cedros-token-presets-label", children: "Click to add:" }),
      /* @__PURE__ */ t("div", { className: "cedros-token-presets-list", children: L.map((i) => {
        const p = a.includes(i);
        return /* @__PURE__ */ u(
          "button",
          {
            type: "button",
            className: `cedros-token-preset-chip ${p ? "cedros-token-preset-chip-selected" : ""}`,
            onClick: () => p ? s(i) : n(i),
            title: p ? `Remove ${i}` : `Add ${i}`,
            children: [
              i,
              p && /* @__PURE__ */ t("span", { className: "cedros-token-chip-check", children: "✓" })
            ]
          },
          i
        );
      }) })
    ] }),
    /* @__PURE__ */ t(
      "input",
      {
        type: "text",
        value: e,
        onChange: (i) => l(i.target.value),
        className: "cedros-setting-input",
        placeholder: "USDC, SOL, BONK..."
      }
    )
  ] });
}
function Z({ status: e, error: l }) {
  return e === "idle" ? null : /* @__PURE__ */ u("div", { className: `cedros-autosave-status cedros-autosave-status--${e}`, children: [
    e === "pending" && /* @__PURE__ */ u(f, { children: [
      /* @__PURE__ */ t("span", { className: "cedros-autosave-dot" }),
      /* @__PURE__ */ t("span", { children: "Unsaved changes" })
    ] }),
    e === "saving" && /* @__PURE__ */ u(f, { children: [
      /* @__PURE__ */ t("span", { className: "cedros-autosave-spinner" }),
      /* @__PURE__ */ t("span", { children: "Saving..." })
    ] }),
    e === "saved" && /* @__PURE__ */ u(f, { children: [
      /* @__PURE__ */ t("span", { className: "cedros-autosave-check", children: "✓" }),
      /* @__PURE__ */ t("span", { children: "Saved" })
    ] }),
    e === "error" && /* @__PURE__ */ u(f, { children: [
      /* @__PURE__ */ t("span", { className: "cedros-autosave-error-icon", children: "!" }),
      /* @__PURE__ */ t("span", { children: l || "Save failed" })
    ] })
  ] });
}
export {
  Z as A,
  Q as S,
  X as u
};
