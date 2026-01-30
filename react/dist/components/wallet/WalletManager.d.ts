export interface WalletManagerProps {
    className?: string;
    showActions?: boolean;
}
/**
 * Orchestrates embedded wallet flows in one cohesive surface:
 * status -> enroll/unlock/recover.
 */
export declare function WalletManager({ className, showActions }: WalletManagerProps): import("react/jsx-runtime").JSX.Element;
