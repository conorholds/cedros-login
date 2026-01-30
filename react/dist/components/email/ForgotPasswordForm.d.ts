export interface ForgotPasswordFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}
/**
 * Form for requesting a password reset email.
 *
 * @example
 * ```tsx
 * <ForgotPasswordForm
 *   onSuccess={() => console.log('Email sent!')}
 *   onCancel={() => setShowForgotPassword(false)}
 * />
 * ```
 */
export declare function ForgotPasswordForm({ onSuccess, onCancel, className, }: ForgotPasswordFormProps): import("react/jsx-runtime").JSX.Element;
