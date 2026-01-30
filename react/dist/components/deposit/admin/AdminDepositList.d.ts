import { AdminDepositItem, AdminDepositListResponse } from '../../../types/deposit';
export interface AdminDepositListProps {
    /** Filter by status (comma-separated) */
    statusFilter?: string;
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a deposit is clicked */
    onDepositClick?: (deposit: AdminDepositItem) => void;
}
/**
 * Admin deposit list display
 *
 * Shows paginated list of all deposits with user info.
 */
export declare function AdminDepositList({ statusFilter, pageSize, refreshInterval, className, onLoad, onDepositClick, }: AdminDepositListProps): import("react/jsx-runtime").JSX.Element;
