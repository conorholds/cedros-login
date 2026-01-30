export interface EmailLoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    /** Called when user clicks "Forgot password?" (only in 'reset' mode) */
    onForgotPassword?: () => void;
    className?: string;
}
/**
 * Email/password login form
 */
export declare function EmailLoginForm({ onSuccess, onSwitchToRegister, onForgotPassword, className, }: EmailLoginFormProps): import("react/jsx-runtime").JSX.Element;
