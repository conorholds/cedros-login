import { WalletStatus as WalletStatusType } from '../../types/wallet';
export interface WalletStatusProps {
    /** Controlled mode: Override wallet status (for demos/stories) */
    status?: WalletStatusType;
    /** Controlled mode: Override public key display */
    publicKey?: string;
    /** Controlled mode: Override lock state */
    onLock?: () => void;
    /** Callback when user wants to create a wallet */
    onEnroll?: () => void;
    /** Callback when user wants to unlock wallet */
    onUnlock?: () => void;
    /** Callback when user wants to recover wallet */
    onRecover?: () => void;
    /** Whether to show action buttons */
    showActions?: boolean;
    /** Compact display mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Wallet status indicator
 *
 * Shows current wallet state with optional action buttons.
 * Pass `status` prop to use in controlled mode (bypasses hook).
 */
export declare function WalletStatus({ status: controlledStatus, publicKey: controlledPubkey, onLock: _onLock, onEnroll, onUnlock, onRecover, showActions, compact, className, }: WalletStatusProps): import("react/jsx-runtime").JSX.Element;
