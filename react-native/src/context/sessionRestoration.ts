import type { AuthUser } from "../types";
import type AuthApi from "../services/api/auth";

type SessionAuthApi = Pick<AuthApi, "getTokenManager" | "getRequest">;

/** Restore a persisted mobile session without mutating React state directly. */
export async function restorePersistedSession(
  authApi: SessionAuthApi,
  isActive: () => boolean = () => true,
): Promise<AuthUser | null> {
  const tokenManager = authApi.getTokenManager();
  await tokenManager.hydrate();
  if (!isActive()) return null;

  if (!tokenManager.getAccessToken() && tokenManager.getRefreshToken()) {
    try {
      await tokenManager.refreshTokens();
    } catch (error) {
      if (isActive()) {
        await tokenManager.expireSession().catch(() => undefined);
      }
      throw error;
    }
  }
  if (!isActive() || !tokenManager.getAccessToken()) return null;

  const response = await authApi.getRequest<{ user?: AuthUser }>("/auth/user");
  return isActive() ? (response.data.user ?? null) : null;
}
