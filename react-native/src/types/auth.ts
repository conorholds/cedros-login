/**
 * Authentication method used for login/registration
 * TYPE-01: Must match backend AuthMethod enum in server/src/models/mod.rs
 */
export type AuthMethod = 'email' | 'google' | 'apple' | 'solana' | 'webauthn' | 'sso';

/**
 * Authenticated user information
 */
export interface AuthUser {
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
 * JWT token pair returned from authentication
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Authentication error response
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
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
export type DisplayError = AuthError | string | null;

/**
 * Standard error codes
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_EXISTS'
  | 'WALLET_EXISTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'INVALID_PUBLIC_KEY'
  | 'CHALLENGE_EXPIRED'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'STEP_UP_REQUIRED'
  | 'TOTP_REQUIRED'
  | 'INVALID_TOTP_CODE'
  | 'LOGIN_FAILED'
  | 'REGISTER_FAILED'
  | 'LOGOUT_FAILED'
  | 'REFRESH_FAILED'
  | 'SERVICE_UNAVAILABLE'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Authentication response from server
 */
export interface AuthResponse {
  user: AuthUser;
  tokens?: TokenPair;
  isNewUser: boolean;
  callbackData?: Record<string, unknown>;
}

/**
 * Solana challenge response
 */
export interface ChallengeResponse {
  nonce: string;
  message: string;
  expiresAt: string;
}

/**
 * Authentication state
 */
export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Password validation result
 */
export interface PasswordValidation {
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
 * TYPE-03: Response when MFA is required to complete login
 *
 * When a user with MFA enabled logs in with valid credentials,
 * the server returns this response instead of full tokens.
 * The client must then call /auth/login/mfa with the mfaToken and TOTP code.
 */
export interface MfaRequiredResponse {
  /** Indicates MFA verification is required (always true) */
  mfaRequired: true;
  /** Temporary token to use for MFA verification (short-lived, ~5 min) */
  mfaToken: string;
  /** User ID (for client reference, e.g., showing "Hi, <user>") */
  userId: string;
}

/**
 * TYPE-03: Request to complete MFA during login
 *
 * After receiving MfaRequiredResponse, call POST /auth/login/mfa with this request.
 */
export interface MfaLoginRequest {
  /** The mfaToken from the initial login response */
  mfaToken: string;
  /** TOTP code from authenticator app (6 digits) */
  code: string;
}
