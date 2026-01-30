export interface WalletAddressRowProps {
    address: string;
    label?: string;
    showCopy?: boolean;
    showExplorerLink?: boolean;
    /** If address is long, show a truncated preview with a reveal toggle. */
    allowReveal?: boolean;
    className?: string;
}
export declare function WalletAddressRow({ address, label, showCopy, showExplorerLink, allowReveal, className, }: WalletAddressRowProps): import("react/jsx-runtime").JSX.Element;
