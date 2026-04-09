import { InputHTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * Apple Sign In button
 *
 * Requires `appleClientId` to be configured in CedrosLoginProvider.
 *
 * @example
 * ```tsx
 * <AppleLoginButton
 *   onSuccess={() => console.log('Logged in!')}
 *   onError={(err) => console.error(err)}
 * />
 * ```
 */
export declare function AppleLoginButton({ onSuccess, onError, className, variant, size, disabled, hideOnNonApple, accessCode, }: AppleLoginButtonProps): JSX.Element | null;

export declare interface AppleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /**
     * Hide the button on non-Apple devices (macOS, iOS, iPadOS).
     * When true (default), button only renders on Apple devices.
     * When false, button always renders regardless of device.
     * @default true
     */
    hideOnNonApple?: boolean;
    /** Access code forwarded to the server when this flow creates a new account. */
    accessCode?: string;
}

/**
 * Authentication callbacks
 */
export declare interface AuthCallbacks {
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
 * Authentication error response
 */
export declare interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

/**
 * Standard error codes
 */
export declare type AuthErrorCode = 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'EMAIL_EXISTS' | 'ACCOUNT_LINK_REQUIRED' | 'WALLET_EXISTS' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'INVALID_SIGNATURE' | 'INVALID_PUBLIC_KEY' | 'CHALLENGE_EXPIRED' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'NOT_FOUND' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'STEP_UP_REQUIRED' | 'TOTP_REQUIRED' | 'INVALID_TOTP_CODE' | 'SERVICE_UNAVAILABLE' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

/**
 * Authentication method used for login/registration
 * TYPE-01: Must match backend AuthMethod enum in server/src/models/mod.rs
 */
export declare type AuthMethod = 'email' | 'google' | 'apple' | 'solana' | 'webauthn' | 'sso';

/**
 * Authentication response from server
 */
export declare interface AuthResponse {
    user: AuthUser;
    tokens?: TokenPair;
    isNewUser: boolean;
    callbackData?: Record<string, unknown>;
    /** Post-login action (welcome page, profile completion, or redirect) */
    postLogin?: PostLoginAction;
}

/**
 * Authentication state
 */
export declare type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Auth state context — changes only on login/logout/token refresh.
 *
 * Subscribing to this context alone avoids re-renders from UI state
 * changes (modal open/close, error display).
 */
export declare interface AuthStateContextValue {
    config: CedrosLoginConfig;
    featureFlags: ResolvedFeatureFlags;
    isFeatureEnabled: (name: FeatureFlagName) => boolean;
    user: AuthUser | null;
    authState: AuthState;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    /** Display order for social login buttons (from server auto-discovery). */
    socialButtonOrder?: string[];
    _internal?: CedrosLoginInternalAPI;
}

/**
 * UI state context — changes on modal/error state changes.
 *
 * Subscribing to this context alone avoids re-renders from auth state
 * changes (login, token refresh).
 */
export declare interface AuthUIContextValue {
    error: AuthError | null;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

/**
 * Authenticated user information
 */
export declare interface AuthUser {
    id: string;
    email?: string;
    name?: string;
    username?: string;
    picture?: string;
    walletAddress?: string;
    authMethods: AuthMethod[];
    emailVerified: boolean;
    /** Whether TOTP 2FA is enabled for this user */
    totpEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
    /** When the user completed the one-time welcome flow */
    welcomeCompletedAt?: string;
    /** User's unique referral code */
    referralCode?: string;
    /** Wallet address to receive direct referral payouts */
    payoutWalletAddress?: string;
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
export declare interface CedrosLoginConfig {
    /** Auth server base URL */
    serverUrl: string;
    /** App name for Solana message: "Login to {appName}". Default: window.location.hostname */
    appName?: string;
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
    /** Solana configuration options */
    solana?: SolanaConfig;
    /**
     * Package feature flag overrides.
     *
     * Resolution precedence is:
     * 1. `config.features`
     * 2. `CEDROS_FEATURE_*` environment variables
     * 3. Registry defaults in `FEATURE_FLAG_REGISTRY`
     */
    features?: FeatureFlags;
    /**
     * Optional environment source for feature flags.
     *
     * Use this in browser bundlers that expose env through objects like
     * `import.meta.env` instead of `process.env`.
     */
    featureFlagEnv?: Record<string, unknown>;
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
    /** Disable all default cedros styles. Use for custom design systems. */
    unstyled?: boolean;
    /** API request timeout in ms. Default: 10000 */
    requestTimeout?: number;
    /** Retry attempts on transient errors. Default: 2 */
    retryAttempts?: number;
}

/**
 * Combined context value (backward-compatible with existing consumers)
 */
declare interface CedrosLoginContextValue extends AuthStateContextValue, AuthUIContextValue {
}

/**
 * Internal helpers for auth hooks (not part of public API)
 */
declare interface CedrosLoginInternalAPI {
    handleLoginSuccess: (user: AuthUser, tokens?: TokenPair) => void;
    getAccessToken: () => string | null;
    /** Get the referral code captured from the ?ref= URL parameter (if any) */
    getReferralCode: () => string | null;
}

/**
 * Provider component that wraps your app and provides authentication context.
 *
 * @example
 * ```tsx
 * <CedrosLoginProvider config={{ serverUrl: 'https://api.example.com' }}>
 *   <App />
 * </CedrosLoginProvider>
 * ```
 */
export declare function CedrosLoginProvider({ config, children }: CedrosLoginProviderProps): JSX.Element | null;

/**
 * Config prop type for `<CedrosLoginProvider>`.
 *
 * Extends {@link CedrosLoginConfig} with one additional feature:
 * the `features` field also accepts `'auto'` to fetch enabled
 * auth methods from the server at startup.
 *
 * **`features: 'auto'` discovery contract:**
 * - Calls `GET {serverUrl}/features` (no auth required, credentials omitted).
 * - Response shape: `{ email, google, apple, solana, webauthn, instantLink }` (all booleans).
 * - Timeout: `requestTimeout` or 5 000 ms. 1 retry on failure.
 * - Fallback: all methods enabled (so the login page is never blank).
 * - Children are not rendered until discovery completes.
 * - `walletEnrollment` flag is client-only and is not part of the server response.
 *
 * When `features` is omitted or set to a `FeatureFlags` object, no server
 * call is made and the flags are used as-is.
 *
 * @example
 * ```tsx
 * // Auto-discover enabled methods from the server:
 * <CedrosLoginProvider config={{ serverUrl: '...', features: 'auto' }}>
 *
 * // Or specify explicitly:
 * <CedrosLoginProvider config={{ serverUrl: '...', features: { email: true, google: true } }}>
 * ```
 */
export declare type CedrosLoginProviderConfig = Omit<CedrosLoginConfig, 'features'> & {
    features?: FeatureFlags | 'auto';
};

export declare interface CedrosLoginProviderProps {
    config: CedrosLoginProviderConfig;
    children: ReactNode;
}

/** Request to create the first admin user */
declare interface CreateFirstAdminRequest {
    /** Admin email address */
    email: string;
    /** Admin password */
    password: string;
    /** Optional display name */
    name?: string;
    /** Organization name (defaults to "My Organization" on server) */
    orgName?: string;
}

/** Response after creating first admin */
declare interface CreateFirstAdminResponse {
    /** Whether admin was successfully created */
    success: boolean;
    /** Created user ID */
    userId: string;
    /** Message for the user */
    message: string;
}

/**
 * Create organization request
 */
declare interface CreateOrgRequest {
    name: string;
    slug?: string;
}

/**
 * Email/password login form
 */
export declare function EmailLoginForm({ onSuccess, onSwitchToRegister, onForgotPassword, className, }: EmailLoginFormProps): JSX.Element;

export declare interface EmailLoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    /** Called when user clicks "Forgot password?" — navigates to forgot-password screen */
    onForgotPassword?: () => void;
    className?: string;
}

/**
 * Email marketing opt-in checkbox configuration
 */
declare interface EmailOptInConfig {
    /** Whether to show the checkbox. @default false */
    show?: boolean;
    /** Default checked state. @default false */
    defaultChecked?: boolean;
    /** Custom label text. @default "Send me updates and news" */
    label?: string;
}

/**
 * Email/password registration form
 */
export declare function EmailRegisterForm({ onSuccess, onSwitchToLogin, className, accessCode: accessCodeProp, }: EmailRegisterFormProps): JSX.Element;

export declare interface EmailRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    className?: string;
    /**
     * Access code value controlled by the parent (e.g. LoginForm).
     * When provided, the internal access code input is hidden and this value
     * is used directly. Allows LoginForm to show a single shared field.
     */
    accessCode?: string;
}

export declare const FEATURE_FLAG_ENV_PREFIX = "CEDROS_FEATURE_";

/**
 * Single source of truth for package feature flags.
 *
 * To roll out a feature:
 * 1. Add it here with a positive name.
 * 2. Ship it with `defaultEnabled: false`.
 * 3. Flip only `defaultEnabled` to `true` when ready.
 */
export declare const FEATURE_FLAG_REGISTRY: {
    readonly email: {
        readonly name: "email";
        readonly description: "Enable email/password authentication.";
        readonly defaultEnabled: true;
        readonly status: "stable";
        readonly envVar: "CEDROS_FEATURE_EMAIL";
        readonly autoDiscoverable: true;
    };
    readonly google: {
        readonly name: "google";
        readonly description: "Enable Google OAuth authentication.";
        readonly defaultEnabled: true;
        readonly status: "stable";
        readonly envVar: "CEDROS_FEATURE_GOOGLE";
        readonly autoDiscoverable: true;
    };
    readonly apple: {
        readonly name: "apple";
        readonly description: "Enable Apple Sign In authentication.";
        readonly defaultEnabled: true;
        readonly status: "stable";
        readonly envVar: "CEDROS_FEATURE_APPLE";
        readonly autoDiscoverable: true;
    };
    readonly solana: {
        readonly name: "solana";
        readonly description: "Enable Solana wallet authentication.";
        readonly defaultEnabled: true;
        readonly status: "stable";
        readonly envVar: "CEDROS_FEATURE_SOLANA";
        readonly autoDiscoverable: true;
    };
    readonly webauthn: {
        readonly name: "webauthn";
        readonly description: "Enable passkey authentication.";
        readonly defaultEnabled: true;
        readonly status: "stable";
        readonly envVar: "CEDROS_FEATURE_WEBAUTHN";
        readonly autoDiscoverable: true;
    };
    readonly instantLink: {
        readonly name: "instantLink";
        readonly description: "Enable passwordless instant-link sign-in.";
        readonly defaultEnabled: false;
        readonly status: "experimental";
        readonly envVar: "CEDROS_FEATURE_INSTANT_LINK";
        readonly autoDiscoverable: true;
    };
    readonly walletEnrollment: {
        readonly name: "walletEnrollment";
        readonly description: "Enable embedded wallet auto-enrollment after registration.";
        readonly defaultEnabled: true;
        readonly status: "stable";
        readonly envVar: "CEDROS_FEATURE_WALLET_ENROLLMENT";
        readonly autoDiscoverable: false;
    };
};

export declare interface FeatureFlagDefinition {
    name: string;
    description: string;
    defaultEnabled: boolean;
    status: FeatureFlagStatus;
    envVar: string;
    autoDiscoverable: boolean;
}

export declare type FeatureFlagName = keyof typeof FEATURE_FLAG_REGISTRY;

export declare type FeatureFlags = Partial<Record<FeatureFlagName, boolean>>;

export declare type FeatureFlagStatus = 'stable' | 'experimental';

/**
 * Forgot password behavior configuration
 */
declare interface ForgotPasswordConfig {
    /**
     * Mode for handling "forgot password" clicks.
     * - 'reset': Shows ForgotPasswordForm (traditional reset flow)
     * - 'instantLink': Sends an instant link for passwordless sign-in
     * @default 'reset'
     */
    mode?: 'reset' | 'instantLink';
}

/**
 * Form for requesting a password reset or instant sign-in link.
 *
 * @param mode - `'reset'` sends a password reset email; `'instantLink'` sends a passwordless sign-in link.
 */
export declare function ForgotPasswordForm({ mode, onSuccess, onCancel, className, }: ForgotPasswordFormProps): JSX.Element;

export declare interface ForgotPasswordFormProps {
    /** Which action to perform: password reset email or instant sign-in link */
    mode?: 'reset' | 'instantLink';
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

/**
 * Form behavior configuration
 */
declare interface FormConfig {
    /** Forgot password behavior on sign in form */
    forgotPassword?: ForgotPasswordConfig;
    /** Terms of service checkbox on register form */
    termsOfService?: TermsOfServiceConfig;
    /** Email marketing opt-in checkbox on register form */
    emailOptIn?: EmailOptInConfig;
}

export declare function getAutoDiscoverableFeatureDefaults(): FeatureFlags;

export declare function getAutoDiscoverableFeatureFlagNames(): FeatureFlagName[];

export declare function getDefaultFeatureFlags(): ResolvedFeatureFlags;

export declare function getFeatureFlagDefinition(name: FeatureFlagName): FeatureFlagDefinition;

export declare function getFeatureFlagDefinitions(): FeatureFlagDefinition[];

export declare function getFeatureFlagEnvVar(name: FeatureFlagName): string;

/**
 * Google OAuth login button
 */
export declare function GoogleLoginButton({ onSuccess, onError, className, variant, size, disabled, accessCode, }: GoogleLoginButtonProps): JSX.Element;

export declare interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /** Access code forwarded to the server when this flow creates a new account. */
    accessCode?: string;
}

export declare function isFeatureEnabled(name: FeatureFlagName, options?: ResolveFeatureFlagsOptions & {
    flags?: FeatureFlags | ResolvedFeatureFlags;
}): boolean;

/**
 * Login form variant that omits all Solana wallet detection and bundle edges.
 */
export declare function LoginForm(props: LoginFormProps): JSX.Element;

export declare interface LoginFormProps {
    onSuccess?: () => void;
    className?: string;
    defaultTab?: 'login' | 'register';
}

/**
 * Membership - user's relationship to an organization
 */
declare interface Membership {
    id?: string;
    userId?: string;
    orgId?: string;
    role: OrgRole;
    joinedAt?: string;
}

/**
 * Organization entity
 */
declare interface Organization {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    isPersonal: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Organization role in RBAC hierarchy
 * owner > admin > member
 */
declare type OrgRole = 'owner' | 'admin' | 'member';

/**
 * Organization with membership details for the current user
 */
declare interface OrgWithMembership extends Organization {
    membership: Membership;
}

export declare function parseFeatureFlagBoolean(value: unknown): boolean | undefined;

export declare function PasskeyLoginButton({ onSuccess, onError, className, children, disabled, accessCode, }: PasskeyLoginButtonProps): JSX.Element;

export declare interface PasskeyLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    /** Access code forwarded to the server when this flow creates a new account. */
    accessCode?: string;
}

/**
 * Password input with visibility toggle and optional strength meter
 */
export declare function PasswordInput({ label, labelAction, showStrengthMeter, onValidationChange, error, className, onChange, value, ...props }: PasswordInputProps): JSX.Element;

export declare interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    /** Action element shown on the right side of the label (e.g., "Forgot password?" link) */
    labelAction?: React.ReactNode;
    showStrengthMeter?: boolean;
    onValidationChange?: (validation: PasswordValidation) => void;
    error?: string;
}

