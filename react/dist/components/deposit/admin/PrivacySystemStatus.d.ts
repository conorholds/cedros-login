import { PrivacyStatusResponse } from '../../../types/deposit';
export interface PrivacySystemStatusProps {
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
    /** Additional CSS classes */
    className?: string;
    /** Callback when status is loaded */
    onLoad?: (status: PrivacyStatusResponse) => void;
}
/**
 * Privacy Cash system status display
 *
 * Shows configuration including partial withdrawal settings for timing analysis protection.
 */
export declare function PrivacySystemStatus({ refreshInterval, className, onLoad, }: PrivacySystemStatusProps): import("react/jsx-runtime").JSX.Element | null;
