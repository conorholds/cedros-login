import type { AuthMethod } from './auth';

/**
 * Admin view of a user (includes more details than regular user)
 */
export interface AdminUser {
  id: string;
  email?: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  walletAddress?: string;
  googleId?: string;
  authMethods: AuthMethod[];
  status?: 'active' | 'suspended';
  suspendedAt?: string;
  isSystemAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  /** Last login timestamp (ISO 8601) */
  lastLoginAt?: string;
  /** User's referral code */
  referralCode?: string;
  /** ID of the user who referred this user */
  referredBy?: string;
  /** Number of users this user has referred */
  referralCount?: number;
}

/**
 * Response for listing users (admin)
 */
export interface ListAdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Request to update a user's system admin status
 */
export interface SetSystemAdminRequest {
  isAdmin: boolean;
}

/**
 * Request to update a user's profile (admin)
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  suspended?: boolean;
}

/**
 * Query params for listing users
 */
export interface ListUsersParams {
  limit?: number;
  offset?: number;
}

/**
 * Admin user statistics by auth method
 */
export interface AdminUserStatsResponse {
  /** Total number of users */
  total: number;
  /** Accounts with a verified email (backs the verified-account rate) */
  verified: number;
  /** New accounts created in the trailing 7 days (user-growth signal) */
  newAccounts7d: number;
  /** New accounts created in the trailing 30 days */
  newAccounts30d: number;
  /** Count by auth method (e.g., { email: 50, google: 25, solana: 10 }) */
  authMethodCounts: Record<string, number>;
}

/**
 * Hook return type
 */
export interface UseAdminUsersReturn {
  users: AdminUser[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  listUsers: (params?: ListUsersParams) => Promise<ListAdminUsersResponse>;
  getUser: (userId: string) => Promise<AdminUser>;
  setSystemAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
  updateUser: (userId: string, data: UpdateUserRequest) => Promise<AdminUser>;
  deleteUser: (userId: string) => Promise<void>;
  forcePasswordReset: (userId: string) => Promise<void>;
  getStats: () => Promise<AdminUserStatsResponse>;
  refresh: () => Promise<void>;
  clearError: () => void;
}
