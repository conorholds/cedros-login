import { AuthUser, AuthMethod, AuthError } from './auth';
/**
 * Solana network configuration
 */
export type SolanaNetwork = 'mainnet-beta' | 'devnet';
/**
 * Session storage mode
 *
 * **Security considerations:**
 * - `cookie`: **Recommended.** HttpOnly cookies managed by server. Immune to XSS.
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
 * Feature flags to enable/disable auth methods
 */
export interface FeatureFlags {
    /** Enable email/password auth. Default: true */
    email?: boolean;
    /** Enable Google OAuth. Default: true (requires googleClientId) */
    google?: boolean;
    /** Enable Apple Sign In. Default: true (requires appleClientId) */
    apple?: boolean;
    /** Enable Solana wallet sign-in. Default: true */
    solana?: boolean;
    /** Enable WebAuthn passkeys (server-managed). Default: true */
    webauthn?: boolean;
    /** Enable embedded wallet auto-enrollment on registration. Default: true */
    walletEnrollment?: boolean;
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
 * CSS variable theme overrides
 */
export interface ThemeOverrides {
    '--cedros-primary'?: string;
    '--cedros-primary-foreground'?: string;
    '--cedros-background'?: string;
    '--cedros-foreground'?: string;
    '--cedros-muted'?: string;
    '--cedros-muted-foreground'?: string;
    '--cedros-border'?: string;
    '--cedros-input'?: string;
    '--cedros-ring'?: string;
    '--cedros-radius'?: string;
    '--cedros-destructive'?: string;
    '--cedros-destructive-foreground'?: string;
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
 * Controls whether the embedded wallet is advertised to other Cedros modules
 * (like cedros-pay) running in the same application.
 */
export interface WalletConfig {
    /**
     * Expose embedded wallet availability via window global.
     *
     * When enabled, sets `window.__CEDROS_EMBEDDED_WALLET__` with:
     * - `available`: boolean - whether user has enrolled SSS wallet
     * - `publicKey`: string | null - Solana public key if available
     *
     * This allows other modules (e.g., cedros-pay) to detect embedded wallet
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
     * SEC-004: Allowed domains for WebAuthn RP ID validation.
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
 * Full configuration for CedrosLoginProvider
 */
export interface CedrosLoginConfig {
    /** Auth server base URL */
    serverUrl: string;
    /** App name for Solana message: "Login to {appName}". Default: window.location.hostname */
    appName?: string;
    /** Google OAuth client ID. Required if Google auth enabled */
    googleClientId?: string;
    /** Apple Sign In client ID (Services ID). Required if Apple auth enabled */
    appleClientId?: string;
    /** Solana configuration options */
    solana?: SolanaConfig;
    /** Enable/disable auth methods */
    features?: FeatureFlags;
    /** Form behavior configuration (forgot password, terms, email opt-in) */
    forms?: FormConfig;
    /** TOTP/2FA configuration (app-based authenticator) */
    totp?: TotpConfig;
    /** Embedded wallet configuration */
    wallet?: WalletConfig;
    /** Session/token configuration */
    session?: SessionConfig;
    /** Authentication event callbacks */
    callbacks?: AuthCallbacks;
    /** Theme mode. Default: 'auto' */
    theme?: ThemeMode;
    /** CSS variable overrides for custom theming */
    themeOverrides?: ThemeOverrides;
    /** API request timeout in ms. Default: 10000 */
    requestTimeout?: number;
    /** Retry attempts on transient errors. Default: 2 */
    retryAttempts?: number;
}
