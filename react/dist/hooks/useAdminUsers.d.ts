import { UseAdminUsersReturn } from '../types';
/**
 * Hook for admin user management operations
 *
 * Provides methods to list all users, get individual users,
 * and manage system admin status. Requires system admin privileges.
 *
 * @example
 * ```tsx
 * function UserManagement() {
 *   const { users, total, isLoading, listUsers, setSystemAdmin } = useAdminUsers();
 *
 *   useEffect(() => {
 *     listUsers({ limit: 20 });
 *   }, [listUsers]);
 *
 *   return (
 *     <AdminUserList
 *       users={users}
 *       total={total}
 *       isLoading={isLoading}
 *       onToggleAdmin={(userId, isAdmin) => setSystemAdmin(userId, isAdmin)}
 *     />
 *   );
 * }
 * ```
 */
export declare function useAdminUsers(): UseAdminUsersReturn;
