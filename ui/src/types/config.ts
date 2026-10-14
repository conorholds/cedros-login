import type { AuthUser, AuthMethod, AuthError } from './auth';
import type { FeatureFlagEnv, FeatureFlags } from '../featureFlags';
import type { DeepPartial, Translations } from '../i18n';

export type {
  FeatureFlagDefinition,
  FeatureFlagEnv,
  FeatureFlagEnvValue,
  FeatureFlags,
  FeatureFlagName,
  FeatureFlagStatus,
  ResolvedFeatureFlags,
} from '../featureFlags';

/**
 * Solana network configuration
 */
export type SolanaNetwork = 'mainnet-beta' | 'devnet';

/**
 * Session storage mode
 *
 * **Security considerations:**
 * - `cookie`: **Recommended.** HttpOnly cookies prevent JavaScript from reading
 *   tokens; injected scripts can still make authenticated requests.
 * - `memory`: Secure but lost on page refresh. Good for high-security applications.
 * - `localStorage`: **Use with caution.** Tokens are accessible to any JavaScript
 *   on the page, making them vulnerable to XSS attacks. Only use when cookie-based
 *   auth is not possible (e.g., cross-origin scenarios without proper CORS).
 */
export type SessionStorage = 'cookie' | 'memory' | 'localStorage' | 'sessionStorage';

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

export type SignupLimitPeriod = 'daily' | 'weekly' | 'monthly';

/** Public, informational snapshot of the current signup quota. */
export interface SignupAvailability {
  remaining: number;
  limit: number;
  period: SignupLimitPeriod;
  resetsAt: string;
}

/**
 * Solana configuration options
 */
export interface SolanaConfig {
  /** Solana network to connect to. Default: 'mainnet-beta' */
  network?: SolanaNetwork;
  /** Auto-reconnect wallet on page load. Default: false */
  autoConnect?: boolean;
}

/**
 * Session handling configuration
 *
 * @security For best security, use the default `cookie` storage with `autoRefresh: true`.
 * Avoid `localStorage` in production unless absolutely necessary.
 */
export interface SessionConfig {
  /**
   * Where to store tokens. Default: 'cookie'
   *
   * @security `cookie` is strongly recommended for production use.
   * See {@link SessionStorage} for security implications of each option.
   */
  storage?: SessionStorage;
  /** Auto-refresh tokens before expiry. Default: true */
  autoRefresh?: boolean;
  /** Sync auth state across browser tabs. Default: true */
  syncTabs?: boolean;
  /** Storage key for tokens when using web storage. Default: 'cedros_tokens' */
  persistKey?: string;
  /**
   * Explicitly allow web storage for tokens.
   *
   * @security This is intentionally opt-in because `localStorage` and
   * `sessionStorage` are vulnerable to XSS token theft.
   *
   * If you enable this, also implement a strict CSP and audit any third-party scripts.
   */
  allowWebStorage?: boolean;
}

/**
 * Authentication callbacks
 */
export interface AuthCallbacks {
  /** Called after successful login */
  onLoginSuccess?: (user: AuthUser, method: AuthMethod) => void;
  /** Called when login fails */
  onLoginError?: (error: AuthError) => void;
  /** Called after logout */
  onLogout?: () => void;
  /** Called when session expires */
  onSessionExpired?: () => void;
}

/**
 * CRM identify-login configuration.
 *
 * When enabled, the provider POSTs to the cedros-data CRM identify endpoint
 * once per authenticated browser session so CRM can merge the anonymous visitor
 * profile (`cedros_vid` cookie) with the authenticated user. The call is
 * best-effort: failures are logged but never block auth UX.
 *
 * The request only carries an optional `eventId` body. The CRM server derives
 * the user from the bearer access token; do not include user data in the body.
 *
 * Requires a bearer access token to be available in the browser
 * (`session.storage` set to `memory` or `localStorage`). With cookie-only
 * sessions the identify call is skipped.
 */
export interface CrmIdentifyConfig {
  /** Enable the identify-login call. @default false */
  enabled?: boolean;
  /**
   * Endpoint to POST to. Must be same-origin (or proxied) so the `cedros_vid`
   * cookie is sent. @default '/site/crm/identify-login'
   */
  endpoint?: string;
  /** Organization UUID sent as the `x-cedros-org-id` header. Required if enabled. */
  orgId?: string;
  /**
   * Optional override for the `eventId` body field.
   * @default `login:${user.id}:${Date.now()}`
   */
  getEventId?: (user: AuthUser) => string;
}

/**
 * CSS variable theme overrides
 */
