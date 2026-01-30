export interface ResetPasswordFormProps {
    token: string;
    onSuccess?: () => void;
    onLoginClick?: () => void;
    className?: string;
}
/**
 * Form for resetting password using a reset token.
 *
 * @example
 * ```tsx
 * // Get token from URL params
 * const token = new URLSearchParams(location.search).get('token');
 *
 * <ResetPasswordForm
 *   token={token}
 *   onSuccess={() => navigate('/login')}
 *   onLoginClick={() => navigate('/login')}
 * />
 * ```
 */
export declare function ResetPasswordForm({ token, onSuccess, onLoginClick, className, }: ResetPasswordFormProps): import("react/jsx-runtime").JSX.Element;