/**
 * Password validation result
 */
export declare interface PasswordValidation {
    isValid: boolean;
    errors: {
        length?: string;
        uppercase?: string;
        lowercase?: string;
        number?: string;
        special?: string;
    };
    strength: 'weak' | 'fair' | 'good' | 'strong';
}

/**
 * Permission types for RBAC
 */
declare type Permission = 'org:delete' | 'org:update' | 'org:read' | 'member:invite' | 'member:remove' | 'member:role_change' | 'member:read' | 'invite:create' | 'invite:cancel' | 'invite:read' | 'audit:read';

/**
 * Post-login action returned by the server after authentication
 */
declare interface PostLoginAction {
    /** Action type: "setup_mfa", "enroll_wallet", "acknowledge_recovery", "choose_username", "welcome", "complete_profile", or "redirect" */
    action: 'setup_mfa' | 'enroll_wallet' | 'acknowledge_recovery' | 'choose_username' | 'welcome' | 'complete_profile' | 'redirect';
    /** URL/route for redirect or welcome page */
    redirectUrl?: string;
}

export declare function readFeatureFlagEnv(envSource?: Record<string, unknown> | undefined): FeatureFlags;

/**
 * Form for resetting password using a reset token.
 *
 * @example
 * ```tsx
 * // Get token from URL params
 * const token = new URLSearchParams(location.search).get('token');
 *
 * <ResetPasswordForm
 *   token={token}
 *   onSuccess={() => navigate('/login')}
 *   onLoginClick={() => navigate('/login')}
 * />
 * ```
 */