export interface ThemeOverrides {
  '--cedros-primary'?: string;
  '--cedros-primary-foreground'?: string;
  '--cedros-card'?: string;
  '--cedros-card-foreground'?: string;
  '--cedros-background'?: string;
  '--cedros-foreground'?: string;
  '--cedros-muted'?: string;
  '--cedros-muted-foreground'?: string;
  '--cedros-accent'?: string;
  '--cedros-accent-foreground'?: string;
  '--cedros-border'?: string;
  '--cedros-input'?: string;
  '--cedros-ring'?: string;
  '--cedros-radius'?: string;
  '--cedros-radius-xs'?: string;
  '--cedros-radius-sm'?: string;
  '--cedros-radius-md'?: string;
  '--cedros-radius-lg'?: string;
  '--cedros-radius-xl'?: string;
  '--cedros-destructive'?: string;
  '--cedros-destructive-foreground'?: string;
  '--cedros-warning'?: string;
  '--cedros-warning-light'?: string;
  '--cedros-success'?: string;
  /**
   * @deprecated Use `--cedros-login-success-soft`. The Cedros theme kernel
   * emits `--cedros-success-light` as a mode-scoped brand color, so this
   * package no longer owns that name. Values passed here are still applied:
   * `useThemeManager` forwards them to `--cedros-login-success-soft`.
   */
  '--cedros-success-light'?: string;
  /** Pale wash behind success copy. */
  '--cedros-login-success-soft'?: string;
  '--cedros-link'?: string;
  '--cedros-ease-out'?: string;
  '--cedros-ease-in-out'?: string;
  '--cedros-ease-spring'?: string;
  '--cedros-duration-fast'?: string;
  '--cedros-duration-normal'?: string;
  '--cedros-duration-slow'?: string;
  [key: string]: string | undefined;
}

/**
 * Forgot password behavior configuration
 */
export interface ForgotPasswordConfig {
  /**
   * Mode for handling "forgot password" clicks.
   * - 'reset': Shows ForgotPasswordForm (traditional reset flow)
   * - 'instantLink': Sends an instant link for passwordless sign-in
   * @default 'reset'
   */
  mode?: 'reset' | 'instantLink';
}

/**
 * Terms of service checkbox configuration
 */
export interface TermsOfServiceConfig {
  /** Whether to show the checkbox. @default false */
  show?: boolean;
  /** Whether agreement is required to register. @default true (when shown) */
  required?: boolean;
  /** Default checked state. @default false */
  defaultChecked?: boolean;
  /** URL to terms of service page */
  url?: string;
  /** Custom label text. @default "I agree to the Terms of Service" */
  label?: string;
}

/**
 * Email marketing opt-in checkbox configuration
 */
export interface EmailOptInConfig {
  /** Whether to show the checkbox. @default false */
  show?: boolean;
  /** Default checked state. @default false */
  defaultChecked?: boolean;
  /** Custom label text. @default "Send me updates and news" */
  label?: string;
}

/**
 * Form behavior configuration
 */
export interface FormConfig {
  /** Forgot password behavior on sign in form */
  forgotPassword?: ForgotPasswordConfig;
  /** Terms of service checkbox on register form */
  termsOfService?: TermsOfServiceConfig;
  /** Email marketing opt-in checkbox on register form */
  emailOptIn?: EmailOptInConfig;
}

/**
 * Embedded wallet configuration
 *
 * Controls whether the embedded wallet is advertised to other modules running
 * in the same application.
 */
export interface WalletConfig {
  /**
   * Expose embedded wallet availability via window global.
   *
   * When enabled, sets `window.__CEDROS_EMBEDDED_WALLET__` with:
   * - `available`: boolean - whether user has enrolled SSS wallet
   * - `publicKey`: string | null - Solana public key if available
   *
   * This allows other modules to detect embedded wallet
   * and offer crypto payment options to users without browser wallet extensions.
   *
   * @security The signing function is NOT exposed on window. Signing must go
   * through React context (useTransactionSigning hook) to prevent unauthorized
   * access by arbitrary scripts.
   *
   * @default false
   */
  exposeAvailability?: boolean;

  /**
   * Whether to include the user's wallet public key in the window global.
   *
   * @security This is a privacy tradeoff: exposing a stable identifier on `window`
   * makes it available to any script on the page.
   *
   * If you only need to know whether an embedded wallet exists, keep this `false`.
   *
   * @default false
   */
  exposePublicKey?: boolean;

  /**
   * Allowed domains for WebAuthn RP ID validation.
   *
   * In production, passkey operations will be rejected if the current hostname
   * is not in this list. This prevents passkey registration on malicious domains
   * that might be serving the app.
   *
   * @security Without this, an attacker could phish users to a lookalike domain
   * and get them to register passkeys that only work on the malicious domain.
   * While this doesn't compromise real credentials, it can be used in social
   * engineering attacks.
   *
   * @example ['myapp.com', 'app.myapp.com']
   * @default [] (localhost/127.0.0.1 always allowed for development)
   */
  allowedRpDomains?: string[];
}

