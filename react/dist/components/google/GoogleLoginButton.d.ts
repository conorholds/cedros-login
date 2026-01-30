export interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    className?: string;
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}
/**
 * Google OAuth login button
 */
export declare function GoogleLoginButton({ onSuccess, onError, className, variant, size, disabled, }: GoogleLoginButtonProps): import("react/jsx-runtime").JSX.Element;
