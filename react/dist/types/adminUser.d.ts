import { AuthMethod } from './auth';
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
    isSystemAdmin: boolean;
    createdAt: string;
    updatedAt: string;
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
}
/**
 * Request to adjust a user's credits (admin)
 */
export interface AdjustCreditsRequest {
    amount: number;
    reason: string;
}
/**
 * Query params for listing users
 */
export interface ListUsersParams {
    limit?: number;
    offset?: number;
}
/**
 * Credit transaction item for admin user detail
 */
export interface AdminCreditTransactionItem {
    id: string;
    amountLamports: number;
    currency: string;
    txType: string;
    referenceType?: string;
    createdAt: string;
}
/**
 * Credit stats for a specific user
 */
export interface AdminUserCreditStats {
    currency: string;
    totalDepositedLamports: number;
    totalDepositedSol: number;
    totalSpentLamports: number;
    totalSpentSol: number;
    totalRefundsLamports: number;
    totalRefundsSol: number;
    currentBalanceLamports: number;
    currentBalanceSol: number;
    depositCount: number;
    spendCount: number;
}
/**
 * Response for user credits (stats + transactions)
 */
export interface AdminUserCreditsResponse {
    stats: AdminUserCreditStats;
    transactions: AdminCreditTransactionItem[];
    totalTransactions: number;
    limit: number;
    offset: number;
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
    adjustCredits: (userId: string, amount: number, reason: string) => Promise<void>;
    getUserDeposits: (userId: string, params?: ListUsersParams) => Promise<import('./deposit').AdminDepositListResponse>;
    getUserCredits: (userId: string, params?: ListUsersParams) => Promise<AdminUserCreditsResponse>;
    getUserWithdrawalHistory: (userId: string, params?: ListUsersParams) => Promise<import('./deposit').AdminUserWithdrawalHistoryResponse>;
    refresh: () => Promise<void>;
    clearError: () => void;
}
