import { CreditTransactionResponse, CreditHistoryResponse } from '../../types/deposit';
/** History tab category for filtering */
export type HistoryCategory = 'all' | 'deposits' | 'usage' | 'adjustments';
export interface HistoryProps {
    /** Initially selected tab (default: 'all') */
    defaultTab?: HistoryCategory;
    /** Number of items per page (default: 10) */
    pageSize?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when history is loaded */
    onLoad?: (history: CreditHistoryResponse) => void;
    /** Callback when a transaction is clicked */
    onTransactionClick?: (transaction: CreditTransactionResponse) => void;
}
/**
 * History component with tabs
 */
export declare function History({ defaultTab, pageSize, refreshInterval, className, onLoad, onTransactionClick, }: HistoryProps): import("react/jsx-runtime").JSX.Element;
