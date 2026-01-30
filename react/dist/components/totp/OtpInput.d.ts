/**
 * OTP Input component (shadcn-style)
 *
 * A 6-digit input with separate boxes for each digit,
 * designed for TOTP verification codes.
 */
export interface OtpInputProps {
    /** Current value (up to 6 digits) */
    value?: string;
    /** Called when the value changes */
    onChange?: (value: string) => void;
    /** Called when all 6 digits are entered */
    onComplete?: (value: string) => void;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Error message to display */
    error?: string;
    /** Auto-focus the first input on mount */
    autoFocus?: boolean;
    /** Additional CSS class */
    className?: string;
}
/**
 * OTP input with separate boxes for each digit (shadcn pattern)
 *
 * Features:
 * - Auto-advances to next input on digit entry
 * - Backspace moves to previous input
 * - Supports paste of full code
 * - Numeric keyboard on mobile
 */
export declare function OtpInput({ value, onChange, onComplete, disabled, error, autoFocus, className, }: OtpInputProps): import("react/jsx-runtime").JSX.Element;
