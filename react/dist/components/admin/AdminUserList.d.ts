import { AdminUser, ListAdminUsersResponse } from '../../types';
export interface AdminUserListProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Current user's ID (to prevent self-demotion) */
    currentUserId?: string;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: ListAdminUsersResponse) => void;
    /** Callback when a user is clicked */
    onUserClick?: (user: AdminUser) => void;
    /** Callback when edit is clicked (parent handles modal) */
    onEditUser?: (user: AdminUser) => void;
    /** Callback when credits adjustment is clicked (parent handles modal) */
    onAdjustCredits?: (user: AdminUser) => void;
}
/**
 * Admin user list display
 *
 * Shows all registered users with their auth methods and admin status.
 */
export declare function AdminUserList({ pageSize, refreshInterval, currentUserId, className, onLoad, onUserClick, onEditUser, onAdjustCredits, }: AdminUserListProps): import("react/jsx-runtime").JSX.Element;
