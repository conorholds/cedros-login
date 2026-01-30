import { AdminDepositItem, AdminDepositListResponse } from '../../../types/deposit';
export interface AdminPrivacyPeriodDepositsProps {
    /** Number of items per page (default: 20) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when list is loaded */
    onLoad?: (response: AdminDepositListResponse) => void;
    /** Callback when a deposit item is clicked */
    onItemClick?: (item: AdminDepositItem) => void;
}
/**
 * Admin privacy period deposits display
 *
 * Shows deposits that are still in the privacy period (not yet available for withdrawal).
 */
export declare function AdminPrivacyPeriodDeposits({ pageSize, refreshInterval, className, onLoad, onItemClick, }: AdminPrivacyPeriodDepositsProps): import("react/jsx-runtime").JSX.Element;
