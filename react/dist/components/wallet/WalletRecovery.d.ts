import { ShareAAuthMethod } from '../../types/wallet';
export interface WalletRecoveryProps {
    /** Callback when recovery completes successfully */
    onComplete?: () => void;
    /** Callback when user cancels recovery */
    onCancel?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Default auth method (optional) */
    defaultAuthMethod?: ShareAAuthMethod;
}
/**
 * Wallet recovery wizard
 *
 * Two-phase flow:
 * 1. Enter recovery phrase
 * 2. Enter new credential (password/passkey)
 */
export declare function WalletRecovery({ onComplete, onCancel, className, defaultAuthMethod, }: WalletRecoveryProps): import("react/jsx-runtime").JSX.Element;
