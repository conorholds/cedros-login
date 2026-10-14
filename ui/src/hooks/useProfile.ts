import { useState, useCallback, useMemo } from 'react';
import type {
  ChangeEmailRequest,
  ChangeEmailResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UseProfileReturn,
} from '../types';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { ProfileApiClient } from '../utils/profileApi';

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
export function useProfile(): UseProfileReturn {
  const { config, authState, _internal } = useCedrosLogin();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apiClient = useMemo(
    () =>
      new ProfileApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Change the account email address.
   *
   * The server re-authenticates with the current password (when the account has
   * one), validates the new address, and queues a verification email to it. The
   * address stays unverified until the user confirms it.
   */
  const changeEmail = useCallback(
    async (data: ChangeEmailRequest): Promise<ChangeEmailResponse> => {
      if (authState !== 'authenticated') {
        throw new Error('Must be authenticated to change email');
      }
      setIsLoading(true);
      setError(null);
      try {
        return await apiClient.changeEmail(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to change email');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authState, apiClient]
  );

  /**
   * Update profile (name, picture)
   */
  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
      if (authState !== 'authenticated') {
        throw new Error('Must be authenticated to update profile');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.updateProfile(data);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update profile');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authState, apiClient]
  );

  /**
   * Change password
   *
   * Requires current password for verification. On success:
   * - All other sessions are revoked (forced re-login on other devices)
   * - Wallet Share A is re-encrypted if using password-based protection
   */
  const changePassword = useCallback(
    async (data: ChangePasswordRequest): Promise<void> => {
      if (authState !== 'authenticated') {
        throw new Error('Must be authenticated to change password');
      }

      setIsLoading(true);
      setError(null);

      try {
        await apiClient.changePassword(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to change password');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [authState, apiClient]
  );

  return {
    isLoading,
    error,
    updateProfile,
    changePassword,
    changeEmail,
    clearError,
  };
}
