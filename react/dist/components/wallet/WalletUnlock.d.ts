import { ShareAAuthMethod } from '../../types/wallet';
export interface WalletUnlockProps {
    /** Callback when wallet is successfully unlocked */
    onUnlock?: () => void;
    /** Callback when unlock is cancelled */
    onCancel?: () => void;
    /** Whether to show the cancel button */
    showCancel?: boolean;
    /** The wallet's auth method (if known) */
    authMethod?: ShareAAuthMethod;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Wallet unlock form
 *
 * Simple single-credential flow:
 * - Password users: Enter password
 * - Passkey users: Authenticate with passkey
 *
 * Server validates credential and caches derived key for session signing.
 */
export declare function WalletUnlock({ onUnlock, onCancel, showCancel, authMethod: propAuthMethod, className, }: WalletUnlockProps): import("react/jsx-runtime").JSX.Element;
