import type { Session, ListSessionsResponse, RevokeAllSessionsResponse } from '../types';
import { ApiClient, handleApiError } from './apiClient';

/** API client for session management operations. */
export class SessionApiClient {
  private client: ApiClient;

  constructor(
    baseUrl: string,
    timeoutMs?: number,
    retryAttempts?: number,
    getAccessToken?: () => string | null
  ) {
    this.client = new ApiClient({ baseUrl, timeoutMs, retryAttempts, getAccessToken });
  }

  /** List all active sessions, including subsequent standalone-server pages. */
  async listSessions(forceRefresh = false): Promise<Session[]> {
    try {
      const sessions = new Map<string, Session>();
      let offset = 0;
      let total: number | undefined;
      do {
        const response = parseSessionPage(
          await this.client.get<unknown>(
            offset === 0 ? '/sessions' : `/sessions?offset=${offset}`,
            { cacheTtlMs: 1_000, forceRefresh }
          )
        );
        if (response.offset !== offset) throw invalidSessionResponse();
        // Bound this traversal by the initial total, even if new logins arrive.
        total ??= response.total;
        total = Math.min(total, response.total);
        for (const session of response.sessions) {
          if (sessions.has(session.id)) throw invalidSessionResponse();
          sessions.set(session.id, session);
        }
        if (response.sessions.length === 0 && offset < total) throw invalidSessionResponse();
        offset += response.sessions.length;
      } while (offset < total);
      const result = [...sessions.values()];
      if (result.filter((session) => session.isCurrent).length > 1) throw invalidSessionResponse();
      return result;
    } catch (error) {
      throw handleApiError(error, 'Failed to list sessions');
    }
  }

  /** Revoke all other sessions, preserving the session authorizing the request. */
  async revokeAllSessions(): Promise<RevokeAllSessionsResponse> {
    try {
      const data = await this.client.delete<unknown>('/sessions');
      if (!isRecord(data) || !isCount(data.revokedCount) || typeof data.message !== 'string') {
        throw invalidSessionResponse();
      }
      return { revokedCount: data.revokedCount, message: data.message };
    } catch (error) {
      throw handleApiError(error, 'Failed to revoke sessions');
    }
  }
}

function invalidSessionResponse() {
  return {
    code: 'SERVER_ERROR',
    message: 'Could not verify session data. Please refresh and try again.',
  };
}

function isRecord(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function parseSessionPage(data: unknown): ListSessionsResponse {
  if (!isRecord(data) || !Array.isArray(data.sessions) || !isCount(data.total)) {
    throw invalidSessionResponse();
  }
  const sessions = data.sessions.map(parseSession);
  // Extension versions before pagination metadata returned the complete list.
  const limit = data.limit ?? sessions.length;
  const offset = data.offset ?? 0;
  if (
    !isCount(limit) ||
    !isCount(offset) ||
    sessions.length > limit ||
    sessions.length > data.total
  ) {
    throw invalidSessionResponse();
  }
  return { sessions, total: data.total, limit, offset };
}

function parseSession(data: unknown): Session {
  if (!isRecord(data)) throw invalidSessionResponse();
  // Older extension archives called this field `current`.
  const isCurrent = data.isCurrent ?? data.current;
  if (
    typeof data.id !== 'string' ||
    !data.id ||
    typeof isCurrent !== 'boolean' ||
    typeof data.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(data.createdAt)) ||
    typeof data.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(data.expiresAt)) ||
    (data.ipAddress != null && typeof data.ipAddress !== 'string') ||
    (data.userAgent != null && typeof data.userAgent !== 'string')
  ) {
    throw invalidSessionResponse();
  }
  return {
    id: data.id,
    isCurrent,
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    ...(typeof data.ipAddress === 'string' ? { ipAddress: data.ipAddress } : {}),
    ...(typeof data.userAgent === 'string' ? { userAgent: data.userAgent } : {}),
  };
}
