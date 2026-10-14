import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useDeviceAccountLink } from '../context/DeviceAccountLinkContext';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { AccountEmailApiClient } from '../utils/accountEmailApi';
import { CredentialApiClient } from '../utils/credentialApi';
import { InviteCodeApiClient } from '../utils/inviteCodeApi';
import { validateEmail } from '../utils/validation';
import { useRateLimiter } from './useRateLimiter';
import { useI18n } from '../i18n';
import type { AuthResponse, AuthError } from '../types';
import type { FriendlyAuthMessages } from '../utils/apiClient';
import type { MfaRequiredResponse } from '../types';
import { safeReturnToPath } from '../utils/returnTo';

function isMfaRequiredResponse(
  response: AuthResponse | MfaRequiredResponse
): response is MfaRequiredResponse {
  return 'mfaRequired' in response && response.mfaRequired === true;
}

/** True when the server created the account but intentionally issued no session. */
export function isEmailVerificationPending(response: AuthResponse): boolean {
  return Boolean(
    response.user.email &&
    (response.emailQueued === true ||
      (response.user.emailVerified === false && response.tokens === undefined))
  );
}

/** Result when MFA verification is required */
export interface MfaRequiredResult {
  mfaRequired: true;
  mfaToken: string;
  email: string;
  userId: string;
}

/** Result of successful login (no TOTP required or after TOTP verification) */
export interface LoginSuccessResult {
  mfaRequired: false;
  response: AuthResponse;
}

/**
 * Result when the account registered under the invite-code gate but has not
 * redeemed a code: no session is issued and the client must collect a code and
 * call `redeemInviteCode` with the returned `pendingInviteToken`.
 */
export interface InviteCodeRequiredResult {
  mfaRequired: false;
  inviteCodeRequired: true;
  pendingInviteToken: string;
  waitlistEnrollmentAccepted: boolean;
}

/** Union type for login result */
export type LoginResult = MfaRequiredResult | LoginSuccessResult | InviteCodeRequiredResult;

export interface RedeemInviteCodeOptions {
  /**
   * Skip committing the authenticated state (context user, callbacks) so the
   * caller can play a success moment first. The session cookies from the
   * response are already set either way; the caller MUST later pass the
   * response to `completeInviteRedemption` to finish the client-side login.
   */
  deferLoginSuccess?: boolean;
}

