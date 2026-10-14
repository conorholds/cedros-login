import type { AuthError, AuthErrorCode } from '../types';

export interface ApiErrorData {
  code?: string;
  error?: string;
  message?: string;
  detail?: string;
  details?: unknown;
  traceId?: string;
  conflict?: unknown;
}

export interface ApiErrorResponse {
  isApiError: true;
  data: ApiErrorData;
  status: number;
  retryable?: boolean;
}

export type FriendlyAuthMessages = Partial<Record<AuthErrorCode, string>>;

const FRIENDLY_MESSAGES: FriendlyAuthMessages = {
  INVALID_CREDENTIALS: 'Incorrect email or password. Please check your details and try again.',
  EMAIL_EXISTS: 'An account with this email already exists. Try signing in instead.',
  EMAIL_NOT_VERIFIED: 'Verify your email before signing in.',
  WALLET_EXISTS: 'This wallet is already linked to an account.',
  INVALID_TOKEN: 'Your session has expired. Please try again.',
  TOKEN_EXPIRED: 'This link has expired. Please request a new one.',
  INVALID_SIGNATURE: 'Wallet verification failed. Please try signing again.',
  CHALLENGE_EXPIRED: 'This verification has expired. Please try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  SIGNUP_LIMIT_REACHED: 'Registration is temporarily closed. Please try again next period.',
  STEP_UP_REQUIRED: 'Please verify your identity to continue.',
  SETUP_REQUIRED:
    'Cedros Login setup is incomplete. Finish setup in site settings, then try again.',
  DISPOSABLE_EMAIL_BLOCKED: 'Use a permanent email address to continue.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
};

const AUTH_ERROR_CODES = new Set<AuthErrorCode>([
  'INVALID_CREDENTIALS',
  'ACCOUNT_LOCKED',
  'EMAIL_EXISTS',
  'EMAIL_NOT_VERIFIED',
  'ACCOUNT_LINK_REQUIRED',
  'WALLET_EXISTS',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'INVALID_SIGNATURE',
  'INVALID_PUBLIC_KEY',
  'CHALLENGE_EXPIRED',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'SIGNUP_LIMIT_REACHED',
  'NOT_FOUND',
  'FORBIDDEN',
  'UNAUTHORIZED',
  'STEP_UP_REQUIRED',
  'SETUP_REQUIRED',
  'DISPOSABLE_EMAIL_BLOCKED',
  'TOTP_REQUIRED',
  'INVALID_TOTP_CODE',
  'LOGIN_FAILED',
  'REGISTER_FAILED',
  'LOGOUT_FAILED',
  'REFRESH_FAILED',
  'SERVICE_UNAVAILABLE',
  'SERVER_ERROR',
  'NETWORK_ERROR',
  'WALLET_ERROR',
  'UNKNOWN_ERROR',
]);

const ERROR_CODE_ALIASES: Record<string, AuthErrorCode> = {
  account_locked: 'ACCOUNT_LOCKED',
  challenge_expired: 'CHALLENGE_EXPIRED',
  db_error: 'SERVER_ERROR',
  email_exists: 'EMAIL_EXISTS',
  email_not_verified: 'EMAIL_NOT_VERIFIED',
  encoding_error: 'SERVER_ERROR',
  forbidden: 'FORBIDDEN',
  internal_error: 'SERVER_ERROR',
  invalid_credentials: 'INVALID_CREDENTIALS',
  invalid_signature: 'INVALID_SIGNATURE',
  invalid_token: 'INVALID_TOKEN',
  not_found: 'NOT_FOUND',
  secrets_error: 'SERVER_ERROR',
  signup_limit_reached: 'SIGNUP_LIMIT_REACHED',
  service_unavailable: 'SERVICE_UNAVAILABLE',
  settings_error: 'SERVER_ERROR',
  setup_required: 'SETUP_REQUIRED',
  token_expired: 'TOKEN_EXPIRED',
  unauthenticated: 'UNAUTHORIZED',
  unauthorized: 'UNAUTHORIZED',
  validation_failed: 'VALIDATION_ERROR',
  wallet_exists: 'WALLET_EXISTS',
};

export interface HandleApiErrorOptions {
  friendlyMessages?: FriendlyAuthMessages;
  networkMessage?: string;
  timeoutMessage?: string;
}

function createAuthError(
  data: ApiErrorData,
  fallbackMessage: string,
  friendlyMessages: FriendlyAuthMessages = FRIENDLY_MESSAGES
): AuthError {
  const code = authErrorCodeFrom(data.code ?? data.error);
  const detailsMessage = messageFromDetails(data.details);
  return {
    code,
    message:
      friendlyMessages[code] ?? data.message ?? data.detail ?? detailsMessage ?? fallbackMessage,
    ...(isDetailsRecord(data.details) ? { details: data.details } : {}),
  };
}

function createNetworkError(
  message = 'Unable to reach the server. Check your connection and try again.'
): AuthError {
  return {
    code: 'NETWORK_ERROR',
    message,
  };
}

export function handleApiError(
  err: unknown,
  fallbackMessage: string,
  options: HandleApiErrorOptions = {}
): AuthError {
  // DOMException carries a numeric `code`, so recognize timeouts before the
  // structural AuthError check can mistake it for a server error.
  if (typeof err === 'object' && err !== null && 'name' in err && err.name === 'AbortError') {
    return {
      code: 'NETWORK_ERROR',
      message:
        options.timeoutMessage ?? 'The request timed out. Check your connection and try again.',
    };
  }
  if (isAuthError(err)) return err;

  if (isApiErrorResponse(err)) {
    const authError = createAuthError(err.data, fallbackMessage, options.friendlyMessages);
    return Object.assign(authError, {
      status: err.status,
      data: {
        ...err.data,
        message: err.data.message ?? err.data.detail ?? authError.message,
      },
    });
  }

  if (err instanceof Error) {
    if (
      err.message.startsWith('Server error:') ||
      err.message.startsWith('Invalid JSON response')
    ) {
      return {
        code: 'SERVER_ERROR',
        message: fallbackMessage,
      };
    }
  }

  return createNetworkError(options.networkMessage);
}

export function isApiErrorResponse(err: unknown): err is ApiErrorResponse {
  return typeof err === 'object' && err !== null && 'isApiError' in err;
}

function authErrorCodeFrom(raw?: string): AuthErrorCode {
  if (!raw) return 'SERVER_ERROR';
  const alias = ERROR_CODE_ALIASES[raw] ?? ERROR_CODE_ALIASES[raw.toLowerCase()];
  if (alias) return alias;
  const upper = raw.toUpperCase() as AuthErrorCode;
  return AUTH_ERROR_CODES.has(upper) ? upper : 'SERVER_ERROR';
}

function messageFromDetails(details: unknown): string | undefined {
  if (!Array.isArray(details)) return undefined;
  const messages = details.filter((item): item is string => typeof item === 'string');
  return messages.length > 0 ? messages.join('. ') : undefined;
}

function isDetailsRecord(details: unknown): details is Record<string, unknown> {
  return typeof details === 'object' && details !== null && !Array.isArray(details);
}

function isAuthError(err: unknown): err is AuthError {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
}
