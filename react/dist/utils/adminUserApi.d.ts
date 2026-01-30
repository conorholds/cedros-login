import { AdminUser, AdminUserCreditsResponse, AdjustCreditsRequest, ListAdminUsersResponse, ListUsersParams, UpdateUserRequest } from '../types';
import { AdminDepositListResponse, AdminUserWithdrawalHistoryResponse } from '../types/deposit';
/**
 * API client for admin user operations
 *
 * Requires system admin privileges.
 */
export declare class AdminUserApiClient {
    private client;
    constructor(baseUrl: string, timeoutMs?: number, retryAttempts?: number, getAccessToken?: () => string | null);
    /**
     * List all users in the system
     */
    listUsers(params?: ListUsersParams): Promise<ListAdminUsersResponse>;
    /**
     * Get a specific user by ID
     */
    getUser(userId: string): Promise<AdminUser>;
    /**
     * Set a user's system admin status
     */
    setSystemAdmin(userId: string, isAdmin: boolean): Promise<void>;
    /**
     * Update a user's profile
     */
    updateUser(userId: string, data: UpdateUserRequest): Promise<AdminUser>;
    /**
     * Delete a user
     */
    deleteUser(userId: string): Promise<void>;
    /**
     * Send a password reset email to a user
     */
    forcePasswordReset(userId: string): Promise<void>;
    /**
     * Adjust a user's credits
     */
    adjustCredits(userId: string, data: AdjustCreditsRequest): Promise<void>;
    /**
     * Get a user's deposit history
     */
    getUserDeposits(userId: string, params?: ListUsersParams): Promise<AdminDepositListResponse>;
    /**
     * Get a user's credit stats and transaction history
     */
    getUserCredits(userId: string, params?: ListUsersParams): Promise<AdminUserCreditsResponse>;
    /**
     * Get a user's withdrawal history
     */
    getUserWithdrawalHistory(userId: string, params?: ListUsersParams): Promise<AdminUserWithdrawalHistoryResponse>;
}
