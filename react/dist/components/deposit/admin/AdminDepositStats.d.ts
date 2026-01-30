import { AdminDepositStatsResponse } from '../../../types/deposit';
export interface AdminDepositStatsProps {
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when stats are loaded */
    onLoad?: (stats: AdminDepositStatsResponse) => void;
}
/**
 * Admin deposit statistics display
 *
 * Shows total deposits, withdrawals, and pending amounts.
 */
export declare function AdminDepositStats({ refreshInterval, className, onLoad, }: AdminDepositStatsProps): import("react/jsx-runtime").JSX.Element | null;
