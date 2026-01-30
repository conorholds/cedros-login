import { CreditBalanceResponse } from '../../types/deposit';
export interface CreditBalanceProps {
    /** Show only SOL balance (default) or all currencies */
    showAllCurrencies?: boolean;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Compact display mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Callback when balance is loaded */
    onLoad?: (balance: CreditBalanceResponse[]) => void;
}
/**
 * Credit balance display
 *
 * Shows the user's credit balance. Supports auto-refresh.
 */
export declare function CreditBalance({ showAllCurrencies, refreshInterval, compact, className, onLoad, }: CreditBalanceProps): import("react/jsx-runtime").JSX.Element;
