import { useCallback, useMemo, useState } from "react";
import { useProviderAuthApi } from "../context/ApiServicesContext";
import { useCedrosLogin } from "../context/CedrosLoginProvider";
import { buildAccountDeletionUrl } from "../utils";
import type { AuthError } from "../types";

const DELETE_CONFIRM_TEXT = "DELETE";

export interface UseAccountDeletionReturn {
  deleteAccount: (confirmText?: string) => Promise<void>;
  requestDeletionEmail: (email: string) => Promise<void>;
  accountDeletionUrl: string;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useAccountDeletion(): UseAccountDeletionReturn {
  const { config, logout } = useCedrosLogin();
  const authApi = useProviderAuthApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const accountDeletionUrl = useMemo(
    () => buildAccountDeletionUrl(config),
    [config],
  );

  const deleteAccount = useCallback(
    async (confirmText = DELETE_CONFIRM_TEXT): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await authApi.deleteCurrentAccount(confirmText);
        await logout().catch(() => undefined);
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "SERVER_ERROR", message: err.message }
            : {
                code: "SERVER_ERROR",
                message: "Account deletion failed",
              };
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [authApi, logout],
  );

  const requestDeletionEmail = useCallback(
    async (email: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await authApi.requestAccountDeletion(email);
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "SERVER_ERROR", message: err.message }
            : {
                code: "SERVER_ERROR",
                message: "Unable to request account deletion",
              };
        setError(authError);
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [authApi],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deleteAccount,
    requestDeletionEmail,
    accountDeletionUrl,
    isLoading,
    error,
    clearError,
  };
}
