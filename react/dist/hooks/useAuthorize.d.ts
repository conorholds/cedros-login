import { AuthorizeRequest, AuthError } from '../types';
export interface AuthorizationCheck {
    allowed: boolean;
    reason?: string;
    isLoading: boolean;
    error: AuthError | null;
}
export interface UseAuthorizeReturn {
    /**
     * Check if an action is authorized server-side.
     * Use this for dynamic authorization checks.
     */
    authorize: (request: AuthorizeRequest) => Promise<boolean>;
    /**
     * Authorization state for the last check
     */
    lastCheck: AuthorizationCheck;
    /**
     * Clear the last authorization check
     */
    clearCheck: () => void;
    /**
     * Check authorization and return detailed result
     */
    checkAuthorization: (request: AuthorizeRequest) => Promise<AuthorizationCheck>;
}
/**
 * Hook for server-side authorization checks.
 *
 * This hook allows you to check if a specific action is authorized
 * by making a request to the server's /authorize endpoint.
 *
 * For simple permission checks based on the user's role, use `useOrgs().hasPermission()` instead.
 *
 * @example
 * ```tsx
 * function DeleteButton({ resourceId }: { resourceId: string }) {
 *   const { authorize, lastCheck } = useAuthorize();
 *   const { activeOrg } = useOrgs();
 *
 *   const handleDelete = async () => {
 *     const allowed = await authorize({
 *       orgId: activeOrg?.id!,
 *       action: 'delete',
 *       resource: 'document',
 *       resourceId,
 *     });
 *
 *     if (allowed) {
 *       // Proceed with delete
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={lastCheck.isLoading}>
 *       Delete
 *     </button>
 *   );
 * }
 * ```
 */
export declare function useAuthorize(): UseAuthorizeReturn;
