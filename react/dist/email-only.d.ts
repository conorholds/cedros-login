import { CSSProperties } from 'react';
import { InputHTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { NamedExoticComponent } from 'react';
import { ReactNode } from 'react';

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
export declare type AuthErrorCode = 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'EMAIL_EXISTS' | 'WALLET_EXISTS' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'INVALID_SIGNATURE' | 'INVALID_PUBLIC_KEY' | 'CHALLENGE_EXPIRED' | 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'NOT_FOUND' | 'FORBIDDEN' | 'UNAUTHORIZED' | 'STEP_UP_REQUIRED' | 'TOTP_REQUIRED' | 'INVALID_TOTP_CODE' | 'SERVICE_UNAVAILABLE' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

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
declare interface AuthStateContextValue {
    config: CedrosLoginConfig;
    user: AuthUser | null;
    authState: AuthState;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    _internal?: CedrosLoginInternalAPI;
}

/**
 * UI state context — changes on modal/error state changes.
 *
 * Subscribing to this context alone avoids re-renders from auth state
 * changes (login, token refresh).
 */
declare interface AuthUIContextValue {
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
    picture?: string;
    walletAddress?: string;
    authMethods: AuthMethod[];
    emailVerified: boolean;
    /** Whether TOTP 2FA is enabled for this user */
    totpEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Full configuration for CedrosLoginProvider
 */
export declare interface CedrosLoginConfig {
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
 * Config accepted by CedrosLoginProvider.
 * Same as CedrosLoginConfig but `features` also accepts `'auto'`
 * to fetch enabled methods from the server at startup.
 */
declare type CedrosLoginProviderConfig = Omit<CedrosLoginConfig, 'features'> & {
    features?: FeatureFlags | 'auto';
};

declare interface CedrosLoginProviderProps {
    config: CedrosLoginProviderConfig;
    children: ReactNode;
}

/**
 * UI-08: Standardized error prop type for display components.
 *
 * Use this type for component props that display errors to users.
 * Components should handle both AuthError objects and plain strings:
 * - AuthError: structured error from API with code and message
 * - string: simple error message for form validation or local errors
 * - null: no error state
 *
 * @example
 * ```tsx
 * interface MyFormProps {
 *   error?: DisplayError;
 * }
 *
 * // In component:
 * const message = typeof error === 'string' ? error : error?.message;
 * ```
 */
declare type DisplayError = AuthError | string | null;

/**
 * Email/password login form
 */
export declare function EmailLoginForm({ onSuccess, onSwitchToRegister, onForgotPassword, className, }: EmailLoginFormProps): JSX.Element;

declare interface EmailLoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    /** Called when user clicks "Forgot password?" (only in 'reset' mode) */
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
export declare function EmailRegisterForm({ onSuccess, onSwitchToLogin, className, }: EmailRegisterFormProps): JSX.Element;

declare interface EmailRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    className?: string;
}

/**
 * Error message display component with accessibility support.
 * Announces errors to screen readers and optionally focuses the message.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export declare const ErrorMessage: NamedExoticComponent<ErrorMessageProps>;

declare interface ErrorMessageProps {
    error: DisplayError;
    className?: string;
    onDismiss?: () => void;
    /** If true, focus the error message when it appears (for accessibility) */
    autoFocus?: boolean;
}

/**
 * Feature flags to enable/disable auth methods
 */
export declare interface FeatureFlags {
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
    /** Enable instant-link passwordless sign-in. Default: false */
    instantLink?: boolean;
    /** Enable embedded wallet auto-enrollment on registration. Default: true */
    walletEnrollment?: boolean;
}

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

/**
 * Accessible loading spinner component.
 * Announces loading state to screen readers when announce prop is true.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export declare const LoadingSpinner: NamedExoticComponent<LoadingSpinnerProps>;

declare interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    style?: CSSProperties;
    /** Custom label for screen readers (default: "Loading") */
    label?: string;
    /** If true, announce the loading state to screen readers */
    announce?: boolean;
}

/** Union type for login result */
declare type LoginResult = MfaRequiredResult | LoginSuccessResult;

/** Result of successful login (no TOTP required or after TOTP verification) */
declare interface LoginSuccessResult {
    mfaRequired: false;
    response: AuthResponse;
}

/** Result when MFA verification is required */
declare interface MfaRequiredResult {
    mfaRequired: true;
    mfaToken: string;
    email: string;
    userId: string;
}

/**
 * Password input with visibility toggle and optional strength meter
 */
export declare function PasswordInput({ label, labelAction, showStrengthMeter, onValidationChange, error, className, onChange, value, ...props }: PasswordInputProps): JSX.Element;

declare interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
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
 * Main authentication hook providing user state and actions.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout, openLoginModal } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={openLoginModal}>Login</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useAuth(): UseAuthReturn;

declare interface UseAuthReturn {
    user: AuthUser | null;
    authState: AuthState;
    error: AuthError | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

/**
 * Hook to access the full Cedros Login context.
 * Must be used within a CedrosLoginProvider.
 *
 * For better performance, prefer `useAuthState()` or `useAuthUI()` when you
 * only need a subset of the context. This hook re-renders on any change.
 */
export declare function useCedrosLogin(): CedrosLoginContextValue;

/**
 * Hook for email/password authentication.
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useEmailAuth();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     try {
 *       await login(email, password);
 *     } catch (err) {
 *       // Handle error
 *     }
 *   };
 * }
 * ```
 */
export declare function useEmailAuth(): UseEmailAuthReturn;

declare interface UseEmailAuthReturn {
    /** Login - may return mfaRequired if 2FA is enabled */
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (email: string, password: string, name?: string) => Promise<AuthResponse>;
    isLoading: boolean;
    error: AuthError | null;
    clearError: () => void;
    /**
     * Number of remaining login attempts before rate limiting.
     *
     * M-10: Snapshot Behavior
     * This value is a point-in-time snapshot computed at render time.
     * It may be briefly stale during rapid requests or concurrent renders.
     * For UI display only - actual rate limiting is enforced inside login/register.
     */
    remainingAttempts: number;
    /**
     * Time in ms until rate limit resets (0 if not rate limited).
     *
     * M-10: Snapshot Behavior
     * This value is a point-in-time snapshot computed at render time.
     * It may be briefly stale - use for UI display, not for logic decisions.
     */
    timeUntilReset: number;
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