export declare function ResetPasswordForm({ token, onSuccess, onLoginClick, className, }: ResetPasswordFormProps): JSX.Element;

export declare interface ResetPasswordFormProps {
    token: string;
    onSuccess?: () => void;
    onLoginClick?: () => void;
    className?: string;
}

export declare type ResolvedFeatureFlags = Record<FeatureFlagName, boolean>;

export declare function resolveFeatureFlags(options?: ResolveFeatureFlagsOptions): ResolvedFeatureFlags;

declare interface ResolveFeatureFlagsOptions {
    config?: FeatureFlags;
    env?: Record<string, unknown>;
    /**
     * Lower-precedence flag values from another source, such as server discovery.
     */
    base?: FeatureFlags;
}

/**
 * Session handling configuration
 *
 * @security For best security, use the default `cookie` storage with `autoRefresh: true`.
 * Avoid `localStorage` in production unless absolutely necessary.
 */
export declare interface SessionConfig {
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
 * Session storage mode
 *
 * **Security considerations:**
 * - `cookie`: **Recommended.** HttpOnly cookies managed by server. Immune to XSS.
 * - `memory`: Secure but lost on page refresh. Good for high-security applications.
 * - `localStorage`: **Use with caution.** Tokens are accessible to any JavaScript
 *   on the page, making them vulnerable to XSS attacks. Only use when cookie-based
 *   auth is not possible (e.g., cross-origin scenarios without proper CORS).
 */
export declare type SessionStorage = 'cookie' | 'memory' | 'localStorage' | 'sessionStorage';

/**
 * Setup types for first-run configuration
 */
/** Response from setup status check */
declare interface SetupStatusResponse {
    /** Whether initial setup is needed (no admin exists) */
    needsSetup: boolean;
    /** Whether at least one admin user exists */
    hasAdmin: boolean;
    /** Server version for compatibility checking */
    serverVersion: string;
}

export declare function SetupWizard({ onComplete, className }: SetupWizardProps): JSX.Element;

/**
 * Setup Wizard Component
 *
 * Displayed during first-run when no admin user exists.
 * Allows creating the first admin account.
 *
 * @example
 * ```tsx
 * function AdminApp() {
 *   const { status, isLoading, checkStatus, createAdmin } = useSetup();
 *
 *   useEffect(() => {
 *     checkStatus();
 *   }, [checkStatus]);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (status?.needsSetup) {
 *     return <SetupWizard onComplete={() => window.location.reload()} />;
 *   }
 *   return <AdminRoute />;
 * }
 * ```
 */
export declare interface SetupWizardProps {
    /** Callback when setup is complete */
    onComplete?: () => void;
    /** Additional CSS class */
    className?: string;
}

/**
 * Solana configuration options
 */
declare interface SolanaConfig {
    /** Solana network to connect to. Default: 'mainnet-beta' */
    network?: SolanaNetwork;
    /** Auto-reconnect wallet on page load. Default: false */
    autoConnect?: boolean;
}

/**
 * Solana network configuration
 */
declare type SolanaNetwork = 'mainnet-beta' | 'devnet';

/**
 * Terms of service checkbox configuration
 */
declare interface TermsOfServiceConfig {
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
 * Theme mode
 */
export declare type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * CSS variable theme overrides
 */
export declare interface ThemeOverrides {
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
    '--cedros-destructive'?: string;
    '--cedros-destructive-foreground'?: string;
    '--cedros-warning'?: string;
    '--cedros-warning-light'?: string;
    '--cedros-success'?: string;
    '--cedros-success-light'?: string;
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
 * JWT token pair returned from authentication
 */
export declare interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Two-factor authentication (TOTP) configuration
 *
 * Admin-level settings for app-based 2FA using authenticator apps.
 */
declare interface TotpConfig {
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
 * Update organization request
 */
declare interface UpdateOrgRequest {
    name?: string;
    slug?: string;
    logoUrl?: string;
}

/**
 * Hook to access only auth state (user, authState, config, logout, refreshUser).
 *
 * Does NOT re-render on UI state changes (modal, error). Use this in components
 * that only need to know about authentication status.
 */
export declare function useAuthState(): AuthStateContextValue;

/**
 * Hook to access only UI state (isModalOpen, error, openModal, closeModal).
 *
 * Does NOT re-render on auth state changes (login, token refresh). Use this
 * in components that only control the login modal or display errors.
 */
export declare function useAuthUI(): AuthUIContextValue;

/**
 * Hook to access the full Cedros Login context.
 * Must be used within a CedrosLoginProvider.
 *
 * For better performance, prefer `useAuthState()` or `useAuthUI()` when you
 * only need a subset of the context. This hook re-renders on any change.
 */
export declare function useCedrosLogin(): CedrosLoginContextValue;

/**
 * Hook for managing organizations, memberships, and permissions.
 *
 * @example
 * ```tsx
 * function OrgSelector() {
 *   const { orgs, activeOrg, switchOrg, hasPermission } = useOrgs();
 *
 *   return (
 *     <select
 *       value={activeOrg?.id}
 *       onChange={(e) => switchOrg(e.target.value)}
 *     >
 *       {orgs.map(org => (
 *         <option key={org.id} value={org.id}>{org.name}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export declare function useOrgs(): UseOrgsReturn;

export declare interface UseOrgsReturn {
    /** All organizations the user belongs to */
    orgs: OrgWithMembership[];
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** User's permissions in the active org */
    permissions: Permission[];
    /** User's role in the active org */
    role: OrgRole | null;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: AuthError | null;
    /** Fetch/refresh organizations list */
    fetchOrgs: () => Promise<void>;
    /** Switch to a different organization */
    switchOrg: (orgId: string) => Promise<void>;
    /** Create a new organization */
    createOrg: (data: CreateOrgRequest) => Promise<Organization>;
    /** Update an organization */
    updateOrg: (orgId: string, data: UpdateOrgRequest) => Promise<Organization>;
    /** Delete an organization */
    deleteOrg: (orgId: string) => Promise<void>;
    /** Check if user has a specific permission */
    hasPermission: (permission: Permission) => boolean;
}

/**
 * Hook for first-run setup operations.
 *
 * Checks if setup is needed (no admin exists) and provides
 * ability to create the first admin user.
 *
 * @example
 * ```tsx
 * function SetupCheck() {
 *   const { status, isLoading, checkStatus, createAdmin } = useSetup();
 *
 *   useEffect(() => {
 *     checkStatus();
 *   }, [checkStatus]);
 *
 *   if (isLoading) return <Loading />;
 *   if (status?.needsSetup) {
 *     return <SetupWizard onCreateAdmin={createAdmin} />;
 *   }
 *   return <AdminRoute />;
 * }
 * ```
 */
export declare function useSetup(): UseSetupReturn;

/** Return type for useSetup hook */
export declare interface UseSetupReturn {
    /** Current setup status */
    status: SetupStatusResponse | null;
    /** Whether status is loading */
    isLoading: boolean;
    /** Whether admin creation is in progress */
    isCreating: boolean;
    /** Error if any */
    error: Error | null;
    /** Check setup status */
    checkStatus: () => Promise<void>;
    /** Create first admin */
    createAdmin: (request: CreateFirstAdminRequest) => Promise<CreateFirstAdminResponse>;
}

/**
 * Password validation rules:
 * - Minimum 10 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (@$!%*?&#^())
 *
 * Note: All checks are performed regardless of early failures to prevent
 * timing attacks that could reveal which requirements are met.
 */
export declare function validatePassword(password: string): PasswordValidation;

/**
 * Embedded wallet configuration
 *
 * Controls whether the embedded wallet is advertised to other Cedros modules
 * (like cedros-pay) running in the same application.
 */
declare interface WalletConfig {
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

export { }
