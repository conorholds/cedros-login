import { ShareAAuthMethod } from '../../types/wallet';
export interface WalletEnrollmentProps {
    /** Callback when enrollment completes */
    onComplete?: (solanaPubkey: string) => void;
    /** Callback to cancel enrollment */
    onCancel?: () => void;
    /** Optional class name */
    className?: string;
    /** Force a specific auth method (otherwise auto-detected) */
    forceAuthMethod?: ShareAAuthMethod;
}
/**
 * Wallet enrollment wizard
 */
export declare function WalletEnrollment({ onComplete, onCancel, className, forceAuthMethod, }: WalletEnrollmentProps): import("react/jsx-runtime").JSX.Element;
