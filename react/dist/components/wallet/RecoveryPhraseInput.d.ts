/**
 * Component for entering BIP-39 recovery phrase
 *
 * Provides input fields for 12 words with validation and autocomplete.
 */
export interface RecoveryPhraseInputProps {
    /** Callback when valid phrase is entered */
    onSubmit: (words: string[]) => void;
    /** Callback to cancel */
    onCancel?: () => void;
    /** Whether submission is in progress */
    isSubmitting?: boolean;
    /** Error message to display */
    error?: string;
    /** Optional class name */
    className?: string;
}
/**
 * Input form for recovery phrase
 */
export declare function RecoveryPhraseInput({ onSubmit, onCancel, isSubmitting, error, className, }: RecoveryPhraseInputProps): import("react/jsx-runtime").JSX.Element;
