/**
 * Settings metadata - rich descriptions and input configuration
 */
import type { SettingMeta } from '../../../types';

// =============================================================================
// DURATION UTILITIES
// =============================================================================

interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function secondsToDuration(totalSeconds: number): DurationParts {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function formatDuration(totalSeconds: number): string {
  const { days, hours, minutes } = secondsToDuration(totalSeconds);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${totalSeconds}s`);
  return parts.join(' ');
}

// =============================================================================
// SETTING METADATA - Rich descriptions and input configuration
// =============================================================================

export const SETTING_METADATA: Record<string, SettingMeta> = {
  // ============= Signup Limits =============
  signup_limit_enabled: {
    key: 'signup_limit_enabled',
    label: 'Limit new signups',
    description: 'Cap new account registrations within a UTC calendar period.',
    inputType: 'boolean',
  },
  signup_limit_period: {
    key: 'signup_limit_period',
    label: 'Period',
    description: 'The UTC calendar period in which registrations are counted.',
    inputType: 'select',
    presets: [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ],
  },
  signup_limit_max: {
    key: 'signup_limit_max',
    label: 'Maximum signups',
    description: 'The maximum number of new accounts allowed in each period.',
    inputType: 'number',
    min: 1,
    max: 1000000,
    step: 1,
  },
  signup_limit_show_remaining: {
    key: 'signup_limit_show_remaining',
    label: 'Show remaining spots',
    description:
      'Display the current number of signup spots and the UTC reset time on public registration forms.',
    inputType: 'boolean',
  },

  // ============= Authentication Providers =============
  // Email auth
  auth_email_enabled: {
    key: 'auth_email_enabled',
    label: 'Enable email authentication',
    description: 'Allow users to sign up and sign in with email and password.',
    inputType: 'boolean',
  },
  auth_email_require_verification: {
    key: 'auth_email_require_verification',
    label: 'Require email verification',
    description: 'Users must verify their email address before they can sign in.',
    inputType: 'boolean',
  },
  auth_email_block_disposable: {
    key: 'auth_email_block_disposable',
    label: 'Block disposable emails',
    description: 'Reject registrations from known disposable email providers.',
    inputType: 'boolean',
  },

  // Google OAuth
  auth_google_enabled: {
    key: 'auth_google_enabled',
    label: 'Enable Google sign-in',
    description:
      'Allow users to authenticate with their Google account. Configure at <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">Google Cloud Console > Credentials</a>.',
    inputType: 'boolean',
  },
  auth_google_client_id: {
    key: 'auth_google_client_id',
    label: 'Google client ID',
    description:
      'OAuth 2.0 client ID from Google Cloud Console. Create a Web application credential and add your frontend URL to Authorized JavaScript origins.',
    inputType: 'text',
  },
  // Apple OAuth
  auth_apple_enabled: {
    key: 'auth_apple_enabled',
    label: 'Enable Sign in with Apple',
    description:
      'Allow users to authenticate with their Apple ID. Configure at <a href="https://developer.apple.com/account/resources/identifiers" target="_blank" rel="noopener">Apple Developer > Identifiers</a>.',
    inputType: 'boolean',
  },
  auth_apple_client_id: {
    key: 'auth_apple_client_id',
    label: 'Apple services ID',
    description:
      'Your Client ID (e.g. com.yourdomain.service). Create at Identifiers > Services IDs, then enable Sign in with Apple and add your frontend URL as a Return URL (e.g. https://yourdomain.com).',
    inputType: 'text',
    placeholder: 'com.yourdomain.service',
  },
  auth_apple_team_id: {
    key: 'auth_apple_team_id',
    label: 'Apple team ID',
    description:
      'Identifies your developer account. Found at the top-right of <a href="https://developer.apple.com/account" target="_blank" rel="noopener">Apple Developer</a>.',
    inputType: 'text',
  },

  // Solana auth
  auth_solana_enabled: {
    key: 'auth_solana_enabled',
    label: 'Enable Solana wallet authentication',
    description: 'Allow users to authenticate by signing with their Solana wallet.',
    inputType: 'boolean',
  },
  auth_solana_challenge_expiry: {
    key: 'auth_solana_challenge_expiry',
    label: 'Challenge Expiry',
    description: 'How long a wallet signature challenge is valid.',
    inputType: 'duration',
    min: 60,
    presets: [
      { label: '1 minute', value: '60' },
      { label: '5 minutes', value: '300' },
      { label: '10 minutes', value: '600' },
    ],
  },

  // WebAuthn/Passkeys
  auth_webauthn_enabled: {
    key: 'auth_webauthn_enabled',
    label: 'Enable WebAuthn/Passkeys',
    description: 'Allow passwordless authentication with FIDO2/WebAuthn credentials.',
    inputType: 'boolean',
  },
  auth_webauthn_rp_id: {
    key: 'auth_webauthn_rp_id',
    label: 'Relying Party ID',
    description: 'Usually your domain (e.g., example.com). Passkeys are bound to this.',
    inputType: 'text',
  },
  auth_webauthn_rp_name: {
    key: 'auth_webauthn_rp_name',
    label: 'Relying Party Name',
    description: 'Display name shown to users during passkey registration.',
    inputType: 'text',
  },
  auth_webauthn_rp_origin: {
    key: 'auth_webauthn_rp_origin',
    label: 'Allowed Origins',
    description: 'Comma-separated origins allowed for WebAuthn (e.g., https://example.com).',
    inputType: 'text',
  },

  // Instant Link (Magic Link)
  auth_instantlink_enabled: {
    key: 'auth_instantlink_enabled',
    label: 'Enable instant link',
    description:
      'When enabled, "Forgot your password?" sends a one-time sign-in link instead of a password reset. This replaces the password reset flow — it is not a separate sign-in button.',
    inputType: 'boolean',
  },
  auth_instantlink_expiry: {
    key: 'auth_instantlink_expiry',
    label: 'Link expiry',
    description: 'How long the magic link remains valid.',
    inputType: 'duration',
    min: 60,
    presets: [
      { label: '5 minutes', value: '300' },
      { label: '15 minutes', value: '900' },
      { label: '30 minutes', value: '1800' },
      { label: '1 hour', value: '3600' },
    ],
  },
  auth_instantlink_rate_limit: {
    key: 'auth_instantlink_rate_limit',
    label: 'Rate limit',
    description: 'Maximum instant link requests per email per hour.',
    inputType: 'select',
    presets: [
      { label: '3 per hour', value: '3' },
      { label: '5 per hour', value: '5' },
      { label: '10 per hour', value: '10' },
    ],
  },

  // ============= Feature Flags =============
  // Order: organizations, enterprise SSO, 2fa, embedded wallets
  feature_organizations: {
    key: 'feature_organizations',
    label: 'Organizations',
    description: 'Enable multi-user organizations with role-based access.',
    inputType: 'boolean',
  },
  feature_sso: {
    key: 'feature_sso',
    label: 'Enterprise SSO',
    description: 'Enable SAML/OIDC single sign-on for enterprise customers.',
    inputType: 'boolean',
  },
  feature_mfa: {
    key: 'feature_mfa',
    label: 'Two-factor authentication',
    description:
      'Allow users to enable TOTP-based two-factor authentication for email/password sign-in. ' +
      'OAuth (Google, Apple) and passkey logins are not affected — those providers handle their own verification.',
    inputType: 'boolean',
  },
  // ============= Security Settings =============
  security_require_mfa: {
    key: 'security_require_mfa',
    label: 'Require two-factor authentication',
    description:
      'Require users with email/password credentials to set up TOTP two-factor authentication. ' +
      'Users will be prompted to enroll after their next sign-in. ' +
      'Does not affect OAuth, passkey, or wallet sign-in methods. ' +
      'Works independently of the "Two-factor authentication" feature flag, which controls UI visibility.',
    inputType: 'boolean',
  },
  auth_new_device_alert_enabled: {
    key: 'auth_new_device_alert_enabled',
    label: 'New device sign-in alerts',
    description:
      'Email users when their account is signed into from a device (browser + OS) not seen in their recent sessions. ' +
      'A standard account-takeover signal. On by default; turn off if it is too noisy for your users.',
    inputType: 'boolean',
  },
  security_cors_origins: {
    key: 'security_cors_origins',
    label: 'CORS Origins',
    description:
      'Allowed origins for cross-origin requests (comma-separated). Empty = same origin only.',
    inputType: 'text',
  },
  security_cookie_domain: {
    key: 'security_cookie_domain',
    label: 'Cookie Domain',
    description: 'Domain for auth cookies. Empty uses the request origin.',
    inputType: 'text',
  },
  security_cookie_secure: {
    key: 'security_cookie_secure',
    label: 'Secure Cookies',
    description: 'Require HTTPS for cookies. Disable only for local development.',
    inputType: 'boolean',
  },
  security_cookie_same_site: {
    key: 'security_cookie_same_site',
    label: 'Cookie SameSite',
    description: 'SameSite policy for cookies. Use "none" only if needed for cross-site embeds.',
    inputType: 'select',
    presets: [
      { label: 'Strict', value: 'strict' },
      { label: 'Lax (Recommended)', value: 'lax' },
      { label: 'None (cross-site)', value: 'none' },
    ],
  },
  security_session_timeout: {
    key: 'security_session_timeout',
    label: 'Session Timeout',
    description: 'How long sessions remain valid before requiring re-authentication.',
    inputType: 'duration',
    min: 300,
    presets: [
      { label: '1 hour', value: '3600' },
      { label: '24 hours', value: '86400' },
      { label: '7 days', value: '604800' },
      { label: '30 days', value: '2592000' },
    ],
  },
  security_jwt_issuer: {
    key: 'security_jwt_issuer',
    label: 'JWT Issuer',
    description: 'Issuer claim for JWTs. Empty uses the server URL.',
    inputType: 'text',
  },
  security_jwt_audience: {
    key: 'security_jwt_audience',
    label: 'JWT Audience',
    description: 'Audience claim for JWTs. Empty uses default.',
    inputType: 'text',
  },

  // ============= Email/SMTP Settings =============
  email_provider: {
    key: 'email_provider',
    label: 'Email Provider',
    description:
      'Select a provider to auto-configure SMTP host, port, and TLS. Choose Custom SMTP to enter settings manually.',
    inputType: 'select',
    presets: [
      { label: 'Mailgun', value: 'mailgun' },
      { label: 'SendGrid', value: 'sendgrid' },
      { label: 'Postmark', value: 'postmark' },
      { label: 'AWS SES', value: 'ses' },
      { label: 'Resend', value: 'resend' },
      { label: 'Custom SMTP', value: 'custom' },
    ],
  },
  email_smtp_host: {
    key: 'email_smtp_host',
    label: 'SMTP Host',
    description: 'SMTP server hostname. Auto-filled when selecting a provider above.',
    inputType: 'text',
    placeholder: 'smtp.example.com',
  },
  email_smtp_port: {
    key: 'email_smtp_port',
    label: 'SMTP Port',
    description: 'SMTP server port. Most providers use 587 (TLS).',
    inputType: 'select',
    presets: [
      { label: '587 (TLS)', value: '587' },
      { label: '465 (SSL)', value: '465' },
      { label: '25 (Plain)', value: '25' },
    ],
  },
  email_smtp_user: {
    key: 'email_smtp_user',
    label: 'SMTP Username',
    description:
      'Username for SMTP authentication. For SendGrid use "apikey", for Postmark use your server API token, for Mailgun use your full Mailgun SMTP login.',
    inputType: 'text',
  },
  email_smtp_password: {
    key: 'email_smtp_password',
    label: 'API Key',
    description:
      'API key or password for your email provider. For SendGrid this is your API key, for Postmark your server API token, for Mailgun your SMTP password.',
    inputType: 'secret',
  },
  email_smtp_tls: {
    key: 'email_smtp_tls',
    label: 'Use TLS',
    description: 'Enable TLS encryption for SMTP connections. Required by most providers.',
    inputType: 'boolean',
  },
  email_from_address: {
    key: 'email_from_address',
    label: 'From Address',
    description:
      'Sender email address for verification, password reset, and instant link emails. Must be verified with your provider.',
    inputType: 'text',
    placeholder: 'noreply@yourdomain.com',
  },
  email_from_name: {
    key: 'email_from_name',
    label: 'From Name',
    description: 'Display name shown in the "From" field of outbound emails.',
    inputType: 'text',
    placeholder: 'My App',
  },

  // ============= Email Subject Customization =============
  email_subject_verification: {
    key: 'email_subject_verification',
    label: 'Verification Email Subject',
    description:
      'Custom subject for email verification messages. Leave empty for the default: "Verify your email address".',
    inputType: 'text',
    placeholder: 'Verify your email address',
  },
  email_subject_password_reset: {
    key: 'email_subject_password_reset',
    label: 'Password Reset Subject',
    description:
      'Custom subject for password reset emails. Leave empty for the default: "Reset your password".',
    inputType: 'text',
    placeholder: 'Reset your password',
  },
  email_subject_instant_link: {
    key: 'email_subject_instant_link',
    label: 'Instant Link Subject',
    description:
      'Custom subject for instant link sign-in emails. Leave empty for the default: "Your sign-in link".',
    inputType: 'text',
    placeholder: 'Your sign-in link',
  },
  email_subject_invite: {
    key: 'email_subject_invite',
    label: 'Invite Email Subject',
    description:
      'Custom subject for organization invite emails. Leave empty for the default which includes the org name.',
    inputType: 'text',
    placeholder: "You've been invited to join...",
  },
  email_subject_security_alert: {
    key: 'email_subject_security_alert',
    label: 'Security Alert Subject',
    description:
      'Custom subject for new device sign-in alerts. Leave empty for the default: "New sign-in to your account".',
    inputType: 'text',
    placeholder: 'New sign-in to your account',
  },

  // ============= Webhook Settings =============
  webhook_enabled: {
    key: 'webhook_enabled',
    label: 'Enable Webhooks',
    description: 'Send notifications to a Discord or Slack webhook URL.',
    inputType: 'boolean',
  },
  webhook_url: {
    key: 'webhook_url',
    label: 'Webhook URL',
    description: 'Discord or Slack webhook URL to receive notifications.',
    inputType: 'text',
    placeholder: 'https://discord.com/api/webhooks/...',
  },
  webhook_notify_registrations: {
    key: 'webhook_notify_registrations',
    label: 'New Registrations',
    description: 'Notify when a new user registers.',
    inputType: 'boolean',
  },
  webhook_notify_signins: {
    key: 'webhook_notify_signins',
    label: 'Sign-Ins',
    description: 'Notify when a user signs in.',
    inputType: 'boolean',
  },
  // ============= Server Settings =============
  server_frontend_url: {
    key: 'server_frontend_url',
    label: 'Frontend URL',
    description: 'URL of your frontend app (for redirects and email links).',
    inputType: 'text',
  },
  server_base_path: {
    key: 'server_base_path',
    label: 'Base Path',
    description: 'Base path for auth endpoints (e.g., /auth).',
    inputType: 'text',
  },
  server_trust_proxy: {
    key: 'server_trust_proxy',
    label: 'Trust Proxy',
    description: 'Trust X-Forwarded-For headers. Enable if behind a reverse proxy.',
    inputType: 'boolean',
  },
  server_metrics_api_key: {
    key: 'server_metrics_api_key',
    label: 'Metrics API Key',
    description:
      'API key for Prometheus/Grafana to scrape the /metrics endpoint. Use with Authorization: Bearer header.',
    inputType: 'secret',
  },
  server_log_level: {
    key: 'server_log_level',
    label: 'Log Level',
    description: 'Minimum severity level for log output. Lower levels are more verbose.',
    inputType: 'select',
    presets: [
      { label: 'Trace (most verbose)', value: 'trace' },
      { label: 'Debug', value: 'debug' },
      { label: 'Info', value: 'info' },
      { label: 'Warn', value: 'warn' },
      { label: 'Error (least verbose)', value: 'error' },
    ],
  },
  server_log_format: {
    key: 'server_log_format',
    label: 'Log Format',
    description: 'Output format for log messages.',
    inputType: 'select',
    presets: [
      { label: 'JSON (structured)', value: 'json' },
      { label: 'Pretty (human-readable)', value: 'pretty' },
    ],
  },
  server_environment: {
    key: 'server_environment',
    label: 'Environment',
    description: 'Deployment environment. Affects default behaviors and log verbosity.',
    inputType: 'select',
    presets: [
      { label: 'Development', value: 'development' },
      { label: 'Staging', value: 'staging' },
      { label: 'Production', value: 'production' },
    ],
  },

  // Rate limit settings
  rate_limit_auth: {
    key: 'rate_limit_auth',
    label: 'Auth Request Limit',
    description:
      'Maximum authentication attempts (login, register, password reset) per IP per window. Protects against brute force attacks.',
    inputType: 'select',
    min: 1,
    unit: 'requests',
    presets: [
      { label: '5 (Strict)', value: '5' },
      { label: '10 (Recommended)', value: '10' },
      { label: '20', value: '20' },
      { label: '50 (Permissive)', value: '50' },
    ],
    warningThreshold: {
      above: 20,
      message: 'High auth limits may allow brute force attempts.',
    },
  },
  rate_limit_general: {
    key: 'rate_limit_general',
    label: 'General Request Limit',
    description: 'Maximum general API requests per IP per window. Affects all non-auth endpoints.',
    inputType: 'select',
    min: 1,
    unit: 'requests',
    presets: [
      { label: '30', value: '30' },
      { label: '60 (Recommended)', value: '60' },
      { label: '120', value: '120' },
      { label: '300', value: '300' },
    ],
  },
  rate_limit_window: {
    key: 'rate_limit_window',
    label: 'Rate Limit Window',
    description:
      'Time window for rate limiting. All limits above are "per window". Shorter windows are stricter.',
    inputType: 'duration',
    min: 1,
    presets: [
      { label: '30 seconds', value: '30' },
      { label: '1 minute', value: '60' },
      { label: '5 minutes', value: '300' },
      { label: '15 minutes', value: '900' },
    ],
  },

  // ============= Post-Login Flow =============
  postlogin_redirect_url: {
    key: 'postlogin_redirect_url',
    label: 'Redirect URL',
    description:
      'Final step: send users here after all login and registration steps are complete. Leave empty for the consumer app default.',
    inputType: 'text',
    placeholder: 'https://example.com/dashboard',
  },
  postlogin_welcome_enabled: {
    key: 'postlogin_welcome_enabled',
    label: 'Enable welcome page',
    description: 'Show a one-time welcome page to new users after their first sign-in.',
    inputType: 'boolean',
  },
  postlogin_welcome_route: {
    key: 'postlogin_welcome_route',
    label: 'Welcome route',
    description: 'Path on your app where new users land for onboarding.',
    inputType: 'path',
    placeholder: 'welcome',
  },
  postlogin_complete_enabled: {
    key: 'postlogin_complete_enabled',
    label: 'Prompt profile completion',
    description:
      'Prompt users to fill in a missing name or email after sign-in until they complete or skip it.',
    inputType: 'boolean',
  },
  postlogin_username_enabled: {
    key: 'postlogin_username_enabled',
    label: 'Require username selection',
    description:
      'Prompt new users to choose a unique handle-style username (e.g. @swift_falcon_42) after signup. Shows until the user picks a username or skips.',
    inputType: 'boolean',
  },
  // ============= Image Storage Settings =============
  image_storage_enabled: {
    key: 'image_storage_enabled',
    label: 'Enable Image Storage',
    description:
      'Enable S3-compatible object storage for user avatar uploads. When disabled, users cannot upload profile pictures.',
    inputType: 'boolean',
  },
  image_storage_provider: {
    key: 'image_storage_provider',
    label: 'Storage Provider',
    description:
      'Select your S3-compatible storage provider to auto-fill endpoint and region hints.',
    inputType: 'select',
    presets: [
      { label: 'DigitalOcean Spaces', value: 'digitalocean' },
      { label: 'AWS S3', value: 's3' },
      { label: 'Custom S3-Compatible', value: 'custom' },
    ],
  },
  image_storage_bucket: {
    key: 'image_storage_bucket',
    label: 'Bucket Name',
    description: 'The name of your S3 bucket or DigitalOcean Space.',
    inputType: 'text',
    placeholder: 'my-app-avatars',
  },
  image_storage_region: {
    key: 'image_storage_region',
    label: 'Region',
    description: 'AWS region or DigitalOcean datacenter (e.g., us-east-1, nyc3, ams3).',
    inputType: 'text',
    placeholder: 'us-east-1',
  },
  image_storage_endpoint: {
    key: 'image_storage_endpoint',
    label: 'Endpoint URL',
    description:
      'S3-compatible endpoint URL. For DigitalOcean Spaces: https://{region}.digitaloceanspaces.com. Leave empty for AWS S3.',
    inputType: 'text',
    placeholder: 'https://nyc3.digitaloceanspaces.com',
  },
  image_storage_access_key: {
    key: 'image_storage_access_key',
    label: 'Access Key',
    description: 'S3 access key ID or DigitalOcean Spaces access key.',
    inputType: 'secret',
  },
  image_storage_secret_key: {
    key: 'image_storage_secret_key',
    label: 'Secret Key',
    description: 'S3 secret access key or DigitalOcean Spaces secret key.',
    inputType: 'secret',
  },
  image_storage_cdn_url: {
    key: 'image_storage_cdn_url',
    label: 'CDN URL (optional)',
    description:
      'Custom CDN URL prefix for serving images (e.g., https://cdn.example.com). If empty, images are served directly from the bucket URL.',
    inputType: 'text',
    placeholder: 'https://cdn.example.com',
  },
};

// =============================================================================
// CATEGORY METADATA
// =============================================================================

export interface CategoryMeta {
  label: string;
  description: string;
  icon: string;
}

export const CATEGORY_METADATA: Record<string, CategoryMeta> = {
  // Auth providers (sorted alphabetically by subcategory)
  'auth.apple': {
    label: 'Apple Sign-In',
    description: 'Configure Sign in with Apple OAuth integration.',
    icon: '',
  },
  'auth.email': {
    label: 'Email Authentication',
    description: 'Configure email/password authentication settings.',
    icon: '',
  },
  'auth.google': {
    label: 'Google Sign-In',
    description: 'Configure Google OAuth integration.',
    icon: '',
  },
  'auth.solana': {
    label: 'Solana Wallet Auth',
    description: 'Configure Solana wallet signature authentication.',
    icon: '',
  },
  'auth.webauthn': {
    label: 'WebAuthn / Passkeys',
    description: 'Configure FIDO2/WebAuthn passwordless authentication.',
    icon: '',
  },
  'auth.instantlink': {
    label: 'Instant Link',
    description:
      'Passwordless sign-in via email link. Replaces "Forgot your password?" with a one-time login link instead of a password reset.',
    icon: '',
  },
  postlogin: {
    label: 'Post-Login',
    description: 'Configure what happens after a user logs in.',
    icon: '',
  },
  'postlogin.welcome': {
    label: 'Welcome Page',
    description: 'One-time onboarding page shown to new users after first login.',
    icon: '',
  },
  'postlogin.complete': {
    label: 'Profile Completion',
    description: 'Prompt users to fill in missing profile information.',
    icon: '',
  },
  'postlogin.username': {
    label: 'Username Selection',
    description: 'Prompt users to choose a unique handle-style username.',
    icon: '',
  },
  'postlogin.wallet': {
    label: 'Wallet Enrollment',
    description: 'Prompt users to enroll an embedded wallet after signup.',
    icon: '',
  },
  email: {
    label: 'Email / SMTP',
    description:
      'Configure outbound email delivery for verification, password reset, and notifications.',
    icon: '',
  },
  features: {
    label: 'Feature Flags',
    description: 'Enable or disable major platform features.',
    icon: '',
  },
  rate_limit: {
    label: 'Rate Limiting',
    description:
      'Protect the system from abuse by limiting request rates. Balance security with user experience.',
    icon: '',
  },
  security: {
    label: 'Security',
    description: 'Configure CORS, cookies, sessions, and JWT settings.',
    icon: '',
  },
  server: {
    label: 'Server',
    description: 'Server infrastructure settings. Some may be overridden by environment variables.',
    icon: '',
  },
  webhook: {
    label: 'Webhooks',
    description: 'Configure HTTP webhook notifications for auth events.',
    icon: '',
  },
  image_storage: {
    label: 'Image Storage',
    description: 'Configure S3-compatible object storage for user avatars and images.',
    icon: '',
  },
};

/** Preset tokens that are always available without needing to be redefined */
export const PRESET_TOKEN_SYMBOLS = [
  'SOL',
  'USDC',
  'USDT',
  'EURC',
  'USD1',
  'PYUSD',
  'USDH',
  'CASH',
  'BONK',
  'ORE',
];
