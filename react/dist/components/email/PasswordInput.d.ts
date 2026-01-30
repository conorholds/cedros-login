import { InputHTMLAttributes } from 'react';
import { PasswordValidation } from '../../types';
export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    /** Action element shown on the right side of the label (e.g., "Forgot password?" link) */
    labelAction?: React.ReactNode;
    showStrengthMeter?: boolean;
    onValidationChange?: (validation: PasswordValidation) => void;
    error?: string;
}
/**
 * Password input with visibility toggle and optional strength meter
 */
export declare function PasswordInput({ label, labelAction, showStrengthMeter, onValidationChange, error, className, onChange, value, ...props }: PasswordInputProps): import("react/jsx-runtime").JSX.Element;
