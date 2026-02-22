import { Component } from 'react';
import { ComponentType } from 'react';
import { CSSProperties } from 'react';
import { default as default_2 } from 'react';
import { ErrorInfo } from 'react';
import { InputHTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';
import { NamedExoticComponent } from 'react';
import { ReactNode } from 'react';

/**
 * Request to accept an invite
 */
export declare interface AcceptInviteRequest {
    token: string;
}

/**
 * Response from accepting an invite
 */
export declare interface AcceptInviteResponse {
    orgId: string;
    orgName: string;
    role: OrgRole;
}

/** Request to acknowledge receipt of recovery phrase */
export declare interface AcknowledgeRecoveryRequest {
    /** Confirmation that user has saved the recovery phrase */
    confirmed: boolean;
}

/**
 * Individual chat message from cedros-pay
 */
declare interface AdminChatMessage {
    id: string;
    role: ChatMessageRole;
    content: string;
    createdAt: string;
    /** Optional metadata (e.g., tool calls, function results) */
    metadata?: Record<string, unknown>;
}

/**
 * Chat session/conversation from cedros-pay
 */
declare interface AdminChatSession {
    id: string;
    userId: string;
    /** Session title or first message preview */
    title?: string;
    /** Number of messages in this session */
    messageCount: number;
    /** When the session was created */
    createdAt: string;
    /** When the session was last updated */
    updatedAt: string;
    /** Messages in this session (populated when fetching single session) */
    messages?: AdminChatMessage[];
}

/** Admin credit stats response */
declare interface AdminCreditStatsResponse {
    sol: CurrencyCreditStatsResponse;
    usd: CurrencyCreditStatsResponse;
    totalUsersWithBalance: number;
    totalOutstandingLamports: number;
    totalOutstandingSol: number;
}

/**
 * Credit transaction item for admin user detail
 */
declare interface AdminCreditTransactionItem {
    id: string;
    amountLamports: number;
    currency: string;
    txType: string;
    referenceType?: string;
    createdAt: string;
}

/** Admin deposit item (includes user info) */
export declare interface AdminDepositItem {
    id: string;
    userId: string;
    walletAddress: string;
    status: 'pending' | 'detected' | 'processing' | 'completed' | 'withdrawn' | 'partially_withdrawn' | 'expired' | 'failed';
    amountLamports: number | null;
    txSignature?: string;
    withdrawalTxSignature?: string;
    createdAt: string;
    completedAt?: string;
    withdrawalAvailableAt?: string;
    errorMessage?: string;
}

/**
 * Admin deposit list display
 *
 * Shows paginated list of all deposits with user info.
 */
export declare function AdminDepositList({ statusFilter, pageSize, refreshInterval, className, onLoad, onDepositClick, }: AdminDepositListProps): JSX.Element;

export declare interface AdminDepositListProps {
    /** Filter by status (comma-separated) */
    statusFilter?: string;
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a deposit is clicked */
    onDepositClick?: (deposit: AdminDepositItem) => void;
}

/** Admin deposit list response */
export declare interface AdminDepositListResponse {
    deposits: AdminDepositItem[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Admin deposit statistics display
 *
 * Shows total deposits, withdrawals, and pending amounts.
 */
export declare function AdminDepositStats({ refreshInterval, className, onLoad, }: AdminDepositStatsProps): JSX.Element | null;

export declare interface AdminDepositStatsProps {
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when stats are loaded */
    onLoad?: (stats: AdminDepositStatsResponse) => void;
}

/** Admin deposit stats response */
export declare interface AdminDepositStatsResponse {
    totalDeposits: number;
    totalDepositedLamports: number;
    totalDepositedSol: number;
    pendingWithdrawalCount: number;
    pendingWithdrawalLamports: number;
    pendingWithdrawalSol: number;
    totalWithdrawnCount: number;
    totalWithdrawnLamports: number;
    totalWithdrawnSol: number;
    failedCount: number;
    readyForWithdrawalCount: number;
    readyForWithdrawalLamports: number;
    readyForWithdrawalSol: number;
    inPrivacyPeriodCount: number;
    inPrivacyPeriodLamports: number;
    inPrivacyPeriodSol: number;
    usdcDepositCount: number;
    totalUsdcInput: number;
    totalUsdcDisplay: number;
    usdtDepositCount: number;
    totalUsdtInput: number;
    totalUsdtDisplay: number;
    nativeSolDepositCount: number;
    totalNativeSolInput: number;
    totalNativeSolDisplay: number;
}

/**
 * Group configuration for sidebar organization.
 */
export declare interface AdminGroupConfig {
    /** Group identifier */
    id: string;
    /** Display label */
    label: string;
    /** Sort order (lower = higher in sidebar) */
    order: number;
    /** Icon for the group header */
    icon?: ReactNode;
    /** Whether group starts collapsed */
    defaultCollapsed?: boolean;
}

export declare const AdminIcons: Record<string, ReactNode>;

/**
 * Plugin definition - the main export from each admin module.
 */
export declare interface AdminPlugin {
    /** Unique plugin identifier */
    id: PluginId;
    /** Display name for the plugin */
    name: string;
    /** Plugin version (semver) */
    version: string;
    /** Sections this plugin contributes */
    sections: AdminSectionConfig[];
    /** Sidebar groups with display order */
    groups?: AdminGroupConfig[];
    /** Map of section ID to component */
    components: Record<SectionId, ComponentType<AdminSectionProps>>;
    /**
     * Context bridge - converts host context to plugin-specific context.
     */
    createPluginContext: (hostContext: HostContext) => PluginContext;
    /**
     * Permission resolver - maps plugin permissions to host permission checks.
     */
    checkPermission: (permission: PluginPermission, hostContext: HostContext) => boolean;
    /** CSS class prefix for all plugin styles */
    cssNamespace: string;
    /** Called when plugin is registered */
    onRegister?: (registry: PluginRegistry) => void;
    /** Called when plugin is unregistered */
    onUnregister?: () => void;
}

/**
 * Admin privacy period deposits display
 *
 * Shows deposits that are still in the privacy period (not yet available for withdrawal).
 */
export declare function AdminPrivacyPeriodDeposits({ pageSize, refreshInterval, className, onLoad, onItemClick, }: AdminPrivacyPeriodDepositsProps): JSX.Element;

export declare interface AdminPrivacyPeriodDepositsProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a deposit item is clicked */
    onItemClick?: (item: AdminDepositItem) => void;
}

/**
 * Section configuration for sidebar navigation.
 */
export declare interface AdminSectionConfig {
    /** Section ID unique within the plugin */
    id: SectionId;
    /** Display label for sidebar */
    label: string;
    /** React node for the icon (SVG or component) */
    icon: ReactNode;
    /** Sidebar group name for visual organization */
    group?: string;
    /** Sort order within group (lower = higher) */
    order?: number;
    /** Permission required to see this section */
    requiredPermission?: PluginPermission;
    /** Badge content (e.g., notification count) */
    badge?: ReactNode;
}

/**
 * Props passed to section components by AdminShell.
 */
export declare interface AdminSectionProps {
    /** Plugin context with auth and API access */
    pluginContext: PluginContext;
    /** Page size for lists */
    pageSize: number;
    /** Refresh interval for auto-updating data (0 = disabled) */
    refreshInterval: number;
}

export declare function AdminShell({ title, plugins: initialPlugins, hostContext, defaultSection, pageSize, refreshInterval, onSectionChange, logo, sidebarFooter, onSettingsClick, onLogoutClick, className, }: AdminShellProps): default_2.JSX.Element;

declare interface AdminShellContextValue {
    registry: PluginRegistry;
    hostContext: HostContext;
    activeSection: QualifiedSectionId | null;
    setActiveSection: (section: QualifiedSectionId) => void;
    getPluginContext: (pluginId: string) => PluginContext | null;
}

export declare interface AdminShellProps {
    /** Dashboard title */
    title?: string;
    /** Plugins to load */
    plugins?: AdminPlugin[];
    /** Host context from parent providers */
    hostContext: HostContext;
    /** Default active section (qualified ID) */
    defaultSection?: QualifiedSectionId;
    /** Page size for lists */
    pageSize?: number;
    /** Refresh interval in ms (0 to disable) */
    refreshInterval?: number;
    /** Callback when section changes */
    onSectionChange?: (section: QualifiedSectionId) => void;
    /** Custom logo/header content */
    logo?: ReactNode;
    /** Additional sidebar footer content */
    sidebarFooter?: ReactNode;
    /** Callback when user clicks Settings in profile dropdown */
    onSettingsClick?: () => void;
    /** Callback when user clicks Logout in profile dropdown */
    onLogoutClick?: () => void;
    /** Additional CSS class */
    className?: string;
}

/**
 * Admin view of a user (includes more details than regular user)
 */
export declare interface AdminUser {
    id: string;
    email?: string;
    emailVerified: boolean;
    name?: string;
    picture?: string;
    walletAddress?: string;
    googleId?: string;
    authMethods: AuthMethod[];
    isSystemAdmin: boolean;
    createdAt: string;
    updatedAt: string;
    /** Last login timestamp (ISO 8601) */
    lastLoginAt?: string;
    /** Credit balance in lamports (if credit system is enabled) */
    balanceLamports?: number;
}

/**
 * Response for listing user chat sessions
 */
declare interface AdminUserChatsResponse {
    sessions: AdminChatSession[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Response for user credits (stats + transactions)
 */
declare interface AdminUserCreditsResponse {
    stats: AdminUserCreditStats;
    transactions: AdminCreditTransactionItem[];
    totalTransactions: number;
    limit: number;
    offset: number;
}

/**
 * Credit stats for a specific user
 */
declare interface AdminUserCreditStats {
    currency: string;
    totalDepositedLamports: number;
    totalDepositedSol: number;
    totalSpentLamports: number;
    totalSpentSol: number;
    totalRefundsLamports: number;
    totalRefundsSol: number;
    currentBalanceLamports: number;
    currentBalanceSol: number;
    depositCount: number;
    spendCount: number;
}

/**
 * Admin user list display
 *
 * Shows all registered users.
 */
export declare function AdminUserList({ pageSize, refreshInterval, currentUserId, className, onLoad, onUserClick, }: AdminUserListProps): JSX.Element;

export declare interface AdminUserListProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Current user's ID (to highlight current user) */
    currentUserId?: string;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: ListAdminUsersResponse) => void;
    /** Callback when a user is clicked */
    onUserClick?: (user: AdminUser) => void;
}

/**
 * Admin user statistics by auth method
 */
declare interface AdminUserStatsResponse {
    /** Total number of users */
    total: number;
    /** Count by auth method (e.g., { email: 50, google: 25, solana: 10 }) */
    authMethodCounts: Record<string, number>;
}

/** User withdrawal history response */
declare interface AdminUserWithdrawalHistoryResponse {
    withdrawals: WithdrawalHistoryItem[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Admin withdrawal history display
 *
 * Shows deposits that have been fully withdrawn.
 */
export declare function AdminWithdrawalHistory({ pageSize, refreshInterval, className, onLoad, onItemClick, }: AdminWithdrawalHistoryProps): JSX.Element;

export declare interface AdminWithdrawalHistoryProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a withdrawal item is clicked */
    onItemClick?: (item: AdminDepositItem) => void;
}

/**
 * Admin withdrawal queue display
 *
 * Shows deposits ready for withdrawal processing with action buttons.
 */
export declare function AdminWithdrawalQueue({ pageSize, refreshInterval, className, onLoad, onItemClick, onWithdrawalProcessed, onAllProcessed, }: AdminWithdrawalQueueProps): JSX.Element;

export declare interface AdminWithdrawalQueueProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a withdrawal item is clicked */
    onItemClick?: (item: AdminDepositItem) => void;
    /** Callback when a withdrawal is processed */
    onWithdrawalProcessed?: (response: ProcessWithdrawalResponse) => void;
    /** Callback when all withdrawals are processed */
    onAllProcessed?: (response: ProcessAllWithdrawalsResponse) => void;
}

export declare function AdminWithdrawalStats({ refreshInterval, className, onLoad, }: AdminWithdrawalStatsProps): JSX.Element | null;

export declare interface AdminWithdrawalStatsProps {
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when stats are loaded */
    onLoad?: (stats: AdminDepositStatsResponse) => void;
}

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
export declare function AppleLoginButton({ onSuccess, onError, className, variant, size, disabled, hideOnNonApple, }: AppleLoginButtonProps): JSX.Element | null;

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

export declare function AuthenticationSettings({ className }: AuthenticationSettingsProps): JSX.Element;

export declare interface AuthenticationSettingsProps {
    className?: string;
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

export declare interface AuthorizationCheck {
    allowed: boolean;
    reason?: string;
    isLoading: boolean;
    error: AuthError | null;
}

/**
 * Authorization check request
 */
export declare interface AuthorizeRequest {
    orgId: string;
    action: string;
    resource?: string;
    resourceId?: string;
}

/**
 * Authorization check response
 */
export declare interface AuthorizeResponse {
    allowed: boolean;
    reason?: string;
}

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
export declare interface AuthStateContextValue {
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
    picture?: string;
    walletAddress?: string;
    authMethods: AuthMethod[];
    emailVerified: boolean;
    /** Whether TOTP 2FA is enabled for this user */
    totpEnabled?: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Multiple balances response */
export declare interface BalancesResponse {
    balances: CreditBalanceResponse[];
}

/**
 * Warning display for missing capabilities
 */
export declare function CapabilityWarning({ capabilities, className }: CapabilityWarningProps): JSX.Element | null;

export declare interface CapabilityWarningProps {
    /** Capability check results */
    capabilities: CryptoCapabilities;
    /** Optional class name */
    className?: string;
}

/**
 * Unified Admin Dashboard
 *
 * Provides a complete admin interface with sidebar navigation.
 * Follows shadcn/ui dashboard patterns.
 */
export declare function CedrosAdminDashboard({ title, sections, defaultSection, refreshInterval, pageSize, onSectionChange, onSettingsClick, onLogoutClick, className, }: CedrosAdminDashboardProps): JSX.Element;

export declare interface CedrosAdminDashboardProps {
    /** Dashboard title */
    title?: string;
    /** Sections to display (defaults to all) */
    sections?: DashboardSection[];
    /** Initial active section */
    defaultSection?: DashboardSection;
    /** Auto-refresh interval for stats in ms (0 to disable) */
    refreshInterval?: number;
    /** Items per page for lists */
    pageSize?: number;
    /** Callback when section changes */
    onSectionChange?: (section: DashboardSection) => void;
    /** Callback when user clicks Settings in profile dropdown */
    onSettingsClick?: () => void;
    /** Callback when user clicks Logout in profile dropdown (defaults to context logout) */
    onLogoutClick?: () => void;
    /** Additional CSS class */
    className?: string;
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

declare const cedrosLoginPlugin: AdminPlugin;
export { cedrosLoginPlugin }
export { cedrosLoginPlugin as loginPlugin }

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
export declare function CedrosLoginProvider({ config, children }: CedrosLoginProviderProps): JSX.Element;

export declare interface CedrosLoginProviderProps {
    config: CedrosLoginConfig;
    children: ReactNode;
}

/**
 * Solana challenge response
 */
export declare interface ChallengeResponse {
    nonce: string;
    message: string;
    expiresAt: string;
}

/**
 * Request to change password
 */
export declare interface ChangePasswordRequest {
    /** Current password for verification */
    currentPassword: string;
    /** New password */
    newPassword: string;
}

/**
 * Response from password change
 */
export declare interface ChangePasswordResponse {
    message: string;
}

/**
 * Chat message role
 */
declare type ChatMessageRole = 'user' | 'assistant' | 'system';

/** Request to create the first admin user */
export declare interface CreateFirstAdminRequest {
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
export declare interface CreateFirstAdminResponse {
    /** Whether admin was successfully created */
    success: boolean;
    /** Created user ID */
    userId: string;
    /** Message for the user */
    message: string;
}

/**
 * Request to create a new invite
 */
export declare interface CreateInviteRequest {
    email: string;
    role?: Exclude<OrgRole, 'owner'>;
}

/**
 * Create organization request
 */
export declare interface CreateOrgRequest {
    name: string;
    slug?: string;
}

/**
 * Credit balance display
 *
 * Shows the user's credit balance. Supports auto-refresh.
 */
export declare function CreditBalance({ showAllCurrencies, refreshInterval, compact, className, onLoad, }: CreditBalanceProps): JSX.Element;

export declare interface CreditBalanceProps {
    /** Show only SOL balance (default) or all currencies */
    showAllCurrencies?: boolean;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Compact display mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Callback when balance is loaded */
    onLoad?: (balance: CreditBalanceResponse[]) => void;
}

/** Credit balance */
export declare interface CreditBalanceResponse {
    /** Balance in lamports */
    balanceLamports: number;
    /** Currency (e.g., "SOL") */
    currency: string;
    /** Human-readable display (e.g., "0.5000 SOL") */
    display: string;
}

/** Credit history response with pagination */
export declare interface CreditHistoryResponse {
    transactions: CreditTransactionResponse[];
    total: number;
    limit: number;
    offset: number;
}

declare function CreditSystemSettings({ className }: CreditSystemSettingsProps): JSX.Element;
export { CreditSystemSettings }
export { CreditSystemSettings as PrivacyCashSettings }

declare interface CreditSystemSettingsProps {
    className?: string;
}
export { CreditSystemSettingsProps }
export { CreditSystemSettingsProps as PrivacyCashSettingsProps }

/** Credit transaction */
export declare interface CreditTransactionResponse {
    id: string;
    /** Amount in lamports (positive = credit, negative = debit) */
    amountLamports: number;
    currency: string;
    /** Transaction type: "deposit", "spend", "adjustment" */
    txType: string;
    /** Human-readable description */
    description: string;
    depositSessionId?: string;
    createdAt: string;
}

/** Crypto capability detection results */
export declare interface CryptoCapabilities {
    /** WebCrypto API available */
    webCrypto: boolean;
    /** AES-GCM supported */
    aesGcm: boolean;
    /** HKDF supported */
    hkdf: boolean;
    /** Ed25519 signing supported */
    ed25519: boolean;
    /** WebAuthn available */
    webAuthn: boolean;
    /** WebAuthn PRF extension supported */
    webAuthnPrf: boolean;
    /** Argon2 WASM can be loaded */
    argon2: boolean;
    /** All required capabilities available */
    allSupported: boolean;
}

/** Credit stats for a single currency */
declare interface CurrencyCreditStatsResponse {
    totalCredited: number;
    totalSpent: number;
    totalPositiveAdjustments: number;
    totalNegativeAdjustments: number;
    currentOutstanding: number;
    depositCount: number;
    spendCount: number;
    adjustmentCount: number;
    totalCreditedDisplay: number;
    totalSpentDisplay: number;
    currentOutstandingDisplay: number;
}

/** Currency configuration mode */
export declare type CurrencyMode = 'sol' | 'single-token' | 'multi-token';

/** Custom token definition from admin settings */
declare interface CustomTokenDefinition {
    /** Token symbol (e.g., "MYTOKEN") */
    symbol: string;
    /** Solana mint address */
    mint: string;
    /** Token decimals (e.g., 6 for USDC, 9 for SOL) */
    decimals: number;
    /** Optional logo URL */
    logoUrl?: string;
}

/**
 * Unified Admin Dashboard
 *
 * A complete, ready-to-use admin panel following shadcn/ui dashboard patterns.
 *
 * @example
 * ```tsx
 * // Minimal setup - everything included
 * function AdminPage() {
 *   return <CedrosAdminDashboard />;
 * }
 *
 * // Customized sections
 * function AdminPage() {
 *   return (
 *     <CedrosAdminDashboard
 *       sections={['users', 'team', 'deposits', 'settings-auth']}
 *       title="My App Admin"
 *     />
 *   );
 * }
 * ```
 */
/** Available dashboard sections */
export declare type DashboardSection = 'users' | 'team' | 'deposits' | 'withdrawals' | 'settings-wallet' | 'settings-auth' | 'settings-messaging' | 'settings-credits' | 'settings-server';

declare type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

declare type DeepPartial_2<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial_2<T[P]> : T[P];
};

export declare const defaultTranslations: Translations;

/** Deposit configuration with tiered thresholds */
export declare interface DepositConfigResponse {
    /** Whether deposits are enabled */
    enabled: boolean;
    /** Whether private deposits are available (false if recovery mode is enabled) */
    privateDepositsEnabled: boolean;
    /** Privacy period in seconds (time before withdrawal to company wallet) */
    privacyPeriodSecs: number;
    /** Company wallet address (destination for public/micro deposits) */
    companyWallet: string;
    /** Company's preferred currency (e.g., "USDC") */
    companyCurrency: string;
    /** Current SOL price in USD (cached, ~30s TTL) */
    solPriceUsd: number;
    /** Token prices in USD (symbol -> price), fetched from Jupiter */
    tokenPrices: Record<string, number>;
    /** Minimum SOL for private deposits (default: 0.25 SOL) */
    privateMinSol: number;
    /** USD equivalent of privateMinSol (rounded up to nearest $5) */
    privateMinUsd: number;
    /** Minimum USD for public deposits (Jupiter minimum: $10) */
    publicMinUsd: number;
    /** Maximum USD for SOL micro deposits (same as publicMinUsd: $10) */
    solMicroMaxUsd: number;
    /** Supported currencies for deposits */
    supportedCurrencies: string[];
    /** Token symbols shown as quick actions in the deposit flow */
    quickActionTokens: string[];
    /** Token symbols shown in the custom token list */
    customTokenSymbols: string[];
    /** Treasury wallet address for micro deposits (undefined if no treasury configured) */
    microDepositAddress?: string;
    /** Batch threshold in USD before executing Jupiter swap */
    microBatchThresholdUsd: number;
    /** Fee policy: who pays deposit fees */
    feePolicy: FeePolicy;
    /** Privacy Cash fee percentage (e.g., 0.35 for 0.35%) */
    privacyFeePercent: number;
    /** Privacy Cash fixed fee in lamports */
    privacyFeeFixedLamports: number;
    /** Swap fee percentage (e.g., 0.1 for 0.1%) */
    swapFeePercent: number;
    /** Swap fixed fee in lamports */
    swapFeeFixedLamports: number;
    /** Company processing fee percentage (e.g., 0.05 for 0.05%, default: 0) */
    companyFeePercent: number;
    /** Company processing fixed fee in lamports (default: 0) */
    companyFeeFixedLamports: number;
    /** Custom token definitions from admin settings */
    customTokens?: CustomTokenDefinition[];
    /** Whether to show the explainer step for non-crypto-native users */
    showExplainer: boolean;
}

/**
 * Multi-step deposit flow component
 */
export declare function DepositFlow({ config, currencyMode, depositMethod: depositMethodProp, tokens, defaultToken, minAmount, maxAmount, onSuccess, onError, onCancel, onUnlockRequired, onAuthorize, className, showStepIndicator, pollInterval, demoMode, demoAutoConfirmMs, tokenPriceUsd, showExplainer, siteName, explainerConfig, }: DepositFlowProps): JSX.Element;

export declare interface DepositFlowProps {
    /** Deposit configuration (required) */
    config: DepositConfigResponse;
    /**
     * Currency mode determines what tokens users can deposit:
     * - 'sol': SOL only (no token selection step)
     * - 'single-token': Single admin-configured token (shows token info, no selection)
     * - 'multi-token': User selects from available tokens
     */
    currencyMode: CurrencyMode;
    /**
     * Deposit method determines how the user deposits:
     * - 'sign': User has a connected wallet and signs transactions (default for browser wallets)
     * - 'receive': User sends from external source (exchange) to deposit address (embedded wallet)
     *
     * If not specified, auto-detects based on wallet status:
     * - If user has external wallet connected → 'sign'
     * - If user has embedded wallet only → 'receive'
     */
    depositMethod?: DepositMethod;
    /**
     * Available tokens for single-token or multi-token modes.
     * For single-token mode, only the first token is used.
     * Ignored in 'sol' mode.
     */
    tokens?: Token[];
    /** Pre-selected token (for multi-token mode) */
    defaultToken?: Token;
    /** Minimum deposit amount (overrides server config) */
    minAmount?: number;
    /** Maximum deposit amount */
    maxAmount?: number;
    /** Callback on successful deposit */
    onSuccess?: (result: DepositFlowResult) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Callback when user cancels */
    onCancel?: () => void;
    /** Callback to request wallet unlock */
    onUnlockRequired?: () => void;
    /**
     * Callback to authorize deposit with password/PIN.
     * This sends the password to the server to decrypt Share B for withdrawal signing.
     * Returns the session ID for tracking the deposit.
     *
     * For sign mode: amount is the user-entered deposit amount
     * For receive mode: amount is 0 (auto-detected when deposit arrives)
     */
    onAuthorize?: (password: string, amount: number | null, token: Token) => Promise<{
        sessionId: string;
        depositAddress: string;
    }>;
    /** Additional CSS classes */
    className?: string;
    /** Show step indicator */
    showStepIndicator?: boolean;
    /** Polling interval for checking deposit status in receive mode (ms, default: 5000) */
    pollInterval?: number;
    /** Demo mode - skips wallet checks for Storybook/testing (default: false) */
    demoMode?: boolean;
    /** Demo mode auto-confirm delay in ms (storybook only) */
    demoAutoConfirmMs?: number;
    /** USD price overrides for non-USD tokens (by symbol) */
    tokenPriceUsd?: Record<string, number>;
    /**
     * Show an optional explainer step for non-crypto-native users.
     * This explains Solana and suggests an exchange for purchasing.
     * Admin-controlled setting (default: false)
     */
    showExplainer?: boolean;
    /** Site name to display in explainer (e.g., "Acme Inc") */
    siteName?: string;
    /** Configuration for the explainer step content */
    explainerConfig?: ExplainerConfig;
}

export declare interface DepositFlowResult {
    /** Selected token (null for SOL) */
    token: Token | null;
    /** Amount in token units */
    amount: number;
    /** Amount in lamports (for SOL) or smallest unit */
    amountSmallestUnit: number;
    /** Transaction signature (for sign mode) */
    txSignature: string;
    /** Session ID for tracking */
    sessionId: string;
    /** Deposit response from server */
    response: DepositResponse;
    /** Deposit method used */
    method: DepositMethod;
    /** Deposit address (for receive mode) */
    depositAddress?: string;
}

/** Flow step */
export declare type DepositFlowStep = 'explainer' | 'unlock' | 'confirm' | 'signing' | 'show-address' | 'waiting' | 'success' | 'error';

/** Individual deposit item in list response */
export declare interface DepositItemResponse {
    sessionId: string;
    status: 'pending' | 'detected' | 'processing' | 'completed' | 'withdrawn' | 'partially_withdrawn' | 'expired' | 'failed';
    amountLamports: number | null;
    txSignature?: string;
    withdrawalTxSignature?: string;
    createdAt: string;
    completedAt?: string;
    withdrawalAvailableAt?: string;
}

/** Deposit list response with pagination */
export declare interface DepositListResponse {
    deposits: DepositItemResponse[];
    total: number;
    limit: number;
    offset: number;
}

/** Deposit method - how the user will deposit funds */
export declare type DepositMethod = 'sign' | 'receive';

/** Swap quote response from GET /deposit/quote */
export declare interface DepositQuoteResponse {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    inUsdValue?: number;
    outUsdValue?: number;
    slippageBps?: number;
    /** Base64-encoded unsigned transaction to sign */
    transaction: string;
    /** Pass this back to POST /deposit/public */
    requestId: string;
}

/**
 * Types for Privacy Cash deposits and credits
 */
/** Request to execute a privacy deposit */
export declare interface DepositRequest {
    /** Amount to deposit in lamports */
    amountLamports: number;
}

/** Response from executing a privacy deposit */
export declare interface DepositResponse {
    /** Session ID for tracking */
    sessionId: string;
    /** Transaction signature on Solana */
    txSignature: string;
    /** Amount deposited in lamports */
    amountLamports: number;
    /** Human-readable message */
    message: string;
    /** When withdrawal becomes available */
    withdrawalAvailableAt: string;
}

/** Deposit session status */
export declare interface DepositStatusResponse {
    sessionId: string;
    status: 'pending' | 'detected' | 'processing' | 'completed' | 'withdrawn' | 'partially_withdrawn' | 'expired' | 'failed' | 'pending_batch' | 'batched';
    walletAddress: string;
    amountLamports: number | null;
    txSignature?: string;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
    withdrawalAvailableAt?: string;
}

/** Deposit tier type for tiered deposits */
export declare type DepositTier = 'private' | 'public' | 'sol_micro';

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

export declare interface EmailLoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    /** Called when user clicks "Forgot password?" (only in 'reset' mode) */
    onForgotPassword?: () => void;
    className?: string;
}

/**
 * Email marketing opt-in checkbox configuration
 */
export declare interface EmailOptInConfig {
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

export declare interface EmailRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    className?: string;
}

export declare function EmailSettings({ className }: EmailSettingsProps): JSX.Element;

export declare interface EmailSettingsProps {
    className?: string;
}

/**
 * Embedded wallet info exposed via window global
 */
export declare interface EmbeddedWalletInfo {
    /** Whether user has enrolled SSS embedded wallet */
    available: boolean;
    /** Solana public key (base58) if available */
    publicKey: string | null;
}

export declare function EmbeddedWalletSettings({ className }: EmbeddedWalletSettingsProps): JSX.Element;

export declare interface EmbeddedWalletSettingsProps {
    className?: string;
}

/** Enrollment flow state machine */
export declare interface EnrollmentState {
    step: EnrollmentStep;
    error?: string;
    /** BIP-39 mnemonic words (only during showing_recovery step) */
    recoveryPhrase?: string[];
    /** Solana public key (after complete) */
    solanaPubkey?: string;
}

/** Enrollment flow state */
declare type EnrollmentStep = 'idle' | 'generating_seed' | 'splitting_shares' | 'encrypting_shares' | 'registering_passkey' | 'uploading' | 'showing_recovery' | 'complete' | 'error';

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Prevents the entire app from crashing and shows a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<div>Something went wrong</div>}
 *   onError={(error) => logError(error)}
 * >
 *   <LoginForm />
 * </ErrorBoundary>
 * ```
 */
export declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleRetry: () => void;
    render(): ReactNode;
}

export declare interface ErrorBoundaryProps {
    /** Child components to render */
    children: ReactNode;
    /** Custom fallback UI to show when an error occurs */
    fallback?: ReactNode;
    /** Callback when an error is caught */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Whether to show error details (useful for development) */
    showDetails?: boolean;
}

declare interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error message display component with accessibility support.
 * Announces errors to screen readers and optionally focuses the message.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export declare const ErrorMessage: NamedExoticComponent<ErrorMessageProps>;

export declare interface ErrorMessageProps {
    error: DisplayError;
    className?: string;
    onDismiss?: () => void;
    /** If true, focus the error message when it appears (for accessibility) */
    autoFocus?: boolean;
}

/** Configuration for the optional explainer step */
export declare interface ExplainerConfig {
    /** Custom title (default: "How Deposits Work") */
    title?: string;
    /** Custom body text (default explains Solana and suggests exchange) */
    body?: string;
    /** Exchange URL (default: "https://www.coinbase.com") */
    exchangeUrl?: string;
    /** Exchange name (default: "Coinbase") */
    exchangeName?: string;
    /** Whether to show the exchange suggestion (default: true) */
    showExchangeSuggestion?: boolean;
}

/** Options for external wallet signing */
export declare interface ExternalSignOptions {
    /**
     * Callback to sign transaction with external wallet adapter.
     * Only called when user has external Solana wallet.
     *
     * @param transaction - Transaction bytes to sign
     * @returns Signature bytes (64 bytes Ed25519)
     */
    onExternalSign?: (transaction: Uint8Array) => Promise<Uint8Array>;
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
    /** Enable embedded wallet auto-enrollment on registration. Default: true */
    walletEnrollment?: boolean;
}

/** Fee policy options - who pays the deposit fees */
declare type FeePolicy = 'company_pays_all' | 'user_pays_swap' | 'user_pays_privacy' | 'user_pays_all';

/**
 * Forgot password behavior configuration
 */
export declare interface ForgotPasswordConfig {
    /**
     * Mode for handling "forgot password" clicks.
     * - 'reset': Shows ForgotPasswordForm (traditional reset flow)
     * - 'instantLink': Sends an instant link for passwordless sign-in
     * @default 'reset'
     */
    mode?: 'reset' | 'instantLink';
}

/**
 * Form for requesting a password reset email.
 *
 * @example
 * ```tsx
 * <ForgotPasswordForm
 *   onSuccess={() => console.log('Email sent!')}
 *   onCancel={() => setShowForgotPassword(false)}
 * />
 * ```
 */
export declare function ForgotPasswordForm({ onSuccess, onCancel, className, }: ForgotPasswordFormProps): JSX.Element;

export declare interface ForgotPasswordFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

/**
 * Form behavior configuration
 */
export declare interface FormConfig {
    /** Forgot password behavior on sign in form */
    forgotPassword?: ForgotPasswordConfig;
    /** Terms of service checkbox on register form */
    termsOfService?: TermsOfServiceConfig;
    /** Email marketing opt-in checkbox on register form */
    emailOptIn?: EmailOptInConfig;
}

/**
 * Full page login layout with centered card on gradient background.
 * Follows shadcn/ui login block pattern.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FullPageLayout onSuccess={() => navigate('/dashboard')} />
 *
 * // With branding and terms
 * <FullPageLayout
 *   brandLogo={<img src="/logo.svg" alt="" />}
 *   brandName="Acme Inc."
 *   termsText={<>By clicking continue, you agree to our <a href="/terms">Terms</a>.</>}
 *   onSuccess={handleSuccess}
 * />
 * ```
 */
export declare function FullPageLayout({ brandLogo, brandName, title, subtitle, termsText, onSuccess, defaultTab, children, className, }: FullPageLayoutProps): JSX.Element;

export declare interface FullPageLayoutProps {
    /** Brand logo element (e.g., an img or svg) */
    brandLogo?: ReactNode;
    /** Brand name displayed next to the logo */
    brandName?: string;
    /** Title displayed above the form. @default "Welcome back" */
    title?: string;
    /** Subtitle displayed below the title. @default "Login with your Apple or Google account" */
    subtitle?: string;
    /** Terms/legal text displayed below the card */
    termsText?: ReactNode;
    /** Called when login/register succeeds */
    onSuccess?: () => void;
    /** Default tab for the form. @default "login" */
    defaultTab?: 'login' | 'register';
    /** Custom content to render instead of LoginForm */
    children?: ReactNode;
    /** Additional CSS class for the outer container */
    className?: string;
}

/**
 * Get embedded wallet info
 *
 * Returns the full wallet info object if available.
 *
 * @returns Wallet info or null if not exposed
 */
export declare function getEmbeddedWalletInfo(): EmbeddedWalletInfo | null;

/**
 * Determine which tier an amount falls into
 *
 * When private deposits are disabled (recovery mode enabled), the 'private'
 * tier is not available and amounts that would qualify for it fall back to 'public'.
 */
export declare function getTierForAmount(usd: number, config: DepositConfigResponse): DepositTier;

/**
 * Google OAuth login button
 */
export declare function GoogleLoginButton({ onSuccess, onError, className, variant, size, disabled, }: GoogleLoginButtonProps): JSX.Element;

export declare interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

/**
 * History component with tabs
 */
declare function History_2({ defaultTab, pageSize, refreshInterval, className, onLoad, onTransactionClick, }: HistoryProps): JSX.Element;
export { History_2 as History }

/** History tab category for filtering */
export declare type HistoryCategory = 'all' | 'deposits' | 'usage' | 'adjustments';

export declare interface HistoryProps {
    /** Initially selected tab (default: 'all') */
    defaultTab?: HistoryCategory;
    /** Number of items per page (default: 10) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when history is loaded */
    onLoad?: (history: CreditHistoryResponse) => void;
    /** Callback when a transaction is clicked */
    onTransactionClick?: (transaction: CreditTransactionResponse) => void;
}

/**
 * Host context provided by AdminShell to plugins.
 * Aggregates auth/context from all available sources.
 */
export declare interface HostContext {
    /** cedros-login context */
    cedrosLogin?: {
        user: {
            id: string;
            email?: string;
            name?: string;
            picture?: string;
        } | null;
        getAccessToken: () => string | null;
        serverUrl: string;
    };
    /** cedros-pay context */
    cedrosPay?: {
        walletAddress?: string;
        jwtToken?: string;
        serverUrl: string;
    };
    /** Organization context */
    org?: {
        orgId: string;
        role: string;
        permissions: string[];
    };
    /**
     * Dashboard section permissions (configured by org owner).
     * Provides role-based access control for individual dashboard sections.
     */
    dashboardPermissions?: {
        /** Check if current user can access a section by ID */
        canAccess: (sectionId: string) => boolean;
    };
    /** Generic extension point */
    custom?: Record<string, unknown>;
}

/**
 * Provider for internationalization support.
 * Allows overriding default English translations with custom strings.
 */
export declare function I18nProvider({ children, locale, translations: customTranslations, }: I18nProviderProps): JSX.Element;

export declare interface I18nProviderProps {
    children: ReactNode;
    locale?: string;
    translations?: DeepPartial<Translations>;
}

/**
 * Pending invite to an organization
 *
 * TYPE-05: invitedByName removed - backend doesn't populate it.
 * To show inviter name, would need to join users table in backend.
 */
export declare interface Invite {
    id: string;
    orgId: string;
    email: string;
    role: Exclude<OrgRole, 'owner'>;
    invitedBy: string;
    createdAt: string;
    expiresAt: string;
}

/**
 * Form for inviting new members to an organization.
 *
 * @example
 * ```tsx
 * function InviteManager() {
 *   const { activeOrg } = useOrgs();
 *   const { createInvite, isLoading, error } = useInvites(activeOrg?.id);
 *
 *   return (
 *     <InviteForm
 *       onSubmit={createInvite}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       defaultRole="member"
 *     />
 *   );
 * }
 * ```
 */
export declare function InviteForm({ onSubmit, isLoading, error, availableRoles, defaultRole, className, }: InviteFormProps): JSX.Element;

export declare interface InviteFormProps {
    /** Callback when invite is submitted */
    onSubmit: (email: string, role: InviteRole) => Promise<void>;
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Available roles for invite (default: admin, member) */
    availableRoles?: InviteRole[];
    /** Default role for new invites */
    defaultRole?: InviteRole;
    /** Additional CSS class */
    className?: string;
}

/**
 * Display and manage pending organization invites.
 *
 * @example
 * ```tsx
 * function PendingInvites() {
 *   const { activeOrg, hasPermission } = useOrgs();
 *   const { invites, isLoading, error, cancelInvite, resendInvite } = useInvites(activeOrg?.id);
 *
 *   return (
 *     <InviteList
 *       invites={invites}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       canManage={hasPermission('invite:cancel')}
 *       onCancel={cancelInvite}
 *       onResend={resendInvite}
 *     />
 *   );
 * }
 * ```
 */
export declare function InviteList({ invites, isLoading, error, canManage, onCancel, onResend, className, }: InviteListProps): JSX.Element;

export declare interface InviteListProps {
    /** List of pending invites */
    invites: Invite[];
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Whether the current user can manage invites */
    canManage?: boolean;
    /** Callback when invite is cancelled */
    onCancel?: (inviteId: string) => Promise<void>;
    /** Callback when invite is resent */
    onResend?: (inviteId: string) => Promise<void>;
    /** Additional CSS class */
    className?: string;
}

declare type InviteRole = Exclude<OrgRole, 'owner'>;

/**
 * Check if embedded wallet is available
 *
 * Use this in other Cedros modules (like cedros-pay) to detect
 * if an embedded wallet is available for signing.
 *
 * @example
 * ```tsx
 * import { isEmbeddedWalletAvailable, getEmbeddedWalletInfo } from '@cedros/login-react';
 *
 * // Simple check
 * if (isEmbeddedWalletAvailable()) {
 *   // Show "Pay with Crypto" button
 * }
 *
 * // Get full info
 * const walletInfo = getEmbeddedWalletInfo();
 * if (walletInfo?.available && walletInfo.publicKey) {
 *   console.log('User wallet:', walletInfo.publicKey);
 * }
 * ```
 *
 * @returns true if embedded wallet is enrolled and available
 */
export declare function isEmbeddedWalletAvailable(): boolean;

/** Argon2id KDF parameters (OWASP recommended) */
export declare interface KdfParams {
    /** Memory cost in KiB (default: 19456 = 19 MiB) */
    mCost: number;
    /** Time cost / iterations (default: 2) */
    tCost: number;
    /** Parallelism (default: 1) */
    pCost: number;
}

/**
 * Response for listing users (admin)
 */
export declare interface ListAdminUsersResponse {
    users: AdminUser[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Response from listing sessions
 */
export declare interface ListSessionsResponse {
    sessions: Session[];
    total: number;
    limit: number;
    offset: number;
}

/** Response from GET /admin/settings */
export declare interface ListSystemSettingsResponse {
    /** Settings grouped by category (privacy, withdrawal, rate_limit) */
    settings: Record<string, SystemSetting[]>;
}

/**
 * Query params for listing users
 */
export declare interface ListUsersParams {
    limit?: number;
    offset?: number;
}

/**
 * Accessible loading spinner component.
 * Announces loading state to screen readers when announce prop is true.
 * Wrapped with React.memo to prevent unnecessary re-renders.
 */
export declare const LoadingSpinner: NamedExoticComponent<LoadingSpinnerProps>;

export declare interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    style?: CSSProperties;
    /** Custom label for screen readers (default: "Loading") */
    label?: string;
    /** If true, announce the loading state to screen readers */
    announce?: boolean;
}

/**
 * Login button that opens the login modal when clicked.
 * Shows user info when authenticated.
 */
export declare function LoginButton({ className, variant, size, children, menuItems, hideSignOut, }: LoginButtonProps): JSX.Element;

export declare interface LoginButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
    /** Custom menu items to show above "Sign out" */
    menuItems?: MenuItemConfig[];
    /** Hide the default "Sign out" item (default: false) */
    hideSignOut?: boolean;
}

/**
 * Combined login form with all enabled auth methods
 */
export declare function LoginForm({ onSuccess, className, defaultTab }: LoginFormProps): JSX.Element;

export declare interface LoginFormProps {
    onSuccess?: () => void;
    className?: string;
    defaultTab?: 'login' | 'register';
}

/**
 * Modal containing the login form.
 * Controlled by the CedrosLoginProvider context.
 */
export declare function LoginModal({ className, title }: LoginModalProps): JSX.Element | null;

export declare interface LoginModalProps {
    className?: string;
    title?: string;
}

/** Union type for login result */
declare type LoginResult = MfaRequiredResult | LoginSuccessResult;

/** Result of successful login (no TOTP required or after TOTP verification) */
declare interface LoginSuccessResult {
    mfaRequired: false;
    response: AuthResponse;
}

/**
 * Member of an organization
 */
export declare interface Member {
    id: string;
    userId: string;
    orgId: string;
    role: OrgRole;
    joinedAt: string;
    user: MemberUser;
}

/**
 * Display and manage organization members.
 *
 * @example
 * ```tsx
 * function TeamMembers() {
 *   const { activeOrg, hasPermission } = useOrgs();
 *   const { members, isLoading, error, updateMemberRole, removeMember } = useMembers(activeOrg?.id);
 *   const { user } = useAuth();
 *
 *   return (
 *     <MemberList
 *       members={members}
 *       currentUserId={user?.id}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       canManage={hasPermission('member:remove')}
 *       canChangeRoles={hasPermission('member:role_change')}
 *       onUpdateRole={updateMemberRole}
 *       onRemove={removeMember}
 *     />
 *   );
 * }
 * ```
 */
export declare function MemberList({ members, currentUserId, isLoading, error, canManage, canChangeRoles, onUpdateRole, onRemove, className, }: MemberListProps): JSX.Element;

export declare interface MemberListProps {
    /** List of members to display */
    members: Member[];
    /** Current user's ID (to prevent self-actions) */
    currentUserId?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Whether the current user can manage members */
    canManage?: boolean;
    /** Whether the current user can change roles */
    canChangeRoles?: boolean;
    /** Callback when role is updated */
    onUpdateRole?: (userId: string, role: OrgRole) => Promise<void>;
    /** Callback when member is removed */
    onRemove?: (userId: string) => Promise<void>;
    /** Additional CSS class */
    className?: string;
}

/**
 * Membership - user's relationship to an organization
 */
export declare interface Membership {
    id?: string;
    userId?: string;
    orgId?: string;
    role: OrgRole;
    joinedAt?: string;
}

/**
 * User info within a membership context
 */
export declare interface MemberUser {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
}

export declare interface MenuItemConfig {
    /** Label to display */
    label: string;
    /** Click handler */
    onClick: () => void;
    /** Optional icon element */
    icon?: React.ReactNode;
}

/**
 * Deep merge translations, allowing partial overrides
 */
export declare function mergeTranslations(base: Translations, overrides: DeepPartial_2<Translations>): Translations;

/**
 * TYPE-03: Response when MFA is required to complete login
 *
 * When a user with MFA enabled logs in with valid credentials,
 * the server returns this response instead of full tokens.
 * The client must then call /auth/login/mfa with the mfaToken and TOTP code.
 */
declare interface MfaRequiredResponse {
    /** Indicates MFA verification is required (always true) */
    mfaRequired: true;
    /** Temporary token to use for MFA verification (short-lived, ~5 min) */
    mfaToken: string;
    /** User ID (for client reference, e.g., showing "Hi, <user>") */
    userId: string;
}

/** Result when MFA verification is required */
declare interface MfaRequiredResult {
    mfaRequired: true;
    mfaToken: string;
    email: string;
    userId: string;
}

/** Request for POST /deposit/micro */
export declare interface MicroDepositRequest {
    txSignature: string;
    amountLamports: number;
    walletAddress: string;
}

/**
 * Organization entity
 */
export declare interface Organization {
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
export declare type OrgRole = 'owner' | 'admin' | 'member';

/**
 * Dropdown selector for switching between organizations.
 *
 * ## A11Y-02: Keyboard Navigation Limitation
 *
 * Currently supports:
 * - Tab/Shift+Tab: Move focus between trigger and items
 * - Escape: Close dropdown
 * - Enter/Space: Select focused item
 *
 * FUTURE: Consider implementing arrow key navigation for enhanced accessibility:
 * - ArrowUp/ArrowDown: Navigate between items in the list
 * - Home/End: Jump to first/last item
 * - Type-ahead: Focus item starting with typed character
 *
 * See WAI-ARIA Listbox Pattern for reference implementation.
 * Currently the component meets basic accessibility requirements.
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { orgs, activeOrg, switchOrg } = useOrgs();
 *
 *   return (
 *     <OrgSelector
 *       orgs={orgs}
 *       activeOrg={activeOrg}
 *       onSelect={switchOrg}
 *       onCreateClick={() => setShowCreateModal(true)}
 *     />
 *   );
 * }
 * ```
 */
export declare function OrgSelector({ orgs, activeOrg, isLoading, onSelect, onCreateClick, className, placeholder, }: OrgSelectorProps): JSX.Element;

export declare interface OrgSelectorProps {
    /** List of organizations to display */
    orgs: OrgWithMembership[];
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** Loading state */
    isLoading?: boolean;
    /** Callback when organization is selected */
    onSelect: (orgId: string) => void;
    /** Callback when "Create organization" is clicked */
    onCreateClick?: () => void;
    /** Additional CSS class */
    className?: string;
    /** Placeholder when no orgs */
    placeholder?: string;
}

/**
 * Organization state for context
 */
export declare interface OrgState {
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** All organizations the user belongs to */
    orgs: OrgWithMembership[];
    /** User's permissions in the active org */
    permissions: Permission[];
    /** User's role in the active org */
    role: OrgRole | null;
    /** Loading state for org operations */
    isLoading: boolean;
}

/**
 * Modal for switching organizations and creating new ones.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const { orgs, activeOrg, switchOrg, createOrg } = useOrgs();
 *
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Switch org</button>
 *       <OrgSwitcher
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         orgs={orgs}
 *         activeOrg={activeOrg}
 *         onSelect={switchOrg}
 *         onCreate={createOrg}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export declare function OrgSwitcher({ isOpen, onClose, orgs, activeOrg, isLoading, error, onSelect, onCreate, className, }: OrgSwitcherProps): JSX.Element | null;

export declare interface OrgSwitcherProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** List of organizations */
    orgs: OrgWithMembership[];
    /** Currently active organization */
    activeOrg: OrgWithMembership | null;
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Callback when organization is selected */
    onSelect: (orgId: string) => void;
    /** Callback when new organization is created */
    onCreate?: (data: CreateOrgRequest) => Promise<void>;
    /** Additional CSS class */
    className?: string;
}

/**
 * Organization with membership details for the current user
 */
export declare interface OrgWithMembership extends Organization {
    membership: Membership;
}

/**
 * OTP input with separate boxes for each digit (shadcn pattern)
 *
 * Features:
 * - Auto-advances to next input on digit entry
 * - Backspace moves to previous input
 * - Supports paste of full code
 * - Numeric keyboard on mobile
 */
export declare function OtpInput({ value, onChange, onComplete, disabled, error, autoFocus, className, }: OtpInputProps): JSX.Element;

/**
 * OTP Input component (shadcn-style)
 *
 * A 6-digit input with separate boxes for each digit,
 * designed for TOTP verification codes.
 */
export declare interface OtpInputProps {
    /** Current value (up to 6 digits) */
    value?: string;
    /** Called when the value changes */
    onChange?: (value: string) => void;
    /** Called when all 6 digits are entered */
    onComplete?: (value: string) => void;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Error message to display */
    error?: string;
    /** Auto-focus the first input on mount */
    autoFocus?: boolean;
    /** Additional CSS class */
    className?: string;
}

export declare function PasskeyLoginButton({ onSuccess, className, children, disabled, }: PasskeyLoginButtonProps): JSX.Element;

export declare interface PasskeyLoginButtonProps {
    onSuccess?: () => void;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
}

/**
 * WebAuthn passkey interaction prompt
 *
 * Displays appropriate UI and messaging for passkey operations.
 */
export declare function PasskeyPrompt({ mode, isLoading, error, onPrompt, onRetry, onCancel, title, description, className, }: PasskeyPromptProps): JSX.Element;

/**
 * Passkey prompt component for WebAuthn interactions
 *
 * Provides visual feedback during WebAuthn ceremonies:
 * - Registration of new passkeys
 * - Authentication with existing passkeys
 * - PRF extension operations
 */
export declare interface PasskeyPromptProps {
    /** Type of WebAuthn operation */
    mode: 'register' | 'authenticate';
    /** Whether the operation is in progress */
    isLoading?: boolean;
    /** Error message if operation failed */
    error?: string;
    /** Callback to trigger the operation */
    onPrompt?: () => void;
    /** Callback to retry after error */
    onRetry?: () => void;
    /** Callback to cancel the operation */
    onCancel?: () => void;
    /** Optional custom title */
    title?: string;
    /** Optional custom description */
    description?: string;
    /** Additional CSS classes */
    className?: string;
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

/** Response from pending wallet recovery check */
export declare interface PendingWalletRecoveryResponse {
    /** Whether there is pending recovery data to acknowledge */
    hasPendingRecovery: boolean;
    /** Type of recovery data: "share_c" or "full_seed" */
    recoveryType?: string;
    /** Recovery phrase (BIP-39 mnemonic or base64 seed) */
    recoveryPhrase?: string;
    /** When the recovery data expires */
    expiresAt?: string;
}

/**
 * Permission types for RBAC
 */
export declare type Permission = 'org:delete' | 'org:update' | 'org:read' | 'member:invite' | 'member:remove' | 'member:role_change' | 'member:read' | 'invite:create' | 'invite:cancel' | 'invite:read' | 'audit:read';

/**
 * Context provided to each plugin's section components.
 */
export declare interface PluginContext {
    /** Server URL for API calls */
    serverUrl: string;
    /** Current authenticated user ID (if any) */
    userId?: string;
    /** Function to get current access token */
    getAccessToken: () => string | null;
    /** Permission check function */
    hasPermission: (permission: PluginPermission) => boolean;
    /** Current organization ID (if applicable) */
    orgId?: string;
    /** Plugin-specific context data */
    pluginData?: Record<string, unknown>;
}

/** Unique identifier for a plugin */
export declare type PluginId = string;

/** Permission identifier for capability checking */
export declare type PluginPermission = string;

/**
 * Plugin registry for runtime management.
 */
export declare interface PluginRegistry {
    /** Register a plugin */
    register(plugin: AdminPlugin): void;
    /** Unregister a plugin by ID */
    unregister(pluginId: PluginId): void;
    /** Get registered plugin by ID */
    get(pluginId: PluginId): AdminPlugin | undefined;
    /** Get all registered plugins */
    getAll(): AdminPlugin[];
    /** Listen for registration changes */
    subscribe(listener: (plugins: AdminPlugin[]) => void): () => void;
}

/** Privacy Cash system status response */
declare interface PrivacyStatusResponse {
    enabled: boolean;
    companyWallet: string | null;
    companyCurrency: string;
    privacyPeriodSecs: number;
    privacyPeriodDisplay: string;
    minDepositLamports: number;
    minDepositSol: number;
    withdrawalPollIntervalSecs: number;
    withdrawalBatchSize: number;
    /** Percentage of ready funds to withdraw per cycle (1-100) */
    withdrawalPercentage: number;
    /** Minimum amount (lamports) to withdraw - smaller amounts are skipped */
    withdrawalMinLamports: number;
    /** Minimum amount (SOL) to withdraw */
    withdrawalMinSol: number;
    /** Maximum partial withdrawals per batch (0 = disabled) */
    partialWithdrawalCount: number;
    /** Minimum amount (lamports) for partial withdrawals */
    partialWithdrawalMinLamports: number;
    /** Minimum amount (SOL) for partial withdrawals */
    partialWithdrawalMinSol: number;
    sidecarStatus: string;
    sidecarUrl: string;
    webhookConfigured: boolean;
}

/** Response from processing all withdrawals */
declare interface ProcessAllWithdrawalsResponse {
    totalProcessed: number;
    totalSucceeded: number;
    totalFailed: number;
    results: ProcessWithdrawalResponse[];
}

/** Request to process a single withdrawal */
declare interface ProcessWithdrawalRequest {
    /** Force early withdrawal (before privacy period ends) */
    force?: boolean;
}

/** Response from processing a single withdrawal */
declare interface ProcessWithdrawalResponse {
    success: boolean;
    sessionId: string;
    txSignature?: string;
    error?: string;
    /** True if this was an early withdrawal (before privacy period) */
    earlyWithdrawal: boolean;
}

/**
 * Profile dropdown button with settings and logout options.
 *
 * @example
 * ```tsx
 * <ProfileDropdown
 *   name={user.name}
 *   email={user.email}
 *   picture={user.picture}
 *   onSettings={() => navigate('/settings')}
 *   onLogout={logout}
 * />
 * ```
 */
export declare function ProfileDropdown({ name, email, picture, onSettings, onLogout, className, }: ProfileDropdownProps): JSX.Element;

/**
 * Profile Dropdown Component
 *
 * Displays user avatar/name with a dropdown menu for settings and logout.
 */
export declare interface ProfileDropdownProps {
    /** User's display name */
    name?: string;
    /** User's email */
    email?: string;
    /** User's profile picture URL */
    picture?: string;
    /** Callback when Settings is clicked */
    onSettings?: () => void;
    /** Callback when Logout is clicked */
    onLogout?: () => void;
    /** Additional CSS class */
    className?: string;
}

/** Request for POST /deposit/public */
export declare interface PublicDepositRequest {
    signedTransaction: string;
    requestId: string;
    inputMint: string;
    inputAmount: number;
    walletAddress: string;
}

/** Fully qualified section ID: `pluginId:sectionId` */
export declare type QualifiedSectionId = `${PluginId}:${SectionId}`;

/**
 * Display recovery phrase with security warnings
 */
export declare function RecoveryPhraseDisplay({ words, onConfirm, className, }: RecoveryPhraseDisplayProps): JSX.Element;

/**
 * Component to display BIP-39 recovery phrase
 *
 * Shows 12 words in a grid format with copy functionality.
 * Includes security warnings about storing the phrase safely.
 */
export declare interface RecoveryPhraseDisplayProps {
    /** Array of 12 mnemonic words */
    words: string[];
    /** Callback when user confirms they've saved the phrase */
    onConfirm: () => void;
    /** Optional class name */
    className?: string;
}

/**
 * Input form for recovery phrase
 */
export declare function RecoveryPhraseInput({ onSubmit, onCancel, isSubmitting, error, className, }: RecoveryPhraseInputProps): JSX.Element;

/**
 * Component for entering BIP-39 recovery phrase
 *
 * Provides input fields for 12 words with validation and autocomplete.
 */
export declare interface RecoveryPhraseInputProps {
    /** Callback when valid phrase is entered */
    onSubmit: (words: string[]) => void;
    /** Callback to cancel */
    onCancel?: () => void;
    /** Whether submission is in progress */
    isSubmitting?: boolean;
    /** Error message to display */
    error?: string;
    /** Optional class name */
    className?: string;
}

/** Recovery flow state machine */
export declare interface RecoveryState {
    step: RecoveryStep;
    error?: string;
    /**
     * New recovery phrase (12 words) shown ONLY on successful completion.
     * SECURITY: Must be displayed to user immediately and never logged.
     * User should write down and securely store this phrase.
     */
    recoveryPhrase?: string[];
}

/** Recovery flow state */
declare type RecoveryStep = 'idle' | 'entering_phrase' | 'validating' | 'prompting_password' | 'registering_passkey' | 'encrypting' | 'uploading' | 'complete' | 'error';

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

/**
 * Response from revoking all sessions
 */
export declare interface RevokeAllSessionsResponse {
    revokedCount: number;
    message: string;
}

/**
 * Request to rotate user secret (re-encrypt Share A)
 *
 * TYPE-04: Current credential fields are FLATTENED into this struct (not nested).
 * The server uses `#[serde(flatten)]` so credential fields appear at root level.
 * E.g., send `{ password: "xxx", newAuthMethod: "passkey", ... }` not `{ currentCredential: {...} }`
 *
 * BUILD-01: Uses intersection type instead of interface-extends because
 * UnlockCredentialRequest is a union type (TypeScript doesn't allow interfaces
 * to extend union types).
 */
export declare type RotateUserSecretRequest = UnlockCredentialRequest & {
    /** New auth method */
    newAuthMethod: ShareAAuthMethod;
    /** New encrypted Share A (base64) */
    shareACiphertext: string;
    /** New nonce (base64, 12 bytes) */
    shareANonce: string;
    /** New KDF salt for password/PIN (base64) */
    shareAKdfSalt?: string;
    /** New KDF params for password/PIN */
    shareAKdfParams?: KdfParams;
    /** New PRF salt for passkey (base64, 32 bytes) */
    prfSalt?: string;
};

/** Section identifier, unique within a plugin */
export declare type SectionId = string;

export declare function SecuritySettings({ className }: SecuritySettingsProps): JSX.Element;

export declare interface SecuritySettingsProps {
    className?: string;
}

/**
 * Server-side feature flags stored in system settings.
 *
 * These control which features are available in the application.
 * Unlike client-side FeatureFlags (passed to CedrosLoginProvider),
 * these can be toggled at runtime via the admin dashboard.
 */
export declare interface ServerFeatures {
    /** Enable multi-tenant organizations. Controls: Team, Invites sections */
    organizations: boolean;
    /** Enable Enterprise SSO for organizations */
    sso: boolean;
    /** Enable two-factor authentication (TOTP) */
    mfa: boolean;
    /** Enable embedded wallet for transaction signing */
    walletSigning: boolean;
    /** Enable deposits and credits system. Controls: Deposits, Withdrawals, Credit System sections */
    credits: boolean;
    /** Enable user withdrawals from embedded wallet to external addresses */
    userWithdrawals: boolean;
    /** Enable Cedros Pay integration. Controls: Products, Transactions, Refunds, etc. */
    cedrosPay: boolean;
}

export declare function ServerSettings({ className }: ServerSettingsProps): JSX.Element;

export declare interface ServerSettingsProps {
    className?: string;
}

/**
 * Active session information
 */
export declare interface Session {
    id: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    expiresAt: string;
    /** Whether this is the current session */
    isCurrent: boolean;
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
 * Display active sessions and allow revoking all other sessions.
 *
 * @example
 * ```tsx
 * function SecuritySettings() {
 *   const { sessions, isLoading, error, revokeAllSessions } = useSessions();
 *
 *   return (
 *     <SessionList
 *       sessions={sessions}
 *       isLoading={isLoading}
 *       error={error?.message}
 *       onRevokeAll={revokeAllSessions}
 *     />
 *   );
 * }
 * ```
 */
export declare function SessionList({ sessions, isLoading, error, onRevokeAll, className, }: SessionListProps): JSX.Element;

export declare interface SessionListProps {
    /** List of active sessions */
    sessions: Session[];
    /** Loading state */
    isLoading?: boolean;
    /** Error message */
    error?: DisplayError;
    /** Callback to revoke all other sessions */
    onRevokeAll?: () => Promise<void>;
    /** Additional CSS class */
    className?: string;
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

/** Category metadata for UI display */
export declare interface SettingCategoryMeta {
    label: string;
    description: string;
}

/** Setting metadata for UI rendering */
export declare interface SettingMeta {
    key: string;
    label: string;
    /** Detailed description explaining what this setting does */
    description: string;
    /** Unit for display (e.g., 'seconds', 'requests', '%') */
    unit?: string;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Input type determines how the setting is rendered */
    inputType: 'number' | 'duration' | 'percentage' | 'select' | 'text' | 'boolean' | 'secret' | 'tokenSymbolList' | 'tokenList';
    /** Preset values for quick selection (used with 'select' or as suggestions) */
    presets?: SettingPreset[];
    /** Value threshold that triggers a warning */
    warningThreshold?: {
        above?: number;
        below?: number;
        message: string;
    };
    /** Step for number inputs */
    step?: number;
    /** Whether secret inputs should be multiline (textarea) */
    multiline?: boolean;
    /** Placeholder text for text inputs */
    placeholder?: string;
}

/** Preset option for settings with suggested values */
declare interface SettingPreset {
    label: string;
    value: string;
}

/**
 * Shared layout component for settings pages.
 * Handles loading and displaying settings for specified categories.
 * Changes are automatically saved after a brief debounce.
 */
export declare function SettingsPageLayout({ title, description, categories, className, }: SettingsPageLayoutProps): JSX.Element;

export declare interface SettingsPageLayoutProps {
    /** Page title */
    title: string;
    /** Page description */
    description: string;
    /** Categories to display on this page */
    categories: string[];
    /** Additional CSS class */
    className?: string;
}

/**
 * Setup types for first-run configuration
 */
/** Response from setup status check */
export declare interface SetupStatusResponse {
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
 *   return <CedrosAdminDashboard />;
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
 * Authentication method for Share A encryption
 * - password: Email users use their login password (Argon2id KDF)
 * - passkey: Users with passkey login use PRF extension (HKDF)
 */
export declare type ShareAAuthMethod = 'password' | 'passkey';

/** Request to get Share B for Share C recovery mode */
declare interface ShareCRecoveryRequest {
    /** Share C data (base64, 32 bytes decoded from mnemonic) */
    shareC: string;
}

/** Response from Share C recovery endpoint */
declare interface ShareCRecoveryResponse {
    /** Share B (base64) */
    shareB: string;
    /** Solana pubkey (for verification) */
    solanaPubkey: string;
}

/** Signing method in use */
export declare type SigningMethod = 'external' | 'sss' | 'none';

/** Request to sign a transaction  */
export declare interface SignTransactionRequest {
    /** Transaction bytes (base64) */
    transaction: string;
    /** Unlock credential */
    credential?: UnlockCredentialRequest;
}

/** Response from transaction signing */
export declare interface SignTransactionResponse {
    /** Ed25519 signature (base64, 64 bytes) */
    signature: string;
    /** Solana pubkey that signed */
    pubkey: string;
}

/**
 * Solana configuration options
 */
export declare interface SolanaConfig {
    /** Solana network to connect to. Default: 'mainnet-beta' */
    network?: SolanaNetwork;
    /** Auto-reconnect wallet on page load. Default: false */
    autoConnect?: boolean;
}

/**
 * Solana wallet login button with one-click authentication.
 *
 * Handles wallet connection and message signing automatically.
 * If wallet is already connected, signs immediately.
 * If not connected, connects first then auto-signs.
 */
export declare function SolanaLoginButton({ onSuccess, onError, className, variant, size, disabled, hideIfNoWallet, walletContext, }: SolanaLoginButtonProps): JSX.Element | null;

export declare interface SolanaLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /**
     * Hide the button if no Solana wallets are detected.
     * When true (default), button renders nothing if no wallets are installed.
     * When false, button always renders (useful for showing "install wallet" prompts).
     * @default true
     */
    hideIfNoWallet?: boolean;
    /**
     * Solana wallet adapter context. Pass this from @solana/wallet-adapter-react's useWallet().
     * The button will handle connection and signing automatically for a one-click experience.
     */
    walletContext?: {
        publicKey: {
            toBase58: () => string;
        } | null;
        signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | null;
        connected: boolean;
        connecting: boolean;
        connect: () => Promise<void>;
        wallet: {
            adapter: {
                name: string;
            };
        } | null;
        select: (walletName: string) => void;
        wallets: Array<{
            adapter: {
                name: string;
                icon: string;
                readyState: string;
            };
        }>;
    };
}

/**
 * Solana network configuration
 */
export declare type SolanaNetwork = 'mainnet-beta' | 'devnet';

/**
 * Split page login layout with branding on the left and form on the right.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <SplitPageLayout
 *   brandName="MyApp"
 *   tagline="The best app for everything"
 *   onSuccess={() => navigate('/dashboard')}
 * />
 *
 * // With custom logo
 * <SplitPageLayout
 *   brandLogo={<img src="/logo.svg" alt="MyApp" />}
 *   brandName="MyApp"
 *   tagline="Enterprise-grade solutions"
 *   title="Welcome back"
 *   subtitle="Sign in to continue"
 * />
 * ```
 */
export declare function SplitPageLayout({ brandName, brandLogo, tagline, title, subtitle, onSuccess, defaultTab, children, className, }: SplitPageLayoutProps): JSX.Element;

export declare interface SplitPageLayoutProps {
    /** Brand name or logo text displayed on the left panel */
    brandName?: string;
    /** Brand logo element (replaces default logo) */
    brandLogo?: ReactNode;
    /** Tagline displayed below the brand name */
    tagline?: string;
    /** Title displayed above the form. @default "Sign in" */
    title?: string;
    /** Subtitle displayed below the title */
    subtitle?: string;
    /** Called when login/register succeeds */
    onSuccess?: () => void;
    /** Default tab for the form. @default "login" */
    defaultTab?: 'login' | 'register';
    /** Custom content to render instead of LoginForm */
    children?: ReactNode;
    /** Additional CSS class for the outer container */
    className?: string;
}

/**
 * Supported stablecoins for deposits
 */
export declare const SUPPORTED_TOKENS: Token[];

/**
 * System settings types for admin configuration management
 */
/** Individual system setting */
export declare interface SystemSetting {
    key: string;
    value: string;
    description: string | null;
    updatedAt: string;
    updatedBy: string | null;
}

/**
 * System settings management component for administrators.
 *
 * Features:
 * - Duration inputs with human-readable display
 * - Percentage sliders
 * - Preset dropdown selectors
 * - Warning indicators for extreme values
 * - Rich descriptions for each setting
 */
export declare function SystemSettings({ showDescriptions, className, onSave, }: SystemSettingsProps): JSX.Element;

export declare interface SystemSettingsProps {
    /** Whether to show section descriptions */
    showDescriptions?: boolean;
    /** Additional CSS class */
    className?: string;
    /** Callback when settings are saved */
    onSave?: () => void;
}

/**
 * Terms of service checkbox configuration
 */
export declare interface TermsOfServiceConfig {
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
 * Tiered amount input with deposit tier indicator
 */
export declare function TieredAmountSlider({ config, valueUsd, onChange, maxUsd, disabled, className, }: TieredAmountSliderProps): JSX.Element;

export declare interface TieredAmountSliderProps {
    /** Deposit configuration with tier thresholds */
    config: DepositConfigResponse;
    /** Current amount in USD */
    valueUsd: number;
    /** Amount change handler */
    onChange: (valueUsd: number) => void;
    /** Cap in USD (default: 10000) */
    maxUsd?: number;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/** Response from tiered deposit endpoints */
export declare interface TieredDepositResponse {
    sessionId: string;
    txSignature: string;
    message: string;
    depositType: DepositTier;
}

/**
 * Token types and constants for deposit currency selection
 */
export declare interface Token {
    /** Token mint address */
    mint: string;
    /** Token symbol (e.g., SOL, USDC) */
    symbol: string;
    /** Token name (e.g., Solana, USD Coin) */
    name: string;
    /** Token decimals */
    decimals: number;
    /** Token logo URL */
    logoUrl?: string;
}

/** A single token balance from the wallet */
export declare interface TokenBalanceEntry {
    mint: string;
    amount: string;
    decimals: number;
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
 * Token selector dropdown component
 */
export declare function TokenSelector({ tokens, selectedToken, onSelect, openSignal, placeholder, disabled, className, searchable, }: TokenSelectorProps): JSX.Element;

export declare interface TokenSelectorProps {
    /** List of available tokens */
    tokens: Token[];
    /** Currently selected token */
    selectedToken?: Token;
    /** Callback when token is selected */
    onSelect: (token: Token) => void;
    /** Signal to force-open the dropdown */
    openSignal?: number;
    /** Placeholder text when no token selected */
    placeholder?: string;
    /** Disable the selector */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Show search input */
    searchable?: boolean;
}

/**
 * Response with new backup codes
 */
export declare interface TotpBackupCodesResponse {
    /** New one-time recovery codes */
    recoveryCodes: string[];
}

/**
 * Two-factor authentication (TOTP) configuration
 *
 * Admin-level settings for app-based 2FA using authenticator apps.
 */
export declare interface TotpConfig {
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
 * Request to verify and enable TOTP
 */
export declare interface TotpEnableRequest {
    /** 6-digit code from authenticator app */
    code: string;
}

/**
 * Two-factor authentication settings panel.
 *
 * Shows current 2FA status and provides controls for
 * enabling, disabling, and managing backup codes.
 *
 * @example
 * ```tsx
 * function SecuritySettings() {
 *   return (
 *     <div>
 *       <h2>Security</h2>
 *       <TotpSettings
 *         onStatusChange={(enabled) => {
 *           console.log('2FA is now', enabled ? 'enabled' : 'disabled');
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export declare function TotpSettings({ onStatusChange, className }: TotpSettingsProps): JSX.Element;

/**
 * TOTP Settings component for managing two-factor authentication
 *
 * Allows users to:
 * - View current 2FA status
 * - Enable 2FA (via TotpSetup wizard)
 * - Disable 2FA (requires verification)
 * - Regenerate backup codes
 */
export declare interface TotpSettingsProps {
    /** Called when 2FA status changes */
    onStatusChange?: (enabled: boolean) => void;
    /** Additional CSS class */
    className?: string;
}

/**
 * Two-factor authentication setup wizard.
 *
 * Displays QR code for authenticator app scanning,
 * recovery codes for account recovery, and verification step.
 */
export declare function TotpSetup({ onSuccess, onCancel, className }: TotpSetupProps): JSX.Element | null;

/**
 * TOTP Setup component for enabling two-factor authentication
 *
 * Guides users through:
 * 1. Scanning QR code with authenticator app
 * 2. Saving backup codes
 * 3. Verifying setup with a code
 */
export declare interface TotpSetupProps {
    /** Called when setup is completed successfully */
    onSuccess?: () => void;
    /** Called when user cancels setup */
    onCancel?: () => void;
    /** Additional CSS class */
    className?: string;
}

/**
 * Response from TOTP setup initiation
 */
export declare interface TotpSetupResponse {
    /** Base32-encoded secret for manual entry */
    secret: string;
    /** otpauth:// URI for QR code generation */
    otpauthUri: string;
    /** One-time recovery codes (shown only once) */
    recoveryCodes: string[];
}

/**
 * TOTP setup state for the enrollment flow
 */
export declare type TotpSetupState = 'idle' | 'loading' | 'setup' | 'verifying' | 'success' | 'error';

/**
 * TOTP (Time-based One-Time Password) types for two-factor authentication
 */
/**
 * User's TOTP status
 */
export declare interface TotpStatus {
    /** Whether TOTP is enabled for this user */
    enabled: boolean;
    /** Number of unused recovery codes remaining */
    recoveryCodesRemaining: number;
}

/**
 * Two-factor authentication verification for login.
 *
 * Accepts 6-digit codes from authenticator apps
 * or recovery codes for account recovery.
 */
export declare function TotpVerify({ mfaToken, email, onSuccess, onBack, className, }: TotpVerifyProps): JSX.Element;

/**
 * TOTP Verification component for login flow
 *
 * Displayed when a user with 2FA enabled needs to
 * enter their verification code to complete login.
 */
export declare interface TotpVerifyProps {
    /** Temporary token from password authentication */
    mfaToken: string;
    /** Email address (for display) */
    email?: string;
    /** Called when verification succeeds */
    onSuccess?: () => void;
    /** Called when user wants to go back */
    onBack?: () => void;
    /** Additional CSS class */
    className?: string;
}

/**
 * Request to verify TOTP during login
 */
export declare interface TotpVerifyRequest {
    /** 6-digit code from authenticator app or recovery code */
    code: string;
}

/**
 * TOTP verification state for the login flow
 */
export declare type TotpVerifyState = 'idle' | 'verifying' | 'success' | 'error';

export declare interface Translations {
    auth: {
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        optional: string;
        createPassword: string;
        confirmYourPassword: string;
        emailPlaceholder: string;
        namePlaceholder: string;
    };
    buttons: {
        signIn: string;
        signUp: string;
        signOut: string;
        createAccount: string;
        continueWithGoogle: string;
        continueWithSolana: string;
        forgotPassword: string;
        resetPassword: string;
        sendVerification: string;
    };
    messages: {
        signingIn: string;
        signingUp: string;
        creatingAccount: string;
        connectingWallet: string;
        verifyingSignature: string;
        passwordsDoNotMatch: string;
        alreadyHaveAccount: string;
        dontHaveAccount: string;
        orContinueWith: string;
    };
    errors: {
        invalidCredentials: string;
        emailExists: string;
        invalidEmail: string;
        weakPassword: string;
        networkError: string;
        unknownError: string;
        walletNotFound: string;
        signatureRejected: string;
        challengeExpired: string;
    };
    passwordValidation: {
        minLength: string;
        uppercase: string;
        lowercase: string;
        number: string;
        special: string;
        weak: string;
        fair: string;
        good: string;
        strong: string;
    };
}

/**
 * Credential for unlocking wallet / signing transactions (frontend internal use)
 *
 * TYPE-02: This type uses explicit `type` discriminator for TypeScript narrowing.
 * When sending to server API, convert to `UnlockCredentialRequest` which uses
 * the flattened format expected by the backend (`{ password: '...' }` not
 * `{ type: 'password', password: '...' }`).
 *
 * @see UnlockCredentialRequest for API request format
 */
export declare type UnlockCredential = {
    type: 'password';
    password: string;
} | {
    type: 'prfOutput';
    prfOutput: string;
};

/**
 * Credential for API request (flattened format matching server)
 *
 * TYPE-02: Server uses Serde's flattened enum format, so only ONE of these
 * fields should be present in the request object. Do NOT include `type` field.
 *
 * @example { password: 'secret' }
 * @example { prfOutput: 'base64...' }
 */
declare type UnlockCredentialRequest = {
    password: string;
} | {
    prfOutput: string;
};

/**
 * Request to update a member's role
 */
export declare interface UpdateMemberRoleRequest {
    role: OrgRole;
}

/**
 * Update organization request
 */
export declare interface UpdateOrgRequest {
    name?: string;
    slug?: string;
    logoUrl?: string;
}

/**
 * User profile types
 *
 * Types for user profile management including updates and password changes.
 */
/**
 * Request to update user profile
 */
export declare interface UpdateProfileRequest {
    /** User's display name */
    name?: string;
    /** User's profile picture URL */
    picture?: string;
}

/**
 * Response from profile update
 */
export declare interface UpdateProfileResponse {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Request to update a single setting */
export declare interface UpdateSettingRequest {
    key: string;
    value: string;
}

/** Request body for PATCH /admin/settings */
export declare interface UpdateSystemSettingsRequest {
    settings: UpdateSettingRequest[];
}

/** Response from PATCH /admin/settings */
export declare interface UpdateSystemSettingsResponse {
    updated: SystemSetting[];
}

/**
 * Request to update a user's profile (admin)
 */
declare interface UpdateUserRequest {
    name?: string;
    email?: string;
    emailVerified?: boolean;
}

/**
 * Hook for admin Privacy Cash deposit operations
 *
 * Requires system admin privileges. All methods will fail with 403 if not admin.
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useAdminDeposits(): UseAdminDepositsReturn;

/** Return type for useAdminDeposits hook */
export declare interface UseAdminDepositsReturn {
    /** List all deposits (admin) */
    listDeposits: (options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }) => Promise<AdminDepositListResponse>;
    /** Get deposit statistics (admin) */
    getStats: () => Promise<AdminDepositStatsResponse>;
    /** List deposits in privacy period (completed but not yet ready for withdrawal) */
    listInPrivacyPeriod: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<AdminDepositListResponse>;
    /** List pending withdrawals (admin) */
    listPendingWithdrawals: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<AdminDepositListResponse>;
    /** Process a single withdrawal (admin) */
    processWithdrawal: (sessionId: string, options?: ProcessWithdrawalRequest) => Promise<ProcessWithdrawalResponse>;
    /** Process all ready withdrawals (admin) */
    processAllWithdrawals: () => Promise<ProcessAllWithdrawalsResponse>;
    /** Get Privacy Cash system status */
    getPrivacyStatus: () => Promise<PrivacyStatusResponse>;
    /** Get credit spending stats */
    getCreditStats: () => Promise<AdminCreditStatsResponse>;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

export declare function useAdminShell(): AdminShellContextValue;

/**
 * Hook for admin user management operations
 *
 * Provides methods to list all users, get individual users,
 * and manage system admin status. Requires system admin privileges.
 *
 * @example
 * ```tsx
 * function UserManagement() {
 *   const { users, total, isLoading, listUsers, setSystemAdmin } = useAdminUsers();
 *
 *   useEffect(() => {
 *     listUsers({ limit: 20 });
 *   }, [listUsers]);
 *
 *   return (
 *     <AdminUserList
 *       users={users}
 *       total={total}
 *       isLoading={isLoading}
 *       onToggleAdmin={(userId, isAdmin) => setSystemAdmin(userId, isAdmin)}
 *     />
 *   );
 * }
 * ```
 */
export declare function useAdminUsers(): UseAdminUsersReturn;

/**
 * Hook return type
 */
export declare interface UseAdminUsersReturn {
    users: AdminUser[];
    total: number;
    isLoading: boolean;
    error: Error | null;
    listUsers: (params?: ListUsersParams) => Promise<ListAdminUsersResponse>;
    getUser: (userId: string) => Promise<AdminUser>;
    setSystemAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
    updateUser: (userId: string, data: UpdateUserRequest) => Promise<AdminUser>;
    deleteUser: (userId: string) => Promise<void>;
    forcePasswordReset: (userId: string) => Promise<void>;
    adjustCredits: (userId: string, amount: number, reason: string) => Promise<void>;
    getUserDeposits: (userId: string, params?: ListUsersParams) => Promise<AdminDepositListResponse>;
    getUserCredits: (userId: string, params?: ListUsersParams) => Promise<AdminUserCreditsResponse>;
    getUserWithdrawalHistory: (userId: string, params?: ListUsersParams) => Promise<AdminUserWithdrawalHistoryResponse>;
    getUserChats: (userId: string, params?: ListUsersParams) => Promise<AdminUserChatsResponse>;
    getStats: () => Promise<AdminUserStatsResponse>;
    refresh: () => Promise<void>;
    clearError: () => void;
}

/**
 * Hook for Apple Sign In authentication.
 *
 * @example
 * ```tsx
 * function AppleButton() {
 *   const { signIn, isLoading, isInitialized, error } = useAppleAuth();
 *
 *   return (
 *     <button onClick={signIn} disabled={!isInitialized || isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign in with Apple'}
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useAppleAuth(): UseAppleAuthReturn;

export declare interface UseAppleAuthReturn {
    signIn: () => Promise<AuthResponse>;
    isLoading: boolean;
    isInitialized: boolean;
    error: AuthError | null;
    clearError: () => void;
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

/**
 * Hook for server-side authorization checks.
 *
 * This hook allows you to check if a specific action is authorized
 * by making a request to the server's /authorize endpoint.
 *
 * For simple permission checks based on the user's role, use `useOrgs().hasPermission()` instead.
 *
 * @example
 * ```tsx
 * function DeleteButton({ resourceId }: { resourceId: string }) {
 *   const { authorize, lastCheck } = useAuthorize();
 *   const { activeOrg } = useOrgs();
 *
 *   const handleDelete = async () => {
 *     const allowed = await authorize({
 *       orgId: activeOrg?.id!,
 *       action: 'delete',
 *       resource: 'document',
 *       resourceId,
 *     });
 *
 *     if (allowed) {
 *       // Proceed with delete
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={lastCheck.isLoading}>
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useAuthorize(): UseAuthorizeReturn;

export declare interface UseAuthorizeReturn {
    /**
     * Check if an action is authorized server-side.
     * Use this for dynamic authorization checks.
     */
    authorize: (request: AuthorizeRequest) => Promise<boolean>;
    /**
     * Authorization state for the last check
     */
    lastCheck: AuthorizationCheck;
    /**
     * Clear the last authorization check
     */
    clearCheck: () => void;
    /**
     * Check authorization and return detailed result
     */
    checkAuthorization: (request: AuthorizeRequest) => Promise<AuthorizationCheck>;
}

export declare interface UseAuthReturn {
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
 * Hook for credit balance and transaction history
 *
 * Credits represent the user's balance from Privacy Cash deposits.
 * The balance can be used for services within the application.
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useCredits(): UseCreditsReturn;

/** Return type for useCredits hook */
export declare interface UseCreditsReturn {
    /** Get SOL credit balance */
    getBalance: () => Promise<CreditBalanceResponse>;
    /** Get all balances */
    getAllBalances: () => Promise<CreditBalanceResponse[]>;
    /** Get transaction history */
    getHistory: (options?: {
        currency?: string;
        limit?: number;
        offset?: number;
    }) => Promise<CreditHistoryResponse>;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

/**
 * Hook for Privacy Cash deposit operations
 *
 * Deposits go to the user's Privacy Cash account (user's pubkey is owner).
 * Credits are issued immediately, withdrawal to company wallet happens later.
 *
 * Requirements:
 * - User must have SSS wallet enrolled
 * - Wallet must be unlocked (call POST /wallet/unlock first)
 * - Wallet must be in "no recovery" mode
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useDeposit(): UseDepositReturn;

/** Return type for useDeposit hook */
export declare interface UseDepositReturn {
    /** Execute a private deposit (Privacy Cash) */
    deposit: (amountLamports: number) => Promise<DepositResponse>;
    /** Get swap quote for public deposits */
    getQuote: (params: {
        inputMint: string;
        amount: number;
        taker: string;
    }) => Promise<DepositQuoteResponse>;
    /** Execute a public deposit (Jupiter swap to company wallet) */
    publicDeposit: (request: PublicDepositRequest) => Promise<TieredDepositResponse>;
    /** Execute a SOL micro deposit (direct transfer) */
    microDeposit: (request: MicroDepositRequest) => Promise<TieredDepositResponse>;
    /** Get deposit status */
    getStatus: (sessionId: string) => Promise<DepositStatusResponse>;
    /** Get deposit config */
    getConfig: () => Promise<DepositConfigResponse>;
    /** List deposits with pagination */
    listDeposits: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<DepositListResponse>;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

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

export declare interface UseEmailAuthReturn {
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
 * Hook for Google OAuth authentication.
 *
 * @example
 * ```tsx
 * function GoogleButton() {
 *   const { signIn, isLoading, isInitialized, error } = useGoogleAuth();
 *
 *   return (
 *     <button onClick={signIn} disabled={!isInitialized || isLoading}>
 *       {isLoading ? 'Signing in...' : 'Sign in with Google'}
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useGoogleAuth(): UseGoogleAuthReturn;

export declare interface UseGoogleAuthReturn {
    signIn: () => Promise<AuthResponse>;
    isLoading: boolean;
    isInitialized: boolean;
    error: AuthError | null;
    clearError: () => void;
}

/**
 * Hook for instant link (passwordless) authentication.
 *
 * Sends an instant link email that allows the user to sign in
 * without entering their password.
 *
 * @example
 * ```tsx
 * function InstantLinkForm() {
 *   const { sendInstantLink, isLoading, isSuccess, error } = useInstantLink();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await sendInstantLink(email);
 *   };
 *
 *   if (isSuccess) {
 *     return <p>Check your email for the sign-in link</p>;
 *   }
 * }
 * ```
 */
export declare function useInstantLink(): UseInstantLinkReturn;

export declare interface UseInstantLinkReturn {
    /** Send an instant link email to the given address */
    sendInstantLink: (email: string) => Promise<void>;
    /** Verify an instant link token and sign in */
    verifyInstantLink: (token: string) => Promise<AuthResponse | MfaRequiredResponse>;
    /** Whether a request is in progress */
    isLoading: boolean;
    /** Whether the instant link was sent successfully */
    isSuccess: boolean;
    /** Error from the last request */
    error: AuthError | null;
    /** Clear the error state */
    clearError: () => void;
    /** Reset to initial state */
    reset: () => void;
    /** Number of remaining attempts before rate limiting */
    remainingAttempts: number;
}

/**
 * Hook for managing organization invites.
 *
 * @param orgId - The organization ID to manage invites for
 *
 * @example
 * ```tsx
 * function InviteManager() {
 *   const { activeOrg } = useOrgs();
 *   const { invites, createInvite, cancelInvite, resendInvite } = useInvites(activeOrg?.id);
 *
 *   const handleInvite = async (email: string) => {
 *     await createInvite(email, 'member');
 *   };
 *
 *   return (
 *     <div>
 *       <InviteForm onSubmit={handleInvite} />
 *       <ul>
 *         {invites.map(invite => (
 *           <li key={invite.id}>
 *             {invite.email} ({invite.role})
 *             <button onClick={() => resendInvite(invite.id)}>Resend</button>
 *             <button onClick={() => cancelInvite(invite.id)}>Cancel</button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useInvites(orgId: string | undefined): UseInvitesReturn;

export declare interface UseInvitesReturn {
    /** List of pending invites */
    invites: Invite[];
    /** Total pending invites available on the server */
    total: number;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: AuthError | null;
    /** Fetch/refresh invites list */
    fetchInvites: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<void>;
    /** Create a new invite */
    createInvite: (email: string, role?: Exclude<OrgRole, 'owner'>) => Promise<void>;
    /** Cancel a pending invite */
    cancelInvite: (inviteId: string) => Promise<void>;
    /** Resend an invite email */
    resendInvite: (inviteId: string) => Promise<void>;
    /** Accept an invite (public) */
    acceptInvite: (token: string) => Promise<AcceptInviteResponse>;
}

/**
 * Hook to access current locale
 */
export declare function useLocale(): string;

/**
 * Hook for managing organization members.
 *
 * @param orgId - The organization ID to manage members for
 *
 * @example
 * ```tsx
 * function MembersList() {
 *   const { activeOrg } = useOrgs();
 *   const { members, isLoading, updateMemberRole, removeMember } = useMembers(activeOrg?.id);
 *
 *   if (!activeOrg) return null;
 *
 *   return (
 *     <ul>
 *       {members.map(member => (
 *         <li key={member.id}>
 *           {member.user.name} - {member.role}
 *           <button onClick={() => updateMemberRole(member.userId, 'admin')}>
 *             Make Admin
 *           </button>
 *           <button onClick={() => removeMember(member.userId)}>
 *             Remove
 *           </button>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export declare function useMembers(orgId: string | undefined): UseMembersReturn;

export declare interface UseMembersReturn {
    /** List of members */
    members: Member[];
    /** Total members available on the server */
    total: number;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: AuthError | null;
    /** Fetch/refresh members list */
    fetchMembers: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<void>;
    /** Update a member's role */
    updateMemberRole: (userId: string, role: OrgRole) => Promise<void>;
    /** Remove a member */
    removeMember: (userId: string) => Promise<void>;
}

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
 * Helper hook to get PRF output for passkey signing
 *
 * This handles the WebAuthn PRF flow and returns a credential
 * that can be used with useWalletSigning.
 */
export declare function usePasskeySigning(): {
    getPasskeyCredential: () => Promise<UnlockCredential | null>;
    isAuthenticating: boolean;
    error: string | null;
    clearError: () => void;
};

/**
 * Hook for password reset functionality.
 *
 * @example
 * ```tsx
 * function ForgotPasswordForm() {
 *   const { forgotPassword, isLoading, isSuccess, error } = usePasswordReset();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await forgotPassword(email);
 *   };
 *
 *   if (isSuccess) {
 *     return <p>Check your email for reset instructions</p>;
 *   }
 * }
 * ```
 */
export declare function usePasswordReset(): UsePasswordResetReturn;

export declare interface UsePasswordResetReturn {
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    isLoading: boolean;
    isSuccess: boolean;
    error: AuthError | null;
    clearError: () => void;
    reset: () => void;
    /** Number of remaining attempts before rate limiting */
    remainingAttempts: number;
}

/**
 * Hook for managing pending wallet recovery data
 *
 * Use this after wallet enrollment to show the user their recovery phrase
 * and allow them to acknowledge receipt.
 */
export declare function usePendingRecovery(): UsePendingRecoveryReturn;

/**
 * Hook for pending wallet recovery management
 *
 * After wallet enrollment, if recovery mode is enabled, the server stores
 * recovery data temporarily. This hook fetches that data and allows the
 * user to acknowledge receipt (after which the data is deleted from server).
 */
export declare interface UsePendingRecoveryReturn {
    /** Whether there is pending recovery data */
    hasPendingRecovery: boolean;
    /** Recovery type: 'share_c' or 'full_seed' */
    recoveryType: string | null;
    /** Recovery phrase (base64-encoded seed) */
    recoveryPhrase: string | null;
    /** When the recovery data expires */
    expiresAt: Date | null;
    /** Fetch pending recovery data from server */
    fetchPendingRecovery: () => Promise<void>;
    /** Acknowledge that user has saved the recovery phrase (deletes from server) */
    acknowledgeRecovery: () => Promise<void>;
    /** Whether request is in progress */
    isLoading: boolean;
    /** Error from last request */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

/**
 * Hook for managing user profile operations.
 *
 * Provides methods for updating profile information and changing password.
 *
 * @example
 * ```tsx
 * function ProfileSettings() {
 *   const { isLoading, error, changePassword, clearError } = useProfile();
 *
 *   const handlePasswordChange = async () => {
 *     try {
 *       await changePassword({
 *         currentPassword: 'oldpass',
 *         newPassword: 'newpass123',
 *       });
 *       // Success - other sessions have been revoked
 *     } catch (err) {
 *       // Error is available via the error property
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {error && <p className="error">{error.message}</p>}
 *       <button onClick={handlePasswordChange} disabled={isLoading}>
 *         Change Password
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useProfile(): UseProfileReturn;

/**
 * Return type for useProfile hook
 */
export declare interface UseProfileReturn {
    /** Whether a profile operation is in progress */
    isLoading: boolean;
    /** Error from last operation */
    error: Error | null;
    /** Update profile (name, picture) */
    updateProfile: (data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
    /** Change password */
    changePassword: (data: ChangePasswordRequest) => Promise<void>;
    /** Clear error state */
    clearError: () => void;
}

/**
 * User profile settings panel.
 *
 * Shows user profile information and provides controls for
 * changing password and managing profile settings.
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   return (
 *     <UserProfileSettings
 *       onPasswordChange={() => console.log('Password changed')}
 *       onClose={() => navigate('/dashboard')}
 *     />
 *   );
 * }
 * ```
 */
export declare function UserProfileSettings({ onPasswordChange, onClose, className, }: UserProfileSettingsProps): JSX.Element;

/**
 * User Profile Settings component
 *
 * Allows users to:
 * - View their profile information
 * - Change their password
 * - (Future) Update name and picture when backend supports it
 */
export declare interface UserProfileSettingsProps {
    /** Called when password is changed successfully */
    onPasswordChange?: () => void;
    /** Called when user requests to close/cancel */
    onClose?: () => void;
    /** Additional CSS class */
    className?: string;
}

/** A single user withdrawal history item */
export declare interface UserWithdrawalHistoryItem {
    id: string;
    tokenType: 'sol' | 'spl';
    tokenMint: string | null;
    amount: string;
    destination: string;
    txSignature: string;
    feeLamports: number;
    createdAt: string;
}

/** Paginated response from GET /wallet/withdraw/history */
export declare interface UserWithdrawalHistoryResponse {
    items: UserWithdrawalHistoryItem[];
    total: number;
}

/**
 * Hook for reading server-side feature flags from system settings.
 *
 * Use this to conditionally show/hide features based on admin settings.
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { features, isLoading, isEnabled } = useServerFeatures();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <nav>
 *       {isEnabled('organizations') && <NavItem>Team</NavItem>}
 *       {isEnabled('credits') && <NavItem>Deposits</NavItem>}
 *     </nav>
 *   );
 * }
 * ```
 */
export declare function useServerFeatures(): UseServerFeaturesReturn;

export declare interface UseServerFeaturesReturn {
    /** Current feature flag states */
    features: ServerFeatures;
    /** Whether settings are still loading */
    isLoading: boolean;
    /** Error if settings failed to load */
    error: Error | null;
    /** Refresh feature flags from server */
    refetch: () => Promise<void>;
    /** Check if a specific feature is enabled */
    isEnabled: (feature: keyof ServerFeatures) => boolean;
}

/**
 * Hook for managing user sessions across devices.
 *
 * @example
 * ```tsx
 * function SessionManager() {
 *   const { sessions, isLoading, revokeAllSessions, otherSessionCount } = useSessions();
 *
 *   return (
 *     <div>
 *       <h3>Active Sessions ({sessions.length})</h3>
 *       <ul>
 *         {sessions.map(session => (
 *           <li key={session.id}>
 *             {session.userAgent}
 *             {session.isCurrent && ' (current)'}
 *           </li>
 *         ))}
 *       </ul>
 *       {otherSessionCount > 0 && (
 *         <button onClick={revokeAllSessions}>
 *           Sign out of {otherSessionCount} other device(s)
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useSessions(): UseSessionsReturn;

export declare interface UseSessionsReturn {
    /** List of active sessions */
    sessions: Session[];
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: AuthError | null;
    /** Fetch/refresh sessions list */
    fetchSessions: () => Promise<void>;
    /** Revoke all sessions (logout everywhere) */
    revokeAllSessions: () => Promise<RevokeAllSessionsResponse>;
    /** Number of other active sessions (excluding current) */
    otherSessionCount: number;
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
 *   return <Dashboard />;
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
 * Hook for Solana wallet authentication.
 *
 * @example
 * ```tsx
 * function SolanaLogin() {
 *   const { requestChallenge, signIn, isLoading } = useSolanaAuth();
 *   const { publicKey, signMessage } = useWallet();
 *
 *   const handleLogin = async () => {
 *     const challenge = await requestChallenge(publicKey.toBase58());
 *     const signature = await signMessage(new TextEncoder().encode(challenge.message));
 *     const result = await signIn(
 *       publicKey.toBase58(),
 *       Buffer.from(signature).toString('base64'),
 *       challenge.message
 *     );
 *   };
 * }
 * ```
 */
export declare function useSolanaAuth(): UseSolanaAuthReturn;

export declare interface UseSolanaAuthReturn {
    requestChallenge: (publicKey: string) => Promise<ChallengeResponse>;
    signIn: (publicKey: string, signature: string, message: string) => Promise<AuthResponse>;
    isLoading: boolean;
    error: AuthError | null;
    clearError: () => void;
}

/**
 * Hook for managing system settings (admin only).
 *
 * Provides CRUD operations for system-wide configuration settings
 * stored in the database. Only accessible to system administrators.
 *
 * @example
 * ```tsx
 * function SystemSettingsPanel() {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     fetchSettings,
 *     updateSettings,
 *     getValue,
 *   } = useSystemSettings();
 *
 *   useEffect(() => {
 *     fetchSettings();
 *   }, [fetchSettings]);
 *
 *   const handleSave = async () => {
 *     await updateSettings([
 *       { key: 'privacy_period_secs', value: '1209600' },
 *     ]);
 *   };
 *
 *   return (
 *     <div>
 *       {Object.entries(settings).map(([category, items]) => (
 *         <section key={category}>
 *           <h3>{category}</h3>
 *           {items.map(item => (
 *             <div key={item.key}>
 *               {item.key}: {item.value}
 *             </div>
 *           ))}
 *         </section>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useSystemSettings(): UseSystemSettingsReturn;

/** Return type for useSystemSettings hook */
export declare interface UseSystemSettingsReturn {
    /** Settings grouped by category */
    settings: Record<string, SystemSetting[]>;
    /** Whether data is loading */
    isLoading: boolean;
    /** Whether an update is in progress */
    isUpdating: boolean;
    /** Error state */
    error: Error | null;
    /** Fetch settings from server */
    fetchSettings: () => Promise<void>;
    /** Update one or more settings */
    updateSettings: (updates: UpdateSettingRequest[]) => Promise<void>;
    /** Get a setting value by key */
    getValue: (key: string) => string | undefined;
}

/**
 * Hook for TOTP (Time-based One-Time Password) two-factor authentication.
 *
 * Provides methods for:
 * - Setting up TOTP with authenticator apps
 * - Enabling/disabling TOTP for the user's account
 * - Managing backup codes
 *
 * @example
 * ```tsx
 * function TotpSettings() {
 *   const { status, beginSetup, enableTotp, setupData } = useTotp();
 *
 *   if (status?.enabled) {
 *     return <p>2FA is enabled</p>;
 *   }
 *
 *   const handleSetup = async () => {
 *     const data = await beginSetup();
 *     // Show QR code from data.otpauthUri
 *   };
 * }
 * ```
 */
export declare function useTotp(): UseTotpReturn;

export declare interface UseTotpReturn {
    /** Current TOTP status for the user */
    status: TotpStatus | null;
    /** Setup state for the enrollment flow */
    setupState: TotpSetupState;
    /** Setup data (secret, QR URL, backup codes) */
    setupData: TotpSetupResponse | null;
    /** Whether a request is in progress */
    isLoading: boolean;
    /** Error from the last request */
    error: AuthError | null;
    /** Fetch current TOTP status */
    getStatus: () => Promise<TotpStatus>;
    /** Start TOTP setup (generates secret and backup codes) */
    beginSetup: () => Promise<TotpSetupResponse>;
    /** Verify code and enable TOTP */
    enableTotp: (code: string) => Promise<void>;
    /** Disable TOTP (requires password confirmation) */
    disableTotp: (password: string) => Promise<void>;
    /** Regenerate recovery codes (requires current authenticator code) */
    regenerateBackupCodes: (code: string) => Promise<TotpBackupCodesResponse>;
    /** Clear error state */
    clearError: () => void;
    /** Reset to initial state */
    reset: () => void;
}

/**
 * Hook for verifying TOTP codes during the login flow.
 *
 * Used when a user has TOTP enabled and needs to provide
 * their 6-digit code after password authentication.
 *
 * @example
 * ```tsx
 * function TotpVerifyStep({ mfaToken }) {
 *   const { verifyTotp, isLoading, error } = useTotpVerify();
 *
 *   const handleVerify = async (code: string) => {
 *     const response = await verifyTotp(mfaToken, code);
 *     // User is now authenticated
 *   };
 * }
 * ```
 */
export declare function useTotpVerify(): UseTotpVerifyReturn;

export declare interface UseTotpVerifyReturn {
    /** Verification state */
    state: TotpVerifyState;
    /** Whether verification is in progress */
    isLoading: boolean;
    /** Error from the last request */
    error: AuthError | null;
    /** Verify MFA code during login */
    verifyTotp: (mfaToken: string, code: string) => Promise<AuthResponse>;
    /** Clear error state */
    clearError: () => void;
    /** Reset to initial state */
    reset: () => void;
    /** Number of remaining verification attempts before rate limiting */
    remainingAttempts: number;
    /** Time in ms until rate limit resets (0 if not rate limited) */
    timeUntilReset: number;
}

/**
 * Unified transaction signing hook
 *
 * Automatically routes signing requests to the appropriate method:
 * - External wallet: Uses provided callback
 * - SSS wallet: Uses server-side signing
 */
export declare function useTransactionSigning(options?: ExternalSignOptions): UseTransactionSigningReturn;

/** Return type for useTransactionSigning hook */
export declare interface UseTransactionSigningReturn {
    /** Sign a transaction (routes to appropriate method) */
    signTransaction: (transaction: Uint8Array, credential?: UnlockCredential) => Promise<Uint8Array>;
    /** Which signing method is available */
    signingMethod: SigningMethod;
    /** Whether user can sign transactions */
    canSign: boolean;
    /** Whether signing is in progress */
    isSigning: boolean;
    /** Solana public key (from either wallet type) */
    publicKey: string | null;
    /** Whether user has external Solana wallet */
    hasExternalWallet: boolean;
    /** Whether SSS wallet is enrolled */
    hasSssWallet: boolean;
    /** Whether SSS wallet is unlocked (for session-based signing) */
    isSssUnlocked: boolean;
    /** Error from last signing attempt */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

/**
 * Hook to access translations
 */
export declare function useTranslations(): Translations;

/**
 * Main wallet hook
 *
 * Provides wallet status, capabilities, and refresh functionality.
 * Distinguishes between external Solana wallet and SSS embedded wallet.
 *
 * Returns safe defaults when called outside CedrosLoginProvider.
 */
export declare function useWallet(): WalletContextValue;

/**
 * Hook for wallet enrollment
 *
 * Supports auth methods:
 * - password: User sets a wallet password (Argon2id KDF)
 * - passkey: Uses passkey PRF extension
 */
export declare function useWalletEnrollment(): UseWalletEnrollmentReturn;

/** Enrollment hook return value  */
export declare interface UseWalletEnrollmentReturn {
    /** Current enrollment state */
    state: EnrollmentState;
    /** Start enrollment with password (email users) */
    startEnrollmentWithPassword: (password: string) => Promise<void>;
    /** Start enrollment with passkey PRF */
    startEnrollmentWithPasskey: () => Promise<void>;
    /** Confirm user has saved recovery phrase */
    confirmRecoveryPhrase: () => void;
    /** Cancel enrollment */
    cancel: () => void;
    /** Whether enrollment is in progress */
    isEnrolling: boolean;
}

/**
 * Hook for wallet material API operations
 *
 * Signing happens server-side: server stores Share A (encrypted) and Share B
 * (plaintext), combines shares JIT for signing, and wipes immediately after.
 *
 * Safe to call outside CedrosLoginProvider - returns no-op functions that throw.
 */
export declare function useWalletMaterial(): UseWalletMaterialReturn;

/** Wallet material hook return value */
export declare interface UseWalletMaterialReturn {
    /** Fetch wallet status (enrolled, unlocked, external wallet) */
    getStatus: () => Promise<WalletStatusApiResponse>;
    /** Fetch wallet material (for SSS wallet details) */
    getMaterial: () => Promise<WalletMaterialResponse | null>;
    /** Enroll new SSS wallet */
    enroll: (request: WalletEnrollRequest) => Promise<void>;
    /** Recover wallet (replace existing with new credentials) */
    recover: (request: WalletRecoverRequest) => Promise<void>;
    /** Sign a transaction (SSS wallet) */
    signTransaction: (request: SignTransactionRequest) => Promise<SignTransactionResponse>;
    /** Rotate user secret */
    rotateUserSecret: (request: RotateUserSecretRequest) => Promise<void>;
    /** Unlock wallet for session-based signing (credential cached server-side) */
    unlock: (credential: UnlockCredential) => Promise<WalletUnlockResponse>;
    /** Lock wallet (clear cached credential) */
    lock: () => Promise<void>;
    /** Get Share B for Share C recovery mode (proves ownership via Share C) */
    getShareBForRecovery: (request: ShareCRecoveryRequest) => Promise<ShareCRecoveryResponse>;
    /** Whether request is in progress */
    isLoading: boolean;
    /** Error from last request */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

/**
 * Hook for wallet recovery
 *
 * Supports two recovery modes based on server config:
 * - full_seed: User enters the full 12-word seed phrase (portable)
 * - share_c_only: User enters 12-word Share C phrase, server provides Share B (app-locked)
 */
export declare function useWalletRecovery(): UseWalletRecoveryReturn;

/** Recovery hook return value */
export declare interface UseWalletRecoveryReturn {
    /** Current recovery state */
    state: RecoveryState;
    /** Start recovery: validate phrase, then set new credential */
    startRecovery: (words: string[], method: ShareAAuthMethod, credential: string) => Promise<void>;
    /** Cancel recovery */
    cancel: () => void;
    /** Whether recovery is in progress */
    isRecovering: boolean;
}

/**
 * Hook for wallet transaction signing
 *
 * Usage:
 * ```tsx
 * const { signTransaction, isSigning, error } = useWalletSigning();
 *
 * // Sign with password
 * const signature = await signTransaction(txBytes, { type: 'password', password: 'xxx' });
 *
 * // Sign with PIN
 * const signature = await signTransaction(txBytes, { type: 'password', password: 'secret' });
 *
 * // Sign with passkey (PRF)
 * const signature = await signTransaction(txBytes, { type: 'prfOutput', prfOutput: 'base64...' });
 * ```
 */
export declare function useWalletSigning(): UseWalletSigningReturn;

/**
 * Signing hook return value
 * Signing is server-side. Client just provides credential.
 */
export declare interface UseWalletSigningReturn {
    /** Sign a transaction */
    signTransaction: (transaction: Uint8Array, credential?: UnlockCredential) => Promise<Uint8Array>;
    /** Whether signing is in progress */
    isSigning: boolean;
    /** Error from last signing attempt */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}

/**
 * Server-managed WebAuthn (passkey) authentication + registration.
 *
 * - Login: /webauthn/auth/options -> navigator.credentials.get -> /webauthn/auth/verify
 * - Registration: /webauthn/register/options -> navigator.credentials.create -> /webauthn/register/verify
 */
export declare function useWebAuthn(): UseWebAuthnReturn;

export declare interface UseWebAuthnReturn {
    isSupported: boolean;
    isLoading: boolean;
    error: AuthError | null;
    clearError: () => void;
    /** Start a server-managed WebAuthn authentication ceremony (login). */
    authenticatePasskey: (params?: {
        email?: string;
    }) => Promise<AuthResponse>;
    /** Register a new passkey for the currently authenticated user. */
    registerPasskey: (params?: {
        label?: string;
    }) => Promise<{
        credentialId: string;
        label?: string;
    }>;
}

export declare function useWithdrawal(): UseWithdrawalReturn;

/** Return type for useWithdrawal hook */
export declare interface UseWithdrawalReturn {
    withdrawSol: (destination: string, amountLamports: number) => Promise<WithdrawalResponse>;
    withdrawSpl: (destination: string, tokenMint: string, amount: string) => Promise<WithdrawalResponse>;
    getBalances: () => Promise<WalletBalancesResponse>;
    getHistory: (limit?: number, offset?: number) => Promise<UserWithdrawalHistoryResponse>;
    isSubmitting: boolean;
    error: string | null;
    clearError: () => void;
    lastResult: WithdrawalResponse | null;
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

export declare function WalletAddressRow({ address, label, showCopy, showExplorerLink, allowReveal, className, }: WalletAddressRowProps): JSX.Element;

export declare interface WalletAddressRowProps {
    address: string;
    label?: string;
    showCopy?: boolean;
    showExplorerLink?: boolean;
    /** If address is long, show a truncated preview with a reveal toggle. */
    allowReveal?: boolean;
    className?: string;
}

/** Response from the wallet balances endpoint */
export declare interface WalletBalancesResponse {
    solLamports: number;
    tokens: TokenBalanceEntry[];
}

/**
 * Embedded wallet configuration
 *
 * Controls whether the embedded wallet is advertised to other Cedros modules
 * (like cedros-pay) running in the same application.
 */
export declare interface WalletConfig {
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

/** Wallet context value */
export declare interface WalletContextValue {
    /** Current wallet status */
    status: WalletStatus_2;
    /** Solana public key (from SSS wallet if enrolled, or external wallet) */
    solanaPubkey: string | null;
    /** Auth method for Share A (if enrolled in SSS wallet) */
    authMethod: ShareAAuthMethod | null;
    /** Whether user signed in with external Solana wallet (not SSS) */
    hasExternalWallet: boolean;
    /** Whether SSS wallet is unlocked for signing */
    isUnlocked: boolean;
    /** Crypto capabilities */
    capabilities: CryptoCapabilities | null;
    /** Whether all required capabilities are available */
    isSupported: boolean;
    /** Error message if any */
    error: string | null;
    /** Refresh wallet status */
    refresh: () => Promise<void>;
    /** Clear error */
    clearError: () => void;
}

/**
 * Wallet enrollment wizard
 */
export declare function WalletEnrollment({ onComplete, onCancel, className, forceAuthMethod, }: WalletEnrollmentProps): JSX.Element;

export declare interface WalletEnrollmentProps {
    /** Callback when enrollment completes */
    onComplete?: (solanaPubkey: string) => void;
    /** Callback to cancel enrollment */
    onCancel?: () => void;
    /** Optional class name */
    className?: string;
    /** Force a specific auth method (otherwise auto-detected) */
    forceAuthMethod?: ShareAAuthMethod;
}

/** Request to enroll wallet  */
export declare interface WalletEnrollRequest {
    solanaPubkey: string;
    /** Auth method for Share A encryption */
    shareAAuthMethod: ShareAAuthMethod;
    /** Encrypted Share A (base64) */
    shareACiphertext: string;
    /** Nonce for Share A encryption (base64, 12 bytes) */
    shareANonce: string;
    /** KDF salt for password/PIN method (base64) */
    shareAKdfSalt?: string;
    /** KDF params for password/PIN method */
    shareAKdfParams?: KdfParams;
    /** PRF salt for passkey method (base64, 32 bytes) */
    prfSalt?: string;
    /** Plaintext Share B (base64) - SSS math protects it */
    shareB: string;
    /**
     * Recovery data (base64) - sent when recovery mode is enabled
     * Contains the full seed for server-side storage until user acknowledges
     */
    recoveryData?: string;
}

/**
 * Orchestrates embedded wallet flows in one cohesive surface:
 * status -> enroll/unlock/recover.
 */
export declare function WalletManager({ className, showActions }: WalletManagerProps): JSX.Element;

export declare interface WalletManagerProps {
    className?: string;
    showActions?: boolean;
}

/**
 * Wallet material response from server
 * Note: Server no longer returns share ciphertexts - shares stay on server
 */
export declare interface WalletMaterialResponse {
    solanaPubkey: string;
    schemeVersion: number;
    shareAAuthMethod: ShareAAuthMethod;
    /** PRF salt for passkey auth method (base64, 32 bytes) */
    prfSalt?: string;
    createdAt: string;
    updatedAt: string;
}

/** Request to recover wallet (replace existing with new credentials) */
declare interface WalletRecoverRequest {
    /** Solana pubkey (must match existing wallet to prove ownership) */
    solanaPubkey: string;
    /** Auth method for Share A encryption */
    shareAAuthMethod: ShareAAuthMethod;
    /** Encrypted Share A (base64) */
    shareACiphertext: string;
    /** Nonce for Share A encryption (base64, 12 bytes) */
    shareANonce: string;
    /** KDF salt for password/PIN method (base64) */
    shareAKdfSalt?: string;
    /** KDF params for password/PIN method */
    shareAKdfParams?: KdfParams;
    /** PRF salt for passkey method (base64, 32 bytes) */
    prfSalt?: string;
    /** Plaintext Share B (base64) */
    shareB: string;
}

/**
 * Wallet recovery wizard
 *
 * Two-phase flow:
 * 1. Enter recovery phrase
 * 2. Enter new credential (password/passkey)
 */
export declare function WalletRecovery({ onComplete, onCancel, className, defaultAuthMethod, }: WalletRecoveryProps): JSX.Element;

export declare interface WalletRecoveryProps {
    /** Callback when recovery completes successfully */
    onComplete?: () => void;
    /** Callback when user cancels recovery */
    onCancel?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Default auth method (optional) */
    defaultAuthMethod?: ShareAAuthMethod;
}

/**
 * Wallet status indicator
 *
 * Shows current wallet state with optional action buttons.
 * Pass `status` prop to use in controlled mode (bypasses hook).
 */
export declare function WalletStatus({ status: controlledStatus, publicKey: controlledPubkey, onLock: _onLock, onEnroll, onUnlock, onRecover, showActions, compact, className, }: WalletStatusProps): JSX.Element;

/** Wallet status */
declare type WalletStatus_2 = 'loading' | 'not_enrolled' | 'enrolled_locked' | 'enrolled_unlocked' | 'unlocked' | 'error';

/** Wallet status response from server */
declare interface WalletStatusApiResponse {
    /** Whether SSS embedded wallet is enrolled */
    enrolled: boolean;
    /** Whether wallet is currently unlocked for signing */
    unlocked: boolean;
    /** Solana public key (from SSS wallet if enrolled, or external wallet if connected) */
    solanaPubkey?: string;
    /** Auth method for SSS wallet (if enrolled) */
    authMethod?: ShareAAuthMethod;
    /** Whether user signed in with external Solana wallet (not SSS) */
    hasExternalWallet: boolean;
}

export declare interface WalletStatusProps {
    /** Controlled mode: Override wallet status (for demos/stories) */
    status?: WalletStatus_2;
    /** Controlled mode: Override public key display */
    publicKey?: string;
    /** Controlled mode: Override lock state */
    onLock?: () => void;
    /** Callback when user wants to create a wallet */
    onEnroll?: () => void;
    /** Callback when user wants to unlock wallet */
    onUnlock?: () => void;
    /** Callback when user wants to recover wallet */
    onRecover?: () => void;
    /** Whether to show action buttons */
    showActions?: boolean;
    /** Compact display mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Wallet unlock form
 *
 * Simple single-credential flow:
 * - Password users: Enter password
 * - Passkey users: Authenticate with passkey
 *
 * Server validates credential and caches derived key for session signing.
 */
export declare function WalletUnlock({ onUnlock, onCancel, showCancel, authMethod: propAuthMethod, className, }: WalletUnlockProps): JSX.Element;

export declare interface WalletUnlockProps {
    /** Callback when wallet is successfully unlocked */
    onUnlock?: () => void;
    /** Callback when unlock is cancelled */
    onCancel?: () => void;
    /** Whether to show the cancel button */
    showCancel?: boolean;
    /** The wallet's auth method (if known) */
    authMethod?: ShareAAuthMethod;
    /** Additional CSS classes */
    className?: string;
}

/** Request to unlock wallet for session-based signing */
export declare interface WalletUnlockRequest {
    /** Unlock credential (flattened format) */
    credential: UnlockCredentialRequest;
}

/** Response from wallet unlock */
export declare interface WalletUnlockResponse {
    /** Whether wallet is now unlocked */
    unlocked: boolean;
    /** TTL in seconds until auto-lock */
    ttlSeconds: number;
}

export declare function WebhookSettings({ className }: WebhookSettingsProps): JSX.Element;

export declare interface WebhookSettingsProps {
    className?: string;
}

export declare function WithdrawalFlow({ onSuccess, onError, onCancel, className, }: WithdrawalFlowProps): JSX.Element | null;

export declare interface WithdrawalFlowProps {
    onSuccess?: (result: WithdrawalResponse) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
    className?: string;
}

export declare function WithdrawalHistory({ pageSize, className, onTransactionClick, explorerUrl, }: WithdrawalHistoryProps): JSX.Element;

/** Individual withdrawal history entry */
declare interface WithdrawalHistoryItem {
    id: string;
    depositSessionId: string;
    amountLamports: number;
    amountSol: number;
    txSignature: string;
    cumulativeWithdrawnLamports: number;
    cumulativeWithdrawnSol: number;
    remainingLamports: number;
    remainingSol: number;
    isFinal: boolean;
    withdrawalPercentage: number | null;
    createdAt: string;
}

export declare interface WithdrawalHistoryProps {
    /** Number of items per page (default: 10) */
    pageSize?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when a transaction row is clicked */
    onTransactionClick?: (item: UserWithdrawalHistoryItem) => void;
    /** Solana explorer base URL (default: https://solscan.io) */
    explorerUrl?: string;
}

/** Response from a withdrawal operation */
export declare interface WithdrawalResponse {
    txSignature: string;
    feeLamports: number;
}

/**
 * Types for user withdrawal operations
 */
/** Request to withdraw SOL to an external address */
export declare interface WithdrawSolRequest {
    destination: string;
    amountLamports: number;
}

/** Request to withdraw SPL tokens to an external address */
export declare interface WithdrawSplRequest {
    destination: string;
    tokenMint: string;
    amount: string;
}

export { }
