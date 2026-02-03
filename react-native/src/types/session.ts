/**
 * Active session information
 */
export interface Session {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  /** Whether this is the current session */
  isCurrent: boolean;
}

/**
 * Response from listing sessions
 */
export interface ListSessionsResponse {
  sessions: Session[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Response from revoking all sessions
 */
export interface RevokeAllSessionsResponse {
  revokedCount: number;
  message: string;
}
