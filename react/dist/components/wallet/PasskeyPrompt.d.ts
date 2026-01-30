/**
 * Passkey prompt component for WebAuthn interactions
 *
 * Provides visual feedback during WebAuthn ceremonies:
 * - Registration of new passkeys
 * - Authentication with existing passkeys
 * - PRF extension operations
 */
export interface PasskeyPromptProps {
    /** Type of WebAuthn operation */
    mode: 'register' | 'authenticate';
    /** Whether the operation is in progress */
    isLoading?: boolean;
    /** Error message if operation failed */
    error?: string;
    /** Callback to trigger the operation */
    onPrompt?: () => void;
    /** Callback to retry after error */
    onRetry?: () => void;
    /** Callback to cancel the operation */
    onCancel?: () => void;
    /** Optional custom title */
    title?: string;
    /** Optional custom description */
    description?: string;
    /** Additional CSS classes */
    className?: string;
}
/**
 * WebAuthn passkey interaction prompt
 *
 * Displays appropriate UI and messaging for passkey operations.
 */
export declare function PasskeyPrompt({ mode, isLoading, error, onPrompt, onRetry, onCancel, title, description, className, }: PasskeyPromptProps): import("react/jsx-runtime").JSX.Element;
