import { useState, useCallback, useMemo } from 'react';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { useTranslations } from '../i18n';
import type {
  AuthError,
  TotpStatus,
  TotpSetupResponse,
  TotpBackupCodesResponse,
  TotpDisableRequest,
  TotpSetupState,
} from '../types';

export interface UseTotpReturn {
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
  /** Disable TOTP with password or a passwordless MFA factor */
  disableTotp: (confirmation: string | TotpDisableRequest) => Promise<void>;
  /** Regenerate recovery codes (requires current authenticator code) */
  regenerateBackupCodes: (code: string) => Promise<TotpBackupCodesResponse>;
  /** Clear error state */
  clearError: () => void;
  /** Reset to initial state */
  reset: () => void;
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
export function useTotp(): UseTotpReturn {
  const { config, _internal } = useCedrosLogin();
  const t = useTranslations();
  const [status, setStatus] = useState<TotpStatus | null>(null);
  const [setupState, setSetupState] = useState<TotpSetupState>('idle');
  const [setupData, setSetupData] = useState<TotpSetupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
        getAccessToken: _internal?.getAccessToken,
      }),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  const getStatus = useCallback(async (): Promise<TotpStatus> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.get<TotpStatus>('/mfa/status');
      setStatus(result);
      return result;
    } catch (err) {
      const authError = handleApiError(err, t.auth.loadTotpStatusFailed);
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, t.auth.loadTotpStatusFailed]);

  const beginSetup = useCallback(async (): Promise<TotpSetupResponse> => {
    setIsLoading(true);
    setError(null);
    setSetupState('loading');

    try {
      const result = await apiClient.post<TotpSetupResponse>('/mfa/setup', {});
      setSetupData(result);
      setSetupState('setup');
      return result;
    } catch (err) {
      const authError = handleApiError(err, t.auth.startTotpSetupFailed);
      setError(authError);
      setSetupState('error');
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, t.auth.startTotpSetupFailed]);

  const enableTotp = useCallback(
    async (code: string): Promise<void> => {
      if (!/^\d{6}$/.test(code)) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.auth.enterSixDigitCode,
        };
        setError(validationError);
        throw validationError;
      }

      setIsLoading(true);
      setError(null);
      setSetupState('verifying');

      try {
        await apiClient.post('/mfa/enable', { code });
        setSetupState('success');
        // Fetch fresh status from server instead of using local state count
        try {
          const freshStatus = await apiClient.get<TotpStatus>('/mfa/status');
          setStatus(freshStatus);
        } catch {
          // Fallback to a known-enabled state if the status fetch fails
          setStatus({ enabled: true, recoveryCodesRemaining: 0 });
        }
      } catch (err) {
        const authError = handleApiError(err, t.auth.incorrectVerificationCode);
        setError(authError);
        setSetupState('error');
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, t.auth.enterSixDigitCode, t.auth.incorrectVerificationCode]
  );

  const disableTotp = useCallback(
    async (confirmation: string | TotpDisableRequest): Promise<void> => {
      const body = typeof confirmation === 'string' ? { password: confirmation } : confirmation;
      const hasConfirmation = Object.values(body).some(
        (value) => typeof value === 'string' && value.trim().length > 0
      );
      if (!hasConfirmation) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.auth.enterPassword,
        };
        setError(validationError);
        throw validationError;
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClient.post('/mfa/disable', body);
        setStatus((current) => ({
          enabled: false,
          recoveryCodesRemaining: 0,
          ...(current?.disableMethods ? { disableMethods: current.disableMethods } : {}),
        }));
        setSetupData(null);
        setSetupState('idle');
      } catch (err) {
        const authError = handleApiError(err, t.auth.disableTotpFailed);
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, t.auth.enterPassword, t.auth.disableTotpFailed]
  );

  const regenerateBackupCodes = useCallback(
    async (code: string): Promise<TotpBackupCodesResponse> => {
      if (!/^\d{6}$/.test(code)) {
        const validationError: AuthError = {
          code: 'VALIDATION_ERROR',
          message: t.auth.enterSixDigitCode,
        };
        setError(validationError);
        throw validationError;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiClient.post<TotpBackupCodesResponse>(
          '/mfa/recovery-codes/regenerate',
          { code }
        );
        return result;
      } catch (err) {
        const authError = handleApiError(err, t.auth.regenerateCodesFailed);
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, t.auth.enterSixDigitCode, t.auth.regenerateCodesFailed]
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setError(null);
    setSetupData(null);
    setSetupState('idle');
    setIsLoading(false);
  }, []);

  return {
    status,
    setupState,
    setupData,
    isLoading,
    error,
    getStatus,
    beginSetup,
    enableTotp,
    disableTotp,
    regenerateBackupCodes,
    clearError,
    reset,
  };
}