export interface UseEmailAuthReturn {
  /** Login - may return mfaRequired if 2FA is enabled */
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (
    email: string,
    password: string,
    name?: string,
    referral?: string,
    accessCode?: string
  ) => Promise<AuthResponse>;
  redeemInviteCode: (
    pendingInviteToken: string,
    code: string,
    options?: RedeemInviteCodeOptions
  ) => Promise<AuthResponse>;
  /** Commit the login state deferred by a `deferLoginSuccess` redemption. */
  completeInviteRedemption: (response: AuthResponse) => void;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
  /**
   * Number of remaining login attempts before rate limiting.
   *
   * Snapshot Behavior
   * This value is a point-in-time snapshot computed at render time.
   * It may be briefly stale during rapid requests or concurrent renders.
   * For UI display only - actual rate limiting is enforced inside login/register.
   */
  remainingAttempts: number;
  /**
   * Time in ms until rate limit resets (0 if not rate limited).
   *
   * Snapshot Behavior
   * This value is a point-in-time snapshot computed at render time.
   * It may be briefly stale - use for UI display, not for logic decisions.
   */
  timeUntilReset: number;
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
export function useEmailAuth(): UseEmailAuthReturn {
  const { config, _internal } = useCedrosLogin();
  const deviceAccountLink = useDeviceAccountLink();
  const { t, message } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const friendlyMessages = useMemo<FriendlyAuthMessages>(
    () => ({
      INVALID_CREDENTIALS: t.errors.invalidCredentials,
      EMAIL_EXISTS: t.errors.emailExists,
      EMAIL_NOT_VERIFIED: t.errors.emailNotVerified,
      INVALID_TOKEN: t.errors.sessionExpired,
      TOKEN_EXPIRED: t.errors.linkExpired,
      INVALID_SIGNATURE: t.errors.signatureRejected,
      CHALLENGE_EXPIRED: t.errors.challengeExpired,
      RATE_LIMITED: t.errors.tooManyRequests,
      SIGNUP_LIMIT_REACHED: t.errors.signupLimitReached,
      STEP_UP_REQUIRED: t.errors.stepUpRequired,
      SETUP_REQUIRED: t.errors.setupRequired,
      DISPOSABLE_EMAIL_BLOCKED: t.errors.disposableEmailBlocked,
      SERVER_ERROR: t.errors.serverError,
    }),
    [t.errors]
  );

  // Rate limiter for login attempts (5 attempts per minute)
  const {
    checkLimit,
    getRemainingAttempts,
    getTimeUntilReset,
    reset: resetRateLimit,
  } = useRateLimiter({
    maxAttempts: 5,
    windowMs: 60000,
    rateLimitMessage: (seconds) => message(t.errors.rateLimitedWithSeconds, { seconds }),
  });

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts]
  );

  const authenticatedApiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  const accountEmailClient = useMemo(
    () =>
      new AccountEmailApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  const credentialClient = useMemo(
    () =>
      new CredentialApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  const inviteCodeClient = useMemo(
    () =>
      new InviteCodeApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  const callbacks = config.callbacks;

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      // Validate email format before API call
      if (!validateEmail(email)) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.errors.invalidEmail,
        };
        setError(validationError);
        throw validationError;
      }

      // Rate limit is checked BEFORE API call intentionally.
      // This prevents brute force attacks by limiting attempt frequency,
      // not just successful request frequency.
      try {
        checkLimit();
      } catch (err) {
        const rateLimitError: AuthError = {
          code: 'RATE_LIMITED',
          message: err instanceof Error ? err.message : t.errors.tooManyRequests,
        };
        setError(rateLimitError);
        throw rateLimitError;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.post<AuthResponse | MfaRequiredResponse>('/login', {
          email,
          password,
        });

        // Check if MFA verification is required
        if (isMfaRequiredResponse(data)) {
          return {
            mfaRequired: true,
            mfaToken: data.mfaToken,
            email,
            userId: data.userId,
          };
        }

        const authResponse: AuthResponse = data;

        // Invite-code gate: a pending account that registered under the gate but
        // never redeemed. The server re-issues a fresh pending token on login so
        // the user is not dead-ended; collect a code instead of logging in.
        if (authResponse.inviteCodeRequired && authResponse.pendingInviteToken) {
          resetRateLimit();
          return {
            mfaRequired: false,
            inviteCodeRequired: true,
            pendingInviteToken: authResponse.pendingInviteToken,
            waitlistEnrollmentAccepted: authResponse.inviteGateHandoffStatus === 'accepted',
          };
        }

        // Normal login success
        callbacks?.onLoginSuccess?.(authResponse.user, 'email');
        _internal?.handleLoginSuccess(authResponse.user, authResponse.tokens);
        resetRateLimit(); // Reset on successful login
        return {
          mfaRequired: false,
          response: authResponse,
        };
      } catch (err) {
        const authError = handleApiError(err, t.errors.signInFallback, {
          friendlyMessages,
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, callbacks, _internal, checkLimit, resetRateLimit, friendlyMessages, t.errors]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name?: string,
      referral?: string,
      accessCode?: string
    ): Promise<AuthResponse> => {
      // Validate email format before API call
      if (!validateEmail(email)) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.errors.invalidEmail,
        };
        setError(validationError);
        throw validationError;
      }

      // Rate limit is checked BEFORE API call intentionally.
      // This prevents brute force attacks by limiting attempt frequency,
      // not just successful request frequency.
      try {
        checkLimit();
      } catch (err) {
        const rateLimitError: AuthError = {
          code: 'RATE_LIMITED',
          message: err instanceof Error ? err.message : t.errors.tooManyRequests,
        };
        setError(rateLimitError);
        throw rateLimitError;
      }

      setIsLoading(true);
      setError(null);

      try {
        const deviceDecision = await deviceAccountLink.requestDeviceAccountLink({
          identifier: email,
          method: 'email',
          linkExisting: async (_hint, signedInResponse) => {
            await accountEmailClient.addEmail(email);
            const credentials = await credentialClient.listCredentials();
            const hasPassword = credentials.some((cred) => cred.credentialType === 'password');
            if (!hasPassword) {
              await authenticatedApiClient.post('/set-password', { password });
            }
            return signedInResponse;
          },
        });
        if (deviceDecision.action === 'linked') {
          resetRateLimit();
          if (deviceDecision.response) return deviceDecision.response;
          throw {
            code: 'UNKNOWN_ERROR',
            message: 'Account linked. Please refresh your session.',
          } satisfies AuthError;
        }

        const effectiveReferral = referral ?? _internal?.getReferralCode?.() ?? undefined;
        const returnTo = safeReturnToPath(
          typeof window === 'undefined' ? undefined : window.location.href
        );
        const data = await apiClient.post<AuthResponse>('/register', {
          email,
          password,
          name,
          referral: effectiveReferral,
          ...(accessCode ? { accessCode } : {}),
          ...(returnTo ? { returnTo } : {}),
        });
        if (!data.inviteCodeRequired && !isEmailVerificationPending(data)) {
          callbacks?.onLoginSuccess?.(data.user, 'email');
          _internal?.handleLoginSuccess(data.user, data.tokens);
        }
        resetRateLimit(); // Reset on successful registration

        return data;
      } catch (err) {
        const authError = handleApiError(err, t.errors.registerFallback, {
          friendlyMessages,
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [
      accountEmailClient,
      apiClient,
      authenticatedApiClient,
      callbacks,
      credentialClient,
      deviceAccountLink,
      _internal,
      checkLimit,
      resetRateLimit,
      friendlyMessages,
      t.errors,
    ]
  );

  const completeInviteRedemption = useCallback(
    (data: AuthResponse) => {
      if (isEmailVerificationPending(data)) return;
      callbacks?.onLoginSuccess?.(data.user, 'email');
      _internal?.handleLoginSuccess(data.user, data.tokens);
      resetRateLimit();
    },
    [callbacks, _internal, resetRateLimit]
  );

  const redeemInviteCode = useCallback(
    async (
      pendingInviteToken: string,
      code: string,
      options?: RedeemInviteCodeOptions
    ): Promise<AuthResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await inviteCodeClient.redeem(pendingInviteToken, code);
        if (!options?.deferLoginSuccess) {
          completeInviteRedemption(data);
        }
        return data;
      } catch (err) {
        const authError = handleApiError(err, 'Unable to apply invite code', {
          friendlyMessages,
          networkMessage: t.errors.unableToReachServer,
        });
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [completeInviteRedemption, inviteCodeClient, friendlyMessages, t.errors]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    login,
    register,
    redeemInviteCode,
    completeInviteRedemption,
    isLoading,
    error,
    clearError,
    // Point-in-time snapshots for UI display (see interface JSDoc)
    remainingAttempts: getRemainingAttempts(),
    timeUntilReset: getTimeUntilReset(),
  };
}
