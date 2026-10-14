/**
 * Authentication method used for login/registration.
 *
 * Values must match the server `AuthMethod` enum serialization. Extension-mode
 * (wasm) servers report password-backed accounts as 'password'; the standalone
 * server reports them as 'email'.
 */
export type AuthMethod =
  | 'email'
  | 'password'
  | 'google'
  | 'apple'
  | 'solana'
  | 'webauthn'
  | 'sso';

/**
 * Email address attached to an authenticated account.
 */
export interface AuthUserEmail {
  email: string;
  verified: boolean;
  primary: boolean;
}

/**
 * Authenticated user information returned by auth APIs.
 */
export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  username?: string;
  picture?: string;
  /** MIME type for an avatar stored through the Cedros Core storage seam. */
  avatarContentType?: string;
  walletAddress?: string;
  authMethods: AuthMethod[];
  emailVerified: boolean;
  /** Whether TOTP 2FA is enabled for this user */
  totpEnabled?: boolean;
  /** All email identifiers attached to the account, when returned by the server. */
  emails?: AuthUserEmail[];
  createdAt: string;
  updatedAt: string;
  /** When the user completed the one-time welcome flow */
  welcomeCompletedAt?: string;
  /** User's unique referral code */
  referralCode?: string;
}

/**
 * JWT token pair returned from authentication when cookie auth is not used.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Authentication error response.
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Standardized error prop type for display components.
 */
export type DisplayError = AuthError | string | null;

/**
 * Server and client-normalized auth error codes.
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_EXISTS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LINK_REQUIRED'
  | 'WALLET_EXISTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'INVALID_PUBLIC_KEY'
  | 'CHALLENGE_EXPIRED'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'SIGNUP_LIMIT_REACHED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'STEP_UP_REQUIRED'
  | 'SETUP_REQUIRED'
  | 'DISPOSABLE_EMAIL_BLOCKED'
  | 'TOTP_REQUIRED'
  | 'INVALID_TOTP_CODE'
  | 'LOGIN_FAILED'
  | 'REGISTER_FAILED'
  | 'LOGOUT_FAILED'
  | 'REFRESH_FAILED'
  | 'SERVICE_UNAVAILABLE'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'WALLET_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Post-login action returned by the server after authentication.
 */
export interface PostLoginAction {
  /** Action type returned by server-managed post-login flows */
  action:
    | 'setup_mfa'
    | 'enroll_wallet'
    | 'acknowledge_recovery'
    | 'choose_username'
    | 'choose_subscription'
    | 'welcome'
    | 'complete_profile'
    | 'redirect';
  /** URL/route for redirect or welcome page */
  redirectUrl?: string;
}

/**
 * Authentication response from server.
 */
/** Discount granted by a redeemed invite code (redeem responses only). */
export interface InviteDiscount {
  /** Percent off the subscription price (1-100; 100 = free). */
  percentOff: number;
  /** Months from subscription start; null or absent means lifetime. */
  durationMonths?: number | null;
  /** The invite code that granted the discount. */
  code: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens?: TokenPair;
  isNewUser: boolean;
  callbackData?: Record<string, unknown>;
  /** API key for programmatic access, only returned for new users when enabled */
  apiKey?: string;
  /** Whether a verification email was queued when verification is required */
  emailQueued?: boolean;
  /** Post-login action such as welcome, profile completion, or redirect */
  postLogin?: PostLoginAction;
  /** True when registration pre-created the account but still needs an invite code. */
  inviteCodeRequired?: boolean;
  /** Opaque token used to redeem an invite code for the pre-created account. */
  pendingInviteToken?: string;
  /** Trusted host acceptance of the pending-account handoff; only `accepted` permits success copy. */
  inviteGateHandoffStatus?: 'accepted' | 'rejected' | 'unavailable';
  /** Subscription discount granted by the invite code just redeemed (redeem responses only). */
  inviteDiscount?: InviteDiscount | null;
  /** The auth method used for THIS login; absent on non-login responses (refresh, MFA completion) */
  method?: AuthMethod;
}

/** Authoritative Login-owned organization context for the active session. */
export interface LoginOrganizationContext {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
}

/** Authoritative mutable session state returned by GET /user. */
export interface LoginSessionContext {
  id: string;
  valid: true;
  /** Refresh-session expiry in RFC 3339 format. */
  expiresAt: string;
  /** Current access-token expiry in RFC 3339 format. */
  tokenExpiresAt: string;
}

/**
 * Published `cedros-login:user-context` response.
 *
 * Login restrictions only are returned here. Cedros Core remains authoritative
 * for site-level permissions and must not be inferred from this contract.
 */
export interface LoginUserContext {
  authenticated: true;
  user: AuthUser;
  session: LoginSessionContext;
  organization: LoginOrganizationContext | null;
  restrictions: string[];
}

/**
 * Response from POST /solana/link — wallet attached to the current account.
 */
export interface WalletLinkResponse {
  linked: 'solana';
  user: AuthUser;
}

/**
 * Solana challenge response.
 */
export interface ChallengeResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

/**
 * Authentication state.
 */
export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Password validation result.
 */
/** Stable identifier for each password rule, in display order. */
export type PasswordRequirementKey = 'minLength' | 'uppercase' | 'lowercase' | 'number' | 'special';

/** A single password rule and whether the current value satisfies it. */
export interface PasswordRequirement {
  key: PasswordRequirementKey;
  /** Localized, human-readable requirement text, such as "At least 10 characters". */
  label: string;
  /** True when the current password satisfies this rule. */
  met: boolean;
}

export interface PasswordValidation {
  isValid: boolean;
  /** All rules in display order, each flagged met or unmet for checklist rendering. */
  requirements: PasswordRequirement[];
  /** Number of satisfied requirements, from 0 to requirements.length. */
  metCount: number;
  /**
   * Display strength. Invariant: `good` and `strong` are returned only when
   * `isValid` is true, so meters cannot show a positive state for an invalid
   * password.
   */
  strength: 'weak' | 'fair' | 'good' | 'strong';
}

/**
 * Response when MFA is required to complete login.
 */
export interface MfaRequiredResponse {
  /** Indicates MFA verification is required */
  mfaRequired: true;
  /** Temporary token to use for MFA verification */
  mfaToken: string;
  /** User ID for client reference */
  userId: string;
}

/** A primary authentication attempt either completes or advances to MFA. */
export type LoginAttemptResponse = AuthResponse | MfaRequiredResponse;

/**
 * Request to complete MFA during login.
 */
export interface MfaLoginRequest {
  /** The mfaToken from the initial login response */
  mfaToken: string;
  /** TOTP code from authenticator app or recovery code */
  code: string;
}
