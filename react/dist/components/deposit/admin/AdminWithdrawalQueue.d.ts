import { AdminDepositItem, AdminDepositListResponse, ProcessWithdrawalResponse, ProcessAllWithdrawalsResponse } from '../../../types/deposit';
export interface AdminWithdrawalQueueProps {
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
    /** Callback when a withdrawal is processed */
    onWithdrawalProcessed?: (response: ProcessWithdrawalResponse) => void;
    /** Callback when all withdrawals are processed */
    onAllProcessed?: (response: ProcessAllWithdrawalsResponse) => void;
}
/**
 * Admin withdrawal queue display
 *
 * Shows deposits ready for withdrawal processing with action buttons.
 */
export declare function AdminWithdrawalQueue({ pageSize, refreshInterval, className, onLoad, onItemClick, onWithdrawalProcessed, onAllProcessed, }: AdminWithdrawalQueueProps): import("react/jsx-runtime").JSX.Element;
