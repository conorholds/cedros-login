import { AdminUser } from '../../types';
export interface AdminUserDetailProps {
    /** User ID to display */
    userId: string;
    /** Callback when back button is clicked */
    onBack: () => void;
    /** Current user's ID (to prevent self-demotion) */
    currentUserId?: string;
    /** Callback when edit is clicked (parent handles modal) */
    onEditUser?: (user: AdminUser) => void;
    /** Callback when credits adjustment is clicked (parent handles modal) */
    onAdjustCredits?: (user: AdminUser) => void;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Admin user detail display
 *
 * Shows comprehensive user information with deposit and credit history.
 */
export declare function AdminUserDetail({ userId, onBack, currentUserId, onEditUser, onAdjustCredits, className, }: AdminUserDetailProps): import("react/jsx-runtime").JSX.Element;
