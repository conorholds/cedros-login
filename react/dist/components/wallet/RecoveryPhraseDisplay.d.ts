/**
 * Component to display BIP-39 recovery phrase
 *
 * Shows 12 words in a grid format with copy functionality.
 * Includes security warnings about storing the phrase safely.
 */
export interface RecoveryPhraseDisplayProps {
    /** Array of 12 mnemonic words */
    words: string[];
    /** Callback when user confirms they've saved the phrase */
    onConfirm: () => void;
    /** Optional class name */
    className?: string;
}
/**
 * Display recovery phrase with security warnings
 */
export declare function RecoveryPhraseDisplay({ words, onConfirm, className, }: RecoveryPhraseDisplayProps): import("react/jsx-runtime").JSX.Element;
