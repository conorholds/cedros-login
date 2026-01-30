export interface SolanaLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /**
     * Hide the button if no Solana wallets are detected.
     * When true (default), button renders nothing if no wallets are installed.
     * When false, button always renders (useful for showing "install wallet" prompts).
     * @default true
     */
    hideIfNoWallet?: boolean;
    /**
     * Solana wallet adapter context. Pass this from @solana/wallet-adapter-react's useWallet().
     * The button will handle connection and signing automatically for a one-click experience.
     */
    walletContext?: {
        publicKey: {
            toBase58: () => string;
        } | null;
        signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | null;
        connected: boolean;
        connecting: boolean;
        connect: () => Promise<void>;
        wallet: {
            adapter: {
                name: string;
            };
        } | null;
        select: (walletName: string) => void;
        wallets: Array<{
            adapter: {
                name: string;
                icon: string;
                readyState: string;
            };
        }>;
    };
}
/**
 * Solana wallet login button with one-click authentication.
 *
 * Handles wallet connection and message signing automatically.
 * If wallet is already connected, signs immediately.
 * If not connected, connects first then auto-signs.
 */
export declare function SolanaLoginButton({ onSuccess, onError, className, variant, size, disabled, hideIfNoWallet, walletContext, }: SolanaLoginButtonProps): import("react/jsx-runtime").JSX.Element | null;
