import { AdminDepositItem, AdminDepositListResponse } from '../../../types/deposit';
export interface AdminWithdrawalHistoryProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a withdrawal item is clicked */
    onItemClick?: (item: AdminDepositItem) => void;
}
/**
 * Admin withdrawal history display
 *
 * Shows deposits that have been fully withdrawn.
 */
export declare function AdminWithdrawalHistory({ pageSize, refreshInterval, className, onLoad, onItemClick, }: AdminWithdrawalHistoryProps): import("react/jsx-runtime").JSX.Element;