/**
 * Two-factor authentication (TOTP) configuration
 *
 * Admin-level settings for app-based 2FA using authenticator apps.
 */
export interface TotpConfig {
  /**
   * Whether TOTP 2FA is enabled for the application.
   * @default false
   */
  enabled?: boolean;
  /**
   * Whether TOTP 2FA is required for all users.
   * If false, users can optionally enable it for their account.
   * @default false
   */
  required?: boolean;
  /**
   * Issuer name shown in authenticator apps.
   * @default appName or hostname
   */
  issuer?: string;
}

/**
 * Full configuration for the authentication system.
 *
 * **Note:** When passing config to `<CedrosLoginProvider>`, use
 * {@link CedrosLoginProviderConfig} instead — it extends this type
 * with `features: 'auto'` support. This base type is used internally
 * after the provider resolves auto-discovery.
 *
 * ```
 * CedrosLoginProviderConfig   (public prop type — accepts features: 'auto')
 *   └── CedrosLoginConfig     (internal type — features is always FeatureFlags)
 * ```
 */
export interface CedrosLoginConfig {
  // Required
  /** Auth server base URL */
  serverUrl: string;

  // App identity
  /** App name for Solana message: "Login to {appName}". Default: window.location.hostname */
  appName?: string;

  // Internationalization
  /** BCP 47 locale used for Cedros UI text and locale-sensitive formatting. @default 'en' */
  locale?: string;
  /**
   * Partial translation overrides merged with Cedros Login's English fallback catalog.
   * Missing keys fall back to English so callers can localize incrementally.
   */
  translations?: DeepPartial<Translations>;

  // Google OAuth
  /**
   * Google OAuth client ID. Required if Google auth enabled.
   *
   * **CSP requirements** (when using Google One Tap / credential popup):
   * ```
   * script-src https://accounts.google.com;
   * connect-src https://accounts.google.com;
   * frame-src https://accounts.google.com;
   * ```
   */
  googleClientId?: string;

  // Apple Sign In
  /**
   * Apple Sign In client ID (Services ID). Required if Apple auth enabled.
   *
   * **CSP requirements** (when using Apple Sign In popup):
   * ```
   * script-src https://appleid.cdn-apple.com;
   * connect-src https://appleid.apple.com;
   * frame-src https://appleid.apple.com;
   * ```
   */
  appleClientId?: string;

  // Solana
  /** Solana configuration options */
  solana?: SolanaConfig;

  /**
   * Display order for social login buttons.
   *
   * Public extension pages can pass the server-discovered order through the
   * provider when feature flags are pinned from host-rendered props.
   */
  socialButtonOrder?: string[];

  /** Public registration policy discovered from the auth server. */
  signupAccessCodeRequired?: boolean;

  /** Public signup-capacity snapshot when the site owner enables disclosure. */
  signupAvailability?: SignupAvailability;

  // Feature flags
  /**
   * Package feature flag overrides.
   *
   * Resolution precedence is:
   * 1. `config.features`
   * 2. `CEDROS_FEATURE_*` values supplied through `config.featureFlagEnv`
   * 3. Registry defaults in `FEATURE_FLAG_REGISTRY`
   */
  features?: FeatureFlags;
  /**
   * Optional environment source for feature flags.
   *
   * Use this in browser bundlers that expose env through objects like
   * `import.meta.env` instead of `process.env`.
   */
  featureFlagEnv?: FeatureFlagEnv;

  // Form behavior
  /** Form behavior configuration (forgot password, terms, email opt-in) */
  forms?: FormConfig;

  // Two-factor authentication
  /** TOTP/2FA configuration (app-based authenticator) */
  totp?: TotpConfig;

  // Embedded wallet
  /** Embedded wallet configuration */
  wallet?: WalletConfig;

  // Session handling
  /** Session/token configuration */
  session?: SessionConfig;

  // Callbacks
  /** Authentication event callbacks */
  callbacks?: AuthCallbacks;

  // CRM integration
  /** cedros-data CRM identify-login integration */
  crmIdentify?: CrmIdentifyConfig;

  // Theming
  /** Theme mode. Default: 'auto' */
  theme?: ThemeMode;
  /** CSS variable overrides for custom theming */
  themeOverrides?: ThemeOverrides;
  /**
   * Mirror the resolved dark class onto document.documentElement so portals
   * and modals outside the provider wrapper inherit the theme. Default: true.
   * Set false for embedded surfaces (e.g. host runtime blocks) that must not
   * mutate the host page's root element.
   */
  applyThemeToDocument?: boolean;
  /** Disable all default cedros styles. Use for custom design systems. */
  unstyled?: boolean;

  // Advanced
  /** API request timeout in ms. Default: 10000 */
  requestTimeout?: number;
  /** Retry attempts on transient errors. Default: 2 */
  retryAttempts?: number;
}
