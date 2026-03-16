import { jsx as e, jsxs as d, Fragment as T } from "react/jsx-runtime";
import { useMemo as N, useCallback as m, useState as f, useRef as P, useEffect as I } from "react";
import { u as U } from "./useCedrosLogin-CFfID-0i.js";
import { u as O } from "./useSystemSettings-rgskaDqP.js";
function M(t) {
  const i = Math.floor(t / 86400), a = Math.floor(t % 86400 / 3600), n = Math.floor(t % 3600 / 60), r = t % 60;
  return { days: i, hours: a, minutes: n, seconds: r };
}
function q(t) {
  const { days: i, hours: a, minutes: n } = M(t), r = [];
  return i > 0 && r.push(`${i}d`), a > 0 && r.push(`${a}h`), n > 0 && r.push(`${n}m`), r.length === 0 && r.push(`${t}s`), r.join(" ");
}
const W = {
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
    description: 'Allow users to authenticate with their Google account. Configure at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud Console &gt; Credentials</a>.',
    inputType: "boolean"
  },
  auth_google_client_id: {
    key: "auth_google_client_id",
    label: "Google Client ID",
    description: "OAuth 2.0 client ID from Google Cloud Console. Create a Web application credential and add your frontend URL to Authorized JavaScript origins.",
    inputType: "text"
  },
  // Apple OAuth
  auth_apple_enabled: {
    key: "auth_apple_enabled",
    label: "Enable Sign in with Apple",
    description: 'Allow users to authenticate with their Apple ID. Configure at <a href="https://developer.apple.com/account/resources/identifiers" target="_blank" rel="noopener">Apple Developer &gt; Identifiers</a>.',
    inputType: "boolean"
  },
  auth_apple_client_id: {
    key: "auth_apple_client_id",
    label: "Apple Services ID",
    description: "Your Client ID (e.g. com.yourdomain.service). Create at Identifiers &gt; Services IDs, then enable Sign in with Apple and add your frontend URL as a Return URL (e.g. https://yourdomain.com).",
    inputType: "text",
    placeholder: "com.yourdomain.service"
  },
  auth_apple_team_id: {
    key: "auth_apple_team_id",
    label: "Apple Team ID",
    description: 'Identifies your developer account. Found at the top-right of <a href="https://developer.apple.com/account" target="_blank" rel="noopener">Apple Developer</a>.',
    inputType: "text"
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
    description: 'When enabled, "Forgot your password?" on the sign-in form sends a one-time sign-in link instead of a password reset. This replaces the password reset flow — it is not a separate login button.',
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
    description: "Allow users to enable TOTP-based two-factor authentication for email/password sign-in. OAuth (Google, Apple) and passkey logins are not affected — those providers handle their own verification.",
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
    description: "Controls whether users can recover their embedded wallet seed. <b>Share C Only</b> lets users export a single key share (cannot reconstruct the full seed). <b>Full Seed</b> lets users export the complete seed phrase. <b>No Recovery</b> prevents any seed export — required when Private Deposits are enabled, because recoverable seeds would let users front-run privacy withdrawals.",
    inputType: "select",
    presets: [
      { label: "Share C Only (Recommended)", value: "share_c_only" },
      { label: "Full Seed Phrase", value: "full_seed" },
      { label: "No Recovery (Required for Private Deposits)", value: "none" }
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
    description: "Allow users to initiate withdrawals from their embedded wallet to external addresses. This is separate from the automated privacy withdrawal worker, which moves funds from the privacy pool to the treasury.",
    inputType: "boolean"
  },
  feature_referrals_enabled: {
    key: "feature_referrals_enabled",
    label: "Referral System",
    description: "Enable the referral system. Each user gets a unique referral code they can share. New users can register with a referral code to track who invited them.",
    inputType: "boolean"
  },
  referral_reward_lamports: {
    key: "referral_reward_lamports",
    label: "Referral Reward Amount (lamports)",
    description: "Amount of credits to reward the referrer (in smallest unit: lamports for SOL, micros for USD). Set to 0 to disable referral rewards. For example, 1000000000 = 1 SOL.",
    inputType: "text"
  },
  referral_reward_max_per_referrer: {
    key: "referral_reward_max_per_referrer",
    label: "Max Reward Per Referrer",
    description: "Maximum total reward amount a single referrer can earn (in smallest unit). Set to 0 for unlimited. Applies to direct payout mode only.",
    inputType: "text"
  },
  referral_reward_type: {
    key: "referral_reward_type",
    label: "Referral Reward Type",
    description: `How referral rewards are issued. "Credits" adds balance to the referrer's in-app credit account. "Direct payout" queues an on-chain transfer to the referrer's configured payout wallet address.`,
    inputType: "select",
    presets: [
      { label: "Credits", value: "credits" },
      { label: "Direct payout (on-chain)", value: "direct_payout" }
    ]
  },
  referral_reward_trigger: {
    key: "referral_reward_trigger",
    label: "Referral Reward Trigger",
    description: 'When to issue the referral reward to the referrer. "On signup" rewards immediately when the referred user registers. "On first purchase" rewards only after the referred user makes their first spend. "On every purchase" rewards the referrer on each spend by the referred user.',
    inputType: "select",
    presets: [
      { label: "On signup", value: "on_signup" },
      { label: "On first purchase", value: "on_first_spend" },
      { label: "On every purchase", value: "on_every_spend" }
    ]
  },
  // ============= Payout Worker Settings =============
  payout_auto_enabled: {
    key: "payout_auto_enabled",
    label: "Auto-Process Payouts",
    description: "Enable the automated payout worker that periodically processes pending referral payouts on-chain. When disabled, payouts must be processed manually from the admin dashboard.",
    inputType: "boolean"
  },
  payout_poll_interval_secs: {
    key: "payout_poll_interval_secs",
    label: "Payout Poll Interval",
    description: "How often the payout worker checks for pending payouts (in seconds). Default: 3600 (1 hour). Lower values mean faster payouts but more frequent treasury key decryption.",
    inputType: "duration",
    unit: "seconds"
  },
  payout_batch_size: {
    key: "payout_batch_size",
    label: "Payout Batch Size",
    description: "Maximum number of referrer groups to process per worker cycle. Default: 50. Each referrer group aggregates all pending payouts for that referrer into a single transfer.",
    inputType: "text"
  },
  // ============= Security Settings =============
  security_require_mfa: {
    key: "security_require_mfa",
    label: "Require Two-Factor Authentication",
    description: 'Require users with email/password credentials to set up TOTP two-factor authentication. Users will be prompted to enroll after their next sign-in. Does not affect OAuth, passkey, or wallet sign-in methods. Works independently of the "Two-Factor Authentication" feature flag (which controls UI visibility).',
    inputType: "boolean"
  },
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
    description: "Select a provider to auto-configure SMTP host, port, and TLS. Choose Custom SMTP to enter settings manually.",
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
    description: "SMTP server hostname. Auto-filled when selecting a provider above.",
    inputType: "text",
    placeholder: "smtp.example.com"
  },
  email_smtp_port: {
    key: "email_smtp_port",
    label: "SMTP Port",
    description: "SMTP server port. Most providers use 587 (TLS).",
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
    description: 'Username for SMTP authentication. For SendGrid use "apikey", for Postmark use your server API token, for Mailgun use your full Mailgun SMTP login.',
    inputType: "text"
  },
  email_smtp_password: {
    key: "email_smtp_password",
    label: "API Key",
    description: "API key or password for your email provider. For SendGrid this is your API key, for Postmark your server API token, for Mailgun your SMTP password.",
    inputType: "secret"
  },
  email_smtp_tls: {
    key: "email_smtp_tls",
    label: "Use TLS",
    description: "Enable TLS encryption for SMTP connections. Required by most providers.",
    inputType: "boolean"
  },
  email_from_address: {
    key: "email_from_address",
    label: "From Address",
    description: "Sender email address for verification, password reset, and instant link emails. Must be verified with your provider.",
    inputType: "text",
    placeholder: "noreply@yourdomain.com"
  },
  email_from_name: {
    key: "email_from_name",
    label: "From Name",
    description: 'Display name shown in the "From" field of outbound emails.',
    inputType: "text",
    placeholder: "My App"
  },
  // ============= Email Subject Customization =============
  email_subject_verification: {
    key: "email_subject_verification",
    label: "Verification Email Subject",
    description: 'Custom subject for email verification messages. Leave empty for the default: "Verify your email address".',
    inputType: "text",
    placeholder: "Verify your email address"
  },
  email_subject_password_reset: {
    key: "email_subject_password_reset",
    label: "Password Reset Subject",
    description: 'Custom subject for password reset emails. Leave empty for the default: "Reset your password".',
    inputType: "text",
    placeholder: "Reset your password"
  },
  email_subject_instant_link: {
    key: "email_subject_instant_link",
    label: "Instant Link Subject",
    description: 'Custom subject for instant link sign-in emails. Leave empty for the default: "Your sign-in link".',
    inputType: "text",
    placeholder: "Your sign-in link"
  },
  email_subject_invite: {
    key: "email_subject_invite",
    label: "Invite Email Subject",
    description: "Custom subject for organization invite emails. Leave empty for the default which includes the org name.",
    inputType: "text",
    placeholder: "You've been invited to join..."
  },
  email_subject_security_alert: {
    key: "email_subject_security_alert",
    label: "Security Alert Subject",
    description: 'Custom subject for new device sign-in alerts. Leave empty for the default: "New sign-in to your account".',
    inputType: "text",
    placeholder: "New sign-in to your account"
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
  feature_cedros_pay: {
    key: "feature_cedros_pay",
    label: "Cedros Pay Integration",
    description: "Enable Cedros Pay integration. When enabled, shows the Integrations tab with API key configuration. Not needed for co-located deployments using JWT/JWKS inter-service auth.",
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
  },
  // ============= Sidecar Shared Secrets =============
  sidecar_api_key: {
    key: "sidecar_api_key",
    label: "Sidecar API Key",
    description: "Authenticates requests from cedros-login to the login-sidecar. This value must also be set as the SIDECAR_API_KEY environment variable on the sidecar container.",
    inputType: "readonlySecret"
  },
  note_encryption_key: {
    key: "note_encryption_key",
    label: "Note Encryption Key",
    description: "AES-256 key for encrypting privacy cash notes (base64). This value must also be set as the NOTE_ENCRYPTION_KEY environment variable on the sidecar container.",
    inputType: "readonlySecret"
  },
  // ============= Post-Login Flow =============
  postlogin_redirect_url: {
    key: "postlogin_redirect_url",
    label: "Redirect URL",
    description: "URL to redirect to after login. Leave empty for default behavior (consumer app decides).",
    inputType: "text",
    placeholder: "https://example.com/dashboard"
  },
  postlogin_welcome_enabled: {
    key: "postlogin_welcome_enabled",
    label: "Enable Welcome Page",
    description: "Show a one-time welcome/onboarding page to new users after their first login.",
    inputType: "boolean"
  },
  postlogin_welcome_route: {
    key: "postlogin_welcome_route",
    label: "Welcome Route",
    description: "Route for the welcome/onboarding page.",
    inputType: "text",
    placeholder: "/welcome"
  },
  postlogin_complete_enabled: {
    key: "postlogin_complete_enabled",
    label: "Prompt Profile Completion",
    description: "Prompt users to fill in missing name or email after login. Shows every login until the user completes or skips.",
    inputType: "boolean"
  },
  postlogin_username_enabled: {
    key: "postlogin_username_enabled",
    label: "Require Username Selection",
    description: "Prompt new users to choose a unique handle-style username (e.g. @swift_falcon_42) after signup. Shows until the user picks a username or skips.",
    inputType: "boolean"
  },
  // ============= Wallet Enrollment =============
  postlogin_wallet_enroll_enabled: {
    key: "postlogin_wallet_enroll_enabled",
    label: "Prompt Wallet Enrollment",
    description: "Prompt users to enroll an embedded wallet after signup. Requires the Embedded Wallet feature to be enabled.",
    inputType: "boolean"
  },
  wallet_enroll_solana_users: {
    key: "wallet_enroll_solana_users",
    label: "Enroll Solana Wallet Users",
    description: "Also prompt Solana wallet users to enroll an embedded wallet. By default they are skipped since they already have a wallet.",
    inputType: "boolean"
  },
  postlogin_show_recovery_enabled: {
    key: "postlogin_show_recovery_enabled",
    label: "Show Recovery Info",
    description: "Show wallet recovery information screen after account creation. Displays recovery phrase based on the configured recovery mode.",
    inputType: "boolean"
  },
  // ============= Image Storage Settings =============
  image_storage_enabled: {
    key: "image_storage_enabled",
    label: "Enable Image Storage",
    description: "Enable S3-compatible object storage for user avatar uploads. When disabled, users cannot upload profile pictures.",
    inputType: "boolean"
  },
  image_storage_provider: {
    key: "image_storage_provider",
    label: "Storage Provider",
    description: "Select your S3-compatible storage provider to auto-fill endpoint and region hints.",
    inputType: "select",
    presets: [
      { label: "DigitalOcean Spaces", value: "digitalocean" },
      { label: "AWS S3", value: "s3" },
      { label: "Custom S3-Compatible", value: "custom" }
    ]
  },
  image_storage_bucket: {
    key: "image_storage_bucket",
    label: "Bucket Name",
    description: "The name of your S3 bucket or DigitalOcean Space.",
    inputType: "text",
    placeholder: "my-app-avatars"
  },
  image_storage_region: {
    key: "image_storage_region",
    label: "Region",
    description: "AWS region or DigitalOcean datacenter (e.g., us-east-1, nyc3, ams3).",
    inputType: "text",
    placeholder: "us-east-1"
  },
  image_storage_endpoint: {
    key: "image_storage_endpoint",
    label: "Endpoint URL",
    description: "S3-compatible endpoint URL. For DigitalOcean Spaces: https://{region}.digitaloceanspaces.com. Leave empty for AWS S3.",
    inputType: "text",
    placeholder: "https://nyc3.digitaloceanspaces.com"
  },
  image_storage_access_key: {
    key: "image_storage_access_key",
    label: "Access Key",
    description: "S3 access key ID or DigitalOcean Spaces access key.",
    inputType: "secret"
  },
  image_storage_secret_key: {
    key: "image_storage_secret_key",
    label: "Secret Key",
    description: "S3 secret access key or DigitalOcean Spaces secret key.",
    inputType: "secret"
  },
  image_storage_cdn_url: {
    key: "image_storage_cdn_url",
    label: "CDN URL (optional)",
    description: "Custom CDN URL prefix for serving images (e.g., https://cdn.example.com). If empty, images are served directly from the bucket URL.",
    inputType: "text",
    placeholder: "https://cdn.example.com"
  },
  // ============= KYC / Identity Verification =============
  kyc_enabled: {
    key: "kyc_enabled",
    label: "Enable KYC Verification",
    description: "Enable identity verification for users via Stripe Identity.",
    inputType: "boolean"
  },
  kyc_provider: {
    key: "kyc_provider",
    label: "KYC Provider",
    description: "Identity verification provider.",
    inputType: "select",
    presets: [{ label: "Stripe Identity", value: "stripe" }]
  },
  kyc_api_secret_key: {
    key: "kyc_api_secret_key",
    label: "Stripe Secret Key",
    description: "Stripe API secret key for Identity API calls (sk_live_... or sk_test_...).",
    inputType: "secret",
    placeholder: "sk_..."
  },
  kyc_webhook_secret: {
    key: "kyc_webhook_secret",
    label: "Webhook Signing Secret",
    description: "Stripe webhook endpoint secret for verifying webhook signatures (whsec_...).",
    inputType: "secret",
    placeholder: "whsec_..."
  },
  kyc_enforcement_mode: {
    key: "kyc_enforcement_mode",
    label: "Enforcement Mode",
    description: 'When to require KYC verification. "None" disables enforcement. "Optional" lets users verify voluntarily.',
    inputType: "select",
    presets: [
      { label: "None (disabled)", value: "none" },
      { label: "Withdrawals only", value: "withdrawals" },
      { label: "Deposits only", value: "deposits" },
      { label: "All financial operations", value: "all" },
      { label: "Optional (user choice)", value: "optional" }
    ]
  },
  kyc_expiry_days: {
    key: "kyc_expiry_days",
    label: "Verification Expiry",
    description: "How long a verification remains valid. Set to 0 for no expiry.",
    inputType: "select",
    presets: [
      { label: "Never expires", value: "0" },
      { label: "90 days", value: "90" },
      { label: "365 days", value: "365" }
    ]
  },
  kyc_redirect_url: {
    key: "kyc_redirect_url",
    label: "Return URL",
    description: "URL where users are redirected after completing Stripe Identity verification.",
    inputType: "text",
    placeholder: "https://app.example.com/kyc/callback"
  },
  kyc_document_types: {
    key: "kyc_document_types",
    label: "Accepted Document Types",
    description: "Comma-separated list of accepted document types: driving_license, id_card, passport.",
    inputType: "text",
    placeholder: "driving_license,id_card,passport"
  },
  kyc_require_selfie: {
    key: "kyc_require_selfie",
    label: "Require Selfie",
    description: "Require a selfie photo that matches the document photo for identity verification.",
    inputType: "boolean"
  },
  kyc_cumulative_deposit_usd: {
    key: "kyc_cumulative_deposit_usd",
    label: "Cumulative Deposit Threshold (USD)",
    description: "Require KYC when a user's total deposits exceed this USD amount. Set to 0 to disable. Works independently of enforcement mode.",
    inputType: "text",
    placeholder: "0",
    unit: "USD"
  },
  kyc_single_deposit_usd: {
    key: "kyc_single_deposit_usd",
    label: "Single Deposit Threshold (USD)",
    description: "Require KYC when any individual deposit exceeds this USD amount. Set to 0 to disable. Works independently of enforcement mode.",
    inputType: "text",
    placeholder: "0",
    unit: "USD"
  },
  kyc_single_purchase_usd: {
    key: "kyc_single_purchase_usd",
    label: "Single Purchase Threshold (USD)",
    description: "Require KYC when any individual credit spend/purchase exceeds this USD amount. Set to 0 to disable. Works independently of enforcement mode.",
    inputType: "text",
    placeholder: "0",
    unit: "USD"
  },
  // ============= Sanctions Screening =============
  sanctions_enabled: {
    key: "sanctions_enabled",
    label: "Enable Sanctions Screening",
    description: "Block transactions to or from wallet addresses that appear on the sanctions list fetched from the configured API URL.",
    inputType: "boolean"
  },
  sanctions_api_url: {
    key: "sanctions_api_url",
    label: "Sanctions API URL",
    description: "Base URL for the sanctions list API (e.g. <code>https://sunscreen.cedros.io</code>). The service calls <code>GET {url}/v1/lists</code>.",
    inputType: "text",
    placeholder: "https://sunscreen.cedros.io"
  },
  sanctions_refresh_interval_secs: {
    key: "sanctions_refresh_interval_secs",
    label: "Refresh Interval",
    description: "How often to re-fetch the sanctions list. Minimum 60 seconds.",
    inputType: "text",
    unit: "seconds",
    placeholder: "3600"
  },
  sanctions_geoip_header: {
    key: "sanctions_geoip_header",
    label: "GeoIP Country Header",
    description: "HTTP header containing the client's ISO country code. Common values: <code>CF-IPCountry</code> (Cloudflare), <code>X-Vercel-IP-Country</code> (Vercel). Leave empty to disable country screening.",
    inputType: "text",
    placeholder: "CF-IPCountry"
  },
  // ============= Accredited Investor Verification =============
  accreditation_enabled: {
    key: "accreditation_enabled",
    label: "Enable Accreditation Verification",
    description: "Enable accredited investor self-service verification.",
    inputType: "boolean"
  },
  accreditation_enforcement_mode: {
    key: "accreditation_enforcement_mode",
    label: "Enforcement Mode",
    description: "When to require accreditation.",
    inputType: "select",
    presets: [
      { label: "None (disabled)", value: "none" },
      { label: "Optional (user choice)", value: "optional" },
      { label: "Required", value: "required" }
    ]
  },
  accreditation_default_expiry_days_income: {
    key: "accreditation_default_expiry_days_income",
    label: "Income/Net Worth Expiry",
    description: "Default validity for income and net worth verifications.",
    inputType: "text",
    unit: "days",
    placeholder: "365"
  },
  accreditation_default_expiry_days_letter: {
    key: "accreditation_default_expiry_days_letter",
    label: "Letter Expiry",
    description: "Default validity for third-party verification letters.",
    inputType: "text",
    unit: "days",
    placeholder: "90"
  },
  accreditation_default_expiry_days_credential: {
    key: "accreditation_default_expiry_days_credential",
    label: "Credential Expiry",
    description: "Default validity for FINRA credential verifications.",
    inputType: "text",
    unit: "days",
    placeholder: "365"
  },
  accreditation_max_upload_size_mb: {
    key: "accreditation_max_upload_size_mb",
    label: "Max Upload Size",
    description: "Maximum file size per document upload.",
    inputType: "text",
    unit: "MB",
    placeholder: "10"
  },
  accreditation_income_threshold_individual: {
    key: "accreditation_income_threshold_individual",
    label: "Income Threshold (Individual)",
    description: "Annual income threshold for individual accreditation (USD).",
    inputType: "text",
    unit: "USD",
    placeholder: "200000"
  },
  accreditation_income_threshold_joint: {
    key: "accreditation_income_threshold_joint",
    label: "Income Threshold (Joint)",
    description: "Annual income threshold for joint accreditation (USD).",
    inputType: "text",
    unit: "USD",
    placeholder: "300000"
  },
  accreditation_net_worth_threshold: {
    key: "accreditation_net_worth_threshold",
    label: "Net Worth Threshold",
    description: "Net worth threshold excluding primary residence (USD).",
    inputType: "text",
    unit: "USD",
    placeholder: "1000000"
  },
  accreditation_investment_threshold_individual: {
    key: "accreditation_investment_threshold_individual",
    label: "Investment Threshold (Individual)",
    description: "Minimum investment commitment for individual simplified verification (USD).",
    inputType: "text",
    unit: "USD",
    placeholder: "200000"
  },
  accreditation_investment_threshold_entity: {
    key: "accreditation_investment_threshold_entity",
    label: "Investment Threshold (Entity)",
    description: "Minimum investment commitment for entity simplified verification (USD).",
    inputType: "text",
    unit: "USD",
    placeholder: "1000000"
  }
}, ae = {
  // Auth providers (sorted alphabetically by subcategory)
  "auth.apple": {
    label: "Apple Sign-In",
    description: "Configure Sign in with Apple OAuth integration.",
    icon: ""
  },
  "auth.email": {
    label: "Email Authentication",
    description: "Configure email/password authentication settings.",
    icon: ""
  },
  "auth.google": {
    label: "Google Sign-In",
    description: "Configure Google OAuth integration.",
    icon: ""
  },
  "auth.solana": {
    label: "Solana Wallet Auth",
    description: "Configure Solana wallet signature authentication.",
    icon: ""
  },
  "auth.webauthn": {
    label: "WebAuthn / Passkeys",
    description: "Configure FIDO2/WebAuthn passwordless authentication.",
    icon: ""
  },
  "auth.instantlink": {
    label: "Instant Link",
    description: 'Passwordless sign-in via email link. Replaces "Forgot your password?" with a one-time login link instead of a password reset.',
    icon: ""
  },
  "deposit.general": {
    label: "General",
    description: "Core deposit and credit system configuration.",
    icon: ""
  },
  postlogin: {
    label: "Post-Login",
    description: "Configure what happens after a user logs in.",
    icon: ""
  },
  "postlogin.welcome": {
    label: "Welcome Page",
    description: "One-time onboarding page shown to new users after first login.",
    icon: ""
  },
  "postlogin.complete": {
    label: "Profile Completion",
    description: "Prompt users to fill in missing profile information.",
    icon: ""
  },
  "postlogin.username": {
    label: "Username Selection",
    description: "Prompt users to choose a unique handle-style username.",
    icon: ""
  },
  "postlogin.wallet": {
    label: "Wallet Enrollment",
    description: "Prompt users to enroll an embedded wallet after signup.",
    icon: ""
  },
  deposit: {
    label: "Deposit Settings",
    description: "Configure deposit tokens, fees, and related settings.",
    icon: ""
  },
  email: {
    label: "Email / SMTP",
    description: "Configure outbound email delivery for verification, password reset, and notifications.",
    icon: ""
  },
  features: {
    label: "Feature Flags",
    description: "Enable or disable major platform features.",
    icon: ""
  },
  privacy: {
    label: "Privacy Settings",
    description: "Control the privacy period for deposits. Longer periods provide better timing privacy but delay fund availability.",
    icon: ""
  },
  referral: {
    label: "Referral & Payouts",
    description: "Configure referral rewards, payout triggers, and the automated payout worker.",
    icon: ""
  },
  rate_limit: {
    label: "Rate Limiting",
    description: "Protect the system from abuse by limiting request rates. Balance security with user experience.",
    icon: ""
  },
  security: {
    label: "Security",
    description: "Configure CORS, cookies, sessions, and JWT settings.",
    icon: ""
  },
  server: {
    label: "Server",
    description: "Server infrastructure settings. Some may be overridden by environment variables.",
    icon: ""
  },
  webhook: {
    label: "Webhooks",
    description: "Configure HTTP webhook notifications for auth events.",
    icon: ""
  },
  withdrawal: {
    label: "Withdrawal Worker",
    description: "Configure how the automated withdrawal processor handles pending withdrawals. These settings affect throughput and privacy.",
    icon: ""
  },
  image_storage: {
    label: "Image Storage",
    description: "Configure S3-compatible object storage for user avatars and images.",
    icon: ""
  },
  kyc: {
    label: "KYC / Identity Verification",
    description: "Configure identity verification requirements using Stripe Identity.",
    icon: ""
  },
  sanctions: {
    label: "Sanctions Screening",
    description: "Block transactions involving wallet addresses on OFAC or custom sanctions lists.",
    icon: ""
  },
  accreditation: {
    label: "Accredited Investor Verification",
    description: "Configure accredited investor verification requirements and thresholds per SEC Regulation D.",
    icon: ""
  }
}, R = [
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
function A(t) {
  const i = t.split(/(<a\s[^>]*>.*?<\/a>)/g);
  return i.length === 1 ? t : i.map((a, n) => {
    const r = a.match(/^<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>$/);
    return r ? /* @__PURE__ */ e("a", { href: r[1], target: "_blank", rel: "noopener noreferrer", children: r[2] }, n) : a;
  });
}
function ie({
  settings: t,
  edits: i,
  onChange: a,
  externalWarnings: n
}) {
  return /* @__PURE__ */ e("div", { className: "cedros-settings-grid", children: t.map((r) => /* @__PURE__ */ e(
    j,
    {
      setting: r,
      editValue: i[r.key],
      onChange: a,
      externalWarning: n?.[r.key]
    },
    r.key
  )) });
}
function j({ setting: t, editValue: i, onChange: a, externalWarning: n }) {
  const r = W[t.key], s = i ?? t.value, p = i !== void 0 && i !== t.value, l = r?.inputType === "boolean", o = N(() => {
    if (n) return n;
    if (!r?.warningThreshold) return null;
    const c = parseInt(s, 10);
    if (isNaN(c)) return null;
    const { above: y, below: b, message: _ } = r.warningThreshold;
    return y !== void 0 && c > y || b !== void 0 && c < b ? _ : null;
  }, [s, r?.warningThreshold, n]);
  return r ? /* @__PURE__ */ e(
    "div",
    {
      className: `cedros-setting-row ${p ? "cedros-setting-row-changed" : ""} ${o ? "cedros-setting-row-warning" : ""} ${l ? "cedros-setting-row-toggle" : ""}`,
      children: l ? /* @__PURE__ */ d(T, { children: [
        /* @__PURE__ */ d("div", { className: "cedros-setting-control cedros-setting-control-toggle", children: [
          /* @__PURE__ */ e(
            L,
            {
              meta: r,
              value: s,
              onChange: (c) => a(t.key, c)
            }
          ),
          o && /* @__PURE__ */ e("div", { className: "cedros-setting-warning", children: o })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-setting-label", children: [
          /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: r.label }),
          /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: A(r.description) })
        ] })
      ] }) : /* @__PURE__ */ d(T, { children: [
        /* @__PURE__ */ d("div", { className: "cedros-setting-label", children: [
          /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: r.label }),
          /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: A(r.description) })
        ] }),
        /* @__PURE__ */ d("div", { className: "cedros-setting-control", children: [
          /* @__PURE__ */ e(
            L,
            {
              meta: r,
              value: s,
              onChange: (c) => a(t.key, c)
            }
          ),
          o && /* @__PURE__ */ e("div", { className: "cedros-setting-warning", children: o })
        ] })
      ] })
    }
  ) : /* @__PURE__ */ d("div", { className: `cedros-setting-row ${p ? "cedros-setting-row-changed" : ""}`, children: [
    /* @__PURE__ */ d("div", { className: "cedros-setting-label", children: [
      /* @__PURE__ */ e("span", { className: "cedros-setting-name", children: t.key }),
      t.description && /* @__PURE__ */ e("span", { className: "cedros-setting-description", children: t.description })
    ] }),
    /* @__PURE__ */ e("div", { className: "cedros-setting-input-wrapper", children: /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: s,
        onChange: (c) => a(t.key, c.target.value),
        className: "cedros-setting-input"
      }
    ) })
  ] });
}
function L({ meta: t, value: i, onChange: a }) {
  switch (t.inputType) {
    case "duration":
      return /* @__PURE__ */ e(F, { value: i, onChange: a, presets: t.presets, min: t.min });
    case "percentage":
      return /* @__PURE__ */ e(
        $,
        {
          value: i,
          onChange: a,
          min: t.min ?? 1,
          max: t.max ?? 100,
          step: t.step ?? 5,
          presets: t.presets
        }
      );
    case "select":
      return /* @__PURE__ */ e(
        V,
        {
          value: i,
          onChange: a,
          presets: t.presets ?? [],
          unit: t.unit
        }
      );
    case "number":
      return /* @__PURE__ */ e(
        B,
        {
          value: i,
          onChange: a,
          min: t.min,
          max: t.max,
          unit: t.unit
        }
      );
    case "tokenList":
      return /* @__PURE__ */ e(J, { value: i, onChange: a });
    case "text":
      return /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          value: i,
          onChange: (n) => a(n.target.value),
          className: "cedros-setting-input",
          placeholder: t.label
        }
      );
    case "boolean":
      return /* @__PURE__ */ e(H, { value: i, onChange: a });
    case "secret":
      return /* @__PURE__ */ e(K, { value: i, onChange: a, multiline: t.multiline });
    case "readonlySecret":
      return /* @__PURE__ */ e(G, { settingKey: t.key, value: i });
    case "tokenSymbolList":
      return /* @__PURE__ */ e(z, { value: i, onChange: a });
    default:
      return /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          value: i,
          onChange: (n) => a(n.target.value),
          className: "cedros-setting-input"
        }
      );
  }
}
function F({ value: t, onChange: i, presets: a, min: n = 0 }) {
  const r = parseInt(t, 10) || 0, s = q(r), p = m(
    (o) => {
      o.target.value && i(o.target.value);
    },
    [i]
  ), l = m(
    (o) => {
      const c = Math.max(n, parseInt(o.target.value, 10) || 0);
      i(String(c));
    },
    [i, n]
  );
  return /* @__PURE__ */ d("div", { className: "cedros-duration-input", children: [
    a && a.length > 0 && /* @__PURE__ */ d(
      "select",
      {
        value: a.find((o) => o.value === t)?.value ?? "",
        onChange: p,
        className: "cedros-setting-select",
        children: [
          /* @__PURE__ */ e("option", { value: "", children: "Custom..." }),
          a.map((o) => /* @__PURE__ */ e("option", { value: o.value, children: o.label }, o.value))
        ]
      }
    ),
    /* @__PURE__ */ d("div", { className: "cedros-duration-custom", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "number",
          value: r,
          onChange: l,
          min: n,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: "seconds" }),
      /* @__PURE__ */ d("span", { className: "cedros-duration-display", children: [
        "= ",
        s
      ] })
    ] })
  ] });
}
function $({
  value: t,
  onChange: i,
  min: a,
  max: n,
  step: r,
  presets: s
}) {
  const p = parseInt(t, 10) || a, l = m(
    (c) => {
      i(c.target.value);
    },
    [i]
  ), o = m(
    (c) => {
      i(c);
    },
    [i]
  );
  return /* @__PURE__ */ d("div", { className: "cedros-percentage-input", children: [
    /* @__PURE__ */ d("div", { className: "cedros-percentage-slider-row", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "range",
          value: p,
          onChange: l,
          min: a,
          max: n,
          step: r,
          className: "cedros-percentage-slider"
        }
      ),
      /* @__PURE__ */ d("span", { className: "cedros-percentage-value", children: [
        p,
        "%"
      ] })
    ] }),
    s && s.length > 0 && /* @__PURE__ */ e("div", { className: "cedros-preset-buttons", children: s.map((c) => /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        className: `cedros-preset-button ${c.value === t ? "cedros-preset-button-active" : ""}`,
        onClick: () => o(c.value),
        children: c.label
      },
      c.value
    )) })
  ] });
}
function V({ value: t, onChange: i, presets: a, unit: n }) {
  const r = !a.some((l) => l.value === t), s = m(
    (l) => {
      l.target.value !== "__custom__" && i(l.target.value);
    },
    [i]
  ), p = m(
    (l) => {
      i(l.target.value);
    },
    [i]
  );
  return /* @__PURE__ */ d("div", { className: "cedros-select-input", children: [
    /* @__PURE__ */ d(
      "select",
      {
        value: r ? "__custom__" : t,
        onChange: s,
        className: "cedros-setting-select",
        children: [
          a.map((l) => /* @__PURE__ */ e("option", { value: l.value, children: l.label }, l.value)),
          /* @__PURE__ */ e("option", { value: "__custom__", children: "Custom..." })
        ]
      }
    ),
    r && /* @__PURE__ */ d("div", { className: "cedros-select-custom", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "number",
          value: t,
          onChange: p,
          className: "cedros-setting-input cedros-setting-input-sm"
        }
      ),
      n && /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: n })
    ] })
  ] });
}
function B({ value: t, onChange: i, min: a, max: n, unit: r }) {
  const s = m(
    (p) => {
      i(p.target.value);
    },
    [i]
  );
  return /* @__PURE__ */ d("div", { className: "cedros-number-input", children: [
    /* @__PURE__ */ e(
      "input",
      {
        type: "number",
        value: t,
        onChange: s,
        min: a,
        max: n,
        className: "cedros-setting-input"
      }
    ),
    r && /* @__PURE__ */ e("span", { className: "cedros-setting-unit", children: r })
  ] });
}
function H({ value: t, onChange: i }) {
  const a = t === "true", n = m(() => {
    i(a ? "false" : "true");
  }, [a, i]);
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      role: "switch",
      "aria-checked": a,
      className: `cedros-toggle ${a ? "cedros-toggle-on" : "cedros-toggle-off"}`,
      onClick: n,
      children: [
        /* @__PURE__ */ e("span", { className: "cedros-toggle-track", children: /* @__PURE__ */ e("span", { className: "cedros-toggle-thumb" }) }),
        /* @__PURE__ */ e("span", { className: "cedros-toggle-label", children: a ? "Enabled" : "Disabled" })
      ]
    }
  );
}
function K({ value: t, onChange: i, multiline: a }) {
  const [n, r] = f(!1), [s, p] = f(!1), l = t && t.length > 0, o = m(() => {
    r(!0), p(!0);
  }, []), c = m(() => {
    r(!1), p(!1);
  }, []), y = m(
    (b) => {
      i(b.target.value);
    },
    [i]
  );
  return !n && l ? /* @__PURE__ */ d("div", { className: "cedros-secret-input cedros-secret-input-masked", children: [
    /* @__PURE__ */ e("span", { className: "cedros-secret-masked", children: "•".repeat(Math.min(t.length, 20)) }),
    /* @__PURE__ */ e("button", { type: "button", className: "cedros-secret-edit-btn", onClick: o, children: "Edit" })
  ] }) : /* @__PURE__ */ d("div", { className: "cedros-secret-input", children: [
    a ? /* @__PURE__ */ e(
      "textarea",
      {
        value: t,
        onChange: y,
        className: "cedros-setting-input cedros-setting-textarea",
        placeholder: "Enter secret value...",
        rows: 4
      }
    ) : /* @__PURE__ */ e(
      "input",
      {
        type: s ? "text" : "password",
        value: t,
        onChange: y,
        className: "cedros-setting-input",
        placeholder: "Enter secret value..."
      }
    ),
    /* @__PURE__ */ d("div", { className: "cedros-secret-actions", children: [
      !a && /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-secret-toggle-btn",
          onClick: () => p(!s),
          children: s ? "Hide" : "Show"
        }
      ),
      n && /* @__PURE__ */ e("button", { type: "button", className: "cedros-secret-done-btn", onClick: c, children: "Done" })
    ] })
  ] });
}
function G({ settingKey: t, value: i }) {
  const [a, n] = f(null), [r, s] = f(!1), [p, l] = f(!1), [o, c] = f(null), [y, b] = f(!1), { config: _, _internal: w } = U(), v = a ?? i, x = v && v.length > 0, C = x && !a, h = m(async () => {
    if (v)
      try {
        await navigator.clipboard.writeText(v), s(!0), setTimeout(() => s(!1), 2e3);
      } catch {
        const u = document.createElement("textarea");
        u.value = v, document.body.appendChild(u), u.select(), document.execCommand("copy"), document.body.removeChild(u), s(!0), setTimeout(() => s(!1), 2e3);
      }
  }, [v]), k = m(async () => {
    l(!0), c(null);
    try {
      const u = w?.getAccessToken?.(), g = { "Content-Type": "application/json" };
      u && (g.Authorization = `Bearer ${u}`);
      const S = await fetch(
        `${_.serverUrl}/auth/admin/settings/regenerate/${t}`,
        { method: "POST", headers: g, credentials: "include" }
      );
      if (!S.ok) {
        const D = await S.json().catch(() => null);
        throw new Error(D?.message || D?.error || `Regenerate failed (${S.status})`);
      }
      const E = await S.json();
      n(E.value), b(!1);
    } catch (u) {
      c(u instanceof Error ? u.message : "Failed to regenerate");
    } finally {
      l(!1);
    }
  }, [_.serverUrl, w, t]);
  return /* @__PURE__ */ d("div", { className: "cedros-readonly-secret", children: [
    /* @__PURE__ */ e("div", { className: "cedros-readonly-secret-value", children: C ? /* @__PURE__ */ e("span", { className: "cedros-secret-masked", children: "•".repeat(20) }) : x ? /* @__PURE__ */ e("code", { className: "cedros-readonly-secret-code", children: v }) : /* @__PURE__ */ e("span", { className: "cedros-readonly-secret-empty", children: "Not generated yet" }) }),
    /* @__PURE__ */ d("div", { className: "cedros-readonly-secret-actions", children: [
      x && /* @__PURE__ */ e("button", { type: "button", className: "cedros-secret-action-btn", onClick: h, children: r ? "Copied!" : "Copy" }),
      y ? /* @__PURE__ */ d("span", { className: "cedros-readonly-secret-confirm", children: [
        /* @__PURE__ */ e("span", { className: "cedros-readonly-secret-confirm-text", children: "Update deploy secret too?" }),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-secret-action-btn cedros-secret-action-btn--danger",
            onClick: k,
            disabled: p,
            children: p ? "Regenerating..." : "Confirm"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            className: "cedros-secret-action-btn",
            onClick: () => b(!1),
            disabled: p,
            children: "Cancel"
          }
        )
      ] }) : /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          className: "cedros-secret-action-btn cedros-secret-action-btn--danger",
          onClick: () => b(!0),
          disabled: p,
          children: "Regenerate"
        }
      )
    ] }),
    o && /* @__PURE__ */ e("p", { className: "cedros-readonly-secret-error", children: o })
  ] });
}
function J({ value: t, onChange: i }) {
  const a = N(() => {
    try {
      return JSON.parse(t || "[]");
    } catch {
      return [];
    }
  }, [t]), n = m(
    (l) => {
      i(JSON.stringify(l));
    },
    [i]
  ), r = m(() => {
    n([...a, { symbol: "", mint: "", decimals: 6 }]);
  }, [a, n]), s = m(
    (l, o, c) => {
      const y = [...a];
      y[l] = { ...y[l], [o]: c }, n(y);
    },
    [a, n]
  ), p = m(
    (l) => {
      n(a.filter((o, c) => c !== l));
    },
    [a, n]
  );
  return /* @__PURE__ */ d("div", { className: "cedros-token-list-input", children: [
    /* @__PURE__ */ d("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ e("span", { className: "cedros-token-presets-label", children: "Built-in tokens:" }),
      /* @__PURE__ */ e("div", { className: "cedros-token-presets-list", children: R.map((l) => /* @__PURE__ */ e("span", { className: "cedros-token-preset-chip", children: l }, l)) })
    ] }),
    a.length === 0 && /* @__PURE__ */ e("p", { className: "cedros-token-list-empty", children: "No custom tokens added. Use the built-in tokens above or add your own." }),
    a.map((l, o) => /* @__PURE__ */ d("div", { className: "cedros-token-row", children: [
      /* @__PURE__ */ d("div", { className: "cedros-token-row-fields", children: [
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Symbol",
            value: l.symbol,
            onChange: (c) => s(o, "symbol", c.target.value.toUpperCase()),
            className: "cedros-setting-input cedros-token-input-symbol",
            maxLength: 10
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Mint address",
            value: l.mint,
            onChange: (c) => s(o, "mint", c.target.value),
            className: "cedros-setting-input cedros-token-input-mint"
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "number",
            placeholder: "Decimals",
            value: l.decimals,
            onChange: (c) => s(o, "decimals", parseInt(c.target.value, 10) || 0),
            className: "cedros-setting-input cedros-token-input-decimals",
            min: 0,
            max: 18
          }
        ),
        /* @__PURE__ */ e(
          "input",
          {
            type: "text",
            placeholder: "Logo URL (optional)",
            value: l.logoUrl || "",
            onChange: (c) => s(o, "logoUrl", c.target.value || void 0),
            className: "cedros-setting-input cedros-token-input-logo"
          }
        )
      ] }),
      /* @__PURE__ */ e(
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
    /* @__PURE__ */ e("button", { type: "button", className: "cedros-token-add-btn", onClick: r, children: "+ Add Token" })
  ] });
}
function z({ value: t, onChange: i }) {
  const a = N(() => t.split(",").map((s) => s.trim()).filter(Boolean), [t]), n = m(
    (s) => {
      if (!s || a.includes(s)) return;
      const p = [...a, s].join(", ");
      i(p);
    },
    [a, i]
  ), r = m(
    (s) => {
      const p = a.filter((l) => l !== s).join(", ");
      i(p);
    },
    [a, i]
  );
  return /* @__PURE__ */ d("div", { className: "cedros-token-symbol-list-input", children: [
    /* @__PURE__ */ d("div", { className: "cedros-token-presets", children: [
      /* @__PURE__ */ e("span", { className: "cedros-token-presets-label", children: "Click to add:" }),
      /* @__PURE__ */ e("div", { className: "cedros-token-presets-list", children: R.map((s) => {
        const p = a.includes(s);
        return /* @__PURE__ */ d(
          "button",
          {
            type: "button",
            className: `cedros-token-preset-chip ${p ? "cedros-token-preset-chip-selected" : ""}`,
            onClick: () => p ? r(s) : n(s),
            title: p ? `Remove ${s}` : `Add ${s}`,
            children: [
              s,
              p && /* @__PURE__ */ e("span", { className: "cedros-token-chip-check", children: "✓" })
            ]
          },
          s
        );
      }) })
    ] }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: t,
        onChange: (s) => i(s.target.value),
        className: "cedros-setting-input",
        placeholder: "USDC, SOL, BONK..."
      }
    )
  ] });
}
const Y = 800, X = 2e3;
function re() {
  const { settings: t, isLoading: i, error: a, fetchSettings: n, updateSettings: r } = O(), [s, p] = f({}), [l, o] = f("idle"), [c, y] = f(null), b = P(null), _ = P(null), w = P({});
  I(() => () => {
    b.current && clearTimeout(b.current), _.current && clearTimeout(_.current);
  }, []);
  const v = m(async () => {
    const h = { ...w.current };
    if (Object.keys(h).length === 0) {
      o("idle");
      return;
    }
    o("saving"), y(null);
    const k = Object.entries(h).map(([u, g]) => ({
      key: u,
      value: g
    }));
    try {
      await r(k), p((u) => {
        const g = { ...u };
        for (const S of Object.keys(h))
          delete g[S];
        return g;
      });
      for (const u of Object.keys(h))
        delete w.current[u];
      o("saved"), _.current && clearTimeout(_.current), _.current = setTimeout(() => {
        o("idle");
      }, X);
    } catch (u) {
      o("error"), y(u instanceof Error ? u.message : "Failed to save");
    }
  }, [r]), x = m(
    (h, k) => {
      p((u) => ({ ...u, [h]: k })), w.current[h] = k, y(null), o("pending"), b.current && clearTimeout(b.current), b.current = setTimeout(() => {
        v();
      }, Y);
    },
    [v]
  ), C = m(
    (h) => {
      if (s[h] !== void 0) return s[h];
      for (const k of Object.values(t)) {
        const u = k.find((g) => g.key === h);
        if (u) return u.value;
      }
      return "";
    },
    [s, t]
  );
  return {
    settings: t,
    edits: s,
    isLoading: i,
    autosaveStatus: l,
    autosaveError: c,
    error: a,
    fetchSettings: n,
    handleChange: x,
    getEffectiveValue: C
  };
}
function se({ status: t, error: i }) {
  return t === "idle" ? null : /* @__PURE__ */ d("div", { className: `cedros-autosave-status cedros-autosave-status--${t}`, children: [
    t === "pending" && /* @__PURE__ */ d(T, { children: [
      /* @__PURE__ */ e("span", { className: "cedros-autosave-dot" }),
      /* @__PURE__ */ e("span", { children: "Unsaved changes" })
    ] }),
    t === "saving" && /* @__PURE__ */ d(T, { children: [
      /* @__PURE__ */ e("span", { className: "cedros-autosave-spinner" }),
      /* @__PURE__ */ e("span", { children: "Saving..." })
    ] }),
    t === "saved" && /* @__PURE__ */ d(T, { children: [
      /* @__PURE__ */ e("span", { className: "cedros-autosave-check", children: "✓" }),
      /* @__PURE__ */ e("span", { children: "Saved" })
    ] }),
    t === "error" && /* @__PURE__ */ d(T, { children: [
      /* @__PURE__ */ e("span", { className: "cedros-autosave-error-icon", children: "!" }),
      /* @__PURE__ */ e("span", { children: i || "Save failed" })
    ] })
  ] });
}
export {
  se as A,
  ae as C,
  ie as S,
  W as a,
  re as u
};
